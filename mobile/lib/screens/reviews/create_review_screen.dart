import 'package:flutter/material.dart';
import '../../models/mediation.dart';
import '../../models/review.dart';
import '../../services/mediation_service.dart';
import '../../services/reviews_service.dart';

class CreateReviewScreen extends StatefulWidget {
  final String? propertyId;
  final String? revieweeId;
  final String? reviewId;

  const CreateReviewScreen({super.key, this.propertyId, this.revieweeId, this.reviewId});

  @override
  State<CreateReviewScreen> createState() => _CreateReviewScreenState();
}

class _CreateReviewScreenState extends State<CreateReviewScreen> {
  final _formKey = GlobalKey<FormState>();
  final ReviewsService _service = ReviewsService();
  final MediationService _mediationService = MediationService();
  final TextEditingController _revieweeController = TextEditingController();
  final TextEditingController _propertyController = TextEditingController();
  final TextEditingController _commentController = TextEditingController();
  final TextEditingController _titleController = TextEditingController();
  final TextEditingController _prosController = TextEditingController();
  final TextEditingController _consController = TextEditingController();
  final TextEditingController _interestController = TextEditingController();
  final TextEditingController _chatSessionController = TextEditingController();
  String _reviewType = 'property';
  String _reviewContext = 'after_viewing';
  double _overallRating = 5;
  bool _isAnonymous = false;
  bool _submitting = false;
  bool _loading = true;
  String? _error;
  Review? _existingReview;
  List<InterestExpression> _interestOptions = [];
  bool _canEdit = true;

  @override
  void initState() {
    super.initState();
    _revieweeController.text = widget.revieweeId ?? '';
    _propertyController.text = widget.propertyId ?? '';
    _loadDefaults();
  }

  @override
  void dispose() {
    _revieweeController.dispose();
    _propertyController.dispose();
    _commentController.dispose();
    _titleController.dispose();
    _prosController.dispose();
    _consController.dispose();
    _interestController.dispose();
    _chatSessionController.dispose();
    super.dispose();
  }

  Future<void> _loadDefaults() async {
    try {
      if (widget.reviewId != null) {
        _existingReview = await _service.getById(widget.reviewId!);
      } else if (widget.propertyId != null) {
        final mine = await _service.listMine(propertyId: widget.propertyId, limit: 1, page: 1);
        _existingReview = mine.reviews.isNotEmpty ? mine.reviews.first : null;
      }
      if (_existingReview != null) {
        final review = _existingReview!;
        _canEdit = ['pending', 'flagged'].contains(review.status);
        _revieweeController.text = review.revieweeId;
        _propertyController.text = review.propertyId ?? '';
        _reviewType = review.reviewType;
        _reviewContext = review.reviewContext ?? 'after_viewing';
        _overallRating = review.overallRating;
        _titleController.text = review.title ?? '';
        _commentController.text = review.comment;
        _prosController.text = review.pros ?? '';
        _consController.text = review.cons ?? '';
        _isAnonymous = review.isAnonymous;
      }

      if (widget.propertyId != null) {
        final response = await _mediationService.getMyInterests(propertyId: widget.propertyId, limit: 5, page: 1);
        _interestOptions = response.interests
            .where((interest) => ['approved', 'connected'].contains(interest.connectionStatus))
            .toList();
        if (_interestOptions.isNotEmpty) {
          _interestController.text = _interestOptions.first.id;
          final chatSessionId = _interestOptions.first.chatSessionId;
          if (chatSessionId != null) {
            _chatSessionController.text = chatSessionId;
          }
        }
      }
    } catch (_) {
      // Best-effort defaults.
    } finally {
      if (mounted) {
        setState(() => _loading = false);
      }
    }
  }

  Future<void> _submit() async {
    if (!_formKey.currentState!.validate() || !_canEdit) return;
    setState(() {
      _submitting = true;
      _error = null;
    });
    try {
      final payload = {
        'revieweeId': _revieweeController.text.trim(),
        if (_propertyController.text.trim().isNotEmpty) 'propertyId': _propertyController.text.trim(),
        if (_interestController.text.trim().isNotEmpty) 'interestExpressionId': _interestController.text.trim(),
        if (_chatSessionController.text.trim().isNotEmpty) 'chatSessionId': _chatSessionController.text.trim(),
        'reviewType': _reviewType,
        'reviewContext': _reviewContext,
        'overallRating': _overallRating.round(),
        if (_titleController.text.trim().isNotEmpty) 'title': _titleController.text.trim(),
        'comment': _commentController.text.trim(),
        if (_prosController.text.trim().isNotEmpty) 'pros': _prosController.text.trim(),
        if (_consController.text.trim().isNotEmpty) 'cons': _consController.text.trim(),
        'isAnonymous': _isAnonymous,
      };
      if (_existingReview != null) {
        await _service.update(_existingReview!.id, payload);
      } else {
        await _service.create(payload);
      }
      if (mounted) {
        Navigator.of(context).pop();
      }
    } catch (e) {
      setState(() {
        _error = e.toString().replaceAll('Exception: ', '').replaceAll('DioException [bad response]: ', '');
      });
    } finally {
      if (mounted) {
        setState(() => _submitting = false);
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    if (widget.propertyId == null || widget.revieweeId == null) {
      return Scaffold(
        appBar: AppBar(
          title: const Text('Create Review'),
          backgroundColor: Theme.of(context).colorScheme.primary,
          foregroundColor: Colors.white,
        ),
        body: const Center(
          child: Text('Reviews can only be created from a property details page.'),
        ),
      );
    }
    return Scaffold(
      appBar: AppBar(
        title: Text(_existingReview != null ? 'Edit Review' : 'Create Review'),
        backgroundColor: Theme.of(context).colorScheme.primary,
        foregroundColor: Colors.white,
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              if (_loading) const LinearProgressIndicator(),
              if (_error != null)
                Container(
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.red.shade50,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: Text(_error!, style: const TextStyle(color: Colors.red)),
                ),
              if (!_canEdit)
                Container(
                  padding: const EdgeInsets.all(10),
                  margin: const EdgeInsets.only(bottom: 12),
                  decoration: BoxDecoration(
                    color: Colors.orange.shade50,
                    borderRadius: BorderRadius.circular(10),
                  ),
                  child: const Text(
                    'This review was already moderated and cannot be edited.',
                    style: TextStyle(color: Colors.deepOrange),
                  ),
                ),
              TextFormField(
                controller: _revieweeController,
                decoration: const InputDecoration(labelText: 'Reviewee ID (Seller/Agent)'),
                validator: (value) => value == null || value.trim().isEmpty ? 'Reviewee ID required' : null,
                readOnly: widget.revieweeId != null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _propertyController,
                decoration: const InputDecoration(labelText: 'Property ID (optional)'),
                readOnly: widget.propertyId != null,
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _reviewType,
                items: const [
                  DropdownMenuItem(value: 'property', child: Text('Property')),
                  DropdownMenuItem(value: 'seller', child: Text('Seller')),
                  DropdownMenuItem(value: 'experience', child: Text('Experience')),
                  DropdownMenuItem(value: 'deal', child: Text('Deal')),
                ],
                onChanged: (value) => setState(() => _reviewType = value ?? 'property'),
                decoration: const InputDecoration(labelText: 'Review Type'),
              ),
              const SizedBox(height: 12),
              DropdownButtonFormField<String>(
                value: _reviewContext,
                items: const [
                  DropdownMenuItem(value: 'after_viewing', child: Text('After Viewing')),
                  DropdownMenuItem(value: 'after_deal', child: Text('After Deal')),
                  DropdownMenuItem(value: 'after_interaction', child: Text('After Interaction')),
                ],
                onChanged: (value) => setState(() => _reviewContext = value ?? 'after_viewing'),
                decoration: const InputDecoration(labelText: 'Context'),
              ),
              const SizedBox(height: 12),
              Text('Overall Rating: ${_overallRating.round()}'),
              Slider(
                value: _overallRating,
                min: 1,
                max: 5,
                divisions: 4,
                onChanged: (value) => setState(() => _overallRating = value),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _titleController,
                decoration: const InputDecoration(labelText: 'Title (optional)'),
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _commentController,
                decoration: const InputDecoration(labelText: 'Review'),
                maxLines: 4,
                validator: (value) => value == null || value.trim().isEmpty ? 'Review required' : null,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _prosController,
                decoration: const InputDecoration(labelText: 'Pros (optional)'),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              TextFormField(
                controller: _consController,
                decoration: const InputDecoration(labelText: 'Cons (optional)'),
                maxLines: 2,
              ),
              const SizedBox(height: 12),
              if (_interestOptions.isNotEmpty)
                DropdownButtonFormField<String>(
                  value: _interestController.text.isEmpty ? null : _interestController.text,
                  items: [
                    const DropdownMenuItem(value: '', child: Text('Select interest (optional)')),
                    ..._interestOptions.map(
                      (option) => DropdownMenuItem(
                        value: option.id,
                        child: Text('${option.interestType} • ${option.connectionStatus}'),
                      ),
                    ),
                  ],
                  onChanged: (value) => setState(() => _interestController.text = value ?? ''),
                  decoration: const InputDecoration(labelText: 'Interest Expression (optional)'),
                )
              else
                TextFormField(
                  controller: _interestController,
                  decoration: const InputDecoration(labelText: 'Interest Expression ID (optional)'),
                ),
              const SizedBox(height: 12),
              if (_interestOptions.any((element) => element.chatSessionId != null))
                DropdownButtonFormField<String>(
                  value: _chatSessionController.text.isEmpty ? null : _chatSessionController.text,
                  items: [
                    const DropdownMenuItem(value: '', child: Text('Select chat session (optional)')),
                    ..._interestOptions
                        .where((option) => option.chatSessionId != null)
                        .map(
                          (option) => DropdownMenuItem(
                            value: option.chatSessionId,
                            child: Text('${option.interestType} chat • ${option.connectionStatus}'),
                          ),
                        ),
                  ],
                  onChanged: (value) => setState(() => _chatSessionController.text = value ?? ''),
                  decoration: const InputDecoration(labelText: 'Chat Session (optional)'),
                )
              else
                TextFormField(
                  controller: _chatSessionController,
                  decoration: const InputDecoration(labelText: 'Chat Session ID (optional)'),
                ),
              const SizedBox(height: 12),
              SwitchListTile(
                value: _isAnonymous,
                title: const Text('Post anonymously'),
                onChanged: (value) => setState(() => _isAnonymous = value),
              ),
              const SizedBox(height: 16),
              SizedBox(
                width: double.infinity,
                child: ElevatedButton(
                  onPressed: _submitting || !_canEdit ? null : _submit,
                  child: Text(_submitting ? 'Submitting...' : _existingReview != null ? 'Update Review' : 'Submit Review'),
                ),
              ),
              const SizedBox(height: 8),
              const Text(
                'Tip: Add interest expression or chat session ID to mark the review as verified.',
                style: TextStyle(color: Colors.black54, fontSize: 12),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
