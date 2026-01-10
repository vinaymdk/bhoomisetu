import { Injectable, Logger, HttpException, HttpStatus } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { firstValueFrom } from 'rxjs';
import { FraudScoreRequestDto } from './dto/fraud-score-request.dto';
import { FraudScoreResponseDto } from './dto/fraud-score-response.dto';
import { DuplicateDetectionRequestDto } from './dto/duplicate-detection-request.dto';
import { DuplicateDetectionResponseDto } from './dto/duplicate-detection-response.dto';
import { SessionRiskRequestDto } from './dto/session-risk-request.dto';
import { SessionRiskResponseDto } from './dto/session-risk-response.dto';
import { SentimentAnalysisRequestDto } from './dto/sentiment-analysis-request.dto';
import { SentimentAnalysisResponseDto } from './dto/sentiment-analysis-response.dto';
import { FakeReviewDetectionRequestDto } from './dto/fake-review-detection-request.dto';
import { FakeReviewDetectionResponseDto } from './dto/fake-review-detection-response.dto';

@Injectable()
export class AiService {
  private readonly logger = new Logger(AiService.name);
  private readonly aiServiceBaseUrl: string;
  private readonly aiServiceRequired: boolean;
  private connectionErrorLogged: boolean = false;

  constructor(private readonly httpService: HttpService) {
    this.aiServiceBaseUrl = process.env.AI_SERVICE_URL || 'http://localhost:8000';
    this.aiServiceRequired = process.env.AI_SERVICE_REQUIRED === 'true';
  }

  /**
   * Score user/request for fraud risk
   */
  async scoreFraudRisk(request: FraudScoreRequestDto): Promise<FraudScoreResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<FraudScoreResponseDto>(
          `${this.aiServiceBaseUrl}/fraud/score-user`,
          request,
          {
            timeout: 5000, // 5 second timeout
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
            },
          },
        ),
      );

      this.logger.debug(`Fraud risk score: ${response.data.riskScore} (${response.data.riskLevel})`);
      return response.data;
    } catch (error: any) {
      // Check if it's a connection error (service unavailable)
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        // Only log connection errors once per service instance to reduce noise
        if (!this.connectionErrorLogged) {
          this.logger.warn(
            `AI service unavailable at ${this.aiServiceBaseUrl}. Using fallback defaults. ` +
            `Set AI_SERVICE_REQUIRED=false to suppress this warning.`,
          );
          this.connectionErrorLogged = true;
        }
        
        if (this.aiServiceRequired) {
          throw new HttpException(
            'AI fraud detection service is required but unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        // Return safe default
        return {
          riskScore: 0,
          riskLevel: 'low',
          reasons: ['AI service unavailable'],
          recommendations: [],
          shouldBlock: false,
          shouldRequireManualReview: false,
          confidence: 0,
        };
      }

      // For other errors, log as error
      this.logger.error(`Error calling AI fraud detection service: ${error.message}`, error.stack);
      throw new HttpException(
        'AI fraud detection service error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Detect duplicate accounts
   */
  async detectDuplicateAccounts(request: DuplicateDetectionRequestDto): Promise<DuplicateDetectionResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<DuplicateDetectionResponseDto>(
          `${this.aiServiceBaseUrl}/auth/detect-duplicate`,
          request,
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
            },
          },
        ),
      );

      this.logger.debug(`Duplicate detection: ${response.data.isDuplicate} (confidence: ${response.data.confidence})`);
      return response.data;
    } catch (error: any) {
      // Check if it's a connection error (service unavailable)
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        // Connection errors are already logged in scoreFraudRisk, skip duplicate logs
        if (this.aiServiceRequired) {
          throw new HttpException(
            'AI duplicate detection service is required but unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        // Return safe default
        return {
          isDuplicate: false,
          confidence: 0,
          recommendations: [],
        };
      }

      // For other errors, log as error
      this.logger.error(`Error calling AI duplicate detection service: ${error.message}`, error.stack);
      throw new HttpException(
        'AI duplicate detection service error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Assess session risk
   */
  async assessSessionRisk(request: SessionRiskRequestDto): Promise<SessionRiskResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<SessionRiskResponseDto>(
          `${this.aiServiceBaseUrl}/auth/risk-session`,
          request,
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
            },
          },
        ),
      );

      this.logger.debug(`Session risk score: ${response.data.riskScore} (${response.data.riskLevel})`);
      return response.data;
    } catch (error: any) {
      // Check if it's a connection error (service unavailable)
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        // Connection errors are already logged in scoreFraudRisk, skip duplicate logs
        if (this.aiServiceRequired) {
          throw new HttpException(
            'AI session risk service is required but unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        // Return safe default
        return {
          riskScore: 0,
          riskLevel: 'low',
          reasons: ['AI service unavailable'],
          shouldRequireVerification: false,
          shouldBlock: false,
          recommendations: [],
          confidence: 0,
        };
      }

      // For other errors, log as error
      this.logger.error(`Error calling AI session risk service: ${error.message}`, error.stack);
      throw new HttpException(
        'AI session risk assessment service error',
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  /**
   * Health check for AI service
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await firstValueFrom(
        this.httpService.get(`${this.aiServiceBaseUrl}/health`, {
          timeout: 2000,
        }),
      );
      return response.status === 200;
    } catch (error) {
      this.logger.warn('AI service health check failed');
      return false;
    }
  }

  /**
   * Chat with AI (OpenAI-compatible LLM)
   * POST /chat/completion
   * CRITICAL: AI must never share seller contact, always escalate serious intent
   */
  async chatCompletion(request: {
    message: string;
    conversationHistory?: Array<{ role: 'user' | 'assistant'; content: string }>;
    language?: 'en' | 'te';
    context?: {
      contextType?: string;
      propertyId?: string;
      requirementId?: string;
      userId?: string;
      userRole?: string;
    };
    systemPrompt?: string;
  }): Promise<{
    response: string;
    detectedIntent?: string;
    requiresEscalation: boolean;
    escalationReason?: string;
    suggestions?: Array<{
      type: string;
      data: Record<string, any>;
    }>;
    confidence: number;
  }> {
    try {
      const response = await firstValueFrom(
        this.httpService.post(
          `${this.aiServiceBaseUrl}/chat/completion`,
          {
            message: request.message,
            conversation_history: request.conversationHistory || [],
            language: request.language || 'en',
            context: request.context,
            system_prompt: request.systemPrompt,
          },
          {
            timeout: 30000, // 30 second timeout for LLM
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
            },
          },
        ),
      );

      return {
        response: response.data.response || response.data.content || 'I apologize, but I could not process your request.',
        detectedIntent: response.data.detected_intent,
        requiresEscalation: response.data.requires_escalation || false,
        escalationReason: response.data.escalation_reason,
        suggestions: response.data.suggestions,
        confidence: response.data.confidence || 0.8,
      };
    } catch (error: any) {
      // Check if it's a connection error (service unavailable)
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        if (!this.connectionErrorLogged) {
          this.logger.warn(
            `AI chat service unavailable at ${this.aiServiceBaseUrl}. Using fallback response. ` +
              'Set AI_SERVICE_REQUIRED=true to throw errors instead of falling back.',
          );
          this.connectionErrorLogged = true;
        }

        if (this.aiServiceRequired) {
          throw new HttpException('AI chat service is required but unavailable', HttpStatus.SERVICE_UNAVAILABLE);
        }

        // Fallback: Simple rule-based response
        return this.getFallbackChatResponse(request.message, request.language);
      }

      this.logger.error(`Error calling AI chat service: ${error.message}`);
      
      if (this.aiServiceRequired) {
        throw new HttpException(`AI chat service error: ${error.message}`, HttpStatus.INTERNAL_SERVER_ERROR);
      }

      return this.getFallbackChatResponse(request.message, request.language);
    }
  }

  /**
   * Fallback chat response when AI service is unavailable
   * Simple rule-based responses based on keywords
   * CRITICAL: Enforces platform rules (no seller contact, escalate serious intent)
   */
  private getFallbackChatResponse(
    message: string,
    language: 'en' | 'te' = 'en',
  ): {
    response: string;
    detectedIntent?: string;
    requiresEscalation: boolean;
    escalationReason?: string;
    suggestions?: Array<{ type: string; data: Record<string, any> }>;
    confidence: number;
  } {
    const lowerMessage = message.toLowerCase();

    // Detect intent
    let detectedIntent = 'general';
    let requiresEscalation = false;
    let escalationReason: string | undefined;

    // CRITICAL: Check for serious intent keywords (requires escalation)
    const seriousIntentKeywords = ['buy', 'purchase', 'deal', 'negotiate', 'seller contact', 'phone number', 'email', 'serious', 'ready', 'appointment', 'viewing'];
    if (seriousIntentKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      requiresEscalation = true;
      escalationReason = 'Serious intent detected - requires human customer service';
      detectedIntent = 'serious_intent';
    }

    // Check for contact requests (CRITICAL: Never share contact)
    const contactKeywords = ['contact', 'phone', 'email', 'address', 'number', 'call', 'reach'];
    if (contactKeywords.some((keyword) => lowerMessage.includes(keyword))) {
      requiresEscalation = true;
      escalationReason = 'Contact information request - customer service will assist';
      detectedIntent = 'serious_intent';
    }

    // Check for property search
    if (lowerMessage.includes('property') || lowerMessage.includes('house') || lowerMessage.includes('apartment') || lowerMessage.includes('flat')) {
      detectedIntent = 'property_search';
    }

    // Check for FAQ
    if (lowerMessage.includes('how') || lowerMessage.includes('what') || lowerMessage.includes('when') || lowerMessage.includes('where') || lowerMessage.includes('why')) {
      detectedIntent = 'faq';
    }

    // Generate fallback response
    let response = '';
    if (language === 'te') {
      // Telugu fallback responses
      if (requiresEscalation) {
        response = 'మీరు తీవ్ర ఉద్దేశ్యాన్ని చూపిస్తున్నారు. దయచేసి మా కస్టమర్ సర్వీస్ టీమ్‌తో సంప్రదించండి. వారు మీకు తగిన సహాయం చేస్తారు.';
      } else if (detectedIntent === 'property_search') {
        response = 'మేము మీకు అనుకూలమైన ఆస్తులను కనుగొనడంలో సహాయం చేయగలము. దయచేసి మీ అవసరాలను (స్థలం, బడ్జెట్, ఆస్తి రకం) పంచుకోండి.';
      } else {
        response = 'మేము మీకు సహాయం చేయగలము. దయచేసి మీ ప్రశ్నను వివరంగా అడగండి.';
      }
    } else {
      // English fallback responses
      if (requiresEscalation) {
        response = 'I detect serious intent in your message. Please contact our customer service team for assistance with property purchases, negotiations, and contact information. They will help you connect with sellers through our verified mediation process.';
      } else if (detectedIntent === 'property_search') {
        response = 'I can help you find suitable properties. Please share your requirements like location, budget, and property type. I\'ll suggest matching properties based on your needs.';
      } else {
        response = 'I\'m here to help! Please feel free to ask me any questions about properties, requirements, verification process, or general information about the platform.';
      }
    }

    return {
      response,
      detectedIntent: detectedIntent as any,
      requiresEscalation,
      escalationReason,
      suggestions: requiresEscalation
        ? [
            {
              type: 'escalate_to_cs',
              data: { reason: escalationReason },
            },
          ]
        : undefined,
      confidence: 0.5, // Low confidence for fallback
    };
  }

  /**
   * Analyze sentiment of review text
   */
  async analyzeSentiment(request: SentimentAnalysisRequestDto): Promise<SentimentAnalysisResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<SentimentAnalysisResponseDto>(
          `${this.aiServiceBaseUrl}/reviews/sentiment-analysis`,
          request,
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
            },
          },
        ),
      );

      this.logger.debug(`Sentiment analysis: ${response.data.sentimentLabel} (score: ${response.data.sentimentScore})`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        if (!this.connectionErrorLogged) {
          this.logger.warn(
            `AI service unavailable at ${this.aiServiceBaseUrl}. Using fallback defaults. ` +
            `Set AI_SERVICE_REQUIRED=false to suppress this warning.`,
          );
          this.connectionErrorLogged = true;
        }

        if (this.aiServiceRequired) {
          throw new HttpException(
            'AI sentiment analysis service is required but unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        // Return safe default based on rating
        const defaultSentiment = request.rating >= 4.0 ? 'positive' : request.rating <= 2.0 ? 'negative' : 'neutral';
        return {
          sentimentScore: request.rating >= 4.0 ? 0.5 : request.rating <= 2.0 ? -0.5 : 0.0,
          sentimentLabel: defaultSentiment as any,
          confidence: 0.3,
          keyPhrases: [],
          topics: [],
          analysis: {},
        };
      }

      this.logger.error(`Error calling AI sentiment analysis service: ${error.message}`, error.stack);
      throw new HttpException('AI sentiment analysis service error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  /**
   * Detect if a review is fake
   */
  async detectFakeReview(request: FakeReviewDetectionRequestDto): Promise<FakeReviewDetectionResponseDto> {
    try {
      const response = await firstValueFrom(
        this.httpService.post<FakeReviewDetectionResponseDto>(
          `${this.aiServiceBaseUrl}/reviews/detect-fake`,
          request,
          {
            timeout: 5000,
            headers: {
              'Content-Type': 'application/json',
              'X-API-Key': process.env.AI_SERVICE_API_KEY || '',
            },
          },
        ),
      );

      this.logger.debug(`Fake review detection: ${response.data.isFake ? 'FAKE' : 'GENUINE'} (score: ${response.data.fakeReviewScore})`);
      return response.data;
    } catch (error: any) {
      if (error.code === 'ECONNREFUSED' || error.code === 'ETIMEDOUT' || error.code === 'ENOTFOUND') {
        if (!this.connectionErrorLogged) {
          this.logger.warn(
            `AI service unavailable at ${this.aiServiceBaseUrl}. Using fallback defaults. ` +
            `Set AI_SERVICE_REQUIRED=false to suppress this warning.`,
          );
          this.connectionErrorLogged = true;
        }

        if (this.aiServiceRequired) {
          throw new HttpException(
            'AI fake review detection service is required but unavailable',
            HttpStatus.SERVICE_UNAVAILABLE,
          );
        }

        // Return safe default (assume genuine if AI unavailable, but flag for manual review)
        return {
          fakeReviewScore: 0.3, // Low suspicion
          isFake: false,
          confidence: 0.3,
          reasons: ['AI service unavailable'],
          analysis: {},
          recommendations: ['Manual review recommended due to AI service unavailability'],
        };
      }

      this.logger.error(`Error calling AI fake review detection service: ${error.message}`, error.stack);
      throw new HttpException('AI fake review detection service error', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}
