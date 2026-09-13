import 'dart:developer';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/inventory_item.dart';
import '../core/api_client.dart';
import '../core/local_queue.dart';

const bool isDemoMode = bool.fromEnvironment('DEMO_MODE', defaultValue: false);

final mockInventoryItems = <InventoryItem>[
  InventoryItem(ingredientId: 'ING01', ingredientName: 'Beef Patty (150g) [DEMO]', closingQty: 150, unit: 'portion', dataFlag: 'SYNTHETIC / DEMO', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING02', ingredientName: 'Artisan Brioche Bun [DEMO]', closingQty: 250, unit: 'piece', dataFlag: 'SYNTHETIC / DEMO', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING03', ingredientName: 'Aged Cheddar Cheese [DEMO]', closingQty: 80, unit: 'piece', dataFlag: 'SYNTHETIC / DEMO', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING04', ingredientName: 'Smoked Beef Bacon [DEMO]', closingQty: 8, unit: 'kg', dataFlag: 'SYNTHETIC / DEMO', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING05', ingredientName: 'Chicken Breast Fillet [DEMO]', closingQty: 35, unit: 'kg', dataFlag: 'SYNTHETIC / DEMO', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING06', ingredientName: 'French Fries (Frozen) [DEMO]', closingQty: 45, unit: 'kg', dataFlag: 'SYNTHETIC / DEMO', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING07', ingredientName: 'Truffle Oil Infusion [DEMO]', closingQty: 2.5, unit: 'liter', dataFlag: 'SYNTHETIC / DEMO', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING08', ingredientName: 'Parmesan (Shredded) [DEMO]', closingQty: 4, unit: 'kg', dataFlag: 'SYNTHETIC / DEMO', branchId: 'R01', businessDate: DateTime.now()),
];

final inventoryProvider = FutureProvider<List<InventoryItem>>((ref) async {
  final client = ref.watch(apiClientProvider);
  try {
    final response = await client.dio.get('/api/v1/inventory/snapshots');
    if (response.statusCode == 200 && response.data != null) {
      final data = response.data;
      final rawList = data is Map ? (data['data'] as List? ?? []) : (data is List ? data : []);
      return rawList
          .map((e) => InventoryItem.fromJson(e as Map<String, dynamic>))
          .toList();
    }
    throw Exception('Unexpected response code: ${response.statusCode}');
  } catch (e) {
    log('Inventory API fetch error: $e');
    if (isDemoMode) {
      log('[DEMO_MODE] Returning synthetic inventory items labeled SYNTHETIC / DEMO');
      return mockInventoryItems;
    }
    // LIVE mode: No silent fabrication. Re-throw error so UI renders OFFLINE / DATA UNAVAILABLE state
    throw Exception('OFFLINE / DATA UNAVAILABLE: Unable to retrieve inventory snapshots ($e)');
  }
});

class StockCountResult {
  final bool synced;
  final bool queuedOffline;
  final String message;
  final dynamic data;

  StockCountResult({
    required this.synced,
    required this.queuedOffline,
    required this.message,
    this.data,
  });
}

class InventoryRepository {
  final ApiClient client;
  final LocalQueue queue;

  InventoryRepository(this.client) : queue = LocalQueue(client.dio);

  Future<StockCountResult> recordStockCount({
    required String productId,
    required double quantity,
    String branchId = 'R01',
    String dataFlag = 'ACTUAL',
    DateTime? date,
  }) async {
    final targetDate = (date ?? DateTime.now()).toIso8601String().split('T')[0];
    final payload = {
      'branch_id': branchId,
      'product_id': productId,
      'snapshot_date': targetDate,
      'quantity': quantity,
      'data_flag': dataFlag,
    };

    try {
      final response = await client.dio.post('/api/v1/inventory/snapshots', data: payload);
      if (response.statusCode == 200 || response.statusCode == 201) {
        return StockCountResult(
          synced: true,
          queuedOffline: false,
          message: 'Stock count recorded successfully.',
          data: response.data,
        );
      }
    } catch (e) {
      log('Direct stock count sync failed ($e), queuing offline mutation');
    }

    // Offline fallback queue
    try {
      await queue.enqueue('/api/v1/inventory/snapshots', 'POST', payload);
      return StockCountResult(
        synced: false,
        queuedOffline: true,
        message: 'Saved offline. Stock count queued for background sync.',
      );
    } catch (queueErr) {
      log('Local queue enqueue failed: $queueErr');
      return StockCountResult(
        synced: false,
        queuedOffline: false,
        message: 'Failed to record stock count: $queueErr',
      );
    }
  }
}

final inventoryRepositoryProvider = Provider<InventoryRepository>((ref) {
  final client = ref.watch(apiClientProvider);
  return InventoryRepository(client);
});
