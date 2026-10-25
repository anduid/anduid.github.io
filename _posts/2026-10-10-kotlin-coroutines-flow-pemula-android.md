---
layout: post
title: "Kotlin Coroutines dan Flow untuk Pemula Android"
description: "Panduan Kotlin Coroutines dan Flow untuk pemula Android: suspend, launch, async, dispatcher, StateFlow, penanganan galat, dan kesalahan umum yang harus dihindari."
date: 2026-10-10 02:30:00 +0700
tags: [android, kotlin, coroutines, tutorial]

# image: /assets/images/kotlin-coroutines-flow.png
# image_alt: Alur Coroutines dan Flow dari repository ke ViewModel dan layar
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di proyek Anda dan tambahkan pengalaman Anda memakai coroutines (masalah yang pernah Anda temui) di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Aplikasi Android tidak boleh membuat layar macet saat menunggu sesuatu: membaca database, memanggil API, atau memproses gambar. Dulu urusan ini dikerjakan dengan *callback* bersarang yang sulit dibaca. Kotlin Coroutines menggantinya dengan kode yang ditulis berurutan namun berjalan tanpa memblokir tampilan, dan Flow menambah kemampuan menangani aliran data yang berubah dari waktu ke waktu.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda beralih dari callback ke coroutines atau kendala awal yang Anda temui. -->

Tulisan ini menjelaskan konsep inti dengan contoh kecil yang langsung bisa dicoba.

<!--more-->

## Masalah yang diselesaikan

Semua tampilan Android berjalan di *utas utama* (*main thread*). Jika Anda melakukan pekerjaan lama di sana, layar membeku dan sistem bisa menampilkan dialog "aplikasi tidak merespons". Pekerjaan berat harus dipindah ke utas lain, tetapi hasilnya harus kembali ke utas utama agar bisa menampilkan sesuatu. Coroutines membuat perpindahan itu mudah dan aman.

## Fungsi suspend

Fungsi `suspend` adalah fungsi yang boleh "berhenti sementara" tanpa memblokir utas, lalu melanjutkan saat hasilnya siap:

```kotlin
suspend fun ambilCatatan(): List<Catatan> {
    delay(1000) // menunggu tanpa memblokir utas
    return dao.daftarSekali()
}
```

Fungsi `suspend` hanya bisa dipanggil dari coroutine atau dari fungsi `suspend` lain. Tanda `suspend` itu sendiri tidak memindahkan pekerjaan ke utas lain; ia hanya mengizinkan penundaan.

## Memulai coroutine dengan scope

Coroutine selalu berjalan di dalam sebuah *scope* yang menentukan masa hidupnya. Di Android, yang paling sering dipakai adalah `viewModelScope`:

```kotlin
class CatatanViewModel(private val repo: CatatanRepository) : ViewModel() {

    fun muat() {
        viewModelScope.launch {
            val hasil = repo.ambilCatatan()
            // perbarui state di sini
        }
    }
}
```

`viewModelScope` otomatis membatalkan semua coroutine di dalamnya saat ViewModel dihancurkan, sehingga tidak ada pekerjaan yang tertinggal. Inilah yang disebut *structured concurrency*: pekerjaan terikat pada pemiliknya.

## Dispatcher: di utas mana pekerjaan berjalan

Dispatcher menentukan utas yang dipakai:

| Dispatcher | Cocok untuk |
|------------|-------------|
| `Dispatchers.Main` | Memperbarui tampilan |
| `Dispatchers.IO` | Jaringan, berkas, database |
| `Dispatchers.Default` | Perhitungan berat (CPU) |

Pindah dispatcher dengan `withContext`:

```kotlin
suspend fun bacaBerkas(): String = withContext(Dispatchers.IO) {
    // pekerjaan I/O yang lama
    File(path).readText()
}
```

Kebiasaan baik: buat fungsi `suspend` yang *aman dipanggil dari utas utama*, artinya fungsi itu sendiri yang berpindah dispatcher bila perlu. Room dan Retrofit sudah menangani ini untuk fungsi `suspend` mereka.

## Menjalankan beberapa pekerjaan sekaligus dengan async

Jika dua pekerjaan tidak saling bergantung, jalankan bersamaan agar lebih cepat:

```kotlin
viewModelScope.launch {
    val a = async { repo.ambilProfil() }
    val b = async { repo.ambilStatistik() }
    val profil = a.await()
    val statistik = b.await()
    // gunakan keduanya
}
```

`async` mengembalikan hasil yang diambil dengan `await()`. Gunakan `launch` untuk pekerjaan yang tidak mengembalikan hasil, dan `async` bila Anda butuh hasilnya.

## Menangani galat

Galat dalam coroutine ditangani dengan `try/catch` biasa:

```kotlin
viewModelScope.launch {
    try {
        val hasil = repo.ambilCatatan()
        // tampilkan hasil
    } catch (e: CancellationException) {
        throw e // pembatalan harus diteruskan
    } catch (e: Exception) {
        // tampilkan pesan galat yang ramah
    }
}
```

Perhatikan bagian `CancellationException`: pembatalan coroutine dilakukan dengan melempar pengecualian ini, jadi jangan menelannya. Teruskan kembali agar pembatalan berjalan benar.

<!-- TAMBAHKAN: pola penanganan galat dan status pemuatan yang Anda pakai di aplikasi Anda. -->

## Flow: aliran data yang berubah

`suspend` mengembalikan satu nilai. Kalau datanya berubah terus, seperti isi tabel atau hitungan mundur, gunakan **Flow**, yaitu aliran nilai dari waktu ke waktu:

```kotlin
fun hitungMundur(dari: Int): Flow<Int> = flow {
    for (i in dari downTo 0) {
        emit(i)
        delay(1000)
    }
}
```

Flow bisa diolah dengan operator seperti `map` dan `filter`:

```kotlin
dao.semua()
    .map { daftar -> daftar.filter { it.judul.isNotBlank() } }
```

Room mendukung Flow secara langsung. DAO yang mengembalikan `Flow<List<Catatan>>` otomatis mengeluarkan daftar baru setiap isi tabel berubah, seperti dibahas di [Room Database di Android: Panduan Pemula dengan Kotlin]({{ site.baseurl }}/2026/10/09/room-database-android-pemula-kotlin/).

## StateFlow untuk state tampilan

Untuk menyimpan keadaan layar, gunakan `StateFlow`. Ia selalu punya nilai terkini dan dibaca oleh tampilan:

```kotlin
class CatatanViewModel(dao: CatatanDao) : ViewModel() {

    val daftar: StateFlow<List<Catatan>> = dao.semua()
        .stateIn(
            scope = viewModelScope,
            started = SharingStarted.WhileSubscribed(5000),
            initialValue = emptyList()
        )
}
```

`WhileSubscribed(5000)` menghentikan aliran 5 detik setelah tidak ada yang mengamati, misalnya saat layar ditutup, sehingga hemat sumber daya, tetapi tidak langsung berhenti saat layar hanya berputar.

Di Compose, amati dengan `collectAsStateWithLifecycle()` dari pustaka `lifecycle-runtime-compose` agar pengamatan berhenti saat aplikasi tidak terlihat:

```kotlin
val daftar by viewModel.daftar.collectAsStateWithLifecycle()
```

## Kesalahan yang sering terjadi

- **Memakai `GlobalScope`.** Coroutine tidak terikat pada siklus hidup apa pun dan bisa bocor. Gunakan `viewModelScope` atau `lifecycleScope`.
- **Memblokir utas dengan `Thread.sleep`.** Gunakan `delay` di dalam coroutine.
- **Lupa berpindah dispatcher** untuk pekerjaan berat, sehingga layar tersendat.
- **Menelan `CancellationException`** dalam `catch (e: Exception)` tanpa meneruskannya.
- **Mengamati Flow tanpa memperhatikan siklus hidup**, sehingga terus berjalan di latar belakang.
- **Menjalankan `launch` di dalam `launch` tanpa perlu**, yang membuat alur sulit dilacak.

## Kesimpulan

Coroutines membuat kode asinkron terasa seperti kode biasa: tulis `suspend`, jalankan di `viewModelScope`, pindah dispatcher dengan `withContext`, dan gunakan Flow untuk data yang berubah. Mulailah dari satu fungsi `suspend` dan satu `StateFlow` di ViewModel, lalu tambahkan `async` dan operator Flow sesuai kebutuhan. Jika Anda memakai injeksi dependensi, baca juga [Hilt di Android: Injeksi Dependensi Tanpa Pusing]({{ site.baseurl }}/2026/10/09/hilt-injeksi-dependensi-android/).
