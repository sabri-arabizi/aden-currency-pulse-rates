import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../../domain/entities/exchange_rate.dart';
import '../../domain/repositories/exchange_rates_repository.dart';
import '../datasources/exchange_rates_remote_ds.dart';

/// تنفيذ مستودع أسعار الصرف فوق مصدر البيانات البعيد.
class ExchangeRatesRepositoryImpl implements ExchangeRatesRepository {
  const ExchangeRatesRepositoryImpl(this._remote);

  final ExchangeRatesRemoteDataSource _remote;

  @override
  Future<List<ExchangeRate>> getRates(String city) => _remote.fetchRates(city);
}

/// مزوّد مستودع أسعار الصرف.
final exchangeRatesRepositoryProvider =
    Provider<ExchangeRatesRepository>(
  (ref) =>
      ExchangeRatesRepositoryImpl(ref.watch(exchangeRatesRemoteDsProvider)),
);
