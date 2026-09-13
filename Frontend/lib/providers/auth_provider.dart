import 'dart:developer';
import 'package:dio/dio.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import '../core/api_client.dart';

class UserProfile {
  final String id;
  final String email;
  final String fullName;
  final String role;
  final String tenantId;

  UserProfile({
    required this.id,
    required this.email,
    required this.fullName,
    required this.role,
    required this.tenantId,
  });

  bool get isManager => role == 'manager' || role == 'admin';
  bool get isEmployee => role == 'employee';

  factory UserProfile.fromJson(Map<String, dynamic> json) {
    return UserProfile(
      id: json['user_id'] as String? ?? json['sub'] as String? ?? '',
      email: json['email'] as String? ?? '',
      fullName: json['full_name'] as String? ?? '',
      role: json['role'] as String? ?? 'employee',
      tenantId: json['tenant_id'] as String? ?? '',
    );
  }
}

class AuthState {
  final bool isAuthenticated;
  final bool isLoading;
  final String? token;
  final UserProfile? user;
  final String? errorMessage;

  const AuthState({
    required this.isAuthenticated,
    required this.isLoading,
    this.token,
    this.user,
    this.errorMessage,
  });

  const AuthState.unauthenticated()
      : isAuthenticated = false,
        isLoading = false,
        token = null,
        user = null,
        errorMessage = null;

  AuthState copyWith({
    bool? isAuthenticated,
    bool? isLoading,
    String? token,
    UserProfile? user,
    String? errorMessage,
  }) {
    return AuthState(
      isAuthenticated: isAuthenticated ?? this.isAuthenticated,
      isLoading: isLoading ?? this.isLoading,
      token: token ?? this.token,
      user: user ?? this.user,
      errorMessage: errorMessage,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  final ApiClient client;

  AuthNotifier(this.client) : super(const AuthState.unauthenticated()) {
    client.onSessionExpired = () {
      state = const AuthState.unauthenticated();
    };
  }

  Future<bool> login(String email, String password) async {
    state = state.copyWith(isLoading: true, errorMessage: null);
    try {
      final formData = FormData.fromMap({
        'username': email.trim(),
        'password': password,
      });

      final response = await client.dio.post(
        '/api/v1/auth/login',
        data: formData,
        options: Options(
          contentType: Headers.formUrlEncodedContentType,
        ),
      );

      if (response.statusCode == 200 && response.data != null) {
        final data = response.data as Map<String, dynamic>;
        final token = data['access_token'] as String;
        final profile = UserProfile(
          id: data['user_id'] as String? ?? '',
          email: email.trim(),
          fullName: data['full_name'] as String? ?? '',
          role: data['role'] as String? ?? 'employee',
          tenantId: data['tenant_id'] as String? ?? '',
        );

        client.setAuthToken(token);
        state = AuthState(
          isAuthenticated: true,
          isLoading: false,
          token: token,
          user: profile,
          errorMessage: null,
        );
        log('[AUTH] Successfully authenticated as \ (\)');
        return true;
      } else {
        state = state.copyWith(
          isLoading: false,
          errorMessage: 'Authentication failed. Please check credentials.',
        );
        return false;
      }
    } on DioException catch (e) {
      String msg = 'Login failed. Please check your credentials.';
      if (e.response?.statusCode == 401 || e.response?.statusCode == 403) {
        msg = 'Incorrect email or password.';
      } else if (e.type == DioExceptionType.connectionTimeout || e.type == DioExceptionType.unknown) {
        msg = 'Unable to reach backend server. Please verify network.';
      }
      state = state.copyWith(
        isLoading: false,
        errorMessage: msg,
      );
      return false;
    } catch (e) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: 'An unexpected error occurred: ',
      );
      return false;
    }
  }

  Future<void> logout() async {
    try {
      if (state.token != null) {
        await client.dio.post('/api/v1/auth/logout');
      }
    } catch (e) {
      log('[AUTH] Logout API call encountered: ');
    } finally {
      client.clearAuthToken();
      state = const AuthState.unauthenticated();
      log('[AUTH] Session cleared, state reset to unauthenticated.');
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  final client = ref.watch(apiClientProvider);
  return AuthNotifier(client);
});