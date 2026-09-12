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

  factory Alert.fromJson(Map<String, dynamic> json) {
    return Alert(
      id: json['id'] as String,
      type: json['type'] as String,
      severity: AlertSeverity.values.firstWhere((e) => e.name == json['severity']),
      productName: json['productName'] as String,
      branchName: json['branchName'] as String,
      message: json['message'] as String,
      explanation: json['explanation'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
      acknowledgedAt: json['acknowledgedAt'] != null ? DateTime.parse(json['acknowledgedAt'] as String) : null,
      status: AlertStatus.values.firstWhere((e) => e.name == json['status']),
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
