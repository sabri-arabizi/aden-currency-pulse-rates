// توليد بانرات GIF متحركة لمدن يمنية (تعبر عن المدن اليمنية)
// تُضاف إلى assets/images/gallery/ وتُستخدم في سلايدر المدن.
//
// التشغيل:
//   cd flutter_app/tool/gen_city_gifs
//   dart pub get --offline
//   dart run gen_city_gifs.dart
import 'dart:io';
import 'dart:math';

import 'package:image/image.dart' as img;

const int W = 800;
const int H = 420;
const int frameCount = 6;
const int delayCs = 14; // 1/100s => 140ms لكل إطار

class CitySlides {
  final String file;
  final String latin;
  final List<int> top;
  final List<int> bottom;
  final List<int> accent;
  const CitySlides(this.file, this.latin, this.top, this.bottom, this.accent);
}

// لوحة ألوان مُميّزة لكل مدينة يمنية.
const List<CitySlides> cities = [
  CitySlides('sanaa', 'SANAA', [0xF5, 0xB0, 0x41], [0xB4, 0x5F, 0x1F], [0xFF, 0xE9, 0x9A]),
  CitySlides('aden', 'ADEN', [0x2D, 0xD4, 0xBF], [0x0E, 0x74, 0xBB], [0xA5, 0xF3, 0xFC]),
  CitySlides('taiz', 'TAIZ', [0x4A, 0xD9, 0x74], [0x16, 0x5E, 0x3B], [0xBB, 0xF7, 0xD0]),
  CitySlides('hodeidah', 'HODEIDAH', [0xF8, 0x71, 0x71], [0x9F, 0x12, 0x39], [0xFD, 0xBA, 0x74]),
  CitySlides('ibb', 'IBB', [0xA7, 0x8B, 0xFA], [0x6D, 0x28, 0xD9], [0xDD, 0xD6, 0xFE]),
  CitySlides('mukalla', 'MUKALLA', [0x60, 0xA5, 0xFA], [0x1E, 0x3A, 0x8A], [0xBF, 0xDB, 0xFE]),
];

void main() {
  final outDir = Directory('../../assets/images/gallery');
  outDir.createSync(recursive: true);

  for (final c in cities) {
    final gif = img.GifEncoder(delay: delayCs, repeat: 0);
    for (var f = 0; f < frameCount; f++) {
      gif.addFrame(_buildFrame(c, f));
    }
    final bytes = gif.finish();
    if (bytes == null) {
      throw StateError('فشل توليد ${c.file}');
    }
    File('${outDir.path}/${c.file}.gif').writeAsBytesSync(bytes);
    stdout.writeln('تم توليد ${c.file}.gif');
  }
}

int _lerp(int a, int b, double t) => (a + (b - a) * t).round().clamp(0, 255);

int _brighten(int v, int amount) => (v + amount).clamp(0, 255);

img.Image _buildFrame(CitySlides c, int frame) {
  final image = img.Image(width: W, height: H);
  final rng = Random(1000 + frame * 7);

  // 1) خلفية تدرّج عامودي بين لوني المدينة.
  for (var y = 0; y < H; y++) {
    final t = y / (H - 1);
    final r = _lerp(c.top[0], c.bottom[0], t);
    final g = _lerp(c.top[1], c.bottom[1], t);
    final b = _lerp(c.top[2], c.bottom[2], t);
    for (var x = 0; x < W; x++) {
      image.setPixelRgb(x, y, r, g, b);
    }
  }

  // 2) خطوط مائلة متوهّجة متحركة (shimmer).
  const stripePeriod = 60;
  final shift = frame * 9;
  for (var y = 0; y < H; y++) {
    for (var x = 0; x < W; x++) {
      final idx = ((x + y) + shift) % stripePeriod;
      if (idx < stripePeriod ~/ 3) {
        final p = image.getPixel(x, y);
        image.setPixelRgb(
          x,
          y,
          _brighten(p.r.toInt(), 30),
          _brighten(p.g.toInt(), 30),
          _brighten(p.b.toInt(), 30),
        );
      }
    }
  }

  // 3) شمس/هالة نابضة في أعلى اليمين.
  final sunR = 48 + ((frame % 3) * 14);
  img.fillCircle(
    image,
    x: W - 110,
    y: 100,
    radius: sunR,
    color: img.ColorRgba8(c.accent[0], c.accent[1], c.accent[2], 190),
    antialias: true,
  );
  img.fillCircle(
    image,
    x: W - 110,
    y: 100,
    radius: (sunR * 0.55).round(),
    color: img.ColorRgba8(255, 255, 255, 230),
    antialias: true,
  );

  // 4) جسيمات/نجوم تتحرك تدريجياً بين الإطارات.
  for (var i = 0; i < 26; i++) {
    final px = rng.nextInt(W);
    final py = rng.nextInt(240);
    img.fillCircle(
      image,
      x: px,
      y: py,
      radius: 2,
      color: img.ColorRgba8(255, 255, 255, 120 + rng.nextInt(120)),
      antialias: true,
    );
  }

  // 5) أفق مدينة (skyline) عند أسفل الصورة مع انزياح أفقي بطيء.
  final skyBase = 320;
  img.fillRect(
    image,
    x1: 0,
    y1: skyBase,
    x2: W - 1,
    y2: H - 1,
    color: img.ColorRgb8(28, 22, 16),
  );
  _drawSkyline(image, skyBase, frame * 6 % 160, c);

  // 6) اسم المدينة (لاتيني) + "YEMEN".
  img.drawString(
    image,
    c.latin,
    font: img.arial48,
    x: 48,
    y: 108,
    color: img.ColorRgb8(255, 253, 240),
  );
  img.drawString(
    image,
    'YEMEN',
    font: img.arial24,
    x: 52,
    y: 168,
    color: img.ColorRgb8(c.accent[0], c.accent[1], c.accent[2]),
  );

  return image;
}

// يرسم أفق أبنية يمنية متنوّعة الارتفاعات، يتحرك ببطء كل إطار.
void _drawSkyline(img.Image image, int baseY, int offset, CitySlides c) {
  final buildings = <Map<String, int>>[
    {'x': 0, 'w': 70, 'h': 46},
    {'x': 74, 'w': 54, 'h': 70},
    {'x': 132, 'w': 42, 'h': 40},
    {'x': 178, 'w': 64, 'h': 82},
    {'x': 246, 'w': 50, 'h': 52},
    {'x': 300, 'w': 72, 'h': 66},
    {'x': 376, 'w': 46, 'h': 46},
    {'x': 426, 'w': 60, 'h': 76},
    {'x': 490, 'w': 52, 'h': 48},
    {'x': 546, 'w': 66, 'h': 72},
    {'x': 616, 'w': 44, 'h': 40},
    {'x': 664, 'w': 58, 'h': 84},
    {'x': 726, 'w': 74, 'h': 56},
  ];
  final outline = img.ColorRgb8(12, 9, 6);

  for (final b in buildings) {
    final x = b['x']! - offset;
    final w = b['w']!;
    final h = b['h']!;
    if (x + w < 0 || x > W) continue;
    img.fillRect(
      image,
      x1: x.clamp(-40, W - 1),
      y1: baseY - h,
      x2: (x + w).clamp(-40, W - 1),
      y2: H - 1,
      color: img.ColorRgb8(24, 19, 14),
    );
    // نافذة مضيئة صغيرة.
    img.fillRect(
      image,
      x1: x + w ~/ 2,
      y1: baseY - h + 12,
      x2: x + w ~/ 2 + 8,
      y2: baseY - h + 22,
      color: img.ColorRgba8(255, 224, 150, 200),
    );
  }
  // خط أرضي.
  img.drawLine(
    image,
    x1: 0,
    y1: baseY,
    x2: W - 1,
    y2: baseY,
    color: outline,
    thickness: 1,
  );
}