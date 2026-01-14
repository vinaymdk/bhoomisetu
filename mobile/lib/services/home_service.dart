import '../config/api_client.dart';
import '../models/property.dart';

class HomeService {
  final _apiClient = ApiClient();

  Future<HomeData> getHomeData({int featuredLimit = 10, int newLimit = 10}) async {
    try {
      final response = await _apiClient.dio.get(
        '/home',
        queryParameters: {
          'featuredLimit': featuredLimit,
          'newLimit': newLimit,
        },
      );
      return HomeData.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }

  Future<DashboardData> getDashboardData() async {
    try {
      // Token will be added automatically by the interceptor
      final response = await _apiClient.dio.get('/home/dashboard');
      return DashboardData.fromJson(response.data);
    } catch (e) {
      rethrow;
    }
  }
}
