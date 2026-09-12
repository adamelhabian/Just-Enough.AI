import 'dart:convert';
import 'package:flutter/material.dart';
import 'package:dio/dio.dart';
import '../core/local_queue.dart';

class ClosingStockScreen extends StatefulWidget {
  const ClosingStockScreen({super.key});

  @override
  State<ClosingStockScreen> createState() => _ClosingStockScreenState();
}

class _ClosingStockScreenState extends State<ClosingStockScreen> {
  final q = LocalQueue(Dio());
  final c = TextEditingController();
  String status = '';

  Future<void> save() async {
    final n = double.tryParse(c.text);
    if (n == null || n < 0) {
      setState(() => status = 'Enter a valid non-negative count');
      return;
    }
    final id = DateTime.now().microsecondsSinceEpoch.toString();
    await q.enqueue('/stock/$id', 'POST', {'idempotency_key': id, 'closing_qty': n});
    setState(() => status = 'Saved on this device and queued for sync');
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Closing stock')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(
          children: [
            TextField(controller: c, keyboardType: TextInputType.number, decoration: const InputDecoration(labelText: 'Physical count')),
            FilledButton(onPressed: save, child: const Text('Save count')),
            Text(status),
          ],
        ),
      ),
    );
  }
}