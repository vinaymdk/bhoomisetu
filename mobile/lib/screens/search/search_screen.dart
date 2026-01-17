import 'package:flutter/material.dart';
import '../../services/search_service.dart';
import '../../widgets/property_card.dart';

class SearchScreen extends StatefulWidget {
  const SearchScreen({super.key});

  @override
  State<SearchScreen> createState() => _SearchScreenState();
}

class _SearchScreenState extends State<SearchScreen> {
  final SearchService _searchService = SearchService();
  final TextEditingController _searchController = TextEditingController();
  final ScrollController _scrollController = ScrollController();
  final Set<String> _dismissedExtracted = {};
  
  AiSearchResponse? _results;
  bool _isLoading = false;
  String? _error;
  bool _showFilters = false;
  int _currentPage = 1;
  bool _hasMore = true;
  bool _isLoadingMore = false;

  // Filter state
  final SearchFilters _filters = SearchFilters()
    ..page = 1
    ..limit = 20
    ..rankBy = 'relevance';

  @override
  void initState() {
    super.initState();
    _scrollController.addListener(_onScroll);
  }

  @override
  void dispose() {
    _searchController.dispose();
    _scrollController.dispose();
    super.dispose();
  }

  void _onScroll() {
    if (_scrollController.position.pixels >= _scrollController.position.maxScrollExtent * 0.8) {
      if (!_isLoadingMore && _hasMore && _results != null) {
        _loadMore();
      }
    }
  }

  Future<void> _performSearch({bool reset = false}) async {
    if (reset) {
      _currentPage = 1;
      _filters.page = 1;
      _hasMore = true;
    }

    setState(() {
      _isLoading = true;
      _error = null;
    });

    try {
      final response = await _searchService.search(_filters);
      
      setState(() {
        if (reset || _results == null) {
          _results = response;
        } else {
          // Append new results for pagination
          _results = AiSearchResponse(
            properties: [..._results!.properties, ...response.properties],
            total: response.total,
            page: response.page,
            limit: response.limit,
            query: response.query,
            extractedFilters: response.extractedFilters,
            similarProperties: response.similarProperties,
            searchMetadata: response.searchMetadata,
          );
        }
        _currentPage = response.page;
        _hasMore = response.properties.length >= response.limit && 
                   _results!.properties.length < response.total;
        _isLoading = false;
        _filters.aiTags ??= response.extractedFilters.aiTags;
      });
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '').replaceAll('DioException [bad response]: ', '');
        _isLoading = false;
      });
    }
  }

  Future<void> _loadMore() async {
    if (_isLoadingMore || !_hasMore) return;

    setState(() {
      _isLoadingMore = true;
    });

    _filters.page = _currentPage + 1;
    await _performSearch(reset: false);

    setState(() {
      _isLoadingMore = false;
    });
  }

  void _handleSearch() {
    _filters.query = _searchController.text.trim().isEmpty ? null : _searchController.text.trim();
    _performSearch(reset: true);
  }

  void _updateFilter(String key, dynamic value) {
    switch (key) {
      case 'listingType':
        _filters.listingType = value;
        break;
      case 'propertyType':
        _filters.propertyType = value;
        break;
      case 'city':
        _filters.city = value;
        break;
      case 'locality':
        _filters.locality = value;
        break;
      case 'minPrice':
        _filters.minPrice = value != null ? double.tryParse(value.toString()) : null;
        break;
      case 'maxPrice':
        _filters.maxPrice = value != null ? double.tryParse(value.toString()) : null;
        break;
      case 'bedrooms':
        _filters.bedrooms = value != null ? int.tryParse(value.toString()) : null;
        break;
      case 'bathrooms':
        _filters.bathrooms = value != null ? int.tryParse(value.toString()) : null;
        break;
      case 'rankBy':
        _filters.rankBy = value;
        break;
      case 'aiTags':
        _filters.aiTags = value;
        break;
    }
    _performSearch(reset: true);
  }

  void _clearFilters() {
    _filters.listingType = null;
    _filters.propertyType = null;
    _filters.city = null;
    _filters.locality = null;
    _filters.minPrice = null;
    _filters.maxPrice = null;
    _filters.bedrooms = null;
    _filters.bathrooms = null;
    _filters.rankBy = 'relevance';
    _searchController.clear();
    _filters.query = null;
    _performSearch(reset: true);
  }

  int _getActiveFiltersCount() {
    int count = 0;
    if (_filters.listingType != null) count++;
    if (_filters.propertyType != null) count++;
    if (_filters.city != null && _filters.city!.isNotEmpty) count++;
    if (_filters.locality != null && _filters.locality!.isNotEmpty) count++;
    if (_filters.minPrice != null) count++;
    if (_filters.maxPrice != null) count++;
    if (_filters.bedrooms != null) count++;
    if (_filters.bathrooms != null) count++;
    return count;
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Property Search'),
        actions: [
          IconButton(
            icon: Stack(
              children: [
                const Icon(Icons.filter_list),
                if (_getActiveFiltersCount() > 0)
                  Positioned(
                    right: 0,
                    top: 0,
                    child: Container(
                      padding: const EdgeInsets.all(4),
                      decoration: const BoxDecoration(
                        color: Colors.red,
                        shape: BoxShape.circle,
                      ),
                      constraints: const BoxConstraints(
                        minWidth: 16,
                        minHeight: 16,
                      ),
                      child: Text(
                        '${_getActiveFiltersCount()}',
                        style: const TextStyle(
                          color: Colors.white,
                          fontSize: 10,
                          fontWeight: FontWeight.bold,
                        ),
                        textAlign: TextAlign.center,
                      ),
                    ),
                  ),
              ],
            ),
            onPressed: () {
              setState(() {
                _showFilters = !_showFilters;
              });
            },
          ),
        ],
      ),
      body: Column(
        children: [
          // Search Bar
          Padding(
            padding: const EdgeInsets.all(16),
            child: Column(
              children: [
                Container(
                  decoration: BoxDecoration(
                    color: Colors.white,
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: Colors.grey[300]!),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.05),
                        blurRadius: 4,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                  child: Row(
                    children: [
                      const Padding(
                        padding: EdgeInsets.only(left: 16),
                        child: Icon(Icons.search, color: Colors.grey),
                      ),
                      Expanded(
                        child: TextField(
                          controller: _searchController,
                          decoration: const InputDecoration(
                            hintText: 'e.g., "2BHK apartment in Hyderabad under 50L"',
                            border: InputBorder.none,
                            contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                          ),
                          onSubmitted: (_) => _handleSearch(),
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.only(right: 8),
                        child: ElevatedButton(
                          onPressed: _isLoading ? null : _handleSearch,
                          style: ElevatedButton.styleFrom(
                            padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 12),
                            shape: RoundedRectangleBorder(
                              borderRadius: BorderRadius.circular(8),
                            ),
                          ),
                          child: _isLoading
                              ? const SizedBox(
                                  width: 16,
                                  height: 16,
                                  child: CircularProgressIndicator(strokeWidth: 2),
                                )
                              : const Text('Search'),
                        ),
                      ),
                    ],
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  '💡 Powered by AI - Describe what you\'re looking for',
                  style: TextStyle(
                    fontSize: 12,
                    color: Colors.grey,
                  ),
                ),
              ],
            ),
          ),

          // Filters Sheet
          if (_showFilters)
            Flexible(
              child: Container(
                constraints: BoxConstraints(
                  maxHeight: MediaQuery.of(context).size.height * 0.6,
                ),
                child: _buildFiltersSheet(),
              ),
            ),

          // Results
          Expanded(
            child: _buildResults(),
          ),
        ],
      ),
    );
  }

  Widget _buildFiltersSheet() {
    return SafeArea(
      child: Container(
        color: Colors.white,
        padding: const EdgeInsets.all(16),
        child: LayoutBuilder(
          builder: (context, constraints) {
            return ConstrainedBox(
              constraints: BoxConstraints(maxHeight: constraints.maxHeight),
              child: SingleChildScrollView(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  mainAxisSize: MainAxisSize.min,
                  children: [
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Filters',
                  style: TextStyle(
                    fontSize: 18,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                if (_getActiveFiltersCount() > 0)
                  TextButton(
                    onPressed: _clearFilters,
                    child: const Text('Clear All'),
                  ),
              ],
            ),
            const Divider(),

            // Listing Type
            _buildFilterSection(
              'Listing Type',
              Row(
                children: [
                  Expanded(
                    child: _buildFilterChip(
                      'For Sale',
                      _filters.listingType == 'sale',
                      () => _updateFilter('listingType', _filters.listingType == 'sale' ? null : 'sale'),
                    ),
                  ),
                  const SizedBox(width: 8),
                  Expanded(
                    child: _buildFilterChip(
                      'For Rent',
                      _filters.listingType == 'rent',
                      () => _updateFilter('listingType', _filters.listingType == 'rent' ? null : 'rent'),
                    ),
                  ),
                ],
              ),
            ),

            // Property Type
            _buildFilterSection(
              'Property Type',
              DropdownButtonFormField<String>(
                value: _filters.propertyType,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                hint: const Text('All Types'),
                items: const [
                  DropdownMenuItem(value: 'apartment', child: Text('Apartment')),
                  DropdownMenuItem(value: 'house', child: Text('House')),
                  DropdownMenuItem(value: 'villa', child: Text('Villa')),
                  DropdownMenuItem(value: 'plot', child: Text('Plot')),
                  DropdownMenuItem(value: 'commercial', child: Text('Commercial')),
                  DropdownMenuItem(value: 'industrial', child: Text('Industrial')),
                  DropdownMenuItem(value: 'agricultural', child: Text('Agricultural')),
                  DropdownMenuItem(value: 'other', child: Text('Other')),
                ],
                onChanged: (value) => _updateFilter('propertyType', value),
              ),
            ),

            // Location
            _buildFilterSection(
              'City',
              TextField(
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Enter city',
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                controller: TextEditingController(text: _filters.city ?? ''),
                onChanged: (value) => _updateFilter('city', value.isEmpty ? null : value),
              ),
            ),

            _buildFilterSection(
              'Locality/Area',
              TextField(
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  hintText: 'Enter locality',
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                controller: TextEditingController(text: _filters.locality ?? ''),
                onChanged: (value) => _updateFilter('locality', value.isEmpty ? null : value),
              ),
            ),

            // Price Range
            _buildFilterSection(
              'Price Range (₹)',
              Row(
                children: [
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: 'Min Price',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      keyboardType: TextInputType.number,
                      controller: TextEditingController(
                        text: _filters.minPrice != null ? _filters.minPrice!.toStringAsFixed(0) : '',
                      ),
                      onChanged: (value) => _updateFilter('minPrice', value.isEmpty ? null : value),
                    ),
                  ),
                  const SizedBox(width: 8),
                  const Text('to'),
                  const SizedBox(width: 8),
                  Expanded(
                    child: TextField(
                      decoration: const InputDecoration(
                        border: OutlineInputBorder(),
                        hintText: 'Max Price',
                        contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                      ),
                      keyboardType: TextInputType.number,
                      controller: TextEditingController(
                        text: _filters.maxPrice != null ? _filters.maxPrice!.toStringAsFixed(0) : '',
                      ),
                      onChanged: (value) => _updateFilter('maxPrice', value.isEmpty ? null : value),
                    ),
                  ),
                ],
              ),
            ),

            // Bedrooms & Bathrooms
            _buildFilterSection(
              'Bedrooms',
              DropdownButtonFormField<int>(
                value: _filters.bedrooms,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                hint: const Text('Any'),
                items: const [
                  DropdownMenuItem(value: 1, child: Text('1 BHK')),
                  DropdownMenuItem(value: 2, child: Text('2 BHK')),
                  DropdownMenuItem(value: 3, child: Text('3 BHK')),
                  DropdownMenuItem(value: 4, child: Text('4 BHK')),
                  DropdownMenuItem(value: 5, child: Text('5+ BHK')),
                ],
                onChanged: (value) => _updateFilter('bedrooms', value),
              ),
            ),

            _buildFilterSection(
              'Bathrooms',
              DropdownButtonFormField<int>(
                value: _filters.bathrooms,
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                hint: const Text('Any'),
                items: const [
                  DropdownMenuItem(value: 1, child: Text('1')),
                  DropdownMenuItem(value: 2, child: Text('2')),
                  DropdownMenuItem(value: 3, child: Text('3')),
                  DropdownMenuItem(value: 4, child: Text('4+')),
                ],
                onChanged: (value) => _updateFilter('bathrooms', value),
              ),
            ),

            // Sort By
            _buildFilterSection(
              'Sort By',
              DropdownButtonFormField<String>(
                value: _filters.rankBy ?? 'relevance',
                decoration: const InputDecoration(
                  border: OutlineInputBorder(),
                  contentPadding: EdgeInsets.symmetric(horizontal: 12, vertical: 8),
                ),
                items: const [
                  DropdownMenuItem(value: 'relevance', child: Text('Relevance')),
                  DropdownMenuItem(value: 'price', child: Text('Price')),
                  DropdownMenuItem(value: 'popularity', child: Text('Popularity')),
                  DropdownMenuItem(value: 'urgency', child: Text('Urgency')),
                  DropdownMenuItem(value: 'newest', child: Text('Newest')),
                ],
                onChanged: (value) => _updateFilter('rankBy', value),
              ),
            ),
                  ],
                ),
              ),
            );
          },
        ),
      ),
    );
  }

  Widget _buildFilterSection(String title, Widget child) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            title,
            style: const TextStyle(
              fontSize: 14,
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
          child,
        ],
      ),
    );
  }

  Widget _buildFilterChip(String label, bool isActive, VoidCallback onTap) {
    return InkWell(
      onTap: onTap,
      child: Container(
        padding: const EdgeInsets.symmetric(vertical: 12, horizontal: 16),
        decoration: BoxDecoration(
          color: isActive ? Theme.of(context).primaryColor : Colors.grey[200],
          borderRadius: BorderRadius.circular(8),
        ),
        child: Center(
          child: Text(
            label,
            style: TextStyle(
              color: isActive ? Colors.white : Colors.black87,
              fontWeight: isActive ? FontWeight.w600 : FontWeight.normal,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildResults() {
    if (_isLoading && _results == null) {
      return const Center(
        child: CircularProgressIndicator(),
      );
    }

    if (_error != null) {
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.error_outline, size: 64, color: Colors.red),
                const SizedBox(height: 16),
                Text(
                  'Error: $_error',
                  style: const TextStyle(color: Colors.red),
                  textAlign: TextAlign.center,
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: () => _performSearch(reset: true),
                  child: const Text('Try Again'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    if (_results == null) {
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.search, size: 64, color: Colors.grey),
                const SizedBox(height: 16),
                const Text(
                  'Start Your Property Search',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Padding(
                  padding: EdgeInsets.symmetric(horizontal: 32),
                  child: Text(
                    'Enter a natural language query or use filters to find your perfect property',
                    textAlign: TextAlign.center,
                    style: TextStyle(color: Colors.grey),
                  ),
                ),
                const SizedBox(height: 24),
                const Text(
                  'Example Searches:',
                  style: TextStyle(
                    fontSize: 16,
                    fontWeight: FontWeight.w600,
                  ),
                ),
                const SizedBox(height: 16),
                _buildExampleSearch('"2BHK apartment in Hyderabad under 50L"'),
                _buildExampleSearch('"3BHK villa near beach in Mumbai"'),
                _buildExampleSearch('"commercial space in Bangalore"'),
              ],
            ),
          ),
        ),
      );
    }

    if (_results!.properties.isEmpty) {
      return SingleChildScrollView(
        physics: const AlwaysScrollableScrollPhysics(),
        child: Padding(
          padding: const EdgeInsets.all(24),
          child: Center(
            child: Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                const Icon(Icons.search_off, size: 64, color: Colors.grey),
                const SizedBox(height: 16),
                const Text(
                  'No properties found',
                  style: TextStyle(
                    fontSize: 20,
                    fontWeight: FontWeight.bold,
                  ),
                ),
                const SizedBox(height: 8),
                const Text(
                  'Try adjusting your search criteria or filters',
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 16),
                ElevatedButton(
                  onPressed: _clearFilters,
                  child: const Text('Clear Filters'),
                ),
              ],
            ),
          ),
        ),
      );
    }

    return Column(
      children: [
        // Results Info
        Container(
          padding: const EdgeInsets.all(16),
          color: Colors.grey[100],
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Text(
                '${_results!.total} ${_results!.total == 1 ? 'property' : 'properties'} found',
                style: const TextStyle(
                  fontWeight: FontWeight.w600,
                ),
              ),
              if (_results!.searchMetadata.aiRankingUsed)
                const Row(
                  children: [
                    Icon(Icons.auto_awesome, size: 16, color: Colors.orange),
                    SizedBox(width: 4),
                    Text(
                      'AI Ranked',
                      style: TextStyle(fontSize: 12, color: Colors.orange),
                    ),
                  ],
                ),
            ],
          ),
        ),

        // Extracted Filters
        if ((_results!.extractedFilters.location != null && 
             _results!.extractedFilters.location!.isNotEmpty) ||
            _results!.extractedFilters.propertyType != null ||
            (_results!.extractedFilters.aiTags != null && _results!.extractedFilters.aiTags!.isNotEmpty))
          Container(
            padding: const EdgeInsets.all(16),
            color: Colors.blue[50],
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'AI Extracted Filters:',
                  style: TextStyle(
                    fontWeight: FontWeight.w600,
                    fontSize: 14,
                  ),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: [
                    if (_results!.extractedFilters.location != null && 
                        _results!.extractedFilters.location!.containsKey('city') &&
                        _results!.extractedFilters.location!['city'] != null)
                      if (!_dismissedExtracted.contains('city'))
                        _buildExtractedTag(
                          '📍 ${_results!.extractedFilters.location!['city']}',
                          onRemove: () {
                            setState(() => _dismissedExtracted.add('city'));
                            _updateFilter('city', null);
                          },
                        ),
                    if (_results!.extractedFilters.propertyType != null)
                      if (!_dismissedExtracted.contains('propertyType'))
                        _buildExtractedTag(
                          '🏠 ${_results!.extractedFilters.propertyType}',
                          onRemove: () {
                            setState(() => _dismissedExtracted.add('propertyType'));
                            _updateFilter('propertyType', null);
                          },
                        ),
                    if (_results!.extractedFilters.bedrooms != null)
                      if (!_dismissedExtracted.contains('bedrooms'))
                        _buildExtractedTag(
                          '🛏️ ${_results!.extractedFilters.bedrooms} BHK',
                          onRemove: () {
                            setState(() => _dismissedExtracted.add('bedrooms'));
                            _updateFilter('bedrooms', null);
                          },
                        ),
                    if (_results!.extractedFilters.aiTags != null)
                      ..._results!.extractedFilters.aiTags!
                          .where((tag) => !_dismissedExtracted.contains('aiTag:$tag'))
                          .map(
                            (tag) => _buildExtractedTag(
                              '✨ $tag',
                              isAiTag: true,
                              onRemove: () {
                                setState(() => _dismissedExtracted.add('aiTag:$tag'));
                                final currentTags = List<String>.from(_filters.aiTags ?? []);
                                currentTags.remove(tag);
                                _updateFilter('aiTags', currentTags);
                              },
                            ),
                          ),
                  ],
                ),
              ],
            ),
          ),

        // Properties List with Pull-to-Refresh
        Expanded(
          child: RefreshIndicator(
            onRefresh: () => _performSearch(reset: true),
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.all(16),
              itemCount: _results!.properties.length + (_isLoadingMore ? 1 : 0),
              itemBuilder: (context, index) {
              if (index == _results!.properties.length) {
                return const Center(
                  child: Padding(
                    padding: EdgeInsets.all(16),
                    child: CircularProgressIndicator(),
                  ),
                );
              }

              final property = _results!.properties[index];
              return Column(
                children: [
                  PropertyCard(
                    property: property,
                    onTap: () {
                      // TODO: Navigate to property details
                      ScaffoldMessenger.of(context).showSnackBar(
                        SnackBar(content: Text('Property: ${property.title}')),
                      );
                    },
                  ),
                  // Match Reasons
                  if (property.matchReasons != null && property.matchReasons!.isNotEmpty)
                    Container(
                      margin: const EdgeInsets.only(top: 8, bottom: 16),
                      padding: const EdgeInsets.all(12),
                      decoration: BoxDecoration(
                        color: Colors.grey[100],
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          const Text(
                            'Why this matches:',
                            style: TextStyle(
                              fontWeight: FontWeight.w600,
                              fontSize: 12,
                            ),
                          ),
                          const SizedBox(height: 4),
                          ...property.matchReasons!.map(
                            (reason) => Padding(
                              padding: const EdgeInsets.only(left: 8, top: 2),
                              child: Text(
                                '• $reason',
                                style: const TextStyle(fontSize: 11, color: Colors.grey),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  // AI Scores
                  if (property.relevanceScore != null ||
                      property.urgencyScore != null ||
                      property.popularityScore != null)
                    Wrap(
                      spacing: 8,
                      runSpacing: 8,
                      children: [
                        if (property.relevanceScore != null)
                          _buildScoreBadge(
                            'Relevance: ${(property.relevanceScore! * 100).toStringAsFixed(0)}%',
                            Colors.blue,
                          ),
                        if (property.urgencyScore != null)
                          _buildScoreBadge(
                            'Urgency: ${(property.urgencyScore! * 100).toStringAsFixed(0)}%',
                            Colors.orange,
                          ),
                        if (property.popularityScore != null)
                          _buildScoreBadge(
                            'Popularity: ${(property.popularityScore! * 100).toStringAsFixed(0)}%',
                            Colors.green,
                          ),
                      ],
                    ),
                  const SizedBox(height: 16),
                ],
              );
            },
            ),
          ),
        ),
      ],
    );
  }

  Widget _buildExampleSearch(String query) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 32, vertical: 4),
      child: InkWell(
        onTap: () {
          _searchController.text = query.replaceAll('"', '');
          _handleSearch();
        },
        child: Container(
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            color: Colors.grey[100],
            borderRadius: BorderRadius.circular(8),
          ),
          child: Text(
            query,
            style: const TextStyle(
              fontSize: 12,
              color: Colors.grey,
            ),
          ),
        ),
      ),
    );
  }

  Widget _buildExtractedTag(String label, {bool isAiTag = false, VoidCallback? onRemove}) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: isAiTag ? Colors.orange[100] : Colors.white,
        borderRadius: BorderRadius.circular(4),
      ),
      child: Row(
        mainAxisSize: MainAxisSize.min,
        children: [
          Text(
            label,
            style: TextStyle(
              fontSize: 12,
              color: isAiTag ? Colors.orange[900] : Colors.black87,
            ),
          ),
          if (onRemove != null) ...[
            const SizedBox(width: 6),
            InkWell(
              onTap: onRemove,
              child: Icon(
                Icons.close,
                size: 14,
                color: isAiTag ? Colors.orange[900] : Colors.black54,
              ),
            ),
          ],
        ],
      ),
    );
  }

  Widget _buildScoreBadge(String label, Color color) {
    return Container(
      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
      decoration: BoxDecoration(
        color: color.withOpacity(0.1),
        borderRadius: BorderRadius.circular(4),
      ),
      child: Text(
        label,
        style: TextStyle(
          fontSize: 10,
          fontWeight: FontWeight.w600,
          color: color,
        ),
      ),
    );
  }
}

