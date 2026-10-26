---
layout: post
title: "Kotlin untuk Pemula Android: Null Safety, Data Class, dan Fungsi Ekstensi"
description: "Belajar dasar Kotlin untuk pengembangan Android: null safety, data class, when, fungsi ekstensi, scope function, koleksi, dan sealed class untuk state layar."
date: 2026-10-26 01:15:00 +0700
tags: [kotlin, android, pemrograman, tutorial]

# image: /assets/images/kotlin-dasar-android.png
# image_alt: Contoh kode Kotlin dengan data class dan null safety
---
<!-- CATATAN PENULIS (tidak tampil di situs): jalankan contoh di Kotlin Playground atau Android Studio, lalu tambahkan pengalaman Anda memakai Kotlin di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Kotlin adalah bahasa utama untuk pengembangan Android modern, dan Google merekomendasikannya sebagai pilihan pertama. Salah satu alasannya adalah rancangannya yang mencegah banyak kesalahan klasik, terutama galat `NullPointerException`, dengan kode yang jauh lebih ringkas daripada Java.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda beralih ke Kotlin atau membuat aplikasi Android dengannya. -->

Tulisan ini mengenalkan fitur Kotlin yang paling sering dipakai di aplikasi Android: null safety, data class, `when`, fungsi ekstensi, scope function, koleksi, dan sealed class. Semua contoh bisa dicoba di [Kotlin Playground](https://play.kotlinlang.org).

<!--more-->

## val dan var

Seperti `const` dan `let` di JavaScript: `val` tidak bisa diisi ulang, `var` bisa. Pakai `val` secara bawaan.

```kotlin
val nama = "Sari"          // tipe String disimpulkan otomatis
var jumlah = 0
jumlah += 1

val tertulis: Int = 10     // tipe boleh ditulis eksplisit
```

## Null safety: akhir dari NullPointerException yang tak terduga

Di Kotlin, tipe biasa **tidak boleh** bernilai `null`. Jika boleh, tandai dengan `?`:

```kotlin
var a: String = "halo"
// a = null            // galat saat kompilasi

var b: String? = "halo"
b = null               // boleh
```

Untuk mengakses nilai yang mungkin `null`, gunakan operator aman:

```kotlin
val panjang = b?.length          // Int? : null jika b null
val panjangAman = b?.length ?: 0 // Elvis: nilai cadangan jika null

b?.let { teks ->                 // blok hanya jalan jika tidak null
    println("Isi: $teks")
}
```

Hindari `!!` (pernyataan "pasti tidak null") kecuali Anda benar-benar yakin. `!!` melempar pengecualian jika nilainya `null`, dan itu justru mengembalikan masalah yang ingin dihindari.

## String template dan fungsi

```kotlin
val nama = "Sari"
println("Halo, $nama! Panjang nama: ${nama.length}")

fun luasPersegi(sisi: Int): Int = sisi * sisi

// parameter bawaan dan bernama
fun sapa(nama: String, salam: String = "Halo") = "$salam, $nama"
println(sapa("Sari"))                    // Halo, Sari
println(sapa(salam = "Selamat pagi", nama = "Budi"))
```

## Data class: model data tanpa kode berulang

Hanya satu baris untuk model yang otomatis punya `equals`, `hashCode`, `toString`, dan `copy`:

```kotlin
data class Catatan(
    val id: Long = 0,
    val judul: String,
    val isi: String
)

val c1 = Catatan(judul = "Belanja", isi = "Beras")
val c2 = c1.copy(isi = "Beras dan gula")   // salin sambil mengubah sebagian
println(c1)                                 // Catatan(id=0, judul=Belanja, isi=Beras)

val (id, judul, _) = c1                     // destructuring
```

Data class cocok untuk model data, termasuk Entity pada Room yang dibahas di [Room Database di Android]({{ site.baseurl }}/2026/10/09/room-database-android-pemula-kotlin/).

## when: pengganti switch yang lebih kuat

```kotlin
fun kategori(skor: Int): String = when {
    skor >= 90 -> "A"
    skor >= 75 -> "B"
    skor >= 60 -> "C"
    else -> "D"
}

fun hari(n: Int) = when (n) {
    1, 7 -> "Akhir pekan"
    in 2..6 -> "Hari kerja"
    else -> "Tidak valid"
}
```

`when` bisa dipakai sebagai ekspresi yang mengembalikan nilai, dan kompilator memaksa semua kemungkinan tercakup bila dipakai pada tipe tertutup.

## Fungsi ekstensi

Tambahkan fungsi ke tipe yang sudah ada tanpa mewarisinya:

```kotlin
fun String.ringkas(maks: Int): String =
    if (length <= maks) this else take(maks - 1) + "…"

println("Kotlin sangat menyenangkan".ringkas(10))   // Kotlin sa…
```

Cocok untuk fungsi bantu yang sering dipakai di banyak layar, seperti memformat tanggal atau rupiah.

## Scope function: let, apply, also, run

Beberapa fungsi bawaan yang membuat kode lebih rapi:

```kotlin
// apply: konfigurasi objek lalu kembalikan objek itu sendiri
val bangun = StringBuilder().apply {
    append("Halo")
    append(", dunia")
}.toString()

// let: pakai nilai non-null atau hasil transformasi
val hasil = "42".toIntOrNull()?.let { it * 2 }   // 84 atau null

// also: efek samping tanpa mengubah rantai
val daftar = mutableListOf(1, 2).also { println("Isi awal: $it") }
```

Jangan berlebihan: terlalu banyak scope function bersarang membuat kode sulit dibaca.

## Koleksi: map, filter, groupBy

```kotlin
val usaha = listOf(
    Triple("Warung A", "Kuliner", 5),
    Triple("Kriya B", "Kriya", 12),
    Triple("Warung C", "Kuliner", 8)
)

val kuliner = usaha.filter { it.second == "Kuliner" }
val namaSaja = usaha.map { it.first }
val perKategori = usaha.groupBy { it.second }          // Map<String, List<...>>
val totalOmzet = usaha.sumOf { it.third }              // 25
val terbesar = usaha.maxByOrNull { it.third }?.first   // Kriya B
```

List biasa (`listOf`) tidak bisa diubah, sedangkan `mutableListOf` bisa. Pilih yang tidak bisa diubah kecuali memang perlu.

## Sealed class untuk state layar

Cara yang sangat berguna untuk memodelkan keadaan layar: memuat, berhasil, atau gagal.

```kotlin
sealed interface KeadaanLayar {
    data object Memuat : KeadaanLayar
    data class Sukses(val data: List<Catatan>) : KeadaanLayar
    data class Gagal(val pesan: String) : KeadaanLayar
}

fun tampilkan(k: KeadaanLayar) = when (k) {
    is KeadaanLayar.Memuat -> "Memuat..."
    is KeadaanLayar.Sukses -> "Ada ${k.data.size} catatan"
    is KeadaanLayar.Gagal -> "Galat: ${k.pesan}"
}
```

Karena `KeadaanLayar` tertutup, `when` wajib mencakup semua kemungkinan dan kompilator memberi peringatan jika ada yang terlewat. Pola ini sering dipasangkan dengan `StateFlow` di ViewModel. Sintaks `data object` tersedia pada versi Kotlin yang lebih baru, jadi pakai `object` biasa jika versi Anda belum mendukungnya.

<!-- TAMBAHKAN: bagaimana Anda memodelkan state layar di aplikasi Anda dan manfaat yang terasa. -->

## Kesalahan yang sering terjadi

- **Terlalu sering memakai `!!`.** Pakai `?.`, `?:`, atau `let`.
- **Memakai `var` dan koleksi mutable** tanpa alasan.
- **Lupa `else` pada `when` sebagai ekspresi** untuk tipe yang tidak tertutup.
- **Menaruh logika berat di data class.** Biarkan ia tetap sederhana.
- **Membuat fungsi ekstensi yang terlalu umum** hingga membingungkan tim.
- **Tidak memanfaatkan peringatan kompilator**, padahal itu pelindung terbaik Anda.

## Langkah belajar berikutnya

Setelah dasar ini, lanjutkan ke coroutines dan Flow di [Kotlin Coroutines dan Flow untuk Pemula Android]({{ site.baseurl }}/2026/10/10/kotlin-coroutines-flow-pemula-android/), injeksi dependensi di [Hilt di Android]({{ site.baseurl }}/2026/10/09/hilt-injeksi-dependensi-android/), dan antarmuka dengan Jetpack Compose seperti di [Dark Mode di Jetpack Compose]({{ site.baseurl }}/2026/10/09/dark-mode-jetpack-compose-android/).

## Kesimpulan

Kotlin mengurangi kode berulang dan mencegah banyak galat lewat sistem tipe yang ketat: null safety, data class, `when`, fungsi ekstensi, koleksi yang kaya, dan sealed class. Mulailah menulis fungsi kecil di Playground, lalu terapkan di proyek Android Anda sedikit demi sedikit.
