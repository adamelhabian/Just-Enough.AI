import 'dart:developer';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/recommendation.dart';
import '../core/api_client.dart';
import '../core/local_queue.dart';

final mockRecommendations = <Recommendation>[
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

final recommendationsProvider = FutureProvider<List<Recommendation>>((ref) async {
  final client = ref.watch(apiClientProvider);
  try {
    final response = await client.dio.get('/api/v1/recommendations');
    if (response.statusCode == 200 && response.data != null) {
      final data = response.data;
      final rawList = data is Map ? (data['data'] as List? ?? []) : (data is List ? data : []);
      if (rawList.isNotEmpty) {
        return rawList
            .map((e) => Recommendation.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }
  } catch (e) {
    log('Recommendations API fetch error, falling back to mock recommendations: $e');
  }
  return mockRecommendations;
});

class OverrideResult {
  final bool synced;
  final bool queuedOffline;
  final String message;
  final dynamic data;

  OverrideResult({
    required this.synced,
    required this.queuedOffline,
    required this.message,
    this.data,
  });
}

class RecommendationsRepository {
  final ApiClient client;
  final LocalQueue queue;

  RecommendationsRepository(this.client) : queue = LocalQueue(client.dio);

  Future<OverrideResult> overrideRecommendation({
    required String id,
    required double newQty,
    required String reason,
  }) async {
    final payload = {
      'recommended_qty': newQty,
      'override_reason': reason,
    };

    try {
      final response = await client.dio.post(
        '/api/v1/recommendations/$id/override',
        data: payload,
      );
      if (response.statusCode == 200) {
        return OverrideResult(
          synced: true,
          queuedOffline: false,
          message: 'Override saved and audited on server.',
          data: response.data,
        );
      }
    } catch (e) {
      log('Direct override sync failed ($e), queuing offline mutation');
    }

    try {
      await queue.enqueue('/api/v1/recommendations/$id/override', 'POST', payload);
      return OverrideResult(
        synced: false,
        queuedOffline: true,
        message: 'Saved locally. Override queued for background sync.',
      );
    } catch (qErr) {
      log('Local queue enqueue failed: $qErr');
      return OverrideResult(
        synced: false,
        queuedOffline: false,
        message: 'Failed to record override: $qErr',
      );
    }
  }
}

final recommendationsRepositoryProvider = Provider<RecommendationsRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return RecommendationsRepository(client);
});
