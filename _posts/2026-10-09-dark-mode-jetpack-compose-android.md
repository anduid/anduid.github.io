---
layout: post
title: "Dark Mode di Jetpack Compose: Tema Gelap yang Nyaman"
description: "Panduan membuat tema gelap di Jetpack Compose: ColorScheme Material 3, mengikuti pengaturan sistem, pilihan manual dengan DataStore, dan tips desain kontras."
date: 2026-10-09 14:15:00 +0700
tags: [android, jetpack-compose, desain, tutorial]

# image: /assets/images/dark-mode-compose.png
# image_alt: Perbandingan tampilan terang dan gelap pada aplikasi Jetpack Compose
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di proyek Anda, periksa versi pustaka terbaru, dan tambahkan pengalaman desain tema gelap Anda di bagian bertanda "TAMBAHKAN". Tangkapan layar terang dan gelap buatan sendiri sangat disarankan. Hapus published: false saat selesai. -->

Banyak pengguna lebih suka aplikasi bertema gelap. Tampilannya lebih nyaman di ruangan redup, dan pada layar OLED warna gelap dapat membantu menghemat baterai. Karena itu dukungan dark mode kini hampir menjadi standar, bukan fitur tambahan.

<!-- TAMBAHKAN (1-2 kalimat): aplikasi Anda yang memakai tema gelap dan alasan Anda memilih gaya warnanya. -->

Di Jetpack Compose, membuat tema gelap cukup rapi karena seluruh warna dikumpulkan di satu tempat. Tulisan ini membahas cara mendefinisikan skema warna terang dan gelap, mengikuti pengaturan sistem, memberi pengguna pilihan manual yang tersimpan, serta aturan desain agar tema gelap terbaca nyaman.

<!--more-->

## Cara kerja tema di Compose

Compose memakai `MaterialTheme` sebagai pusat gaya. Di dalamnya ada `ColorScheme`, kumpulan peran warna seperti `primary`, `background`, `surface`, dan `onSurface`. Komponen Material 3 mengambil warna dari peran-peran itu, jadi Anda tidak perlu mengatur warna di setiap komponen.

Untuk mengetahui apakah sistem sedang memakai mode gelap, Compose menyediakan `isSystemInDarkTheme()`. Dengan dua hal ini, tema terang dan gelap bisa berganti otomatis.

## Mendefinisikan skema warna

Buat dua skema, satu untuk tiap mode. Warna ditulis dalam format heksadesimal ARGB:

```kotlin
private val SkemaGelap = darkColorScheme(
    primary = Color(0xFF8AA8FF),
    background = Color(0xFF121212),
    surface = Color(0xFF1E1E1E),
    onBackground = Color(0xFFE6E6E6),
    onSurface = Color(0xFFE6E6E6)
)

private val SkemaTerang = lightColorScheme(
    primary = Color(0xFF2F5BEA),
    background = Color(0xFFFAFAFA),
    surface = Color(0xFFFFFFFF),
    onBackground = Color(0xFF1B1B1B),
    onSurface = Color(0xFF1B1B1B)
)
```

Perhatikan bahwa latar gelap memakai abu-abu sangat gelap (`#121212`), bukan hitam murni. Abu-abu gelap terasa lebih lembut di mata dan memungkinkan permukaan di atasnya terlihat sedikit lebih terang sehingga ada kedalaman. Warna aksen pada mode gelap dibuat sedikit lebih pucat dibanding mode terang agar tidak menyilaukan.

## Membuat fungsi tema

Bungkus skema itu dalam satu fungsi `@Composable` yang dipakai di seluruh aplikasi:

```kotlin
@Composable
fun AplikasiTema(
    gelap: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    MaterialTheme(
        colorScheme = if (gelap) SkemaGelap else SkemaTerang,
        content = content
    )
}
```

Lalu gunakan di aktivitas utama:

```kotlin
class MainActivity : ComponentActivity() {
    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        enableEdgeToEdge()
        setContent {
            AplikasiTema {
                // seluruh layar aplikasi
            }
        }
    }
}
```

Dengan `enableEdgeToEdge()`, konten tampil di bawah bilah status dan navigasi, dan ikon bilah menyesuaikan diri dengan tema. Pastikan Anda juga menangani *inset* agar konten tidak tertutup bilah sistem.

## Warna dinamis di Android 12 ke atas

Android 12 memperkenalkan warna dinamis, yaitu skema warna yang diambil dari wallpaper pengguna. Compose mendukungnya lewat `dynamicDarkColorScheme` dan `dynamicLightColorScheme`. Fitur ini hanya ada di perangkat yang sesuai, jadi periksa versi Android dulu dan siapkan skema cadangan:

```kotlin
val konteks = LocalContext.current
val skema = when {
    Build.VERSION.SDK_INT >= Build.VERSION_CODES.S ->
        if (gelap) dynamicDarkColorScheme(konteks) else dynamicLightColorScheme(konteks)
    gelap -> SkemaGelap
    else -> SkemaTerang
}
```

Jika aplikasi Anda punya identitas warna yang kuat, Anda boleh melewatkan warna dinamis supaya merek tetap konsisten.

<!-- TAMBAHKAN: apakah Anda memakai warna dinamis atau warna khas aplikasi, dan alasannya. -->

## Memberi pilihan manual dan menyimpannya

Sebagian pengguna ingin memilih tema sendiri, terlepas dari pengaturan sistem. Sediakan tiga pilihan: ikuti sistem, terang, dan gelap. Simpan pilihan dengan **DataStore**:

```kotlin
enum class ModeTema { SISTEM, TERANG, GELAP }

val Context.dataStore by preferencesDataStore(name = "pengaturan")
private val KUNCI_MODE = stringPreferencesKey("mode_tema")

fun modeTema(context: Context): Flow<ModeTema> =
    context.dataStore.data.map { pref ->
        ModeTema.valueOf(pref[KUNCI_MODE] ?: ModeTema.SISTEM.name)
    }

suspend fun simpanModeTema(context: Context, mode: ModeTema) {
    context.dataStore.edit { it[KUNCI_MODE] = mode.name }
}
```

Di `setContent`, baca pilihan itu dan tentukan apakah tema gelap dipakai:

```kotlin
val mode by modeTema(applicationContext).collectAsState(initial = ModeTema.SISTEM)
val gelap = when (mode) {
    ModeTema.SISTEM -> isSystemInDarkTheme()
    ModeTema.TERANG -> false
    ModeTema.GELAP -> true
}
AplikasiTema(gelap = gelap) { /* layar */ }
```

Pilihan pengguna kini tersimpan dan tetap berlaku setelah aplikasi ditutup.

## Aturan desain agar tema gelap nyaman

Membalik warna secara mentah jarang menghasilkan tampilan yang baik. Beberapa pegangan:

- **Jaga kontras.** Teks harus mudah dibaca. Pedoman aksesibilitas WCAG AA meminta rasio kontras minimal 4,5:1 untuk teks biasa. Periksa dengan alat pemeriksa kontras.
- **Hindari hitam murni dan putih murni sekaligus.** Kombinasi `#000000` dan `#FFFFFF` terlalu tajam. Pakai abu-abu sangat gelap dan putih sedikit redup.
- **Kurangi kejenuhan warna aksen.** Warna terlalu jenuh terasa "bergetar" di latar gelap.
- **Bedakan permukaan dengan tingkat kecerahan.** Kartu dan dialog sedikit lebih terang daripada latar, bukan memakai bayangan berat.
- **Periksa gambar dan ikon.** Logo hitam di latar gelap akan hilang. Siapkan varian atau gunakan pewarnaan ikon yang mengikuti tema.

## Menguji kedua tema

Gunakan *preview* Compose dengan mode malam supaya kedua tema bisa dilihat berdampingan:

```kotlin
@Preview(name = "Terang")
@Preview(name = "Gelap", uiMode = Configuration.UI_MODE_NIGHT_YES)
@Composable
fun PratinjauLayar() {
    AplikasiTema { LayarUtama() }
}
```

Uji juga di perangkat nyata dengan mengganti pengaturan tema sistem saat aplikasi berjalan, untuk memastikan tampilan berubah tanpa menutup aplikasi.

## Kesalahan yang sering terjadi

- **Warna ditulis langsung di komponen** (`Color.White`, `Color.Black`). Gunakan peran dari `MaterialTheme.colorScheme` supaya mengikuti tema.
- **Lupa menguji layar dan dialog yang jarang dibuka**, sehingga teks tak terbaca di mode tertentu.
- **Mengabaikan bilah status dan navigasi**, yang tampil terang di atas konten gelap.
- **Tidak menyimpan pilihan pengguna**, sehingga tema kembali ke bawaan setiap aplikasi dibuka.

## Kesimpulan

Dengan `ColorScheme`, `isSystemInDarkTheme()`, dan satu fungsi tema, dark mode di Jetpack Compose bisa dibuat rapi dan konsisten. Tambahkan pilihan manual yang tersimpan dengan DataStore, ikuti aturan kontras, dan uji kedua mode. Hasilnya aplikasi yang nyaman dipakai kapan pun.

Jika Anda ingin menyimpan data pengguna di aplikasi, baca juga [Room Database di Android: Panduan Pemula dengan Kotlin]({{ site.baseurl }}/2026/10/09/room-database-android-pemula-kotlin/).
