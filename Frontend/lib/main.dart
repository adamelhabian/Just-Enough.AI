import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:justenough_mobile/core/theme.dart';
import 'package:justenough_mobile/screens/morning_brief_screen.dart';
import 'package:justenough_mobile/screens/inventory_screen.dart';
import 'package:justenough_mobile/screens/alerts_screen.dart';

void main() => runApp(const ProviderScope(child: App()));

class App extends StatelessWidget {
  const App({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'JustEnough',
      theme: JustEnoughTheme.lightTheme,
      darkTheme: JustEnoughTheme.darkTheme,
      themeMode: ThemeMode.system,
      builder: (context, widget) {
        ErrorWidget.builder = (FlutterErrorDetails errorDetails) {
          return Scaffold(
            body: Center(
              child: Text(
                'An unexpected error occurred: ${errorDetails.exceptionAsString()}',
                style: const TextStyle(color: Colors.red),
                textAlign: TextAlign.center,
              ),
            ),
          );
        };
        return widget!;
      },
      initialRoute: '/morning-brief',
      routes: {
        '/morning-brief': (context) => const MorningBriefScreen(),
        '/inventory': (context) => const InventoryScreen(),
        '/alerts': (context) => const AlertsScreen(),
      },
    );
  }
}