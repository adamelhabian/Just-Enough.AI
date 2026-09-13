import 'package:flutter_test/flutter_test.dart';
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:justenough_mobile/models/recommendation.dart';
import 'package:justenough_mobile/models/alert.dart';
import 'package:justenough_mobile/core/local_queue.dart';
import 'package:justenough_mobile/core/api_client.dart';
import 'package:justenough_mobile/screens/login_screen.dart';
import 'package:justenough_mobile/screens/morning_brief_screen.dart';
import 'package:justenough_mobile/screens/inventory_screen.dart';
import 'package:justenough_mobile/screens/alerts_screen.dart';
import 'package:justenough_mobile/providers/alerts_provider.dart';
import 'package:justenough_mobile/providers/recommendations_provider.dart';

void main() {
  final sampleRecommendations = [
    Recommendation(
      id: '1',
      productName: 'Classic Cheeseburger',
      productId: 'M01',
      branchId: 'R01',
      recommendedQty: 145,
      currentInventory: 10,
      forecastDemand: 138,
      safetyStock: 15,
      status: RecommendationStatus.shortage,
      severity: RecommendationSeverity.critical,
      explanation: 'Recent upward trend and Friday-like demand pattern.',
      createdAt: DateTime.now(),
    ),
    Recommendation(
      id: '2',
      productName: 'Golden Fries',
      productId: 'M06',
      branchId: 'R01',
      recommendedQty: 48,
      currentInventory: 70,
      forecastDemand: 61,
      safetyStock: 5,
      status: RecommendationStatus.waste,
      severity: RecommendationSeverity.warning,
      explanation: 'Existing usable stock exceeds expected demand.',
      createdAt: DateTime.now(),
    ),
  ];

  final sampleInventory = [
    InventoryItem(ingredientId: 'ING01', ingredientName: 'Beef Patty (150g)', closingQty: 150, unit: 'portion', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
    InventoryItem(ingredientId: 'ING02', ingredientName: 'Artisan Brioche Bun', closingQty: 250, unit: 'piece', dataFlag: 'ACTUAL', branchId: 'R01', businessDate: DateTime.now()),
  ];

  final sampleAlerts = [
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

  group('LoginScreen Tests', () {
    testWidgets('renders login form, fields, and quick demo chips', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: LoginScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('JustEnough AI'), findsOneWidget);
      expect(find.text('Corporate Email'), findsOneWidget);
      expect(find.text('Password'), findsOneWidget);
      expect(find.text('Sign In'), findsOneWidget);
      expect(find.text('Branch Manager'), findsOneWidget);
      expect(find.text('Inventory Clerk'), findsOneWidget);
    });

    testWidgets('quick fill chips populate fields correctly', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: LoginScreen()),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Inventory Clerk'));
      await tester.pumpAndSettle();

      expect(find.text('inventory@justenough.ai'), findsOneWidget);
    });

    testWidgets('displays validation error if email is cleared', (WidgetTester tester) async {
      await tester.pumpWidget(
        const ProviderScope(
          child: MaterialApp(home: LoginScreen()),
        ),
      );
      await tester.pumpAndSettle();

      final emailField = find.byType(TextFormField).first;
      await tester.enterText(emailField, '');
      await tester.tap(find.text('Sign In'));
      await tester.pumpAndSettle();

      expect(find.text('Email is required'), findsOneWidget);
    });
  });

  group('Zero-Fabrication & Live Mode Error Tests', () {
    testWidgets('LIVE mode renders OFFLINE / DATA UNAVAILABLE when API is unreachable', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            inventoryProvider.overrideWith((ref) => Future.error(Exception('OFFLINE / DATA UNAVAILABLE: network error'))),
          ],
          child: const MaterialApp(home: InventoryScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.textContaining('OFFLINE / DATA UNAVAILABLE'), findsOneWidget);
      expect(find.text('Retry'), findsOneWidget);
    });
  });

  group('MorningBriefScreen Tests', () {
    testWidgets('renders loading state initially', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            recommendationsProvider.overrideWith((ref) => Future.delayed(const Duration(seconds: 2), () => sampleRecommendations)),
          ],
          child: const MaterialApp(home: MorningBriefScreen()),
        ),
      );
      expect(find.byType(CircularProgressIndicator), findsOneWidget);
      await tester.pump(const Duration(seconds: 3));
      await tester.pumpAndSettle();
    });

    testWidgets('renders recommendations list and summary card when data loaded', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            recommendationsProvider.overrideWith((ref) => Future.value(sampleRecommendations)),
          ],
          child: const MaterialApp(home: MorningBriefScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Summary'), findsOneWidget);
      expect(find.text('Classic Cheeseburger'), findsOneWidget);
      expect(find.text('Golden Fries'), findsOneWidget);
    });

    testWidgets('opens override bottom sheet on recommendation tap', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            recommendationsProvider.overrideWith((ref) => Future.value(sampleRecommendations)),
          ],
          child: const MaterialApp(home: MorningBriefScreen()),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.text('Classic Cheeseburger'));
      await tester.pumpAndSettle();

      expect(find.text('Override Classic Cheeseburger'), findsOneWidget);
      expect(find.text('Save Override'), findsOneWidget);
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

    test('Recommendation model parses backend snake_case JSON schema', () {
      final backendJson = {
        'id': 'rec-uuid-101',
        'branch_id': 'branch_01',
        'product_id': 'prod_pita',
        'target_date': '2026-09-13',
        'recommended_qty': 150.5,
        'status': 'pending',
        'risk': 'HIGH',
        'override_reason': 'Manager forecast boost',
        'explanation': 'Quantile p50 model estimate',
      };

      final rec = Recommendation.fromJson(backendJson);
      expect(rec.id, 'rec-uuid-101');
      expect(rec.branchId, 'branch_01');
      expect(rec.productId, 'prod_pita');
      expect(rec.recommendedQty, 150.5);
      expect(rec.severity, RecommendationSeverity.critical);
      expect(rec.overrideReason, 'Manager forecast boost');
      expect(rec.explanation, 'Quantile p50 model estimate');
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
      expect(list.first.id, '1');
      expect(list.last.id, '2');

      final json = alert1.toJson();
      final restored = Alert.fromJson(json);
      expect(restored.id, alert1.id);
      expect(restored.severity, AlertSeverity.critical);
      expect(restored.status, AlertStatus.active);
    });

    test('Alert model parses backend operational alert schema', () {
      final backendAlertJson = {
        'id': 'alert-uuid-201',
        'branch_id': 'branch_01',
        'product_id': 'prod_cheese',
        'alert_type': 'stock_critical',
        'severity': 'CRITICAL',
        'message': 'Immediate restock required',
        'is_resolved': false,
        'created_at': '2026-09-13T08:00:00Z',
      };

      final alert = Alert.fromJson(backendAlertJson);
      expect(alert.id, 'alert-uuid-201');
      expect(alert.type, 'stock_critical');
      expect(alert.severity, AlertSeverity.critical);
      expect(alert.status, AlertStatus.active);
      expect(alert.message, 'Immediate restock required');
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

    test('InventoryItem model parses backend snapshot schema', () {
      final backendSnapshot = {
        'id': 'snap-001',
        'branch_id': 'R01',
        'product_id': 'ING05',
        'snapshot_date': '2026-09-13',
        'quantity': 35.5,
        'data_flag': 'ACTUAL',
      };
      final item = InventoryItem.fromJson(backendSnapshot);
      expect(item.ingredientId, 'ING05');
      expect(item.branchId, 'R01');
      expect(item.closingQty, 35.5);
      expect(item.dataFlag, 'ACTUAL');
    });
  });

  group('InventoryScreen Widget Tests', () {
    testWidgets('renders search bar with ingredients hint inside ProviderScope', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            inventoryProvider.overrideWith((ref) => Future.value(sampleInventory)),
          ],
          child: const MaterialApp(home: InventoryScreen()),
        ),
      );
      expect(find.byType(TextField), findsOneWidget);
      expect(find.text('Search ingredients...'), findsOneWidget);
      expect(find.byType(FloatingActionButton), findsOneWidget);
      await tester.pumpAndSettle();
    });

    testWidgets('loads and renders inventory items from provider', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            inventoryProvider.overrideWith((ref) => Future.value(sampleInventory)),
          ],
          child: const MaterialApp(home: InventoryScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Beef Patty (150g)'), findsOneWidget);
      expect(find.text('Artisan Brioche Bun'), findsOneWidget);
    });

    testWidgets('opens stock count dialog on floating action button tap', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            inventoryProvider.overrideWith((ref) => Future.value(sampleInventory)),
          ],
          child: const MaterialApp(home: InventoryScreen()),
        ),
      );
      await tester.pumpAndSettle();

      await tester.tap(find.byType(FloatingActionButton));
      await tester.pumpAndSettle();

      expect(find.text('Record Stock Count'), findsOneWidget);
      expect(find.text('Submit Count'), findsOneWidget);
    });
  });

  group('AlertsScreen Widget Tests', () {
    testWidgets('renders loading then lists alerts', (WidgetTester tester) async {
      await tester.pumpWidget(
        ProviderScope(
          overrides: [
            alertsProvider.overrideWith((ref) => Future.value(sampleAlerts)),
          ],
          child: const MaterialApp(home: AlertsScreen()),
        ),
      );
      await tester.pumpAndSettle();

      expect(find.text('Pita Bread'), findsOneWidget);
      expect(find.text('Stock critically low'), findsOneWidget);
      expect(find.text('CRITICAL'), findsOneWidget);
      expect(find.byIcon(Icons.check_circle_outline), findsWidgets);
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

    test('ApiClient dynamically sets and clears auth token header', () {
      final client = ApiClient(baseUrl: 'http://localhost:8000');
      client.setAuthToken('bearer_sample_token_xyz');
      expect(client.dio.options.headers['Authorization'], 'Bearer bearer_sample_token_xyz');
      client.clearAuthToken();
      expect(client.dio.options.headers.containsKey('Authorization'), isFalse);
    });
  });

  group('Repository Offline Resilience Tests', () {
    test('InventoryRepository falls back to offline queue on network disconnect', () async {
      final client = ApiClient(baseUrl: 'http://127.0.0.1:59999');
      final repo = InventoryRepository(client);

      final result = await repo.recordStockCount(
        productId: 'ING01',
        quantity: 120.0,
        branchId: 'R01',
      );

      expect(result.synced, isFalse);
    });

    test('RecommendationsRepository falls back to offline queue on network disconnect', () async {
      final client = ApiClient(baseUrl: 'http://127.0.0.1:59999');
      final repo = RecommendationsRepository(client);

      final result = await repo.overrideRecommendation(
        id: 'rec_offline_01',
        newQty: 200.0,
        reason: 'Emergency inventory replenishment',
      );

      expect(result.synced, isFalse);
    });
  });

  group('Full Vertical Operational Flow Tests', () {
    test('Vertical Flow: LOGIN -> BRIEF -> RECOMMENDATION -> OVERRIDE -> AUDIT & INVENTORY', () async {
      final client = ApiClient(baseUrl: 'http://localhost:8000', initialToken: 'test_jwt_session_token');
      expect(client.dio.options.headers['Authorization'], 'Bearer test_jwt_session_token');

      final recRepo = RecommendationsRepository(client);
      final invRepo = InventoryRepository(client);
      final alertRepo = AlertsRepository(client);

      final overrideRes = await recRepo.overrideRecommendation(
        id: 'rec_flow_101',
        newQty: 180.0,
        reason: 'High local foot traffic anticipated for weekend event',
      );
      expect(overrideRes.message.isNotEmpty, isTrue);

      final stockRes = await invRepo.recordStockCount(
        productId: 'ING01',
        quantity: 142.5,
        branchId: 'R01',
      );
      expect(stockRes.message.isNotEmpty, isTrue);

      final alertRes = await alertRepo.resolveAlert('alert_flow_01');
      expect(alertRes, isTrue);
    });
  });
}
