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
      ingredientName: json['product_name'] as String? ?? json['ingredient_name'] as String? ?? json['product_id'] as String? ?? 'Item',
      closingQty: (json['quantity'] as num?)?.toDouble() ?? (json['closing_qty'] as num?)?.toDouble() ?? 0.0,
      unit: json['unit'] as String? ?? 'portion',
      dataFlag: json['data_flag'] as String? ?? 'ACTUAL',
      branchId: json['branch_id'] as String? ?? '',
      businessDate: json['snapshot_date'] != null
          ? DateTime.tryParse(json['snapshot_date'] as String) ?? DateTime.now()
          : (json['business_date'] != null
              ? DateTime.tryParse(json['business_date'] as String) ?? DateTime.now()
              : DateTime.now()),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'product_id': ingredientId,
      'product_name': ingredientName,
      'quantity': closingQty,
      'unit': unit,
      'data_flag': dataFlag,
      'branch_id': branchId,
      'snapshot_date': businessDate.toIso8601String().split('T')[0],
    };
  }
}
