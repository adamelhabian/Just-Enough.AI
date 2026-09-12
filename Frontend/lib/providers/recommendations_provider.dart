import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/recommendation.dart';

final recommendationsProvider = FutureProvider<List<Recommendation>>((ref) async {
  // PROTOTYPE: Mock data fallback
  await Future.delayed(const Duration(seconds: 1)); // Simulate network
  return [
    Recommendation(
      id: '1',
      productName: 'Chicken Shawarma',
      productId: 'p1',
      branchId: 'b1',
      recommendedQty: 145,
      currentInventory: 10,
      forecastDemand: 138,
      safetyStock: 15,
      status: RecommendationStatus.shortage,
      severity: RecommendationSeverity.critical,
      explanation: 'Recent upward trend and Friday-like demand pattern.',
      createdAt: DateTime.now(),
    ),
    Recommendation(
      id: '2',
      productName: 'Falafel',
      productId: 'p2',
      branchId: 'b1',
      recommendedQty: 48,
      currentInventory: 70,
      forecastDemand: 61,
      safetyStock: 5,
      status: RecommendationStatus.waste,
      severity: RecommendationSeverity.warning,
      explanation: 'Existing usable stock exceeds expected demand.',
      createdAt: DateTime.now(),
    ),
  ];
});
