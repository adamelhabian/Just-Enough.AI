import 'dart:convert';
import 'package:sqflite/sqflite.dart';
import 'package:path/path.dart';
import 'package:dio/dio.dart';

enum OperationStatus { pending, syncing, failed, synced, conflicted }

class QueuedOperation {
  final String id;
  final String endpoint;
  final String method;
  final String body;
  final DateTime createdAt;
  final OperationStatus status;

  QueuedOperation({
    required this.id,
    required this.endpoint,
    required this.method,
    required this.body,
    required this.createdAt,
    required this.status,
  });

  Map<String, dynamic> toMap() {
    return {
      'id': id,
      'endpoint': endpoint,
      'method': method,
      'body': body,
      'created_at': createdAt.toIso8601String(),
      'status': status.name,
    };
  }

  factory QueuedOperation.fromMap(Map<String, dynamic> map) {
    return QueuedOperation(
      id: map['id'] as String,
      endpoint: map['endpoint'] as String,
      method: map['method'] as String,
      body: map['body'] as String,
      createdAt: DateTime.parse(map['created_at'] as String),
      status: OperationStatus.values.firstWhere((e) => e.name == map['status']),
    );
  }
}

class LocalQueue {
  final Dio dio;
  Database? _db;

  LocalQueue(this.dio);

  Future<Database> get db async {
    _db ??= await openDatabase(
      join(await getDatabasesPath(), 'justenough_queue.db'),
      version: 1,
      onCreate: (d, v) async {
        await d.execute('''
          CREATE TABLE queued_operations(
            id TEXT PRIMARY KEY,
            endpoint TEXT NOT NULL,
            method TEXT NOT NULL,
            body TEXT NOT NULL,
            created_at TEXT NOT NULL,
            status TEXT NOT NULL
          )
        ''');
      },
    );
    return _db!;
  }

  Future<void> enqueue(String endpoint, String method, Map<String, dynamic> body) async {
    final d = await db;
    final op = QueuedOperation(
      id: DateTime.now().millisecondsSinceEpoch.toString(),
      endpoint: endpoint,
      method: method,
      body: jsonEncode(body),
      createdAt: DateTime.now(),
      status: OperationStatus.pending,
    );
    await d.insert(
      'queued_operations',
      op.toMap(),
      conflictAlgorithm: ConflictAlgorithm.replace,
    );
  }

  Future<void> updateStatus(String id, OperationStatus status) async {
    final d = await db;
    await d.update(
      'queued_operations',
      {'status': status.name},
      where: 'id = ?',
      whereArgs: [id],
    );
  }

  Future<List<QueuedOperation>> getPending() async {
    final d = await db;
    final maps = await d.query(
      'queued_operations',
      where: 'status IN (?, ?, ?)',
      whereArgs: [OperationStatus.pending.name, OperationStatus.failed.name, OperationStatus.conflicted.name],
      orderBy: 'created_at ASC',
    );
    return maps.map((m) => QueuedOperation.fromMap(m)).toList();
  }

  Future<void> syncAll() async {
    final pending = await getPending();
    for (final op in pending) {
      if (op.status == OperationStatus.conflicted) continue;

      await updateStatus(op.id, OperationStatus.syncing);
      try {
        await dio.request(
          op.endpoint,
          options: Options(method: op.method),
          data: jsonDecode(op.body),
        );
        await updateStatus(op.id, OperationStatus.synced);
      } on DioException catch (e) {
        if (e.response?.statusCode == 409) {
          await updateStatus(op.id, OperationStatus.conflicted);
        } else {
          await updateStatus(op.id, OperationStatus.failed);
        }
      } catch (e) {
        await updateStatus(op.id, OperationStatus.failed);
      }
    }
  }
}