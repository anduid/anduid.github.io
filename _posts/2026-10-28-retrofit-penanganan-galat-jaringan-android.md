---
layout: post
title: "Retrofit dan Penanganan Galat Jaringan di Android: Dari Timeout sampai Offline"
description: "Panduan memanggil API di Android dengan Retrofit dan coroutines: antarmuka API, pembungkus hasil, penanganan HttpException dan IOException, timeout, retry, dan pola cache offline."
date: 2026-10-28 01:00:00 +0700
tags: [android, retrofit, kotlin, api, tutorial]

# image: /assets/images/retrofit-galat-jaringan.png
# image_alt: Alur permintaan jaringan di Android dengan penanganan galat dan cache offline
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di proyek Anda dan periksa versi pustaka terbaru. Tambahkan pengalaman Anda menangani jaringan yang tidak stabil di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Jaringan ponsel tidak bisa diandalkan: sinyal lemah, pengguna masuk terowongan, atau server sedang sibuk. Aplikasi yang hanya dites di jaringan kantor yang stabil sering macet atau berhenti saat sampai di tangan pengguna sungguhan. Penanganan galat jaringan yang baik membedakan aplikasi yang terasa profesional dari aplikasi yang membuat frustrasi.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda dengan galat jaringan di aplikasi nyata dan pelajaran yang diambil. -->

Tulisan ini membahas cara memanggil API dengan Retrofit dan coroutines, membungkus hasilnya dengan aman, membedakan jenis galat, dan menyiapkan cadangan saat offline.

<!--more-->

## Dependensi dan izin

Tambahkan Retrofit, OkHttp, dan converter JSON pilihan Anda (Moshi, kotlinx.serialization, atau Gson). Periksa versi terbaru di dokumentasi masing-masing. Jangan lupa izin internet di `AndroidManifest.xml`:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

## Antarmuka API

Retrofit mengubah antarmuka Kotlin menjadi panggilan HTTP. Fungsi `suspend` membuatnya terintegrasi dengan coroutines:

```kotlin
interface CatatanApi {
    @GET("catatan")
    suspend fun ambilCatatan(): List<CatatanDto>

    @POST("catatan")
    suspend fun tambah(@Body baru: CatatanBaruDto): CatatanDto

    @DELETE("catatan/{id}")
    suspend fun hapus(@Path("id") id: Long)
}
```

Buat instans Retrofit sekali (misalnya lewat Hilt, seperti di [Hilt di Android]({{ site.baseurl }}/2026/10/09/hilt-injeksi-dependensi-android/)):

```kotlin
val klien = OkHttpClient.Builder()
    .connectTimeout(15, TimeUnit.SECONDS)
    .readTimeout(20, TimeUnit.SECONDS)
    .callTimeout(30, TimeUnit.SECONDS)
    .build()

val api: CatatanApi = Retrofit.Builder()
    .baseUrl("https://api.contoh.id/")      // wajib diakhiri garis miring
    .client(klien)
    .addConverterFactory(/* converter JSON pilihan Anda */)
    .build()
    .create(CatatanApi::class.java)
```

Atur *timeout* secara sadar. Nilai bawaan bisa terlalu panjang atau terlalu pendek untuk kebutuhan Anda. Jangan mencatat isi permintaan yang berisi data pribadi atau token di log pada build rilis.

## Tiga jenis galat yang perlu dibedakan

Galat jaringan tidak seragam, dan masing-masing butuh tanggapan berbeda:

| Jenis | Penyebab | Pengecualian | Tanggapan yang pantas |
|-------|----------|--------------|------------------------|
| **Galat koneksi** | Tidak ada internet, timeout, DNS gagal | `IOException` (termasuk `SocketTimeoutException`) | Beri tahu pengguna, tawarkan coba lagi atau tampilkan data tersimpan |
| **Galat HTTP** | Server menjawab dengan status 4xx atau 5xx | `HttpException` | Tanggapi sesuai kode: login ulang (401), tidak berhak (403), tidak ada (404), coba nanti (5xx) |
| **Galat tak terduga** | Data tidak sesuai format, bug | `Exception` lain | Pesan umum dan catat untuk diperbaiki |

Pemahaman status kode ada di [REST API Dasar]({{ site.baseurl }}/2026/10/26/rest-api-dasar-http-json-status-kode/).

## Pembungkus hasil yang aman

Daripada melempar pengecualian ke seluruh aplikasi, bungkus hasil panggilan dalam tipe yang menyatakan sukses atau gagal:

```kotlin
sealed interface Hasil<out T> {
    data class Sukses<T>(val data: T) : Hasil<T>
    data class Gagal(val pesan: String, val kode: Int? = null) : Hasil<Nothing>
}

suspend fun <T> panggilAman(blok: suspend () -> T): Hasil<T> = try {
    Hasil.Sukses(blok())
} catch (e: CancellationException) {
    throw e                                   // pembatalan coroutine harus diteruskan
} catch (e: HttpException) {
    Hasil.Gagal("Server menolak permintaan (${e.code()}).", e.code())
} catch (e: IOException) {
    Hasil.Gagal("Tidak ada koneksi. Periksa internet Anda lalu coba lagi.")
} catch (e: Exception) {
    Hasil.Gagal("Terjadi kesalahan tak terduga.")
}
```

Catatan penting: `CancellationException` **harus diteruskan** dan tidak boleh ditelan, sebagaimana dibahas di [Kotlin Coroutines dan Flow untuk Pemula Android]({{ site.baseurl }}/2026/10/10/kotlin-coroutines-flow-pemula-android/). Pesan galat ke pengguna dibuat ramah dan tidak membocorkan detail internal.

Pakai di repository:

```kotlin
class CatatanRepository(private val api: CatatanApi) {
    suspend fun ambil(): Hasil<List<CatatanDto>> = panggilAman { api.ambilCatatan() }
}
```

## Menampilkan keadaan di layar

ViewModel mengubah `Hasil` menjadi keadaan layar, memakai sealed class seperti di [Kotlin untuk Pemula Android]({{ site.baseurl }}/2026/10/26/kotlin-dasar-null-safety-data-class/):

```kotlin
sealed interface KeadaanLayar {
    object Memuat : KeadaanLayar
    data class Sukses(val daftar: List<CatatanDto>) : KeadaanLayar
    data class Gagal(val pesan: String) : KeadaanLayar
}

class CatatanViewModel(private val repo: CatatanRepository) : ViewModel() {
    private val _keadaan = MutableStateFlow<KeadaanLayar>(KeadaanLayar.Memuat)
    val keadaan: StateFlow<KeadaanLayar> = _keadaan

    fun muat() {
        viewModelScope.launch {
            _keadaan.value = KeadaanLayar.Memuat
            _keadaan.value = when (val h = repo.ambil()) {
                is Hasil.Sukses -> KeadaanLayar.Sukses(h.data)
                is Hasil.Gagal -> KeadaanLayar.Gagal(h.pesan)
            }
        }
    }
}
```

Di layar, tampilkan indikator pemuatan, daftar, atau pesan galat dengan tombol **Coba lagi** yang memanggil `muat()` kembali. Dasar UI-nya ada di [Jetpack Compose Dasar]({{ site.baseurl }}/2026/10/28/jetpack-compose-dasar-state-recomposition/).

<!-- TAMBAHKAN: tampilan galat dan tombol coba lagi yang Anda pakai, beserta alasan desainnya. -->

## Retry dengan jeda yang bertambah

Sebagian galat bersifat sementara. Mengulang otomatis beberapa kali dengan jeda yang makin panjang (*exponential backoff*) sering menyelesaikannya:

```kotlin
suspend fun <T> denganUlang(
    maksPercobaan: Int = 3,
    jedaAwalMs: Long = 500,
    blok: suspend () -> Hasil<T>
): Hasil<T> {
    var jeda = jedaAwalMs
    repeat(maksPercobaan - 1) {
        val hasil = blok()
        if (hasil is Hasil.Sukses) return hasil
        if (hasil is Hasil.Gagal && hasil.kode != null && hasil.kode in 400..499) return hasil // jangan ulangi galat klien
        delay(jeda)
        jeda *= 2
    }
    return blok()
}
```

Hanya ulangi galat yang mungkin sementara (koneksi dan 5xx). Jangan mengulang galat klien seperti 400 atau 404, karena hasilnya akan sama. Untuk operasi yang mengubah data, pastikan pengulangan tidak membuat data ganda (misalnya dengan kunci idempotensi dari server).

## Offline-first: data tersimpan sebagai cadangan

Pendekatan paling ramah: simpan hasil dari server di Room dan tampilkan dari sana. Jaringan hanya menyegarkan datanya:

1. Layar selalu membaca dari basis data lokal (`Flow` dari Room).
2. Saat ada jaringan, ambil data dari API lalu perbarui basis data.
3. Jika gagal, pengguna tetap melihat data terakhir ditambah pesan singkat bahwa data mungkin tidak terbaru.

Dengan pola ini, aplikasi tetap berguna di sinyal buruk. Dasar basis datanya dibahas di [Room Database di Android]({{ site.baseurl }}/2026/10/09/room-database-android-pemula-kotlin/).

## Memeriksa status jaringan

`ConnectivityManager` bisa memberi tahu apakah perangkat terhubung, tetapi **terhubung belum tentu bisa mengakses internet**. Jadikan ini petunjuk, bukan satu-satunya penentu. Tetaplah menangani galat dari panggilan sebenarnya.

## Keamanan jaringan

- **Gunakan HTTPS** untuk semua panggilan. Android modern memblokir lalu lintas teks polos secara bawaan.
- **Jangan menaruh kunci API rahasia di aplikasi.** Panggil lewat server perantara, seperti di [Mengamankan API Key AI di Aplikasi Web dan Android]({{ site.baseurl }}/2026/10/09/mengamankan-api-key-ai-di-aplikasi/).
- **Simpan token autentikasi dengan benar** dan perbarui bila kedaluwarsa. Lihat [Login yang Aman di Aplikasi Web Statis]({{ site.baseurl }}/2026/10/17/login-aman-aplikasi-web-statis/) untuk prinsipnya.
- **Jangan mencatat data sensitif** di log.

## Kesalahan yang sering terjadi

- **Tidak menangani `IOException`**, sehingga aplikasi berhenti saat sinyal hilang.
- **Menelan `CancellationException`** dalam `catch (e: Exception)`.
- **Memanggil API di utas utama.** Gunakan fungsi `suspend` dan coroutines.
- **Mengulang galat 4xx** tanpa guna.
- **Tidak ada timeout yang masuk akal.**
- **Pesan galat teknis** (`java.net.SocketTimeoutException`) ditampilkan ke pengguna.
- **Tidak ada jalur coba lagi** setelah gagal.
- **Hanya menguji di jaringan cepat.** Uji juga dengan mode pesawat, sinyal lemah, dan server yang lambat.

## Kesimpulan

Jaringan akan gagal, jadi rancang aplikasi untuk itu: bedakan galat koneksi, galat HTTP, dan galat tak terduga, bungkus hasil dalam tipe yang jelas, tampilkan keadaan dengan tombol coba lagi, ulangi hanya galat yang sementara, dan simpan data terakhir untuk mode offline. Aplikasi yang tangguh di jaringan buruk adalah aplikasi yang dipercaya pengguna.
