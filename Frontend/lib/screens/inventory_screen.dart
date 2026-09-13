import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Inventory item model matching backend schema
class InventoryItem {
  final String ingredientId;
  final String ingredientName;
  final double closingQty;
  final String unit;
  final String dataFlag;
  final String branchId;
  final DateTime businessDate;

  InventoryItem({
    required this.ingredientId,
    required this.ingredientName,
    required this.closingQty,
    required this.unit,
    required this.dataFlag,
    required this.branchId,
    required this.businessDate,
  });

  factory InventoryItem.fromJson(Map<String, dynamic> json) {
    return InventoryItem(
      ingredientId: json['product_id'] as String? ?? json['ingredient_id'] as String? ?? '',
      ingredientName: json['product_name'] as String? ?? json['ingredient_name'] as String? ?? 'Unknown',
      closingQty: (json['closing_qty'] as num?)?.toDouble() ?? 0,
      unit: json['unit'] as String? ?? 'unit',
      dataFlag: json['data_flag'] as String? ?? 'ACTUAL',
      branchId: json['branch_id'] as String? ?? '',
      businessDate: json['business_date'] != null
          ? DateTime.parse(json['business_date'] as String)
          : DateTime.now(),
    );
  }
}

// Mock data provider (MVP: falls back to mock when API unavailable)
final inventoryProvider = FutureProvider<List<InventoryItem>>((ref) async {
  // PROTOTYPE: Mock data fallback for MVP demo
  await Future.delayed(const Duration(milliseconds: 800));
  return [
    InventoryItem(ingredientId: 'ING01', ingredientName: 'Beef Patty (150g)', closingQty: 150, unit: 'portion', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
    InventoryItem(ingredientId: 'ING02', ingredientName: 'Artisan Brioche Bun', closingQty: 250, unit: 'piece', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
    InventoryItem(ingredientId: 'ING03', ingredientName: 'Aged Cheddar Cheese', closingQty: 80, unit: 'piece', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
    InventoryItem(ingredientId: 'ING04', ingredientName: 'Smoked Beef Bacon', closingQty: 8, unit: 'kg', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
    InventoryItem(ingredientId: 'ING05', ingredientName: 'Chicken Breast Fillet', closingQty: 35, unit: 'kg', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
    InventoryItem(ingredientId: 'ING06', ingredientName: 'French Fries (Frozen)', closingQty: 45, unit: 'kg', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
    InventoryItem(ingredientId: 'ING07', ingredientName: 'Truffle Oil Infusion', closingQty: 2.5, unit: 'liter', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
    InventoryItem(ingredientId: 'ING08', ingredientName: 'Parmesan (Shredded)', closingQty: 4, unit: 'kg', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
  ];
});

class InventoryScreen extends ConsumerStatefulWidget {
  const InventoryScreen({super.key});

  @override
  ConsumerState<InventoryScreen> createState() => _InventoryScreenState();
}

class _InventoryScreenState extends ConsumerState<InventoryScreen> {
  String _searchQuery = '';

  @override
  Widget build(BuildContext context) {
    final inventoryAsync = ref.watch(inventoryProvider);
    return Scaffold(
      appBar: AppBar(title: const Text('Inventory')),
      body: Column(
        children: [
          Padding(
            padding: const EdgeInsets.all(12.0),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search ingredients...',
                prefixIcon: const Icon(Icons.search),
                border: OutlineInputBorder(borderRadius: BorderRadius.circular(10)),
                filled: true,
                fillColor: Colors.grey[50],
              ),
              onChanged: (value) => setState(() => _searchQuery = value.toLowerCase()),
            ),
          ),
          Expanded(
            child: inventoryAsync.when(
              loading: () => const Center(child: CircularProgressIndicator()),
              error: (e, _) => Center(
                child: Column(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Icon(Icons.error_outline, size: 48, color: Colors.red),
                    const SizedBox(height: 16),
                    Text('Failed to load inventory: $e'),
                    const SizedBox(height: 8),
                    ElevatedButton(
                      onPressed: () => ref.invalidate(inventoryProvider),
                      child: const Text('Retry'),
                    ),
                  ],
                ),
              ),
              data: (items) {
                final filtered = _searchQuery.isEmpty
                    ? items
                    : items.where((i) => i.ingredientName.toLowerCase().contains(_searchQuery)).toList();
                if (filtered.isEmpty) {
                  return Center(
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Icon(Icons.inventory_2_outlined, size: 64, color: Colors.grey[400]),
                        const SizedBox(height: 16),
                        Text(_searchQuery.isEmpty ? 'No inventory data' : 'No matching items',
                            style: TextStyle(fontSize: 16, color: Colors.grey[600])),
                      ],
                    ),
                  );
                }
                return RefreshIndicator(
                  onRefresh: () async => ref.invalidate(inventoryProvider),
                  child: ListView.builder(
                    padding: const EdgeInsets.symmetric(horizontal: 12),
                    itemCount: filtered.length,
                    itemBuilder: (context, index) {
                      final item = filtered[index];
                      final isLow = item.closingQty < 10;
                      return Card(
                        margin: const EdgeInsets.only(bottom: 8),
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(10),
                          side: isLow
                              ? const BorderSide(color: Colors.red, width: 1)
                              : BorderSide.none,
                        ),
                        child: ListTile(
                          leading: CircleAvatar(
                            backgroundColor: isLow
                                ? Colors.red.withValues(alpha: 0.15)
                                : Colors.green.withValues(alpha: 0.1),
                            child: Icon(
                              isLow ? Icons.warning_amber_rounded : Icons.check_circle_outline,
                              color: isLow ? Colors.red : Colors.green,
                              size: 20,
                            ),
                          ),
                          title: Text(item.ingredientName,
                              style: const TextStyle(fontWeight: FontWeight.w600)),
                          subtitle: Text('${item.ingredientId} | ${item.dataFlag}',
                              style: TextStyle(color: Colors.grey[500], fontSize: 12)),
                          trailing: Column(
                            mainAxisAlignment: MainAxisAlignment.center,
                            crossAxisAlignment: CrossAxisAlignment.end,
                            children: [
                              Text('${item.closingQty.toStringAsFixed(1)}',
                                  style: TextStyle(
                                    fontWeight: FontWeight.bold,
                                    fontSize: 18,
                                    color: isLow ? Colors.red : Colors.black87,
                                  )),
                              Text(item.unit,
                                  style: TextStyle(color: Colors.grey[500], fontSize: 11)),
                            ],
                          ),
                        ),
                      );
                    },
                  ),
                );
              },
            ),
          ),
        ],
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: () {
          ScaffoldMessenger.of(context).showSnackBar(
            const SnackBar(content: Text('Stock count feature — coming in next release')),
          );
        },
        child: const Icon(Icons.add),
        tooltip: 'Count Stock',
      ),
    );
  }
}
