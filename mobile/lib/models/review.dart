double _parseDouble(dynamic value) {
  if (value is double) return value;
  if (value is int) return value.toDouble();
  if (value is num) return value.toDouble();
  if (value is String) return double.tryParse(value) ?? 0;
  return 0;
}

int _parseInt(dynamic value) {
  if (value is int) return value;
  if (value is num) return value.toInt();
  if (value is String) return int.tryParse(value) ?? 0;
  return 0;
}

class Review {
  final String id;
  final String reviewerId;
  final String? reviewerName;
  final String revieweeId;
  final String? revieweeName;
  final String? propertyId;
  final String? propertyTitle;
  final String? interestExpressionId;
  final String? chatSessionId;
  final String reviewType;
  final String? reviewContext;
  final double overallRating;
  final double? propertyRating;
  final double? sellerRating;
  final double? responsivenessRating;
  final double? communicationRating;
  final double? professionalismRating;
  final String? title;
  final String comment;
  final String? pros;
  final String? cons;
  final double? sentimentScore;
  final String? sentimentLabel;
  final double? fakeReviewScore;
  final bool fakeReviewDetected;
  final List<String>? fakeReviewReasons;
  final double? aiConfidence;
  final String status;
  final int helpfulCount;
  final int notHelpfulCount;
  final bool isVerifiedPurchase;
  final bool isAnonymous;
  final bool isEdited;
  final DateTime createdAt;
  final DateTime updatedAt;
  final bool hasUserVoted;
  final bool? userVoteIsHelpful;
  final int repliesCount;

  Review({
    required this.id,
    required this.reviewerId,
    required this.revieweeId,
    required this.reviewType,
    required this.overallRating,
    required this.comment,
    required this.fakeReviewDetected,
    required this.status,
    required this.helpfulCount,
    required this.notHelpfulCount,
    required this.isVerifiedPurchase,
    required this.isAnonymous,
    required this.isEdited,
    required this.createdAt,
    required this.updatedAt,
    required this.hasUserVoted,
    required this.repliesCount,
    this.reviewerName,
    this.revieweeName,
    this.propertyId,
    this.propertyTitle,
    this.interestExpressionId,
    this.chatSessionId,
    this.reviewContext,
    this.propertyRating,
    this.sellerRating,
    this.responsivenessRating,
    this.communicationRating,
    this.professionalismRating,
    this.title,
    this.pros,
    this.cons,
    this.sentimentScore,
    this.sentimentLabel,
    this.fakeReviewScore,
    this.fakeReviewReasons,
    this.aiConfidence,
    this.userVoteIsHelpful,
  });

  factory Review.fromJson(Map<String, dynamic> json) {
    return Review(
      id: json['id']?.toString() ?? '',
      reviewerId: json['reviewerId']?.toString() ?? '',
      reviewerName: json['reviewerName']?.toString(),
      revieweeId: json['revieweeId']?.toString() ?? '',
      revieweeName: json['revieweeName']?.toString(),
      propertyId: json['propertyId']?.toString(),
      propertyTitle: json['propertyTitle']?.toString(),
      interestExpressionId: json['interestExpressionId']?.toString(),
      chatSessionId: json['chatSessionId']?.toString(),
      reviewType: json['reviewType']?.toString() ?? 'property',
      reviewContext: json['reviewContext']?.toString(),
      overallRating: _parseDouble(json['overallRating']),
      propertyRating: json['propertyRating'] != null ? _parseDouble(json['propertyRating']) : null,
      sellerRating: json['sellerRating'] != null ? _parseDouble(json['sellerRating']) : null,
      responsivenessRating: json['responsivenessRating'] != null ? _parseDouble(json['responsivenessRating']) : null,
      communicationRating: json['communicationRating'] != null ? _parseDouble(json['communicationRating']) : null,
      professionalismRating: json['professionalismRating'] != null ? _parseDouble(json['professionalismRating']) : null,
      title: json['title']?.toString(),
      comment: json['comment']?.toString() ?? '',
      pros: json['pros']?.toString(),
      cons: json['cons']?.toString(),
      sentimentScore: json['sentimentScore'] != null ? _parseDouble(json['sentimentScore']) : null,
      sentimentLabel: json['sentimentLabel']?.toString(),
      fakeReviewScore: json['fakeReviewScore'] != null ? _parseDouble(json['fakeReviewScore']) : null,
      fakeReviewDetected: json['fakeReviewDetected'] == true,
      fakeReviewReasons: json['fakeReviewReasons'] != null
          ? (json['fakeReviewReasons'] as List).map((e) => e.toString()).toList()
          : null,
      aiConfidence: json['aiConfidence'] != null ? _parseDouble(json['aiConfidence']) : null,
      status: json['status']?.toString() ?? 'pending',
      helpfulCount: _parseInt(json['helpfulCount']),
      notHelpfulCount: _parseInt(json['notHelpfulCount']),
      isVerifiedPurchase: json['isVerifiedPurchase'] == true,
      isAnonymous: json['isAnonymous'] == true,
      isEdited: json['isEdited'] == true,
      createdAt: DateTime.tryParse(json['createdAt']?.toString() ?? '') ?? DateTime.now(),
      updatedAt: DateTime.tryParse(json['updatedAt']?.toString() ?? '') ?? DateTime.now(),
      hasUserVoted: json['hasUserVoted'] == true,
      userVoteIsHelpful: json['userVoteIsHelpful'] != null ? json['userVoteIsHelpful'] == true : null,
      repliesCount: _parseInt(json['repliesCount']),
    );
  }
}

class ReviewListResponse {
  final List<Review> reviews;
  final int total;
  final int page;
  final int limit;

  ReviewListResponse({
    required this.reviews,
    required this.total,
    required this.page,
    required this.limit,
  });

  factory ReviewListResponse.fromJson(Map<String, dynamic> json) {
    return ReviewListResponse(
      reviews: (json['reviews'] as List? ?? [])
          .map((item) => Review.fromJson(Map<String, dynamic>.from(item)))
          .toList(),
      total: _parseInt(json['total']),
      page: _parseInt(json['page']),
      limit: _parseInt(json['limit']),
    );
  }
}
