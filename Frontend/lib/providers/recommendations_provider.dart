import 'dart:developer';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/recommendation.dart';
import '../core/api_client.dart';
import '../core/local_queue.dart';

const bool isDemoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

final mockRecommendations = <Recommendation>[
  Recommendation(
    id: 'DEMO-REC-1',
    productName: 'Classic Cheeseburger [DEMO]',
    productId: 'M01',
    branchId: 'R01',
    recommendedQty: 145,
    currentInventory: 10,
    forecastDemand: 138,
    safetyStock: 15,
    status: RecommendationStatus.shortage,
    severity: RecommendationSeverity.critical,
    explanation: 'Demonstration recommendation: upward trend [SYNTHETIC / DEMO].',
    createdAt: DateTime.now(),
  ),
  Recommendation(
    id: 'DEMO-REC-2',
    productName: 'Golden Fries [DEMO]',
    productId: 'M06',
    branchId: 'R01',
    recommendedQty: 48,
    currentInventory: 70,
    forecastDemand: 61,
    safetyStock: 5,
    status: RecommendationStatus.waste,
    severity: RecommendationSeverity.warning,
    explanation: 'Demonstration recommendation: stock surplus [SYNTHETIC / DEMO].',
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
      return rawList
          .map((e) => Recommendation.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    throw Exception('Unexpected server response: ${response.statusCode}');
  } catch (e) {
    log('Recommendations API fetch error: $e');
    if (isDemoMode) {
      log('[DEMO_MODE] Falling back to labeled synthetic recommendations');
      return mockRecommendations;
    }
    // LIVE mode: No silent fabrication. Re-throw error so UI renders OFFLINE / DATA UNAVAILABLE state
    throw Exception('OFFLINE / DATA UNAVAILABLE: Unable to retrieve recommendations ($e)');
  }
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
