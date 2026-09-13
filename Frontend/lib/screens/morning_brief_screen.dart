import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/recommendation.dart';
import '../providers/recommendations_provider.dart';

import '../providers/auth_provider.dart';

class MorningBriefScreen extends ConsumerWidget {
  const MorningBriefScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recommendationsAsync = ref.watch(recommendationsProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Morning Brief'),
        actions: [
          IconButton(
            icon: const Icon(Icons.logout),
            tooltip: 'Sign Out',
            onPressed: () async {
              await ref.read(authProvider.notifier).logout();
              if (context.mounted) {
                Navigator.pushReplacementNamed(context, '/login');
              }
            },
          ),
        ],
      ),
      body: recommendationsAsync.when(
        data: (recommendations) {
          if (recommendations.isEmpty) {
            return const Center(child: Text('No recommendations today.'));
          }
          final count = recommendations.length;
          return RefreshIndicator(
            onRefresh: () => ref.refresh(recommendationsProvider.future),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                Card(
                  child: Padding(
                    padding: const EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        const Text('Summary', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        Text('$count ${count == 1 ? 'item needs' : 'items need'} attention today.'),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 16),
                ...recommendations.map((r) => RecommendationCard(recommendation: r)),
              ],
            ),
          );
        },
        loading: () => const Center(child: CircularProgressIndicator()),
        error: (err, stack) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Error: $err'),
              const SizedBox(height: 8),
              ElevatedButton(
                onPressed: () => ref.refresh(recommendationsProvider.future),
                child: const Text('Retry'),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class RecommendationCard extends ConsumerStatefulWidget {
  final Recommendation recommendation;
  const RecommendationCard({super.key, required this.recommendation});

  @override
  ConsumerState<RecommendationCard> createState() => _RecommendationCardState();
}

class _RecommendationCardState extends ConsumerState<RecommendationCard> {
  void _showOverrideBottomSheet(BuildContext context) {
    final qtyController = TextEditingController(
      text: widget.recommendation.recommendedQty.toStringAsFixed(1),
    );
    final reasonController = TextEditingController(text: 'Demand surge / local event adjustment');

    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) => Padding(
        padding: EdgeInsets.only(
          left: 16.0,
          right: 16.0,
          top: 16.0,
          bottom: MediaQuery.of(sheetContext).viewInsets.bottom + 16.0,
        ),
        child: Column(
          mainAxisSize: MainAxisSize.min,
          crossAxisAlignment: CrossAxisAlignment.stretch,
          children: [
            Text(
              'Override ${widget.recommendation.productName}',
              style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: qtyController,
              keyboardType: const TextInputType.numberWithOptions(decimal: true),
              decoration: const InputDecoration(
                labelText: 'Adjusted Quantity',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 12),
            TextField(
              controller: reasonController,
              decoration: const InputDecoration(
                labelText: 'Override Reason (Min 3 characters)',
                border: OutlineInputBorder(),
              ),
            ),
            const SizedBox(height: 16),
            ElevatedButton(
              onPressed: () async {
                final qty = double.tryParse(qtyController.text.trim());
                final reason = reasonController.text.trim();

                if (qty == null || qty < 0 || reason.length < 3) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    const SnackBar(content: Text('Please provide a valid quantity and reason (>=3 characters).')),
                  );
                  return;
                }

                Navigator.pop(sheetContext);

                final repo = ref.read(recommendationsRepositoryProvider);
                final res = await repo.overrideRecommendation(
                  id: widget.recommendation.id,
                  newQty: qty,
                  reason: reason,
                );

                if (mounted) {
                  ScaffoldMessenger.of(context).showSnackBar(
                    SnackBar(
                      content: Text(res.message),
                      backgroundColor: res.synced ? Colors.green[700] : Colors.orange[800],
                    ),
                  );
                  ref.invalidate(recommendationsProvider);
                }
              },
              child: const Text('Save Override'),
            ),
          ],
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final r = widget.recommendation;
    return Card(
      child: ListTile(
        leading: Icon(r.statusIcon, color: r.statusColor),
        title: Text(r.productName, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(r.explanation),
        trailing: Row(
          mainAxisSize: MainAxisSize.min,
          children: [
            Text(
              '${r.recommendedQty.toStringAsFixed(1)} units',
              style: const TextStyle(fontWeight: FontWeight.w600),
            ),
            const Icon(Icons.chevron_right),
          ],
        ),
        onTap: () => _showOverrideBottomSheet(context),
      ),
    );
  }
}