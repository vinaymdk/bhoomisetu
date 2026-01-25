import { Controller, Get, Query, UseGuards, HttpException, HttpStatus, Logger } from '@nestjs/common';
import { AiSearchService } from './services/ai-search.service';
import { AiSearchRequestDto } from './dto/ai-search-request.dto';
import { AiSearchResponseDto } from './dto/ai-search-response.dto';
import { Public } from '../auth/decorators/public.decorator';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser, CurrentUserData } from '../auth/decorators/current-user.decorator';

@Controller('search')
export class SearchController {
  private readonly logger = new Logger(SearchController.name);

  constructor(private readonly aiSearchService: AiSearchService) {}

  @Public()
  @Get()
  async search(@Query() query: AiSearchRequestDto): Promise<AiSearchResponseDto> {
    try {
      return await this.aiSearchService.search(query);
    } catch (error: any) {
      this.logger.error(`Search error: ${error.message}`, error.stack);
      throw new HttpException(
        { statusCode: 500, message: `Search failed: ${error.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Public()
  @Get('properties')
  async searchProperties(@Query() query: AiSearchRequestDto): Promise<AiSearchResponseDto> {
    // Alias for /search endpoint for clarity
    try {
      return await this.aiSearchService.search(query);
    } catch (error: any) {
      this.logger.error(`Search properties error: ${error.message}`, error.stack);
      throw new HttpException(
        { statusCode: 500, message: `Search failed: ${error.message}` },
        HttpStatus.INTERNAL_SERVER_ERROR,
      );
    }
  }

  @Get('suggestions')
  @UseGuards(JwtAuthGuard)
  async getSearchSuggestions(
    @Query('q') query: string,
    @CurrentUser() currentUser: CurrentUserData,
  ): Promise<{ suggestions: string[] }> {
    // TODO: Implement search suggestions based on user history and popular searches
    // For now, return empty suggestions
    return { suggestions: [] };
  }
}
