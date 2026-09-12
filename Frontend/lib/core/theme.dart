import 'package:flutter/material.dart';

class JustEnoughTheme {
  // Decision colors with WCAG AA contrast verification notes
  static const Color shortageColor = Color(0xFFD32F2F);
  static const Color wasteColor = Color(0xFFF57F17);
  static const Color normalColor = Color(0xFF2E7D32);

  // Non-color indicators
  static const IconData shortageIcon = Icons.warning_amber_rounded;
  static const IconData wasteIcon = Icons.eco;
  static const IconData normalIcon = Icons.check_circle_outline;

  static ThemeData get lightTheme {
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF1976D2),
        brightness: Brightness.light,
      ),
      useMaterial3: true,
      cardTheme: const CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
      ),
      textTheme: const TextTheme(
        titleLarge: TextStyle(fontSize: 22, fontWeight: FontWeight.bold),
        titleMedium: TextStyle(fontSize: 18, fontWeight: FontWeight.w600),
        bodyLarge: TextStyle(fontSize: 16),
        bodyMedium: TextStyle(fontSize: 14),
        bodySmall: TextStyle(fontSize: 12, color: Colors.black54),
      ),
    );
  }

  static ThemeData get darkTheme {
    return ThemeData(
      colorScheme: ColorScheme.fromSeed(
        seedColor: const Color(0xFF1976D2),
        brightness: Brightness.dark,
      ),
      useMaterial3: true,
      cardTheme: const CardThemeData(
        elevation: 2,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.all(Radius.circular(12)),
        ),
      ),
    );
  }
}
