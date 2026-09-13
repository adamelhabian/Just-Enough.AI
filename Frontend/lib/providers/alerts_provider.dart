import 'dart:developer';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/alert.dart';
import '../core/api_client.dart';
import '../core/local_queue.dart';

final mockAlerts = <Alert>[
  Alert(
    id: '1',
    type: 'stock_low',
    severity: AlertSeverity.critical,
    productName: 'Pita Bread',
    branchName: 'Downtown',
    message: 'Stock critically low',
    explanation: 'Only 2 packs remaining, expecting 50 orders.',
    createdAt: DateTime.now().subtract(const Duration(hours: 1)),
    status: AlertStatus.active,
  ),
  Alert(
    id: '2',
    type: 'waste_warning',
    severity: AlertSeverity.warning,
    productName: 'Tomatoes',
    branchName: 'Downtown',
    message: 'Surplus detected',
    explanation: 'Shelf life expiring in 24 hours.',
    createdAt: DateTime.now().subtract(const Duration(hours: 3)),
    status: AlertStatus.active,
  ),
];

final alertsProvider = FutureProvider<List<Alert>>((ref) async {
  final client = ref.watch(apiClientProvider);
  try {
    final response = await client.dio.get('/api/v1/alerts', queryParameters: {'unresolved_only': true});
    if (response.statusCode == 200 && response.data != null) {
      final data = response.data;
      final rawList = data is Map ? (data['data'] as List? ?? []) : (data is List ? data : []);
      if (rawList.isNotEmpty) {
        return rawList
            .map((e) => Alert.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }
  } catch (e) {
    log('Alerts API fetch error, falling back to cached/mock alerts: $e');
  }
  return mockAlerts;
});

class AlertsRepository {
  final ApiClient client;
  final LocalQueue queue;

  AlertsRepository(this.client) : queue = LocalQueue(client.dio);

  Future<bool> resolveAlert(String id) async {
    try {
      final response = await client.dio.post('/api/v1/alerts/$id/resolve');
      if (response.statusCode == 200) {
        return true;
      }
    } catch (e) {
      log('Alert resolution direct sync failed ($e), queuing offline');
    }

    try {
      await queue.enqueue('/api/v1/alerts/$id/resolve', 'POST', {'id': id});
      return true;
    } catch (qErr) {
      log('Alert resolution queue failed: $qErr');
      return false;
    }
  }
}

final alertsRepositoryProvider = Provider<AlertsRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return AlertsRepository(client);
});
