import 'dart:developer';
import 'package:dio/dio.dart';
import 'package:flutter/foundation.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient();
});

class ApiError implements Exception {
  final String message;
  final int? statusCode;
  ApiError(this.message, [this.statusCode]);
  @override
  String toString() => 'ApiError: $message${statusCode != null ? ' (Status: $statusCode)' : ''}';
}

class ApiClient {
  late final Dio dio;
  String? _token;
  void Function()? onSessionExpired;

  ApiClient({String? baseUrl, String? initialToken}) {
    _token = initialToken;
    dio = Dio(BaseOptions(
      baseUrl: baseUrl ?? const String.fromEnvironment('API_BASE_URL', defaultValue: 'http://localhost:8000'),
      connectTimeout: const Duration(seconds: 10),
      receiveTimeout: const Duration(seconds: 30),
    ));

    if (_token != null && _token!.isNotEmpty) {
      dio.options.headers['Authorization'] = 'Bearer $_token';
    }

    // Auth & 401 Session Interceptor
    dio.interceptors.add(InterceptorsWrapper(
      onRequest: (options, handler) {
        final token = _token ?? const String.fromEnvironment('API_TOKEN');
        if (token.isNotEmpty) {
          options.headers['Authorization'] = 'Bearer $token';
        }
        return handler.next(options);
      },
      onError: (DioException e, handler) async {
        if (e.response?.statusCode == 401) {
          log('[AUTH] 401 Unauthorized received. Session expired or revoked.');
          clearAuthToken();
          onSessionExpired?.call();
        }
        return handler.next(e);
      },
    ));

    // Retry Interceptor
    dio.interceptors.add(InterceptorsWrapper(
      onError: (DioException e, handler) async {
        final statusCode = e.response?.statusCode;
        if (statusCode != null && statusCode >= 500 && statusCode < 600) {
          final extra = e.requestOptions.extra;
          final retryCount = (extra['retryCount'] ?? 0) as int;
          if (retryCount < 2) {
            extra['retryCount'] = retryCount + 1;
            await Future.delayed(Duration(seconds: 1 << retryCount)); // Exponential backoff
            try {
              final response = await dio.fetch(e.requestOptions);
              return handler.resolve(response);
            } catch (retryError) {
              return handler.next(retryError as DioException);
            }
          }
        }
        return handler.next(e);
      }
    ));

    // Error Interceptor
    dio.interceptors.add(InterceptorsWrapper(
      onError: (DioException e, handler) {
        String message;
        switch (e.type) {
          case DioExceptionType.connectionTimeout:
          case DioExceptionType.sendTimeout:
          case DioExceptionType.receiveTimeout:
            message = 'Connection timed out';
            break;
          case DioExceptionType.badResponse:
            message = 'Server error: ${e.response?.statusCode}';
            break;
          default:
            message = 'Network error occurred';
        }
        return handler.reject(
          DioException(
            requestOptions: e.requestOptions,
            error: ApiError(message, e.response?.statusCode),
          ),
        );
      },
    ));

    // Sanitized Logging: Disabled in Release mode, sanitized in Debug/Profile mode
    if (!kReleaseMode) {
      dio.interceptors.add(LogInterceptor(
        requestBody: false, // Never log request bodies to protect passwords & PII
        responseBody: false, // Never log raw payloads
        requestHeader: true,
        responseHeader: false,
        logPrint: (obj) {
          final raw = obj.toString();
          // Redact Authorization headers
          final sanitized = raw.replaceAll(
            RegExp(r'Bearer\s+[A-Za-z0-9\-_.]+', caseSensitive: false),
            'Bearer [REDACTED]',
          );
          log(sanitized);
        },
      ));
    }
  }

  void setAuthToken(String token) {
    _token = token;
    dio.options.headers['Authorization'] = 'Bearer $token';
  }

  void clearAuthToken() {
    _token = null;
    dio.options.headers.remove('Authorization');
  }

  String? get currentToken => _token;
}