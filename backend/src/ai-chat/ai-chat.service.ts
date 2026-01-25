import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindOptionsWhere } from 'typeorm';
import { AiChatConversation, ChatLanguage, ConversationStatus, ChatContextType, UserIntent } from './entities/ai-chat-conversation.entity';
import { AiChatMessage, SenderType, MessageType, DetectedIntent } from './entities/ai-chat-message.entity';
import { AiChatAction, ActionType, ActionStatus } from './entities/ai-chat-action.entity';
import { AiChatFaq } from './entities/ai-chat-faq.entity';
import { ChatRequestDto } from '../ai/dto/chat-request.dto';
import { ChatResponseDto } from '../ai/dto/chat-response.dto';
import { AiService } from '../ai/ai.service';
import { Property, PropertyStatus } from '../properties/entities/property.entity';
import { BuyerRequirement } from '../buyer-requirements/entities/buyer-requirement.entity';
import { UsersService } from '../users/users.service';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class AiChatService {
  private readonly logger = new Logger(AiChatService.name);

  // CRITICAL: System prompt that enforces platform rules
  private readonly SYSTEM_PROMPT = `You are a real estate assistant for Bhoomisetu platform.

CRITICAL RULES (NON-NEGOTIABLE):
1. NEVER share seller contact information directly (phone, email, address)
2. NEVER share buyer contact information directly
3. ALWAYS escalate serious intent (purchase interest, negotiation, deal closing) to customer service
4. You can provide property information, suggest properties, answer FAQs, and help with general queries
5. If user asks for seller contact, politely explain that customer service will connect them after verification
6. Support English, Telugu, and Hindi languages

CAPABILITIES:
- Answer FAQs about properties, pricing, verification process
- Suggest properties based on user requirements
- Help update buyer requirements
- Assist with appointment booking (but escalate to CS for confirmation)
- Provide general information about the platform

ESCALATION TRIGGERS:
- User shows serious intent to buy/negotiate
- User asks for seller contact
- User requests complex negotiations
- User asks for property viewing/appointment
- User expresses frustration or complaint
- User requests information about mediation/connection process

When escalating, provide clear reason and suggest next steps.`;

  constructor(
    @InjectRepository(AiChatConversation)
    private readonly conversationRepository: Repository<AiChatConversation>,
    @InjectRepository(AiChatMessage)
    private readonly messageRepository: Repository<AiChatMessage>,
    @InjectRepository(AiChatAction)
    private readonly actionRepository: Repository<AiChatAction>,
    @InjectRepository(AiChatFaq)
    private readonly faqRepository: Repository<AiChatFaq>,
    @InjectRepository(Property)
    private readonly propertyRepository: Repository<Property>,
    @InjectRepository(BuyerRequirement)
    private readonly requirementRepository: Repository<BuyerRequirement>,
    private readonly aiService: AiService,
    private readonly usersService: UsersService,
    private readonly notificationsService: NotificationsService,
  ) {}

  /**
   * Send message to AI chat
   * Main entry point for AI chat support
   */
  async sendMessage(userId: string, chatDto: ChatRequestDto): Promise<ChatResponseDto> {
    try {
      const language = chatDto.language || ChatLanguage.EN;

      // Get or create conversation
      let conversation: AiChatConversation;
      if (chatDto.conversationId) {
        const existingConversation = await this.conversationRepository.findOne({
          where: { id: chatDto.conversationId, userId },
          relations: ['messages'],
        });

        if (!existingConversation) {
          throw new NotFoundException('Conversation not found');
        }

        conversation = existingConversation;

        // Update conversation if context changed
        if (chatDto.contextType && conversation.contextType !== chatDto.contextType) {
          conversation.contextType = chatDto.contextType;
        }
        if (chatDto.contextPropertyId && conversation.contextPropertyId !== chatDto.contextPropertyId) {
          conversation.contextPropertyId = chatDto.contextPropertyId;
        }
        if (chatDto.contextRequirementId && conversation.contextRequirementId !== chatDto.contextRequirementId) {
          conversation.contextRequirementId = chatDto.contextRequirementId;
        }
        await this.conversationRepository.save(conversation);
      } else {
        // Create new conversation
        conversation = this.conversationRepository.create({
          userId,
          sessionId: chatDto.sessionId || this.generateSessionId(),
          language,
          status: ConversationStatus.ACTIVE,
          contextType: chatDto.contextType || ChatContextType.GENERAL,
          contextPropertyId: chatDto.contextPropertyId || undefined,
          contextRequirementId: chatDto.contextRequirementId || undefined,
        });
        conversation = await this.conversationRepository.save(conversation);
      }

      if (!conversation?.id) {
        this.logger.warn(
          `Conversation missing id for user ${userId}. Recreating conversation.`,
        );
        conversation = await this.conversationRepository.save(
          this.conversationRepository.create({
            userId,
            sessionId: chatDto.sessionId || this.generateSessionId(),
            language,
            status: ConversationStatus.ACTIVE,
            contextType: chatDto.contextType || ChatContextType.GENERAL,
            contextPropertyId: chatDto.contextPropertyId || undefined,
            contextRequirementId: chatDto.contextRequirementId || undefined,
          }),
        );
      }

      if (!conversation?.id) {
        throw new BadRequestException('Failed to initialize conversation');
      }

      // Save user message
      // const userMessage = this.messageRepository.create({
      //   conversationId: conversation.id,
      //   conversation,
      //   senderType: SenderType.USER,
      //   senderId: userId,
      //   messageType: MessageType.TEXT,
      //   content: chatDto.message,
      //   contentEnglish: language === ChatLanguage.TE ? null : chatDto.message,
      //   contentTelugu: language === ChatLanguage.TE ? chatDto.message : null,
      // });
      const userMessage = this.messageRepository.create({
        conversationId: conversation.id,
        senderType: SenderType.USER,
        senderId: userId,
        messageType: MessageType.TEXT,
        content: chatDto.message,
        contentEnglish: language === ChatLanguage.TE ? null : chatDto.message,
        contentTelugu: language === ChatLanguage.TE ? chatDto.message : null,
      });
      
      await this.messageRepository.save(userMessage);

      // Get conversation history
      const conversationHistory = await this.messageRepository.find({
        where: { conversationId: conversation.id },
        order: { createdAt: 'ASC' },
        take: 20, // Last 20 messages for context
      });

      const historyForAI = conversationHistory.map((msg) => ({
        role: msg.senderType === SenderType.USER ? ('user' as const) : ('assistant' as const),
        content: msg.content,
      }));

      // Get context (property, requirement) if available
      let contextProperty: Property | null = null;
      let contextRequirement: BuyerRequirement | null = null;

      if (conversation.contextPropertyId) {
        contextProperty = await this.propertyRepository.findOne({
          where: { id: conversation.contextPropertyId },
        });
      }

      if (conversation.contextRequirementId) {
        contextRequirement = await this.requirementRepository.findOne({
          where: { id: conversation.contextRequirementId, buyerId: userId },
        });
      }

      // Get user roles for context
      const userRoles = await this.usersService.getUserRoles(userId);

      // Enrich AI context with FAQs if this is an FAQ-type query
      const detectedIntentFromMessage = this.detectIntentFromMessage(chatDto.message);
      let faqContext: string | undefined;
      if (detectedIntentFromMessage === 'faq' || conversation.contextType === ChatContextType.FAQ) {
        try {
          const relevantFaqs = await this.getRelevantFaqs(chatDto.message, language);
          if (relevantFaqs.length > 0) {
            faqContext = relevantFaqs
              .slice(0, 5) // Top 5 relevant FAQs
              .map((faq) => {
                let question = '';
                let answer = '';
                
                const langStr = language as string;
                if (langStr === 'te' || langStr === ChatLanguage.TE) {
                  question = faq.questionTelugu || faq.questionEnglish;
                  answer = faq.answerTelugu || faq.answerEnglish;
                } else if (langStr === 'hi' || langStr === ChatLanguage.HI) {
                  question = faq.questionEnglish; // Hindi translations can be added later
                  answer = faq.answerEnglish;
                } else {
                  question = faq.questionEnglish;
                  answer = faq.answerEnglish;
                }
                
                return `Q: ${question || 'N/A'}\nA: ${answer || 'N/A'}`;
              })
              .join('\n\n');
          }
        } catch (error) {
          this.logger.warn(`Error fetching FAQs for language ${language}: ${error}`);
        }
      }

      // Enrich AI context with property suggestions if this is a property search query
      let propertyContext: string | undefined;
      if (detectedIntentFromMessage === 'property_search' || conversation.contextType === ChatContextType.PROPERTY_SEARCH) {
        // Extract search criteria from message (simplified - AI can enhance this)
        const searchCriteria = this.extractSearchCriteria(chatDto.message);
        if (searchCriteria) {
          const suggestedProperties = await this.findSuggestedProperties(searchCriteria, userId);
          if (suggestedProperties.length > 0) {
            propertyContext = suggestedProperties
              .slice(0, 5) // Top 5 properties
              .map((prop) => {
                return `Property: ${prop.title}, ${prop.city}, ₹${prop.price.toLocaleString()}, ${prop.bedrooms || 'N/A'} BHK, ID: ${prop.id}`;
              })
              .join('\n');
          }
        }
      }

      // Build enhanced system prompt with FAQs and property context
      let enhancedSystemPrompt = this.SYSTEM_PROMPT;
      if (faqContext) {
        enhancedSystemPrompt += `\n\nRELEVANT FAQs:\n${faqContext}\n\nUse these FAQs to answer user questions accurately.`;
      }
      if (propertyContext) {
        enhancedSystemPrompt += `\n\nSUGGESTED PROPERTIES:\n${propertyContext}\n\nYou can suggest these properties to the user. Always mention property IDs when suggesting.`;
      }

      // Call AI service
      const aiResponse = await this.aiService.chatCompletion({
        message: chatDto.message,
        conversationHistory: historyForAI,
        language: language,
        context: {
          contextType: conversation.contextType || undefined,
          propertyId: conversation.contextPropertyId || undefined,
          requirementId: conversation.contextRequirementId || undefined,
          userId,
          userRole: userRoles[0] || 'buyer',
        },
        systemPrompt: enhancedSystemPrompt,
      });

      // Detect if this requires escalation
      const requiresEscalation = aiResponse.requiresEscalation || this.detectEscalationTriggers(chatDto.message);

      if (requiresEscalation && !conversation.escalatedToCs) {
        // Escalate to CS
        conversation.escalatedToCs = true;
        conversation.escalatedAt = new Date();
        conversation.escalationReason = aiResponse.escalationReason || 'Serious intent detected by AI';
        conversation.status = ConversationStatus.ESCALATED;

        // Create escalation action
        const escalationAction = this.actionRepository.create({
          conversationId: conversation.id,
          messageId: userMessage.id,
          actionType: ActionType.ESCALATED_TO_CS,
          actionData: {
            reason: conversation.escalationReason,
            originalMessage: chatDto.message,
            detectedIntent: aiResponse.detectedIntent,
          },
          status: ActionStatus.PENDING,
        });
        await this.actionRepository.save(escalationAction);

        // Notify CS agents about escalation
        if (conversation.escalationReason) {
          try {
            const csAgents = await this.usersService.findByRole('customer_service');
            if (csAgents.length > 0) {
              // Notify all CS agents about escalation (round-robin assignment can be added later)
              const notificationPromises = csAgents.map((agent) =>
                this.notificationsService
                  .notifyAiChatEscalation(agent.id, conversation.id, conversation.escalationReason!)
                  .catch((error) => {
                    this.logger.error(`Failed to notify CS agent ${agent.id}: ${error.message}`);
                  }),
              );
              await Promise.allSettled(notificationPromises);
              this.logger.log(
                `Conversation ${conversation.id} escalated. Notified ${csAgents.length} CS agent(s). Reason: ${conversation.escalationReason}`,
              );
            } else {
              this.logger.warn(`No CS agents found. Conversation ${conversation.id} escalated but no notifications sent.`);
            }
          } catch (error: any) {
            this.logger.error(`Failed to notify CS agents about escalation: ${error.message}`);
          }
        }
      }

      // Update conversation with AI insights
      if (aiResponse.detectedIntent) {
        conversation.userIntent = this.mapIntentToUserIntent(aiResponse.detectedIntent);
        conversation.intentConfidence = aiResponse.confidence * 100;
      }

      if (aiResponse.suggestions) {
        // Process suggestions (property suggestions, actions, etc.)
        await this.processAiSuggestions(conversation.id, userMessage.id, aiResponse.suggestions);
      }

      // await this.conversationRepository.save(conversation);

      await this.conversationRepository.update(
        { id: conversation.id },
        {
          escalatedToCs: conversation.escalatedToCs,
          escalatedAt: conversation.escalatedAt,
          escalationReason: conversation.escalationReason,
          status: conversation.status,
          userIntent: conversation.userIntent,
          intentConfidence: conversation.intentConfidence,
        },
      );
      

      // Save AI response message
      // const aiMessage = this.messageRepository.create({
      //   conversationId: conversation.id,
      //   conversation,
      //   senderType: SenderType.AI,
      //   senderId: null,
      //   messageType: MessageType.TEXT,
      //   content: aiResponse.response,
      //   contentEnglish: (language as string) === 'en' || (language as string) === ChatLanguage.EN ? aiResponse.response : null,
      //   contentTelugu: (language as string) === 'te' || (language as string) === ChatLanguage.TE ? aiResponse.response : null,
      //   aiModelVersion: 'openai-compatible-v1',
      //   aiConfidence: aiResponse.confidence * 100,
      //   detectedIntent: aiResponse.detectedIntent as DetectedIntent,
      //   requiresEscalation,
      //   escalationReason: aiResponse.escalationReason,
      //   suggestedActions: aiResponse.suggestions
      //     ? {
      //         suggestions: aiResponse.suggestions.map((s) => ({
      //           type: s.type,
      //           data: s.data,
      //         })),
      //       }
      //     : null,
      // });

      const aiMessage = this.messageRepository.create({
        conversationId: conversation.id,
        senderType: SenderType.AI,
        senderId: null,
        messageType: MessageType.TEXT,
        content: aiResponse.response,
        contentEnglish:
          language === ChatLanguage.EN ? aiResponse.response : null,
        contentTelugu:
          language === ChatLanguage.TE ? aiResponse.response : null,
        aiModelVersion: 'openai-compatible-v1',
        aiConfidence: aiResponse.confidence * 100,
        detectedIntent: aiResponse.detectedIntent as DetectedIntent,
        requiresEscalation,
        escalationReason: aiResponse.escalationReason,
        suggestedActions: aiResponse.suggestions
          ? {
              suggestions: aiResponse.suggestions.map((s) => ({
                type: s.type,
                data: s.data,
              })),
            }
          : null,
      });      

      // Ensure conversationId is set before saving
      if (!aiMessage.conversationId) {
        this.logger.error(`AI message conversation_id is null. Conversation: ${JSON.stringify(conversation)}`);
        throw new BadRequestException('Failed to link AI message to conversation');
      }

      const savedAiMessage = await this.messageRepository.save(aiMessage);

      // Build response DTO
      const response: ChatResponseDto = {
        conversationId: conversation.id,
        messageId: savedAiMessage.id,
        content: aiResponse.response,
        messageType: MessageType.TEXT,
        requiresEscalation,
        escalationReason: aiResponse.escalationReason,
        detectedIntent: aiResponse.detectedIntent as any,
        aiConfidence: aiResponse.confidence * 100,
        createdAt: savedAiMessage.createdAt,
      };

      // Add property suggestions if available
      if (aiResponse.suggestions) {
        const propertySuggestions = aiResponse.suggestions
          .filter((s) => s.type === 'property_suggestion')
          .map((s) => ({
            propertyId: s.data?.propertyId || '',
            title: s.data?.title || '',
            price: s.data?.price || 0,
            location: s.data?.location || '',
            matchScore: s.data?.matchScore || 0,
            matchReasons: s.data?.matchReasons || [],
          }));

        if (propertySuggestions.length > 0) {
          response.propertySuggestions = propertySuggestions as any;
        }
      }

      // Add action suggestions if available
      if (aiResponse.suggestions) {
        const actionSuggestions = aiResponse.suggestions
          .filter((s) => s.type !== 'property_suggestion')
          .map((s) => ({
            actionType: s.type as any,
            actionData: s.data || {},
            description: s.data?.description || '',
          }));

        if (actionSuggestions.length > 0) {
          response.actionSuggestions = actionSuggestions as any;
        }
      }

      return response;
    } catch (error: any) {
      this.logger.error(`Error in sendMessage: ${error.message}`, error.stack);
      throw new BadRequestException(`Failed to process chat message: ${error.message}`);
    }
  }

  /**
   * Get conversation history
   */
  async getConversation(conversationId: string, userId: string): Promise<AiChatConversation> {
    const conversation = await this.conversationRepository
      .createQueryBuilder('conversation')
      .leftJoinAndSelect('conversation.messages', 'messages')
      .leftJoinAndSelect('conversation.actions', 'actions')
      .leftJoinAndSelect('conversation.contextProperty', 'contextProperty')
      .leftJoinAndSelect('conversation.contextRequirement', 'contextRequirement')
      .where('conversation.id = :id', { id: conversationId })
      .andWhere('conversation.userId = :userId', { userId })
      .orderBy('messages.createdAt', 'ASC')
      .getOne();

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    return conversation;
  }

  /**
   * Get user's conversations
   */
  async getUserConversations(
    userId: string,
    page: number = 1,
    limit: number = 20,
  ): Promise<{
    conversations: AiChatConversation[];
    total: number;
    page: number;
    limit: number;
  }> {
    const skip = (page - 1) * limit;

    const [conversations, total] = await this.conversationRepository.findAndCount({
      where: { userId },
      relations: ['messages'],
      order: { updatedAt: 'DESC' },
      skip,
      take: limit,
    });

    return {
      conversations,
      total,
      page,
      limit,
    };
  }

  /**
   * Close conversation
   */
  async closeConversation(conversationId: string, userId: string): Promise<void> {
    const conversation = await this.conversationRepository.findOne({
      where: { id: conversationId, userId },
    });

    if (!conversation) {
      throw new NotFoundException('Conversation not found');
    }

    conversation.status = ConversationStatus.CLOSED;
    conversation.closedAt = new Date();
    await this.conversationRepository.save(conversation);
  }

  /**
   * Get FAQs
   */
  async getFaqs(category?: string, language: ChatLanguage = ChatLanguage.EN): Promise<AiChatFaq[]> {
    const where: FindOptionsWhere<AiChatFaq> = {
      isActive: true,
    };

    if (category) {
      where.category = category;
    }

    return this.faqRepository.find({
      where,
      order: { viewCount: 'DESC', helpfulCount: 'DESC' },
      take: 50,
    });
  }

  /**
   * Detect escalation triggers in message
   */
  private detectEscalationTriggers(message: string): boolean {
    const lowerMessage = message.toLowerCase();
    const escalationKeywords = [
      'seller contact',
      'phone number',
      'email',
      'address',
      'buy now',
      'purchase',
      'deal',
      'negotiate',
      'serious',
      'ready to buy',
      'appointment',
      'viewing',
      'meet',
      'direct contact',
    ];

    return escalationKeywords.some((keyword) => lowerMessage.includes(keyword));
  }

  /**
   * Map AI detected intent to UserIntent enum
   */
  private mapIntentToUserIntent(detectedIntent: string): UserIntent {
    switch (detectedIntent) {
      case 'property_search':
        return UserIntent.PROPERTY_SEARCH;
      case 'serious_intent':
        return UserIntent.SERIOUS_INTENT;
      case 'appointment':
        return UserIntent.APPOINTMENT;
      case 'requirement_update':
        return UserIntent.REQUIREMENT_UPDATE;
      case 'complaint':
        return UserIntent.COMPLAINT;
      default:
        return UserIntent.INFORMATION;
    }
  }

  /**
   * Process AI suggestions (property suggestions, actions, etc.)
   */
  private async processAiSuggestions(
    conversationId: string,
    messageId: string,
    suggestions: Array<{ type: string; data: Record<string, any> }>,
  ): Promise<void> {
    for (const suggestion of suggestions) {
      if (suggestion.type === 'property_suggestion' && suggestion.data.propertyId) {
        // Create property suggestion action
        const action = this.actionRepository.create({
          conversationId,
          messageId,
          actionType: ActionType.PROPERTY_SUGGESTED,
          actionData: suggestion.data,
          status: ActionStatus.PENDING,
        });
        await this.actionRepository.save(action);
      } else if (suggestion.type === 'requirement_update' && suggestion.data.requirementId) {
        // Create requirement update action
        const action = this.actionRepository.create({
          conversationId,
          messageId,
          actionType: ActionType.REQUIREMENT_UPDATED,
          actionData: suggestion.data,
          status: ActionStatus.PENDING,
        });
        await this.actionRepository.save(action);
      } else if (suggestion.type === 'appointment_booking') {
        // Create appointment booking action (but requires CS confirmation)
        const action = this.actionRepository.create({
          conversationId,
          messageId,
          actionType: ActionType.APPOINTMENT_BOOKED,
          actionData: suggestion.data,
          status: ActionStatus.PENDING, // Requires CS confirmation
        });
        await this.actionRepository.save(action);
      }
    }
  }

  /**
   * Generate session ID
   */
  private generateSessionId(): string {
    return `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
  }

  /**
   * Get relevant FAQs based on user message
   */
  private async getRelevantFaqs(message: string, language: ChatLanguage): Promise<AiChatFaq[]> {
    const lowerMessage = message.toLowerCase();
    
    // Get all active FAQs
    const allFaqs = await this.faqRepository.find({
      where: { isActive: true },
      order: { viewCount: 'DESC', helpfulCount: 'DESC' },
      take: 20, // Get top 20 FAQs for matching
    });

    // Simple keyword matching (AI service can enhance this with semantic search)
    const relevantFaqs = allFaqs.filter((faq) => {
      const questionEnglish = faq.questionEnglish.toLowerCase();
      const questionTelugu = faq.questionTelugu.toLowerCase();
      const answerEnglish = faq.answerEnglish.toLowerCase();
      const answerTelugu = faq.answerTelugu.toLowerCase();
      
      // Check if message keywords match FAQ
      const messageWords = lowerMessage.split(/\s+/);
      const matches = messageWords.filter((word) => 
        word.length > 3 && // Only match words longer than 3 characters
        (questionEnglish.includes(word) || 
         questionTelugu.includes(word) || 
         answerEnglish.includes(word) || 
         answerTelugu.includes(word))
      );
      
      return matches.length > 0;
    });

    return relevantFaqs.slice(0, 5); // Return top 5 relevant FAQs
  }

  /**
   * Detect intent from message (simple keyword-based detection)
   */
  private detectIntentFromMessage(message: string): string {
    const lowerMessage = message.toLowerCase();
    
    if (lowerMessage.includes('property') || lowerMessage.includes('house') || lowerMessage.includes('apartment') || lowerMessage.includes('flat')) {
      return 'property_search';
    }
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('when') || lowerMessage.includes('where') || lowerMessage.includes('why')) {
      return 'faq';
    }
    if (lowerMessage.includes('requirement') || lowerMessage.includes('budget') || lowerMessage.includes('location')) {
      return 'requirement_update';
    }
    if (lowerMessage.includes('appointment') || lowerMessage.includes('viewing') || lowerMessage.includes('meet')) {
      return 'appointment_booking';
    }
    
    return 'general';
  }

  /**
   * Extract search criteria from message (simplified - AI can enhance)
   */
  private extractSearchCriteria(message: string): { city?: string; minPrice?: number; maxPrice?: number; bedrooms?: number } | null {
    const lowerMessage = message.toLowerCase();
    const criteria: { city?: string; minPrice?: number; maxPrice?: number; bedrooms?: number } = {};
    
    // Extract city (common Indian cities)
    const cities = ['hyderabad', 'bangalore', 'mumbai', 'delhi', 'chennai', 'pune', 'kolkata', 'ahmedabad', 'surat', 'jaipur', 'lucknow', 'kanpur', 'nagpur', 'indore', 'thane', 'bhopal', 'visakhapatnam', 'patna', 'vadodara', 'ghaziabad'];
    for (const city of cities) {
      if (lowerMessage.includes(city)) {
        criteria.city = city.charAt(0).toUpperCase() + city.slice(1);
        break;
      }
    }
    
    // Extract BHK (bedrooms)
    const bhkMatch = lowerMessage.match(/(\d+)\s*(?:bhk|bedroom|bed|bedrooms)/i);
    if (bhkMatch) {
      criteria.bedrooms = parseInt(bhkMatch[1], 10);
    }
    
    // Extract price range (simplified - supports lakh, crore)
    const priceMatch = lowerMessage.match(/₹?\s*(\d+(?:,\d+)*(?:\.\d+)?)\s*(?:lakh|lac|cr|crore)?/gi);
    if (priceMatch && priceMatch.length >= 1) {
      const prices = priceMatch.map((p) => {
        let value = parseFloat(p.replace(/[₹,\s]/g, ''));
        if (p.toLowerCase().includes('lakh') || p.toLowerCase().includes('lac')) {
          value *= 100000; // Convert lakh to rupees
        } else if (p.toLowerCase().includes('cr') || p.toLowerCase().includes('crore')) {
          value *= 10000000; // Convert crore to rupees
        }
        return value;
      });
      if (prices.length >= 2) {
        criteria.minPrice = Math.min(...prices);
        criteria.maxPrice = Math.max(...prices);
      } else {
        criteria.maxPrice = prices[0];
        criteria.minPrice = prices[0] * 0.8; // Assume 80% as min if only one price
      }
    }
    
    return Object.keys(criteria).length > 0 ? criteria : null;
  }

  /**
   * Find suggested properties based on search criteria
   */
  private async findSuggestedProperties(
    criteria: { city?: string; minPrice?: number; maxPrice?: number; bedrooms?: number },
    userId: string,
  ): Promise<Property[]> {
    const queryBuilder = this.propertyRepository
      .createQueryBuilder('property')
      .where('property.status = :status', { status: PropertyStatus.LIVE })
      .andWhere('property.deletedAt IS NULL')
      .orderBy('property.createdAt', 'DESC')
      .take(10); // Limit to 10 properties

    if (criteria.city) {
      queryBuilder.andWhere('LOWER(property.city) = LOWER(:city)', { city: criteria.city });
    }

    if (criteria.minPrice !== undefined) {
      queryBuilder.andWhere('property.price >= :minPrice', { minPrice: criteria.minPrice });
    }

    if (criteria.maxPrice !== undefined) {
      queryBuilder.andWhere('property.price <= :maxPrice', { maxPrice: criteria.maxPrice });
    }

    if (criteria.bedrooms !== undefined) {
      queryBuilder.andWhere('property.bedrooms = :bedrooms', { bedrooms: criteria.bedrooms });
    }

    return await queryBuilder.getMany();
  }
}
