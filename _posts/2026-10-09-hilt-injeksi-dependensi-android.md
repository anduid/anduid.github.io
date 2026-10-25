---
layout: post
title: "Hilt di Android: Injeksi Dependensi Tanpa Pusing"
description: "Panduan Hilt untuk pemula: apa itu injeksi dependensi, cara memasang Hilt, membuat module untuk Room, memakai HiltViewModel di Compose, dan kesalahan umum."
date: 2026-10-09 15:15:00 +0700
tags: [android, kotlin, hilt, tutorial]

# image: /assets/images/hilt-android.png
# image_alt: Diagram Hilt menyediakan database dan DAO ke ViewModel
---
<!-- CATATAN PENULIS (tidak tampil di situs): uji kode di proyek Anda, periksa versi pustaka dan nama plugin terbaru di dokumentasi resmi, dan tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN". Hapus published: false saat selesai. -->

Semakin besar sebuah aplikasi Android, semakin banyak objek yang saling membutuhkan: ViewModel butuh repository, repository butuh database, database butuh konteks aplikasi. Jika semua dibuat manual di setiap tempat, kode menjadi berantakan dan sulit diuji. **Hilt** membereskan ini dengan *injeksi dependensi*: Anda cukup menyatakan apa yang dibutuhkan, dan Hilt yang menyediakannya.

<!-- TAMBAHKAN (1-2 kalimat): pengalaman Anda memakai Hilt di aplikasi dan hal yang paling membantu. -->

Tulisan ini menjelaskan konsepnya dengan bahasa sederhana, lalu menunjukkan cara memasang Hilt, menyediakan database Room, dan memakainya di ViewModel pada aplikasi Compose.

<!--more-->

## Apa itu injeksi dependensi

*Dependensi* adalah objek lain yang dibutuhkan sebuah kelas. Tanpa injeksi, kelas membuat sendiri dependensinya:

```kotlin
class CatatanViewModel : ViewModel() {
    private val dao = Room.databaseBuilder(/* ... */).build().catatanDao()
}
```

Masalahnya, kelas ini terikat pada cara pembuatan database dan sulit diuji dengan data palsu. Dengan injeksi, dependensi diberikan dari luar lewat konstruktor:

```kotlin
class CatatanViewModel(private val dao: CatatanDao) : ViewModel()
```

Kelas tidak peduli dari mana `dao` berasal. Hilt bertugas membuat dan memberikannya secara otomatis.

## Memasang Hilt

Tambahkan plugin Hilt dan pustakanya di Gradle. Gunakan versi terbaru dari [dokumentasi resmi Hilt](https://developer.android.com/training/dependency-injection/hilt-android):

```kotlin
plugins {
    id("com.google.dagger.hilt.android")
    id("com.google.devtools.ksp")
}

dependencies {
    implementation("com.google.dagger:hilt-android:VERSI_TERBARU")
    ksp("com.google.dagger:hilt-android-compiler:VERSI_TERBARU")
    implementation("androidx.hilt:hilt-navigation-compose:VERSI_TERBARU")
}
```

Lalu buat kelas `Application` bertanda `@HiltAndroidApp` dan daftarkan di `AndroidManifest.xml`:

```kotlin
@HiltAndroidApp
class AplikasiSaya : Application()
```

```xml
<application
    android:name=".AplikasiSaya"
    ... >
```

Aktivitas yang memakai injeksi diberi anotasi `@AndroidEntryPoint`:

```kotlin
@AndroidEntryPoint
class MainActivity : ComponentActivity() { /* ... */ }
```

## Menyediakan database dengan Module

Objek yang tidak bisa dibuat lewat konstruktor, seperti database Room, disediakan lewat **Module**. Module adalah tempat Anda menuliskan cara membuat objek itu:

```kotlin
@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase =
        Room.databaseBuilder(context, AppDatabase::class.java, "catatan.db").build()

    @Provides
    fun provideCatatanDao(db: AppDatabase): CatatanDao = db.catatanDao()
}
```

Beberapa istilah penting:

- `@Module` menandai kelas sebagai penyedia dependensi.
- `@InstallIn(SingletonComponent::class)` berarti objek di dalamnya hidup selama aplikasi berjalan.
- `@Provides` menandai fungsi yang tahu cara membuat satu objek.
- `@Singleton` memastikan hanya ada satu instance, ini penting untuk database.
- `@ApplicationContext` meminta konteks aplikasi dari Hilt.

Perhatikan `provideCatatanDao` menerima `AppDatabase` sebagai parameter. Hilt otomatis menyambungkannya dengan `provideDatabase`.

<!-- TAMBAHKAN: struktur module di proyek Anda (satu module besar atau beberapa) dan alasannya. -->

## Memakai di ViewModel

ViewModel diberi `@HiltViewModel` dan konstruktor bertanda `@Inject`:

```kotlin
@HiltViewModel
class CatatanViewModel @Inject constructor(
    private val dao: CatatanDao
) : ViewModel() {

    val daftar: StateFlow<List<Catatan>> = dao.semua()
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), emptyList())
}
```

Di Compose, ambil ViewModel dengan `hiltViewModel()`, tanpa perlu membuat pabrik (*factory*) sendiri:

```kotlin
@Composable
fun LayarCatatan(vm: CatatanViewModel = hiltViewModel()) {
    val daftar by vm.daftar.collectAsState()
    // tampilkan daftar
}
```

Hilt otomatis membuat `CatatanViewModel`, memberinya `CatatanDao`, dan mengaitkannya dengan siklus hidup layar.

## Memakai antarmuka dengan @Binds

Praktik yang baik adalah bergantung pada antarmuka, bukan implementasi. Misalnya repository:

```kotlin
interface CatatanRepository {
    fun semua(): Flow<List<Catatan>>
}

class CatatanRepositoryImpl @Inject constructor(
    private val dao: CatatanDao
) : CatatanRepository {
    override fun semua() = dao.semua()
}

@Module
@InstallIn(SingletonComponent::class)
abstract class RepositoryModule {
    @Binds
    abstract fun bindRepository(impl: CatatanRepositoryImpl): CatatanRepository
}
```

`@Binds` memberi tahu Hilt bahwa setiap kali ada yang meminta `CatatanRepository`, berikan `CatatanRepositoryImpl`. ViewModel cukup meminta antarmukanya, dan saat pengujian Anda bisa menggantinya dengan versi palsu.

## Cakupan (scope) singkat

Cakupan menentukan berapa lama sebuah objek hidup:

| Cakupan | Hidup selama |
|---------|--------------|
| `@Singleton` | Seluruh aplikasi |
| `@ActivityScoped` | Satu aktivitas |
| `@ViewModelScoped` | Satu ViewModel |

Gunakan cakupan sempit sebisa mungkin. Objek yang lama hidup memakan memori, dan hanya objek yang memang harus tunggal, seperti database, yang perlu `@Singleton`.

## Kesalahan yang sering terjadi

- **Lupa `@HiltAndroidApp` atau `@AndroidEntryPoint`.** Aplikasi gagal dibangun atau berhenti saat dijalankan dengan pesan tentang komponen yang belum dibuat.
- **`MissingBinding`.** Hilt tidak tahu cara membuat suatu tipe. Tambahkan `@Inject` pada konstruktor atau sediakan lewat `@Provides` atau `@Binds`.
- **Lupa mendaftarkan kelas Application di manifest.**
- **Mencampur `kapt` dan `ksp`.** Gunakan satu pemroses anotasi secara konsisten sesuai petunjuk versi Hilt yang Anda pakai.
- **Membuat banyak instance database** karena lupa `@Singleton`.

## Kesimpulan

Hilt memangkas kode pembuatan objek yang berulang dan membuat aplikasi lebih mudah diuji. Pasang plugin, tandai `Application` dan aktivitas, sediakan objek lewat Module, lalu ambil ViewModel dengan `hiltViewModel()`. Mulailah dari database dan satu ViewModel, baru tambah repository setelah Anda nyaman.

Jika Anda belum menyiapkan database lokal, baca dulu [Room Database di Android: Panduan Pemula dengan Kotlin]({{ site.baseurl }}/2026/10/09/room-database-android-pemula-kotlin/).
