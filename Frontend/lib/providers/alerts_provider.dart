import 'dart:developer';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/alert.dart';
import '../core/api_client.dart';
import '../core/local_queue.dart';

const bool isDemoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

final mockAlerts = <Alert>[
  Alert(
    id: 'DEMO-1',
    type: 'stock_low',
    severity: AlertSeverity.critical,
    productName: 'Pita Bread [DEMO]',
    branchName: 'Downtown Bistro R01',
    message: 'Stock critically low [SYNTHETIC / DEMO]',
    explanation: 'Demonstration alert for evaluation.',
    createdAt: DateTime.now().subtract(const Duration(hours: 1)),
    status: AlertStatus.active,
  ),
  Alert(
    id: 'DEMO-2',
    type: 'waste_warning',
    severity: AlertSeverity.warning,
    productName: 'Tomatoes [DEMO]',
    branchName: 'Downtown Bistro R01',
    message: 'Surplus detected [SYNTHETIC / DEMO]',
    explanation: 'Demonstration alert for evaluation.',
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
      return rawList
          .map((e) => Alert.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    throw Exception('Unexpected server response: ${response.statusCode}');
  } catch (e) {
    log('Alerts API fetch error: $e');
    if (isDemoMode) {
      log('[DEMO_MODE] Falling back to labeled synthetic alerts');
      return mockAlerts;
    }
    // LIVE mode: No silent fabrication. Re-throw error so UI renders OFFLINE / DATA UNAVAILABLE state
    throw Exception('OFFLINE / DATA UNAVAILABLE: Unable to retrieve operational alerts ($e)');
  }
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
