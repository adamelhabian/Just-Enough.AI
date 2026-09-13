enum AlertSeverity { critical, warning, info }
enum AlertStatus { active, acknowledged, resolved }

class Alert {
  final String id;
  final String type;
  final AlertSeverity severity;
  final String productName;
  final String branchName;
  final String message;
  final String explanation;
  final DateTime createdAt;
  final DateTime? acknowledgedAt;
  final AlertStatus status;

  Alert({
    required this.id,
    required this.type,
    required this.severity,
    required this.productName,
    required this.branchName,
    required this.message,
    required this.explanation,
    required this.createdAt,
    this.acknowledgedAt,
    required this.status,
  });

  static AlertSeverity _parseSeverity(dynamic value) {
    if (value == null) return AlertSeverity.info;
    final s = value.toString().toLowerCase();
    if (s == 'critical') return AlertSeverity.critical;
    if (s == 'high' || s == 'warning') return AlertSeverity.warning;
    return AlertSeverity.info;
  }

  static AlertStatus _parseStatus(dynamic json) {
    if (json is Map && json['is_resolved'] == true) return AlertStatus.resolved;
    if (json is Map && json['status'] != null) {
      final s = json['status'].toString().toLowerCase();
      return AlertStatus.values.firstWhere((e) => e.name.toLowerCase() == s, orElse: () => AlertStatus.active);
    }
    return AlertStatus.active;
  }

  factory Alert.fromJson(Map<String, dynamic> json) {
    final prodName = json['productName'] as String? ??
        json['product_name'] as String? ??
        json['product_id'] as String? ??
        'General';
    final brName = json['branchName'] as String? ??
        json['branch_name'] as String? ??
        json['branch_id'] as String? ??
        'Branch 01';
    final msg = json['message'] as String? ?? 'Operational alert';
    final expl = json['explanation'] as String? ?? msg;
    final alertType = json['type'] as String? ?? json['alert_type'] as String? ?? 'operational';
    final dateStr = json['createdAt'] as String? ?? json['created_at'] as String?;
    final dt = dateStr != null ? DateTime.tryParse(dateStr) ?? DateTime.now() : DateTime.now();
    final ackStr = json['acknowledgedAt'] as String? ?? json['acknowledged_at'] as String?;
    final ackDt = ackStr != null ? DateTime.tryParse(ackStr) : null;

    return Alert(
      id: json['id'] as String? ?? '',
      type: alertType,
      severity: _parseSeverity(json['severity']),
      productName: prodName,
      branchName: brName,
      message: msg,
      explanation: expl,
      createdAt: dt,
      acknowledgedAt: ackDt,
      status: _parseStatus(json),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'type': type,
      'severity': severity.name,
      'productName': productName,
      'branchName': branchName,
      'message': message,
      'explanation': explanation,
      'createdAt': createdAt.toIso8601String(),
      'acknowledgedAt': acknowledgedAt?.toIso8601String(),
      'status': status.name,
    };
  }
}
