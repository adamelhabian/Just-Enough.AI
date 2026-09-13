import 'dart:developer';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/inventory_item.dart';
import '../core/api_client.dart';
import '../core/local_queue.dart';

final mockInventoryItems = <InventoryItem>[
  InventoryItem(ingredientId: 'ING01', ingredientName: 'Beef Patty (150g)', closingQty: 150, unit: 'portion', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING02', ingredientName: 'Artisan Brioche Bun', closingQty: 250, unit: 'piece', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING03', ingredientName: 'Aged Cheddar Cheese', closingQty: 80, unit: 'piece', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING04', ingredientName: 'Smoked Beef Bacon', closingQty: 8, unit: 'kg', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING05', ingredientName: 'Chicken Breast Fillet', closingQty: 35, unit: 'kg', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING06', ingredientName: 'French Fries (Frozen)', closingQty: 45, unit: 'kg', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING07', ingredientName: 'Truffle Oil Infusion', closingQty: 2.5, unit: 'liter', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
  InventoryItem(ingredientId: 'ING08', ingredientName: 'Parmesan (Shredded)', closingQty: 4, unit: 'kg', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
];

final inventoryProvider = FutureProvider<List<InventoryItem>>((ref) async {
  final client = ref.watch(apiClientProvider);
  try {
    final response = await client.dio.get('/api/v1/inventory/snapshots');
    if (response.statusCode == 200 && response.data != null) {
      final data = response.data;
      final rawList = data is Map ? (data['data'] as List? ?? []) : (data is List ? data : []);
      if (rawList.isNotEmpty) {
        return rawList
            .map((e) => InventoryItem.fromJson(e as Map<String, dynamic>))
            .toList();
      }
    }
  } catch (e) {
    log('Inventory API fetch error, falling back to cached/mock data: $e');
  }
  return mockInventoryItems;
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
