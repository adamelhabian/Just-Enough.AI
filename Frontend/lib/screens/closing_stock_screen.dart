import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../providers/inventory_provider.dart';

class ClosingStockScreen extends ConsumerStatefulWidget {
  const ClosingStockScreen({super.key});

  @override
  ConsumerState<ClosingStockScreen> createState() => _ClosingStockScreenState();
}

class _ClosingStockScreenState extends ConsumerState<ClosingStockScreen> {
  final countController = TextEditingController();
  final productController = TextEditingController(text: 'ING01');
  final branchController = TextEditingController(text: 'R01');
  String status = '';

  Future<void> save() async {
    final qty = double.tryParse(countController.text.trim());
    final prodId = productController.text.trim();
    final branchId = branchController.text.trim();

    if (qty == null || qty < 0 || prodId.isEmpty) {
      setState(() => status = 'Enter a valid product ID and non-negative count');
      return;
    }

    final repo = ref.read(inventoryRepositoryProvider);
    final result = await repo.recordStockCount(
      productId: prodId,
      quantity: qty,
      branchId: branchId.isNotEmpty ? branchId : 'R01',
    );

    setState(() {
      status = result.message;
    });

    if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(
          content: Text(result.message),
          backgroundColor: result.synced ? Colors.green[700] : Colors.orange[800],
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Closing Stock')),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: SingleChildScrollView(
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.stretch,
            children: [
              TextField(
                controller: productController,
                decoration: const InputDecoration(
                  labelText: 'Ingredient / Product ID',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: branchController,
                decoration: const InputDecoration(
                  labelText: 'Branch ID',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 12),
              TextField(
                controller: countController,
                keyboardType: const TextInputType.numberWithOptions(decimal: true),
                decoration: const InputDecoration(
                  labelText: 'Physical count',
                  border: OutlineInputBorder(),
                ),
              ),
              const SizedBox(height: 16),
              FilledButton(onPressed: save, child: const Text('Save count')),
              const SizedBox(height: 12),
              if (status.isNotEmpty)
                Text(
                  status,
                  textAlign: TextAlign.center,
                  style: TextStyle(
                    fontWeight: FontWeight.w500,
                    color: status.contains('Failed') ? Colors.red : Colors.green[800],
                  ),
                ),
            ],
          ),
        ),
      ),
    );
  }
}