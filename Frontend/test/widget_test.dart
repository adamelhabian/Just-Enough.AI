import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:justenough_mobile/models/recommendation.dart';
import 'package:justenough_mobile/models/alert.dart';
import 'package:justenough_mobile/core/local_queue.dart';
import 'package:justenough_mobile/core/api_client.dart';
import 'package:justenough_mobile/screens/morning_brief_screen.dart';
import 'package:justenough_mobile/screens/inventory_screen.dart';
import 'package:justenough_mobile/screens/alerts_screen.dart';
import 'package:justenough_mobile/providers/alerts_provider.dart';

void main() {
  group('MorningBriefScreen Tests', () {
    testWidgets('renders loading state initially', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: MorningBriefScreen()),
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      await tester.pump(const Duration(seconds: 1));
    });
  });

  group('Model Serialization Tests', () {
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
      expect(decoded.forecastDemand, 12);
    });

    test('Alert model severity sorting and json roundtrip', () {
      final alert1 = Alert(
        id: '1',
        type: 'stock_low',
        severity: AlertSeverity.critical,
        productName: 'Pita Bread',
        branchName: 'Downtown Bistro',
        message: 'Stock critically low',
        explanation: 'Only 2 packs remaining',
        createdAt: DateTime(2026, 1, 1),
        status: AlertStatus.active,
      );
      final alert2 = Alert(
        id: '2',
        type: 'waste_warning',
        severity: AlertSeverity.info,
        productName: 'Tomatoes',
        branchName: 'Downtown Bistro',
        message: 'Surplus detected',
        explanation: 'Shelf life expiring soon',
        createdAt: DateTime(2026, 1, 1),
        status: AlertStatus.active,
      );

      final list = [alert2, alert1];
      list.sort((a, b) => a.severity.index.compareTo(b.severity.index));
      expect(list.first.id, '1'); // critical (index 0) before info (index 2)
      expect(list.last.id, '2');

      final json = alert1.toJson();
      final restored = Alert.fromJson(json);
      expect(restored.id, alert1.id);
      expect(restored.severity, AlertSeverity.critical);
      expect(restored.status, AlertStatus.active);
    });

    test('InventoryItem model fromJson parsing', () {
      final json = {
        'product_id': 'ING01',
        'product_name': 'Beef Patty (150g)',
        'closing_qty': 150.0,
        'unit': 'portion',
        'data_flag': 'ACTUAL',
        'branch_id': 'R01',
        'business_date': '2026-09-12T00:00:00Z',
      };
      final item = InventoryItem.fromJson(json);
      expect(item.ingredientId, 'ING01');
      expect(item.ingredientName, 'Beef Patty (150g)');
      expect(item.closingQty, 150.0);
      expect(item.unit, 'portion');
      expect(item.dataFlag, 'ACTUAL');
    });
  });

  group('InventoryScreen Widget Tests', () {
    testWidgets('renders search bar with ingredients hint inside ProviderScope', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: InventoryScreen()),
        ),
      );
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('Search ingredients...'), findsOneWidget);
      expect(find.byType(FloatingActionButton), findsOneWidget);
      await tester.pump(const Duration(milliseconds: 900));
    });

    testWidgets('loads and renders inventory items after mock delay', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: InventoryScreen()),
        ),
      );
      // Wait for provider delayed mock
      await tester.pump(const Duration(milliseconds: 900));
      await tester.pumpAndSettle();

      expect(find.text('Beef Patty (150g)'), findsOneWidget);
      expect(find.text('Artisan Brioche Bun'), findsOneWidget);
    });
  });

  group('AlertsScreen Widget Tests', () {
    testWidgets('renders loading then lists alerts', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: AlertsScreen()),
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);

      await tester.pump(const Duration(seconds: 1));
      await tester.pumpAndSettle();

      expect(find.text('Pita Bread'), findsOneWidget);
      expect(find.text('Stock critically low'), findsOneWidget);
      expect(find.text('CRITICAL'), findsOneWidget);
    });

    testWidgets('renders empty state when alerts list is empty', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            alertsProvider.overrideWith((ref) => Future.value([])),
          ],
          child: const MaterialApp(home: AlertsScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('No active alerts'), findsOneWidget);
    });
  });

  group('Offline LocalQueue Lifecycle Tests', () {
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

    test('QueuedOperation supports 409 conflict and syncing states', () {
      final opConflict = QueuedOperation(
        id: 'op_102',
        endpoint: '/api/v1/inventory/snapshots',
        method: 'POST',
        body: '{"closing_qty": 45}',
        createdAt: DateTime.now(),
        status: OperationStatus.conflicted,
      );

      expect(opConflict.status, OperationStatus.conflicted);
      final map = opConflict.toMap();
      final restored = QueuedOperation.fromMap(map);
      expect(restored.status, OperationStatus.conflicted);
    });
  });

  group('API Client & Error Handling Tests', () {
    test('ApiError string formatting with and without status code', () {
      final errWithStatus = ApiError('Unauthorized', 401);
      expect(errWithStatus.toString(), 'ApiError: Unauthorized (Status: 401)');

      final errWithoutStatus = ApiError('Connection lost');
      expect(errWithoutStatus.toString(), 'ApiError: Connection lost');
    });

    test('ApiClient initializes with custom base URL and token', () {
      final client = ApiClient(
        baseUrl: 'http://localhost:8000',
        initialToken: 'custom_secure_jwt',
      );
      expect(client.dio.options.baseUrl, 'http://localhost:8000');
      expect(client.dio.interceptors.isNotEmpty, isTrue);
    });
  });
}
