import 'package:flutter/material.dart';

class AISearchBar extends StatefulWidget {
  final ValueChanged<String>? onSearch;
  
  const AISearchBar({
    super.key,
    this.onSearch,
  });

  @override
  State<AISearchBar> createState() => _AISearchBarState();
}

class _AISearchBarState extends State<AISearchBar> {
  final _controller = TextEditingController();

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _handleSearch() {
    final query = _controller.text.trim();
    widget.onSearch?.call(query);
  }

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(16),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
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
                    controller: _controller,
                    decoration: const InputDecoration(
                      hintText: 'Search properties using natural language...',
                      border: InputBorder.none,
                      contentPadding: EdgeInsets.symmetric(horizontal: 16, vertical: 16),
                    ),
                    onSubmitted: (_) => _handleSearch(),
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FittedBox(
                    fit: BoxFit.scaleDown,
                    child: ElevatedButton(
                      onPressed: _handleSearch,
                      style: ElevatedButton.styleFrom(
                        padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 12),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                      ),
                      child: const Text('Search'),
                    ),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 8),
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text(
              '💡 Powered by AI - Describe what you\'re looking for in your own words',
              style: TextStyle(
                fontSize: 12,
                color: Colors.grey,
              ),
            ),
          ),
        ],
      ),
    );
  }
}
