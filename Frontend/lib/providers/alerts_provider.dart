import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/alert.dart';

final alertsProvider = FutureProvider<List<Alert>>((ref) async {
  // PROTOTYPE: Mock data fallback
  await Future.delayed(const Duration(seconds: 1));
  return [
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
  ];
});
