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

  final String? overrideReason;

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
    this.overrideReason,
  });

  static RecommendationStatus _parseStatus(dynamic value) {
    if (value == null) return RecommendationStatus.normal;
    final s = value.toString().toLowerCase();
    if (s.contains('shortage')) return RecommendationStatus.shortage;
    if (s.contains('waste')) return RecommendationStatus.waste;
    return RecommendationStatus.values.firstWhere(
      (e) => e.name.toLowerCase() == s,
      orElse: () => RecommendationStatus.normal,
    );
  }

  static RecommendationSeverity _parseSeverity(dynamic value) {
    if (value == null) return RecommendationSeverity.info;
    final s = value.toString().toUpperCase();
    if (s == 'CRITICAL' || s == 'HIGH') return RecommendationSeverity.critical;
    if (s == 'WARNING' || s == 'MEDIUM') return RecommendationSeverity.warning;
    if (s == 'INFO' || s == 'LOW') return RecommendationSeverity.info;
    return RecommendationSeverity.values.firstWhere(
      (e) => e.name.toUpperCase() == s,
      orElse: () => RecommendationSeverity.info,
    );
  }

  factory Recommendation.fromJson(Map<String, dynamic> json) {
    final prodName = json['productName'] as String? ??
        json['product_name'] as String? ??
        json['product_id'] as String? ??
        'Product';
    final prodId = json['productId'] as String? ??
        json['product_id'] as String? ??
        '';
    final brId = json['branchId'] as String? ??
        json['branch_id'] as String? ??
        '';
    final qty = (json['recommendedQty'] ?? json['recommended_qty'] as num?)?.toDouble() ?? 0.0;
    final currInv = (json['currentInventory'] ?? json['current_inventory'] as num?)?.toDouble() ?? 0.0;
    final forecast = (json['forecastDemand'] ?? json['forecast_demand'] as num?)?.toDouble() ?? 0.0;
    final safety = (json['safetyStock'] ?? json['safety_stock'] as num?)?.toDouble() ?? 0.0;
    final expl = json['explanation'] as String? ?? '';
    final dateStr = json['createdAt'] as String? ?? json['target_date'] as String?;
    final dt = dateStr != null ? DateTime.tryParse(dateStr) ?? DateTime.now() : DateTime.now();

    return Recommendation(
      id: json['id'] as String? ?? '',
      productName: prodName,
      productId: prodId,
      branchId: brId,
      recommendedQty: qty,
      currentInventory: currInv,
      forecastDemand: forecast,
      safetyStock: safety,
      status: _parseStatus(json['status']),
      severity: _parseSeverity(json['severity'] ?? json['risk']),
      explanation: expl,
      createdAt: dt,
      overrideReason: json['override_reason'] as String?,
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
      'override_reason': overrideReason,
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