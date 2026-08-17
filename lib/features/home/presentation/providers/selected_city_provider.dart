import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../../../core/constants/app_constants.dart';

/// مزوّد المدينة المختارة ('عدن' افتراضياً — كما في Index.tsx).
final selectedCityProvider =
    NotifierProvider<SelectedCityController, String>(
        SelectedCityController.new);

/// متحكم المدينة المختارة في الشاشة الرئيسية.
class SelectedCityController extends Notifier<String> {
  @override
  String build() => AppConstants.cityAden;

  /// تغيير المدينة المختارة.
  void select(String city) => state = city;
}
