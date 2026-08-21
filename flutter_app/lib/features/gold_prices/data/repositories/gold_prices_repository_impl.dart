import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/gold_price.dart';
import '../../domain/repositories/gold_prices_repository.dart';
import '../datasources/gold_prices_remote_ds.dart';

/// تنفيذ مستودع أسعار الذهب فوق مصدر البيانات البعيد.
class GoldPricesRepositoryImpl implements GoldPricesRepository {
  const GoldPricesRepositoryImpl(this._remote);

  final GoldPricesRemoteDataSource _remote;

  @override
  Future<List<GoldPrice>> getGoldPrices(String city) =>
      _remote.fetchGoldPrices(city);
}

/// مزوّد مستودع أسعار الذهب.
final goldPricesRepositoryProvider = Provider<GoldPricesRepository>(
  (ref) => GoldPricesRepositoryImpl(ref.watch(goldPricesRemoteDsProvider)),
);
