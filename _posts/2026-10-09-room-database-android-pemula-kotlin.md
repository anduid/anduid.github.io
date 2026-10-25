---
layout: post
title: "Room Database di Android: Panduan Pemula dengan Kotlin"
description: "Belajar Room Database di Android dengan Kotlin: Entity, DAO, Database, ViewModel dan Flow, lengkap dengan contoh kode dan cara aman mengubah skema."
date: 2026-10-09 13:00:00 +0700
tags: [android, kotlin, room, tutorial]

# image: /assets/images/room-database-android.png
# image_alt: Diagram Entity, DAO, dan Database pada Room di Android
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di proyek Anda sebelum diterbitkan, periksa versi pustaka terbaru di dokumentasi resmi, dan tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Hapus published: false saat selesai. -->

Hampir setiap aplikasi Android perlu menyimpan data: catatan, transaksi, daftar tugas, atau riwayat. Android menyediakan SQLite, tetapi menulis kode SQL mentah itu panjang dan mudah salah. **Room** adalah pustaka resmi dari Google yang membungkus SQLite sehingga Anda bekerja dengan objek Kotlin biasa, dan kesalahan query sudah terdeteksi saat kompilasi.

<!-- TAMBAHKAN (1-2 kalimat): aplikasi Anda yang memakai Room dan alasan memilihnya. -->

Panduan ini membangun contoh kecil, yaitu aplikasi catatan, dengan tiga komponen inti Room serta ViewModel yang menampilkan data secara otomatis.

<!--more-->

## Tiga komponen inti Room

Room terdiri dari tiga bagian yang masing-masing punya tugas jelas:

- **Entity**: kelas data yang mewakili satu tabel.
- **DAO** (*Data Access Object*): antarmuka berisi fungsi untuk membaca dan menulis data.
- **Database**: kelas abstrak yang menghubungkan entity dan DAO, serta membuat koneksi ke basis data.

## Menambahkan dependensi

Tambahkan pustaka Room dan pemroses anotasinya (KSP) di `build.gradle` modul aplikasi. Gunakan versi terbaru yang tercantum di [dokumentasi Room](https://developer.android.com/training/data-storage/room):

```kotlin
plugins {
    id("com.google.devtools.ksp")
}

dependencies {
    implementation("androidx.room:room-runtime:VERSI_TERBARU")
    implementation("androidx.room:room-ktx:VERSI_TERBARU")
    ksp("androidx.room:room-compiler:VERSI_TERBARU")
}
```

## Membuat Entity

Entity adalah kelas data biasa dengan anotasi:

```kotlin
@Entity(tableName = "catatan")
data class Catatan(
    @PrimaryKey(autoGenerate = true) val id: Long = 0,
    val judul: String,
    val isi: String,
    val waktu: Long = System.currentTimeMillis()
)
```

Setiap properti menjadi kolom. `@PrimaryKey(autoGenerate = true)` membuat Room mengisi `id` secara otomatis saat data baru disimpan.

## Membuat DAO

DAO berisi operasi yang Anda butuhkan. Fungsi yang menulis data dibuat `suspend` agar tidak memblokir tampilan, dan fungsi yang membaca mengembalikan `Flow` agar tampilan ikut diperbarui saat data berubah:

```kotlin
@Dao
interface CatatanDao {
    @Query("SELECT * FROM catatan ORDER BY waktu DESC")
    fun semua(): Flow<List<Catatan>>

    @Insert
    suspend fun tambah(catatan: Catatan)

    @Update
    suspend fun ubah(catatan: Catatan)

    @Delete
    suspend fun hapus(catatan: Catatan)
}
```

Query di dalam `@Query` diperiksa saat kompilasi. Jika Anda salah menulis nama tabel atau kolom, proyek tidak akan terbangun, jadi kesalahan ketahuan sebelum aplikasi dijalankan.

## Membuat Database

```kotlin
@Database(entities = [Catatan::class], version = 1)
abstract class AppDatabase : RoomDatabase() {
    abstract fun catatanDao(): CatatanDao
}
```

Buat satu instance saja untuk seluruh aplikasi. Cara paling sederhana:

```kotlin
val db = Room.databaseBuilder(
    applicationContext,
    AppDatabase::class.java,
    "catatan.db"
).build()
```

Pada aplikasi yang lebih besar, instance ini biasanya disediakan lewat injeksi dependensi (misalnya Hilt) sehingga hanya ada satu salinan.

<!-- TAMBAHKAN: bagaimana Anda menyusun database di proyek nyata (satu tabel umum, beberapa tabel, atau Hilt). -->

## Menghubungkan ke ViewModel

ViewModel mengambil data dari DAO dan menyodorkannya ke tampilan sebagai `StateFlow`:

```kotlin
class CatatanViewModel(private val dao: CatatanDao) : ViewModel() {

    val daftar: StateFlow<List<Catatan>> = dao.semua()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())

    fun tambah(judul: String, isi: String) {
        viewModelScope.launch {
            dao.tambah(Catatan(judul = judul, isi = isi))
        }
    }

    fun hapus(catatan: Catatan) {
        viewModelScope.launch { dao.hapus(catatan) }
    }
}
```

Setiap kali isi tabel berubah, `Flow` mengeluarkan daftar baru dan tampilan otomatis menyegarkan diri. Tidak perlu memuat ulang data secara manual.

## Mengubah skema dengan aman

Suatu saat Anda akan menambah kolom atau tabel. Setiap perubahan skema mengharuskan Anda menaikkan `version` pada `@Database` dan menyediakan **migrasi**:

```kotlin
val MIGRASI_1_2 = object : Migration(1, 2) {
    override fun migrate(db: SupportSQLiteDatabase) {
        db.execSQL("ALTER TABLE catatan ADD COLUMN kategori TEXT NOT NULL DEFAULT ''")
    }
}

val db = Room.databaseBuilder(applicationContext, AppDatabase::class.java, "catatan.db")
    .addMigrations(MIGRASI_1_2)
    .build()
```

Jangan tergoda memakai `fallbackToDestructiveMigration()` pada aplikasi yang sudah dipakai pengguna, karena opsi itu **menghapus seluruh data** saat skema berubah. Aktifkan juga ekspor skema (`exportSchema`) supaya riwayat skema tersimpan dan migrasi bisa diuji.

## Kesalahan yang sering terjadi

- **Mengakses database di utas utama.** Room menolak ini secara bawaan. Gunakan fungsi `suspend` atau `Flow`.
- **Lupa menaikkan `version` setelah mengubah Entity.** Aplikasi akan gagal saat dijalankan.
- **Membuat banyak instance database.** Pakai satu instance bersama.
- **Menyimpan data besar seperti gambar langsung di tabel.** Simpan berkasnya di penyimpanan, lalu simpan jalurnya di database.

## Kesimpulan

Room membuat penyimpanan data lokal di Android jauh lebih rapi: Entity untuk bentuk data, DAO untuk operasi, Database sebagai pintu masuk, dan ViewModel dengan `Flow` untuk menjaga tampilan selalu segar. Mulailah dengan satu tabel sederhana, biasakan menulis migrasi sejak awal, dan baca dokumentasi resmi saat Anda membutuhkan relasi antartabel.

Jika aplikasi Anda berbasis web, baca juga [Mengubah Web App Menjadi Aplikasi Android dengan WebView]({{ site.baseurl }}/2026/10/09/webview-android-dari-web-app/).
