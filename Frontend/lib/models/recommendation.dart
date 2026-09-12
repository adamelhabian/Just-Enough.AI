import 'package:flutter/material.dart';
import '../core/theme.dart';

enum RecommendationStatus { shortage, waste, normal }
enum RecommendationSeverity { critical, warning, info }

class Recommendation {
  final String id;
  final String productName;
  final String productId;
  final String branchId;
  final double recommendedQty;
  final double currentInventory;
  final double forecastDemand;
  final double safetyStock;
  final RecommendationStatus status;
  final RecommendationSeverity severity;
  final String explanation;
  final DateTime createdAt;

  Recommendation({
    required this.id,
    required this.productName,
    required this.productId,
    required this.branchId,
    required this.recommendedQty,
    required this.currentInventory,
    required this.forecastDemand,
    required this.safetyStock,
    required this.status,
    required this.severity,
    required this.explanation,
    required this.createdAt,
  });

  factory Recommendation.fromJson(Map<String, dynamic> json) {
    return Recommendation(
      id: json['id'] as String,
      productName: json['productName'] as String,
      productId: json['productId'] as String,
      branchId: json['branchId'] as String,
      recommendedQty: (json['recommendedQty'] as num).toDouble(),
      currentInventory: (json['currentInventory'] as num).toDouble(),
      forecastDemand: (json['forecastDemand'] as num).toDouble(),
      safetyStock: (json['safetyStock'] as num).toDouble(),
      status: RecommendationStatus.values.firstWhere((e) => e.name == json['status']),
      severity: RecommendationSeverity.values.firstWhere((e) => e.name == json['severity']),
      explanation: json['explanation'] as String,
      createdAt: DateTime.parse(json['createdAt'] as String),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'productName': productName,
      'productId': productId,
      'branchId': branchId,
      'recommendedQty': recommendedQty,
      'currentInventory': currentInventory,
      'forecastDemand': forecastDemand,
      'safetyStock': safetyStock,
      'status': status.name,
      'severity': severity.name,
      'explanation': explanation,
      'createdAt': createdAt.toIso8601String(),
    };
  }

  Color get statusColor {
    switch (status) {
      case RecommendationStatus.shortage:
        return JustEnoughTheme.shortageColor;
      case RecommendationStatus.waste:
        return JustEnoughTheme.wasteColor;
      case RecommendationStatus.normal:
        return JustEnoughTheme.normalColor;
    }
  }

  IconData get statusIcon {
    switch (status) {
      case RecommendationStatus.shortage:
        return JustEnoughTheme.shortageIcon;
      case RecommendationStatus.waste:
        return JustEnoughTheme.wasteIcon;
      case RecommendationStatus.normal:
        return JustEnoughTheme.normalIcon;
    }
  }
}