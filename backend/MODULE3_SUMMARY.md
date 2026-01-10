# Module 3: AI Powered Property Search - Implementation Summary

## ✅ Completed: Module 3 Backend Implementation

### What's Been Built

#### AI Search Service
- ✅ **5-Step AI Algorithm** (as per specification)
  1. Normalize location using geo-coordinates
  2. Apply hard filters (price, type)
  3. Rank by relevance, urgency, popularity
  4. Fetch similar properties within ±10% price
  5. Return paginated results

- ✅ **Natural Language Search** - Process user queries like "2BHK apartment near beach in Hyderabad"
- ✅ **Location Normalization** - Google Maps Geocoding API integration with fallback
- ✅ **AI Ranking** - Integration with AI microservice for intelligent ranking
- ✅ **Similarity Matching** - Find similar properties within ±10% price range
- ✅ **AI Tags Extraction** - Extract special tags (Beach, Waterfront, etc.) from queries

#### Geocoding Service
- ✅ Google Maps Geocoding API integration
- ✅ Location parsing and normalization
- ✅ Coordinate-based distance calculation (Haversine formula)
- ✅ Fallback parsing when API unavailable
- ✅ Radius-based location filtering

#### Search Controller
- ✅ `GET /api/search` - Main AI-powered search endpoint
- ✅ `GET /api/search/properties` - Alias for search endpoint
- ✅ `GET /api/search/suggestions` - Search suggestions (placeholder)

#### DTOs (Data Transfer Objects)
- ✅ `AiSearchRequestDto` - Comprehensive search request with natural language support
- ✅ `AiSearchResponseDto` - Rich search response with rankings and metadata
- ✅ `GeocodingResponseDto` - Location normalization response
- ✅ `AiRankingRequestDto` - AI ranking service request
- ✅ `AiRankingResponseDto` - AI ranking service response

### Key Features

#### Search Capabilities
- **Natural Language Queries**: "2BHK apartment near beach in Hyderabad"
- **Structured Filters**: Location, type, price, bedrooms, bathrooms, area
- **Location Search**: 
  - By city/locality/area name
  - By GPS coordinates with radius
  - Automatic location normalization
- **AI Tags**: Beach, Waterfront, Metro-connected, etc.
- **Ranking Options**: Relevance, Price, Popularity, Urgency, Newest

#### Ranking Algorithm
- **Relevance Score**: AI-calculated based on query match
- **Urgency Score**: Based on interested_count and views
- **Popularity Score**: Based on views and engagement
- **Match Reasons**: Explain why each property matched
- **Extracted Tags**: AI-identified special features from query

#### Similarity Matching
- Finds properties within ±10% price range
- Configurable similarity threshold
- Returns up to 20 similar properties

### API Endpoints

#### Main Search Endpoint
```
GET /api/search?query=2BHK apartment near beach&city=Hyderabad&listingType=sale&bedrooms=2
```

**Query Parameters:**
- `query` - Natural language search query
- `listingType` - sale | rent
- `propertyType` - apartment | house | villa | etc.
- `city` - City name
- `locality` - Locality/area name
- `area` - Neighborhood name
- `latitude` & `longitude` - GPS coordinates
- `radius` - Search radius in kilometers
- `minPrice` & `maxPrice` - Price range
- `bedrooms` & `bathrooms` - Number of rooms
- `minArea` & `maxArea` - Area range
- `aiTags` - Special tags (beach, waterfront, etc.)
- `page` & `limit` - Pagination
- `rankBy` - relevance | price | popularity | urgency | newest
- `includeSimilar` - Include similar properties (default: true)
- `similarityThreshold` - Similarity threshold 0-1 (default: 0.8)

**Response Example:**
```json
{
  "properties": [
    {
      "id": "prop-123",
      "title": "2BHK Apartment with Sea View",
      "price": 5000000,
      "relevanceScore": 0.95,
      "urgencyScore": 0.7,
      "popularityScore": 0.85,
      "matchReasons": [
        "Matches location: Hyderabad",
        "Matches bedrooms: 2",
        "Extracted tag: beach access"
      ],
      "extractedAiTags": ["beach", "waterfront"]
    }
  ],
  "total": 25,
  "page": 1,
  "limit": 20,
  "query": "2BHK apartment near beach",
  "extractedFilters": {
    "location": {
      "city": "Hyderabad",
      "coordinates": { "latitude": 17.3850, "longitude": 78.4867 }
    },
    "propertyType": "apartment",
    "bedrooms": 2,
    "aiTags": ["beach", "waterfront"]
  },
  "similarProperties": [...],
  "searchMetadata": {
    "processingTimeMs": 245,
    "aiRankingUsed": true,
    "locationNormalized": true,
    "similarPropertiesCount": 8
  }
}
```

### Integration with AI Microservice

**New Endpoint Added:**
- `POST /search/rank-results` - AI ranking endpoint

**Request Flow:**
1. Backend applies hard filters (price, type, location)
2. Sends filtered properties to AI service for ranking
3. AI returns relevance/urgency/popularity scores
4. Backend merges scores with property data
5. Returns ranked and paginated results

**Fallback Behavior:**
- If AI service unavailable, uses default ranking (featured first, then by views)
- Location normalization falls back to basic parsing
- All features remain functional without AI

### Environment Variables

Add to `.env`:
```env
# Google Maps API (Optional - falls back to basic parsing if not available)
GOOGLE_MAPS_API_KEY=your-google-maps-api-key

# AI Service (for ranking)
AI_SERVICE_URL=http://localhost:8000
AI_SERVICE_API_KEY=your-api-key
```

### Files Created

**DTOs:**
- `src/search/dto/ai-search-request.dto.ts`
- `src/search/dto/ai-search-response.dto.ts`
- `src/search/dto/geocoding-response.dto.ts`
- `src/search/dto/ai-ranking-request.dto.ts`

**Services:**
- `src/search/services/ai-search.service.ts` - Main search logic
- `src/search/services/geocoding.service.ts` - Location normalization

**Controller & Module:**
- `src/search/search.controller.ts`
- `src/search/search.module.ts`

**Documentation:**
- Updated `AI_MICROSERVICE_CONTRACT.md` with search ranking endpoint

### Algorithm Implementation

#### Step 1: Location Normalization
- Extracts location from query or uses provided filters
- Calls Google Geocoding API (or fallback parser)
- Returns structured location with coordinates

#### Step 2: Hard Filters
- Filters by status (only LIVE properties)
- Applies listing type, property type, location
- Filters by price range, area range
- Filters by bedrooms, bathrooms
- Applies radius filter if coordinates provided

#### Step 3: AI Ranking
- Sends properties to AI microservice with query context
- AI calculates relevance, urgency, popularity scores
- AI extracts special tags from query
- Returns ranked properties with match reasons

#### Step 4: Similarity Matching
- Calculates average price from top results
- Finds properties within ±10% price range
- Returns similar properties

#### Step 5: Pagination
- Applies pagination to ranked results
- Returns metadata (total, page, limit)
- Includes processing time

### Default Ranking (When AI Unavailable)

1. **Featured properties first**
2. **By views count** (popularity)
3. **By price** (if rankBy=price)
4. **By urgency** (interested_count) if rankBy=urgency
5. **By newest** (createdAt) if rankBy=newest

### Usage Examples

#### Basic Search
```bash
GET /api/search?query=apartment in Hyderabad&bedrooms=2
```

#### Advanced Search with Filters
```bash
GET /api/search?query=beach view apartment&city=Hyderabad&minPrice=3000000&maxPrice=7000000&bedrooms=2&radius=5
```

#### Location-Based Search
```bash
GET /api/search?latitude=17.3850&longitude=78.4867&radius=10&propertyType=apartment
```

#### Ranking by Price
```bash
GET /api/search?query=apartment&city=Hyderabad&rankBy=price
```

### Next Steps

1. **Implement AI Microservice Ranking Endpoint**
   - Create Python endpoint: `/search/rank-results`
   - Implement ML model for relevance scoring
   - Extract AI tags from queries

2. **Add Search Suggestions**
   - Implement autocomplete functionality
   - Popular searches tracking
   - User history-based suggestions

3. **Optimize Performance**
   - Cache location normalization results
   - Index database for location-based queries
   - Consider PostGIS for advanced location queries

4. **Frontend Integration**
   - Create search bar component
   - Implement filters UI
   - Display search results with rankings
   - Show AI tags and match reasons

### Integration Points

- **Module 2**: Uses Properties module for data access
- **Module 1**: Respects authentication (public search, authenticated suggestions)
- **AI Service**: Calls ranking endpoint for intelligent results
- **Module 5**: Can filter by verification status (currently only LIVE)

---

**Status**: ✅ Complete
**Date**: 2024-01-09
**Next Module**: Module 4 - Seller Property Listing (Already integrated in Module 2)
