import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../models/recommendation.dart';
import '../providers/recommendations_provider.dart';

class MorningBriefScreen extends ConsumerWidget {
  const MorningBriefScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final recommendationsAsync = ref.watch(recommendationsProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Morning Brief')),
      body: recommendationsAsync.when(
        data: (recommendations) {
          if (recommendations.isEmpty) {
            return const Center(child: Text('No recommendations today.'));
          }
          return RefreshIndicator(
            onRefresh: () => ref.refresh(recommendationsProvider.future),
            child: ListView(
              padding: const EdgeInsets.all(16),
              children: [
                const Card(
                  child: Padding(
                    padding: EdgeInsets.all(16.0),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text('Summary', style: TextStyle(fontSize: 20, fontWeight: FontWeight.bold)),
                        Text('2 items need attention.'),
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
        loading: () => const Center(child: CircularProgressIndicator()), // Skeleton/shimmer replacement
        error: (err, stack) => Center(
          child: Column(
            mainAxisSize: MainAxisSize.min,
            children: [
              Text('Error: $err'),
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

class RecommendationCard extends StatelessWidget {
  final Recommendation recommendation;
  const RecommendationCard({super.key, required this.recommendation});

  @override
  Widget build(BuildContext context) {
    return Card(
      child: ListTile(
        leading: Icon(recommendation.statusIcon, color: recommendation.statusColor),
        title: Text(recommendation.productName, style: const TextStyle(fontWeight: FontWeight.bold)),
        subtitle: Text(recommendation.explanation),
        trailing: const Icon(Icons.chevron_right),
        onTap: () {
          showModalBottomSheet(
            context: context,
            builder: (_) => Padding(
              padding: const EdgeInsets.all(16.0),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                children: [
                  Text('Override ${recommendation.productName}', style: const TextStyle(fontWeight: FontWeight.bold)),
                  const TextField(decoration: InputDecoration(labelText: 'Quantity')),
                  const DropdownMenu(
                    dropdownMenuEntries: [
                      DropdownMenuEntry(value: 'stock_off', label: 'Stock Count Incorrect'),
                      DropdownMenuEntry(value: 'event', label: 'Local Event'),
                    ],
                    label: Text('Reason'),
                  ),
                  const TextField(decoration: InputDecoration(labelText: 'Comment')),
                  const SizedBox(height: 16),
                  ElevatedButton(onPressed: () => Navigator.pop(context), child: const Text('Save Override')),
                ],
              ),
            ),
          );
        },
      ),
    );
  }
}