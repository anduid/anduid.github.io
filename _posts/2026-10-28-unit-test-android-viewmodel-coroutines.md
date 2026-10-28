---
layout: post
title: "Unit Test di Android: Menguji ViewModel dan Coroutines dengan JUnit"
description: "Panduan unit test di Android dengan Kotlin: JUnit, runTest, MainDispatcherRule untuk Dispatchers.Main, fake repository, menguji StateFlow, dan prinsip kode yang mudah diuji."
date: 2026-10-28 01:45:00 +0700
tags: [android, kotlin, testing, tutorial]

# image: /assets/images/unit-test-android.png
# image_alt: Unit test ViewModel Android dengan hasil lulus di Android Studio
---
<!-- CATATAN PENULIS (tidak tampil di situs): jalankan semua tes di Android Studio dan sesuaikan versi pustaka dengan dokumentasi terbaru, lalu tambahkan pengalaman Anda menguji aplikasi di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

"Berjalan di ponsel saya" bukan jaminan kualitas. Seiring aplikasi tumbuh, mengubah satu bagian mudah merusak bagian lain tanpa disadari. Tes otomatis adalah jaring pengaman: ia memeriksa dalam hitungan detik bahwa logika penting masih bekerja setelah Anda mengubah kode. Dan ViewModel, tempat logika layar berada, adalah salah satu tempat terbaik untuk memulai.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda menemukan bug lewat tes atau menyesal tidak punya tes. -->

Tulisan ini membahas unit test untuk kode Android dengan Kotlin: pengaturan, tes sederhana, cara menguji coroutines, dan menguji ViewModel dengan `StateFlow`.

<!--more-->

## Dua jenis tes utama

- **Unit test** berjalan di JVM di komputer Anda, cepat, dan menguji logika tanpa perangkat Android. Berada di `src/test`.
- **Instrumented test** berjalan di perangkat atau emulator dan menguji hal yang butuh sistem Android, seperti UI. Berada di `src/androidTest`.

Proporsi yang sehat: banyak unit test, sedikit tes UI. Tulisan ini berfokus pada unit test.

## Dependensi

Tambahkan di `build.gradle` modul app, dengan versi terbaru dari dokumentasi masing-masing:

```kotlin
dependencies {
    testImplementation("junit:junit:4.13.2")
    testImplementation("org.jetbrains.kotlinx:kotlinx-coroutines-test:VERSI_TERBARU")
    // opsional:
    testImplementation("io.mockk:mockk:VERSI_TERBARU")
    testImplementation("app.cash.turbine:turbine:VERSI_TERBARU")
}
```

## Tes pertama: fungsi biasa

Mulailah dari logika murni, yang paling mudah diuji:

```kotlin
fun hitungDiskon(harga: Int, persen: Int): Int {
    require(persen in 0..100) { "persen harus 0-100" }
    return harga - harga * persen / 100
}
```

```kotlin
import org.junit.Assert.assertEquals
import org.junit.Test

class DiskonTest {

    @Test
    fun `diskon 10 persen dari 50000 menjadi 45000`() {
        assertEquals(45000, hitungDiskon(50000, 10))
    }

    @Test
    fun `persen di luar rentang ditolak`() {
        org.junit.Assert.assertThrows(IllegalArgumentException::class.java) {
            hitungDiskon(50000, 150)
        }
    }
}
```

Kotlin mengizinkan nama fungsi dengan tanda petik balik dan spasi, sehingga nama tes terbaca seperti kalimat. Itu hanya berlaku untuk tes JVM biasa.

Tes yang baik mengikuti pola **Atur, Lakukan, Periksa** (*Arrange, Act, Assert*): siapkan data, panggil kode yang diuji, lalu periksa hasilnya.

## Merancang kode yang mudah diuji

Kode yang bergantung langsung pada jaringan atau basis data sulit diuji. Bergantunglah pada **antarmuka**, supaya Anda bisa menggantinya dengan versi palsu (*fake*) di tes. Ini selaras dengan injeksi dependensi di [Hilt di Android]({{ site.baseurl }}/2026/10/09/hilt-injeksi-dependensi-android/).

```kotlin
sealed interface Hasil<out T> {
    data class Sukses<T>(val data: T) : Hasil<T>
    data class Gagal(val pesan: String) : Hasil<Nothing>
}

interface SumberCatatan {
    suspend fun ambil(): Hasil<List<String>>
}

sealed interface Keadaan {
    object Memuat : Keadaan
    data class Sukses(val daftar: List<String>) : Keadaan
    data class Gagal(val pesan: String) : Keadaan
}

class DaftarViewModel(private val sumber: SumberCatatan) : ViewModel() {
    private val _keadaan = MutableStateFlow<Keadaan>(Keadaan.Memuat)
    val keadaan: StateFlow<Keadaan> = _keadaan

    fun muat() {
        viewModelScope.launch {
            _keadaan.value = when (val h = sumber.ambil()) {
                is Hasil.Sukses -> Keadaan.Sukses(h.data)
                is Hasil.Gagal -> Keadaan.Gagal(h.pesan)
            }
        }
    }
}
```

`SumberCatatan` adalah antarmuka, sehingga di aplikasi nyata diisi repository yang memanggil API (lihat [Retrofit dan Penanganan Galat Jaringan]({{ site.baseurl }}/2026/10/28/retrofit-penanganan-galat-jaringan-android/)), sedangkan di tes diisi versi palsu.

## Masalah: Dispatchers.Main di unit test

`viewModelScope` memakai `Dispatchers.Main`, yang tidak ada di lingkungan JVM biasa. Tanpa penanganan, tes akan gagal dengan pesan bahwa modul Main tidak tersedia. Solusinya, ganti dispatcher Main dengan dispatcher uji lewat sebuah aturan JUnit yang bisa dipakai ulang:

```kotlin
import kotlinx.coroutines.Dispatchers
import kotlinx.coroutines.ExperimentalCoroutinesApi
import kotlinx.coroutines.test.TestDispatcher
import kotlinx.coroutines.test.UnconfinedTestDispatcher
import kotlinx.coroutines.test.resetMain
import kotlinx.coroutines.test.setMain
import org.junit.rules.TestWatcher
import org.junit.runner.Description

@OptIn(ExperimentalCoroutinesApi::class)
class MainDispatcherRule(
    private val dispatcher: TestDispatcher = UnconfinedTestDispatcher()
) : TestWatcher() {
    override fun starting(description: Description) {
        Dispatchers.setMain(dispatcher)
    }
    override fun finished(description: Description) {
        Dispatchers.resetMain()
    }
}
```

Simpan di folder `test` dan pakai di semua tes ViewModel.

## Menguji ViewModel

Buat sumber data palsu yang hasilnya bisa diatur dari tes, lalu uji dua jalur: sukses dan gagal:

```kotlin
import kotlinx.coroutines.test.runTest
import org.junit.Assert.assertEquals
import org.junit.Rule
import org.junit.Test

class DaftarViewModelTest {

    @get:Rule
    val mainRule = MainDispatcherRule()

    private class SumberPalsu(var hasil: Hasil<List<String>>) : SumberCatatan {
        override suspend fun ambil() = hasil
    }

    @Test
    fun `muat berhasil mengisi daftar`() = runTest {
        val vm = DaftarViewModel(SumberPalsu(Hasil.Sukses(listOf("a", "b"))))

        vm.muat()

        assertEquals(Keadaan.Sukses(listOf("a", "b")), vm.keadaan.value)
    }

    @Test
    fun `muat gagal menampilkan pesan galat`() = runTest {
        val vm = DaftarViewModel(SumberPalsu(Hasil.Gagal("Tidak ada koneksi")))

        vm.muat()

        assertEquals(Keadaan.Gagal("Tidak ada koneksi"), vm.keadaan.value)
    }

    @Test
    fun `keadaan awal adalah memuat`() = runTest {
        val vm = DaftarViewModel(SumberPalsu(Hasil.Sukses(emptyList())))

        assertEquals(Keadaan.Memuat, vm.keadaan.value)
    }
}
```

Karena `UnconfinedTestDispatcher` menjalankan coroutine langsung, setelah `vm.muat()` keadaan sudah berubah dan bisa diperiksa. `runTest` menyediakan lingkungan coroutines untuk tes dan otomatis menangani fungsi `suspend` serta `delay` tanpa menunggu waktu sungguhan.

<!-- TAMBAHKAN: tes ViewModel yang Anda tulis di proyek Anda dan bug yang berhasil ditangkap. -->

## Menguji aliran Flow yang berubah-ubah

Jika Anda perlu memeriksa **urutan** nilai yang dikeluarkan, pustaka **Turbine** memudahkannya:

```kotlin
@Test
fun `keadaan berubah dari memuat ke sukses`() = runTest {
    val vm = DaftarViewModel(SumberPalsu(Hasil.Sukses(listOf("a"))))

    vm.keadaan.test {
        assertEquals(Keadaan.Memuat, awaitItem())
        vm.muat()
        assertEquals(Keadaan.Sukses(listOf("a")), awaitItem())
        cancelAndIgnoreRemainingEvents()
    }
}
```

Fungsi `test` berasal dari `app.cash.turbine`. Pastikan Anda mengimpornya dan memeriksa dokumentasi untuk versi yang Anda pakai.

## Fake atau mock?

- **Fake** adalah implementasi sederhana buatan sendiri (seperti `SumberPalsu`). Mudah dibaca dan stabil.
- **Mock** (misalnya dengan MockK) memverifikasi bahwa fungsi tertentu dipanggil dengan argumen tertentu. Berguna, tetapi tes yang terlalu banyak memakai mock cenderung rapuh dan terikat pada detail implementasi.

Utamakan fake untuk perilaku sederhana, dan pakai mock saat Anda memang perlu memverifikasi interaksi.

## Tes UI Compose secara singkat

Untuk UI, tes dijalankan di perangkat atau emulator dengan aturan Compose:

```kotlin
@get:Rule
val compose = createComposeRule()

@Test
fun tombolMenambahJumlah() {
    compose.setContent { Penghitung() }

    compose.onNodeWithText("Jumlah: 0").assertExists()
    compose.onNodeWithText("Tambah").performClick()
    compose.onNodeWithText("Jumlah: 1").assertExists()
}
```

Contoh `Penghitung` ada di [Jetpack Compose Dasar]({{ site.baseurl }}/2026/10/28/jetpack-compose-dasar-state-recomposition/). Tes UI lebih lambat, jadi simpan untuk alur penting saja.

## Apa yang layak diuji

- **Logika bisnis**: perhitungan, validasi, aturan.
- **Transformasi data**: pemetaan dari model API ke model layar.
- **ViewModel**: perubahan state untuk setiap jalur (memuat, sukses, gagal).
- **Kasus tepi**: daftar kosong, nilai nol atau negatif, teks sangat panjang, data rusak.

Tidak perlu menguji kode kerangka kerja atau getter sederhana.

## Kesalahan yang sering terjadi

- **Lupa mengganti `Dispatchers.Main`** sehingga tes gagal dengan galat modul Main.
- **Tes yang bergantung pada urutan atau tes lain.** Setiap tes harus berdiri sendiri.
- **Tes yang memakai jaringan atau waktu sungguhan** dan menjadi lambat atau tidak stabil.
- **Terlalu banyak mock** sehingga tes pecah setiap refactor.
- **Menguji implementasi, bukan perilaku.**
- **Menunda menulis tes** sampai aplikasi besar. Mulailah dari fungsi dan ViewModel pertama.
- **Tidak menjalankan tes otomatis** di setiap perubahan. Pasang di alur CI jika memungkinkan.

## Kesimpulan

Unit test membuat Anda berani mengubah kode. Rancang kelas agar bergantung pada antarmuka, pakai fake di tes, ganti `Dispatchers.Main` dengan aturan uji, dan periksa setiap jalur state ViewModel dengan `runTest`. Mulailah dari satu fungsi dan satu ViewModel, lalu biasakan menambah tes setiap kali menemukan bug.
