---
layout: post
title: "Jetpack Compose Dasar: State, Recomposition, dan State Hoisting"
description: "Panduan dasar Jetpack Compose: composable, remember dan rememberSaveable, recomposition, state hoisting, LazyColumn, dan menghubungkan ViewModel dengan StateFlow secara aman."
date: 2026-10-28 00:30:00 +0700
tags: [android, jetpack-compose, kotlin, tutorial]

# image: /assets/images/jetpack-compose-state.png
# image_alt: Diagram alur state dan event pada Jetpack Compose
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di Android Studio dengan versi Compose dan BOM terbaru, lalu tambahkan pengalaman Anda beralih ke Compose di bagian bertanda "TAMBAHKAN". Pastikan tanggal di front matter sudah lewat saat diterbitkan, lalu hapus published: false. -->

Jetpack Compose mengubah cara membuat antarmuka Android. Alih-alih menyusun berkas XML lalu mengubah tampilan satu per satu lewat kode, Anda mendeskripsikan seperti apa layar *seharusnya* tampak untuk suatu keadaan data. Ketika datanya berubah, Compose menggambar ulang bagian yang perlu. Kunci memahaminya ada pada satu konsep: **state**.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda memakai Compose di aplikasi Anda dan hal yang paling terasa berbeda dari XML. -->

Tulisan ini menjelaskan konsep dasar Compose dengan contoh kecil: composable, state, recomposition, state hoisting, daftar, dan hubungan dengan ViewModel.

<!--more-->

## Composable: fungsi yang menggambar UI

Elemen UI di Compose adalah fungsi yang diberi anotasi `@Composable`:

```kotlin
@Composable
fun Sapaan(nama: String) {
    Text(text = "Halo, $nama!")
}
```

Composable bisa dipanggil dari composable lain, dan dirangkai dengan komponen tata letak seperti `Column`, `Row`, dan `Box`:

```kotlin
@Composable
fun KartuProfil(nama: String, kota: String) {
    Column(modifier = Modifier.padding(16.dp)) {
        Text(nama, style = MaterialTheme.typography.titleMedium)
        Text(kota, style = MaterialTheme.typography.bodyMedium)
    }
}
```

`Modifier` mengatur ukuran, jarak, dan perilaku elemen. Urutan modifier memengaruhi hasil: `padding` sebelum `background` berbeda dengan sesudahnya.

## State: data yang memicu penggambaran ulang

Composable yang hanya menerima parameter bersifat statis. Agar UI bereaksi terhadap perubahan, simpan data sebagai **state**:

```kotlin
@Composable
fun Penghitung() {
    var jumlah by remember { mutableStateOf(0) }

    Column(modifier = Modifier.padding(16.dp)) {
        Text("Jumlah: $jumlah")
        Button(onClick = { jumlah++ }) {
            Text("Tambah")
        }
    }
}
```

Ada dua bagian penting:

- **`mutableStateOf`** membuat nilai yang dipantau Compose. Saat nilainya berubah, composable yang membacanya digambar ulang.
- **`remember`** menyimpan nilai itu di antara penggambaran ulang. Tanpanya, `jumlah` akan kembali ke 0 setiap kali composable dijalankan ulang.

## Recomposition: apa yang terjadi saat state berubah

Saat `jumlah` berubah, Compose menjalankan ulang composable yang membaca nilai tersebut. Proses ini disebut *recomposition*. Compose cukup pintar melewati bagian yang tidak terdampak. Beberapa konsekuensinya:

- **Composable harus murni.** Jangan melakukan pekerjaan berat atau efek samping langsung di badan composable, karena ia bisa dijalankan berkali-kali dan dalam urutan yang tidak Anda duga.
- **Jangan mengubah state di tengah penggambaran** tanpa alasan.
- **Pakai `LaunchedEffect`** untuk menjalankan pekerjaan yang butuh coroutine ketika composable masuk ke layar atau sebuah kunci berubah.

```kotlin
@Composable
fun LayarMuat(id: String, vm: DetailViewModel) {
    LaunchedEffect(id) {          // jalan lagi hanya jika id berubah
        vm.muat(id)
    }
    // ... tampilkan state dari vm
}
```

## remember dan rememberSaveable

`remember` bertahan selama composable tetap ada di komposisi, tetapi **hilang saat layar diputar** atau proses aplikasi dihentikan sistem. Untuk state kecil yang harus bertahan melewati perubahan konfigurasi, gunakan `rememberSaveable`:

```kotlin
var teks by rememberSaveable { mutableStateOf("") }
```

Cocok untuk isi kolom teks, posisi tab, atau pilihan sementara. Untuk data besar atau data bisnis, simpan di ViewModel dan Room, bukan di `rememberSaveable`.

## State hoisting: angkat state ke atas

Prinsip terpenting dalam merancang composable: composable yang bisa dipakai ulang sebaiknya **tidak menyimpan state sendiri**. Ia menerima state sebagai parameter dan melaporkan kejadian lewat fungsi *callback*. State dipegang oleh pemanggilnya.

```kotlin
// Tanpa state sendiri: mudah diuji dan dipakai ulang
@Composable
fun KolomCari(
    teks: String,
    onTeksBerubah: (String) -> Unit,
    modifier: Modifier = Modifier
) {
    OutlinedTextField(
        value = teks,
        onValueChange = onTeksBerubah,
        label = { Text("Cari catatan") },
        modifier = modifier
    )
}

// Pemanggil memegang state
@Composable
fun LayarCatatan() {
    var kataKunci by rememberSaveable { mutableStateOf("") }
    KolomCari(teks = kataKunci, onTeksBerubah = { kataKunci = it })
}
```

Pola ini disebut aliran data satu arah: **state turun, kejadian naik**. Alurnya mudah ditelusuri dan penyebab bug lebih mudah ditemukan.

<!-- TAMBAHKAN: contoh composable di proyek Anda yang Anda ubah menjadi stateless dan manfaatnya. -->

## Daftar dengan LazyColumn

Untuk daftar yang panjang, jangan pakai `Column` biasa karena semua item dibuat sekaligus. Pakai `LazyColumn`, yang hanya membuat item yang terlihat:

```kotlin
@Composable
fun DaftarCatatan(daftar: List<Catatan>, onKlik: (Catatan) -> Unit) {
    LazyColumn(contentPadding = PaddingValues(16.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
        items(daftar, key = { it.id }) { catatan ->
            Card(modifier = Modifier.fillMaxWidth().clickable { onKlik(catatan) }) {
                Column(Modifier.padding(12.dp)) {
                    Text(catatan.judul, style = MaterialTheme.typography.titleSmall)
                    Text(catatan.isi, maxLines = 2, overflow = TextOverflow.Ellipsis)
                }
            }
        }
    }
}
```

Parameter `key` memberi identitas stabil pada tiap item, sehingga animasi dan state per item tetap benar saat urutan daftar berubah.

## Menghubungkan ViewModel

Data bisnis dan keadaan layar sebaiknya hidup di ViewModel, yang bertahan saat layar diputar. Amati `StateFlow`-nya dengan sadar siklus hidup:

```kotlin
@Composable
fun LayarCatatanUtama(vm: CatatanViewModel = hiltViewModel()) {
    val daftar by vm.daftar.collectAsStateWithLifecycle()

    DaftarCatatan(daftar = daftar, onKlik = { /* buka detail */ })
}
```

`collectAsStateWithLifecycle` menghentikan pengamatan saat aplikasi tidak terlihat. ViewModel, `StateFlow`, dan injeksi dengan Hilt dibahas di [Kotlin Coroutines dan Flow untuk Pemula Android]({{ site.baseurl }}/2026/10/10/kotlin-coroutines-flow-pemula-android/) dan [Hilt di Android]({{ site.baseurl }}/2026/10/09/hilt-injeksi-dependensi-android/). Penyimpanan datanya ada di [Room Database di Android]({{ site.baseurl }}/2026/10/09/room-database-android-pemula-kotlin/).

## Preview untuk iterasi cepat

Anotasi `@Preview` menampilkan composable di Android Studio tanpa menjalankan aplikasi. Karena composable stateless menerima data lewat parameter, mudah dipratinjau dengan data contoh:

```kotlin
@Preview(showBackground = true)
@Composable
fun PratinjauKartu() {
    MaterialTheme {
        KartuProfil(nama = "Sari", kota = "Bekasi")
    }
}
```

Untuk menguji tema terang dan gelap sekaligus, lihat [Dark Mode di Jetpack Compose]({{ site.baseurl }}/2026/10/09/dark-mode-jetpack-compose-android/).

## Kesalahan yang sering terjadi

- **Lupa `remember`**, sehingga state kembali ke nilai awal di setiap recomposition.
- **Menaruh state di composable yang seharusnya bisa dipakai ulang**, bukan mengangkatnya ke atas.
- **Melakukan pekerjaan berat atau pemanggilan jaringan langsung di badan composable.** Pakai ViewModel atau `LaunchedEffect`.
- **Memakai `Column` untuk daftar panjang** alih-alih `LazyColumn`.
- **Tidak memberi `key`** pada item daftar yang bisa berubah urutannya.
- **Menyimpan data bisnis di `rememberSaveable`** alih-alih ViewModel dan basis data.
- **Mengabaikan `modifier` sebagai parameter** sehingga composable sulit disesuaikan pemanggilnya.

## Kesimpulan

Inti Compose sederhana: UI adalah fungsi dari state. Simpan state dengan `remember` atau `rememberSaveable`, angkat ke atas dengan state hoisting, biarkan ViewModel memegang data bisnis, dan gunakan `LazyColumn` untuk daftar. Dengan pola aliran satu arah ini, antarmuka Anda lebih mudah diuji, dipratinjau, dan dirawat.
