---
layout: post
title: "Memasang Iklan AdMob di Aplikasi Android dengan Aman dan Sesuai Kebijakan"
description: "Panduan memasang AdMob di aplikasi Android: iklan uji, inisialisasi, persetujuan pengguna, penempatan yang sah, iklan rewarded, kesalahan kebijakan umum, dan privasi."
date: 2026-10-28 00:45:00 +0700
tags: [android, admob, monetisasi, panduan]

# image: /assets/images/admob-android-aman.png
# image_alt: Penempatan iklan banner dan rewarded pada aplikasi Android
---
<!-- CATATAN PENULIS (tidak tampil di situs): kebijakan dan SDK AdMob sering berubah. Periksa setiap butir ke dokumentasi dan kebijakan AdMob terbaru sebelum diterbitkan, dan tambahkan pengalaman Anda memasang iklan di bagian bertanda "TAMBAHKAN". Jangan menampilkan ID unit iklan asli atau data akun. Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Iklan adalah salah satu cara paling umum mendapatkan penghasilan dari aplikasi gratis. Tetapi AdMob juga termasuk layanan dengan kebijakan yang ketat. Kesalahan kecil, seperti mengetuk iklan sendiri saat menguji atau menaruh iklan terlalu dekat dengan tombol, dapat berujung pada pembatasan iklan atau penangguhan akun. Karena itu pemasangannya perlu dilakukan dengan hati-hati sejak awal.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda memasang iklan di aplikasi dan hal yang paling Anda hati-hati hindari. -->

Tulisan ini membahas langkah dasar memasang AdMob dan, yang lebih penting, kebiasaan yang menjaga aplikasi dan akun Anda tetap aman.

<!--more-->

## Persiapan

1. Buat akun AdMob dan daftarkan aplikasi Anda.
2. Buat **unit iklan** sesuai format yang Anda butuhkan (banner, native, interstitial, rewarded).
3. Catat **ID aplikasi** dan **ID unit iklan**. Keduanya berbeda untuk setiap aplikasi dan format.
4. Tambahkan SDK Google Mobile Ads ke proyek, dengan versi terbaru dari [dokumentasi resmi AdMob](https://developers.google.com/admob/android/quick-start).

ID aplikasi dipasang di `AndroidManifest.xml`:

```xml
<manifest>
    <application>
        <meta-data
            android:name="com.google.android.gms.ads.APPLICATION_ID"
            android:value="ID_APLIKASI_ADMOB_ANDA" />
    </application>
</manifest>
```

## Aturan emas: selalu pakai iklan uji saat mengembangkan

**Jangan pernah menguji dengan ID unit iklan asli**, dan **jangan pernah mengetuk iklan asli milik Anda sendiri**. Itu termasuk klik tidak valid dan pelanggaran kebijakan. Selama pengembangan, gunakan ID unit iklan uji resmi dari Google (daftar lengkap ada di dokumentasi AdMob), misalnya:

```kotlin
object IdIklan {
    // ID uji resmi Google. Ganti dengan ID asli HANYA pada build rilis.
    const val BANNER_UJI = "ca-app-pub-3940256099942544/6300978111"
    const val REWARDED_UJI = "ca-app-pub-3940256099942544/5224354917"
}
```

Pisahkan ID uji dan ID asli lewat konfigurasi build supaya tidak tertukar:

```kotlin
// build.gradle.kts (modul app)
buildTypes {
    debug   { buildConfigField("String", "BANNER_ID", "\"ca-app-pub-3940256099942544/6300978111\"") }
    release { buildConfigField("String", "BANNER_ID", "\"ID_BANNER_ASLI_ANDA\"") }
}
```

Konfigurasi `buildConfigField` mengharuskan opsi `buildConfig = true` aktif di `buildFeatures`. ID unit iklan bukan rahasia seperti kunci API, tetapi tetap tidak perlu dipublikasikan di repositori publik.

Daftarkan juga **perangkat uji** Anda agar iklan asli ditandai sebagai uji pada perangkat tersebut, sesuai petunjuk di dokumentasi.

## Inisialisasi SDK

Panggil sekali saat aplikasi dimulai, di luar utas utama:

```kotlin
class AplikasiSaya : Application() {
    override fun onCreate() {
        super.onCreate()
        Thread {
            MobileAds.initialize(this) { }
        }.start()
    }
}
```

Lakukan setelah persetujuan pengguna ditangani jika Anda melayani pengguna di wilayah yang mensyaratkannya (lihat bagian berikut).

## Persetujuan pengguna dan privasi

Untuk pengguna di wilayah tertentu, seperti Wilayah Ekonomi Eropa dan Inggris, Google mensyaratkan pesan persetujuan sebelum iklan dipersonalisasi ditayangkan. AdMob menyediakan **User Messaging Platform (UMP)** untuk itu. Siapkan formulir persetujuan di dasbor AdMob, lalu minta informasi persetujuan saat aplikasi dibuka sebelum memuat iklan. Syarat dan tata caranya berubah, jadi ikuti dokumentasi terbaru.

Di luar persetujuan:

- Cantumkan **kebijakan privasi** yang menyebut penggunaan iklan dan pengumpulan pengenal iklan.
- Isi formulir **Keamanan Data** di Google Play dengan jujur, termasuk data yang dikumpulkan oleh SDK iklan.
- Jika aplikasi ditujukan untuk **anak-anak**, berlaku aturan tambahan yang jauh lebih ketat. Baca kebijakan khusus untuk aplikasi anak dan tandai permintaan iklan dengan benar.

Persiapan toko aplikasi lain dibahas di [Daftar Periksa Rilis Aplikasi Android ke Google Play]({{ site.baseurl }}/2026/10/09/daftar-periksa-rilis-aplikasi-android-google-play/).

## Menampilkan banner

Banner paling sederhana. Di Compose, bungkus `AdView` dengan `AndroidView`:

```kotlin
@Composable
fun BannerIklan(idUnit: String, modifier: Modifier = Modifier) {
    AndroidView(
        modifier = modifier.fillMaxWidth(),
        factory = { konteks ->
            AdView(konteks).apply {
                setAdSize(AdSize.BANNER)
                adUnitId = idUnit
                loadAd(AdRequest.Builder().build())
            }
        }
    )
}
```

Hentikan dan bebaskan sumber daya sesuai siklus hidup (`pause`, `resume`, `destroy`) seperti disarankan dokumentasi, terutama pada layar yang sering dibuka dan ditutup.

<!-- TAMBAHKAN: format iklan yang Anda pakai (banner, native, rewarded) dan alasan Anda memilihnya. -->

## Iklan rewarded: hadiah yang jujur

Iklan *rewarded* meminta pengguna menonton iklan untuk mendapat imbalan, misalnya membuka fitur tertentu. Beberapa prinsip:

- **Opsional.** Pengguna memilih menontonnya. Jangan memaksa.
- **Jelaskan imbalannya** sebelum iklan tampil.
- **Berikan imbalan setelah iklan selesai**, hanya saat callback imbalan dipanggil.
- **Pastikan imbalannya benar-benar diberikan**, dan jangan menjadikan seluruh aplikasi tidak bisa dipakai tanpa menonton.

```kotlin
RewardedAd.load(konteks, IdIklan.REWARDED_UJI, AdRequest.Builder().build(),
    object : RewardedAdLoadCallback() {
        override fun onAdLoaded(iklan: RewardedAd) {
            iklan.show(activity) { hadiah ->
                // Panggilan ini berarti pengguna berhak atas imbalan
                berikanImbalan(hadiah.amount)
            }
        }
        override fun onAdFailedToLoad(galat: LoadAdError) {
            // Beri tahu pengguna dengan ramah dan jangan blokir fitur
        }
    })
```

Selalu siapkan jalur ketika iklan gagal dimuat, misalnya memberi tahu pengguna atau menawarkan alternatif. Jangan sampai fitur penting terkunci karena iklan tidak tersedia.

## Penempatan yang sah

Kebijakan AdMob melarang penempatan yang memancing klik tidak sengaja:

- **Jangan menaruh iklan terlalu dekat dengan tombol atau area ketukan** sehingga pengguna mudah salah mengetuk.
- **Jangan menyamarkan iklan** menjadi konten atau tombol aplikasi.
- **Jangan menayangkan iklan di layar kosong atau layar pemuatan** yang tidak punya konten bermakna.
- **Jangan menampilkan iklan saat aplikasi dibuka atau ditutup** dengan cara yang mengejutkan, kecuali memakai format yang memang dirancang untuk itu dan mengikuti aturannya.
- **Batasi frekuensi interstitial** dan tampilkan di jeda alami, bukan di tengah tindakan pengguna.

Selain aman bagi akun, penempatan yang tertib juga membuat pengguna lebih betah.

## Kesalahan kebijakan yang sering terjadi

- **Mengetuk iklan asli sendiri**, atau meminta teman dan keluarga melakukannya.
- **Menguji dengan ID iklan asli** di perangkat pengembangan.
- **Menawarkan imbalan agar pengguna mengetuk iklan** (bukan sekadar menonton).
- **Penempatan menempel pada tombol** atau elemen interaktif.
- **Tidak ada kebijakan privasi** atau formulir keamanan data yang tidak sesuai.
- **Mengabaikan persetujuan pengguna** di wilayah yang mensyaratkannya.
- **Memuat iklan di aplikasi yang melanggar kebijakan konten lain.**

## Mengukur dan merawat

- Pantau laporan AdMob: tayangan, eCPM, tingkat isi (*fill rate*), dan peringatan kebijakan.
- Ukur dampak iklan pada retensi dan ulasan. Iklan yang mengganggu menurunkan peringkat aplikasi.
- Perbarui SDK secara berkala, karena versi lama bisa kehilangan dukungan.
- Bersiap menjelaskan dengan jelas jika akun menerima peringatan, dan perbaiki sumber masalahnya.

Untuk pembahasan standardisasi proyek yang membantu menjaga konfigurasi iklan konsisten di banyak aplikasi, lihat [Membuat Banyak Aplikasi Android Lebih Cepat dengan Template Proyek]({{ site.baseurl }}/2026/10/10/template-proyek-android-banyak-aplikasi/).

## Kesimpulan

Memasang AdMob bukan hanya soal kode. Kuncinya adalah disiplin: pakai iklan uji saat mengembangkan, jangan pernah mengetuk iklan asli sendiri, urus persetujuan dan privasi, tempatkan iklan dengan jujur, dan jadikan imbalan rewarded sebagai pilihan yang adil. Dengan begitu pendapatan Anda tumbuh tanpa mempertaruhkan akun dan kepercayaan pengguna.
