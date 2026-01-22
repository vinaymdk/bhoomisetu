import 'property.dart';

class CsSeller {
  final String id;
  final String? fullName;
  final String? primaryPhone;
  final String? primaryEmail;

  CsSeller({
    required this.id,
    this.fullName,
    this.primaryPhone,
    this.primaryEmail,
  });

  factory CsSeller.fromJson(Map<String, dynamic> json) {
    return CsSeller(
      id: json['id'] as String,
      fullName: json['fullName'] as String?,
      primaryPhone: json['primaryPhone'] as String?,
      primaryEmail: json['primaryEmail'] as String?,
    );
  }
}

class VerificationNote {
  final String? urgencyLevel;
  final String? negotiationNotes;
  final String? remarks;
  final String? verifiedAt;

  VerificationNote({
    this.urgencyLevel,
    this.negotiationNotes,
    this.remarks,
    this.verifiedAt,
  });

  factory VerificationNote.fromJson(Map<String, dynamic> json) {
    return VerificationNote(
      urgencyLevel: json['urgencyLevel'] as String?,
      negotiationNotes: json['negotiationNotes'] as String?,
      remarks: json['remarks'] as String?,
      verifiedAt: json['verifiedAt'] as String?,
    );
  }
}

class PendingVerificationProperty {
  final Property property;
  final CsSeller seller;
  final List<VerificationNote> verificationNotes;

  PendingVerificationProperty({
    required this.property,
    required this.seller,
    required this.verificationNotes,
  });

  factory PendingVerificationProperty.fromJson(Map<String, dynamic> json) {
    final notes = (json['verificationNotes'] as List?)
            ?.map((e) => VerificationNote.fromJson(Map<String, dynamic>.from(e)))
            .toList() ??
        [];
    return PendingVerificationProperty(
      property: Property.fromJson(Map<String, dynamic>.from(json['property'] ?? {})),
      seller: CsSeller.fromJson(Map<String, dynamic>.from(json['seller'] ?? {})),
      verificationNotes: notes,
    );
  }
}

class CsStats {
  final int pending;
  final int verified;
  final int rejected;
  final int total;

  CsStats({
    required this.pending,
    required this.verified,
    required this.rejected,
    required this.total,
  });

  factory CsStats.fromJson(Map<String, dynamic> json) {
    int parseInt(dynamic value) {
      if (value == null) return 0;
      if (value is num) return value.toInt();
      if (value is String) return int.tryParse(value) ?? 0;
      return 0;
    }
    return CsStats(
      pending: parseInt(json['pending']),
      verified: parseInt(json['verified']),
      rejected: parseInt(json['rejected']),
      total: parseInt(json['total']),
    );
  }
}
