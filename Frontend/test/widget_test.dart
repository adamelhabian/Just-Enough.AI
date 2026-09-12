import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:justenough_mobile/models/recommendation.dart';
import 'package:justenough_mobile/models/alert.dart';
import 'package:justenough_mobile/core/local_queue.dart';
import 'package:justenough_mobile/screens/morning_brief_screen.dart';
import 'package:justenough_mobile/screens/inventory_screen.dart';

void main() {
  testWidgets('MorningBriefScreen renders loading state', (WidgetTester tester) async {
    await tester.pumpWidget(
      const ProviderScope(
        child: MaterialApp(home: MorningBriefScreen()),
      ),
    );
    expect(find.byType(CircularProgressIndicator), findsOneWidget);
    await tester.pump(const Duration(seconds: 1));
  });

  test('Recommendation model fromJson/toJson roundtrip', () {
    final original = Recommendation(
      id: '1',
      productName: 'Test Product',
      productId: 'p1',
      branchId: 'b1',
      recommendedQty: 10,
      currentInventory: 5,
      forecastDemand: 12,
      safetyStock: 2,
      status: RecommendationStatus.shortage,
      severity: RecommendationSeverity.critical,
      explanation: 'Low stock',
      createdAt: DateTime(2025, 1, 1),
    );

    final json = original.toJson();
    final decoded = Recommendation.fromJson(json);

    expect(decoded.id, original.id);
    expect(decoded.productName, original.productName);
    expect(decoded.status, original.status);
    expect(decoded.severity, original.severity);
  });

  test('Alert model severity sorting (implicit by enum)', () {
    final alert1 = Alert(
      id: '1', type: 't', severity: AlertSeverity.critical,
      productName: 'p', branchName: 'b', message: 'm', explanation: 'e',
      createdAt: DateTime.now(), status: AlertStatus.active,
    );
    final alert2 = Alert(
      id: '2', type: 't', severity: AlertSeverity.info,
      productName: 'p', branchName: 'b', message: 'm', explanation: 'e',
      createdAt: DateTime.now(), status: AlertStatus.active,
    );
    final list = [alert2, alert1];
    list.sort((a, b) => a.severity.index.compareTo(b.severity.index));
    expect(list.first.id, '1');
    expect(list.last.id, '2');
  });

  testWidgets('InventoryScreen renders search bar', (WidgetTester tester) async {
    await tester.pumpWidget(
      const MaterialApp(home: InventoryScreen()),
    );
    expect(find.byType(TextField), findsOneWidget);
    expect(find.text('Search products...'), findsOneWidget);
  });

  test('QueuedOperation offline serialization and status lifecycle', () {
    final now = DateTime.now();
    final op = QueuedOperation(
      id: 'op_101',
      endpoint: '/api/v1/recommendations/1/override',
      method: 'POST',
      body: '{"recommended_qty": 150.0, "override_reason": "Surge"}',
      createdAt: now,
      status: OperationStatus.pending,
    );

    final map = op.toMap();
    final restored = QueuedOperation.fromMap(map);

    expect(restored.id, 'op_101');
    expect(restored.endpoint, '/api/v1/recommendations/1/override');
    expect(restored.method, 'POST');
    expect(restored.status, OperationStatus.pending);
    expect(restored.body, contains('150.0'));
  });
}

