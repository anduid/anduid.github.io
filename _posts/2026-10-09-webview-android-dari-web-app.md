---
layout: post
title: "Mengubah Web App Menjadi Aplikasi Android dengan WebView"
description: "Panduan membungkus web app ke aplikasi Android dengan WebView: aset lokal, masalah CORS, jembatan native Kotlin, keamanan, dan persiapan rilis."
date: 2026-10-09 10:00:00 +0700
tags: [android, kotlin, webview, tutorial]

# image: /assets/images/webview-android.png
# image_alt: Aplikasi Android yang memuat halaman web lewat WebView
---
<!-- CATATAN PENULIS (tidak tampil di situs): tambahkan pengalaman Anda di bagian bertanda "TAMBAHKAN", uji kode di proyek Anda sendiri sebelum diterbitkan, dan pasang tangkapan layar atau diagram buatan sendiri. Pastikan tanggal di front matter tidak di masa depan, lalu hapus baris published: false. -->

Jika Anda sudah punya aplikasi web yang berjalan baik, mengubahnya menjadi aplikasi Android bisa jauh lebih cepat daripada menulis ulang semuanya dalam Kotlin. Caranya adalah membungkus halaman web di dalam komponen `WebView`. Satu basis kode untuk web dan Android, dan pembaruan tampilan cukup dilakukan di satu tempat.

<!-- TAMBAHKAN (1-2 kalimat): proyek nyata Anda yang dibungkus ke Android dan alasan memilih cara ini. -->

Tantangannya ada pada detail: cara memuat file lokal dengan aman, masalah CORS, keamanan, serta hal-hal kecil seperti tombol kembali dan izin kamera. Tulisan ini membahas semuanya, lengkap dengan contoh kode Kotlin dan JavaScript yang bisa Anda sesuaikan.

<!--more-->

## Kapan WebView masuk akal

WebView cocok jika aplikasi Anda pada dasarnya berisi formulir, daftar, dan halaman informasi, dan Anda ingin merilis cepat dengan tim kecil. Manfaat utamanya: satu basis kode, perubahan tampilan tanpa menulis ulang, dan keahlian web yang bisa dipakai ulang.

WebView kurang cocok untuk aplikasi dengan grafis berat, animasi kompleks, atau integrasi mendalam dengan fitur perangkat. Dibandingkan alternatif:

| Pendekatan | Kelebihan | Kekurangan |
|------------|-----------|------------|
| Aplikasi native | Performa dan akses fitur terbaik | Biaya dan waktu pengembangan lebih besar |
| WebView | Cepat, satu basis kode | Terbatas performa dan fitur native |
| PWA | Tanpa toko aplikasi, mudah diperbarui | Dukungan fitur bervariasi antarperangkat |

Satu catatan penting: kebijakan Google Play menilai aplikasi yang hanya menampilkan situs web tanpa nilai tambah sebagai fungsi minimal. Pastikan aplikasi Anda memberi manfaat nyata sebagai aplikasi, misalnya bekerja dengan data lokal, fitur kamera, atau pengalaman yang dirancang untuk ponsel.

## Struktur proyek

Letakkan berkas web (HTML, CSS, JavaScript, gambar) di folder `app/src/main/assets/`. Aktivitas utama hanya berisi satu `WebView` yang memuat halaman awal. Tambahkan dependensi `androidx.webkit:webkit` (gunakan versi terbaru yang tersedia) untuk memakai `WebViewAssetLoader`, dan izin internet di `AndroidManifest.xml` jika aplikasi memanggil API:

```xml
<uses-permission android:name="android.permission.INTERNET" />
```

Kerangka aktivitas lengkapnya ada di bagian berikut.

## Memuat aset lokal dengan WebViewAssetLoader

Cara lama memuat halaman lokal adalah alamat `file:///android_asset/...`. Cara ini bermasalah karena akses file membuka celah keamanan dan membuat perilaku web tidak konsisten, misalnya pada penyimpanan dan permintaan jaringan.

`WebViewAssetLoader` memecahkannya dengan menyajikan berkas lokal lewat alamat `https` virtual. Halaman Anda dimuat dari asal (*origin*) yang jelas, sehingga berperilaku seperti halaman web biasa.

```kotlin
class MainActivity : AppCompatActivity() {

    private lateinit var webView: WebView

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)
        webView = findViewById(R.id.webView)

        val assetLoader = WebViewAssetLoader.Builder()
            .addPathHandler("/assets/", WebViewAssetLoader.AssetsPathHandler(this))
            .build()

        webView.webViewClient = object : WebViewClient() {
            override fun shouldInterceptRequest(
                view: WebView,
                request: WebResourceRequest
            ): WebResourceResponse? = assetLoader.shouldInterceptRequest(request.url)
        }

        webView.settings.apply {
            javaScriptEnabled = true
            domStorageEnabled = true
            allowFileAccess = false
            allowContentAccess = false
        }

        webView.addJavascriptInterface(NativeBridge(webView), "NativeBridge")
        webView.loadUrl("https://appassets.androidplatform.net/assets/index.html")
    }
}
```

Perhatikan bahwa akses file dimatikan secara eksplisit. Halaman Anda sekarang dimuat dari `appassets.androidplatform.net`, dan semua berkas di folder `assets` tersedia di bawah jalur `/assets/`.

<!-- TAMBAHKAN: kendala yang Anda temui saat pertama kali memuat halaman, dan cara mengatasinya. -->

## Masalah CORS dan jembatan native

Karena halaman Anda dimuat dari asal `appassets.androidplatform.net`, setiap permintaan ke server lain adalah permintaan lintas asal. Banyak API tidak mengizinkannya, dan peramban memblokir hasilnya (CORS). Solusi pertama selalu dicoba: pastikan API mengirim header CORS yang benar atau gunakan permintaan sederhana. Contoh pendekatan untuk backend Apps Script ada di tulisan [Backend Gratis dengan Google Apps Script dan Sheets]({{ site.baseurl }}/2026/10/09/backend-gratis-google-apps-script-sheets/).

Jika itu tidak memungkinkan, gunakan **jembatan native**: JavaScript meminta Kotlin untuk melakukan permintaan jaringan, karena permintaan dari kode native tidak terkena aturan CORS peramban. Hasilnya dikirim kembali ke halaman.

```kotlin
class NativeBridge(private val webView: WebView) {

    @JavascriptInterface
    fun panggilApi(idPermintaan: String, url: String, bodyJson: String) {
        // Hanya izinkan alamat yang Anda percaya dan id berupa angka
        if (!url.startsWith("https://script.google.com/macros/s/")) return
        if (!idPermintaan.all { it.isDigit() }) return

        Thread {
            val hasil = try {
                kirimPost(url, bodyJson)
            } catch (e: Exception) {
                """{"ok":false}"""
            }
            webView.post {
                val js = "window.terimaApi('" + idPermintaan + "'," + JSONObject.quote(hasil) + ")"
                webView.evaluateJavascript(js, null)
            }
        }.start()
    }

    private fun kirimPost(url: String, body: String): String {
        val koneksi = URL(url).openConnection() as HttpURLConnection
        koneksi.requestMethod = "POST"
        koneksi.doOutput = true
        koneksi.setRequestProperty("Content-Type", "text/plain;charset=utf-8")
        koneksi.outputStream.use { it.write(body.toByteArray()) }
        return koneksi.inputStream.bufferedReader().use { it.readText() }
    }
}
```

Di sisi halaman web, bungkus pemanggilan itu dengan fungsi yang mengembalikan janji (*promise*):

```js
function panggilApi(url, data) {
  return new Promise(function (resolve) {
    const id = String(Date.now());
    window.callbackApi = window.callbackApi || {};
    window.callbackApi[id] = resolve;
    NativeBridge.panggilApi(id, url, JSON.stringify(data));
  });
}

window.terimaApi = function (id, hasil) {
  window.callbackApi[id](JSON.parse(hasil));
  delete window.callbackApi[id];
};
```

Alurnya: halaman memanggil `NativeBridge.panggilApi`, Kotlin menjalankan permintaan di utas terpisah, lalu mengembalikan hasilnya lewat `evaluateJavascript`. Pastikan pemanggilan ke utas UI dilakukan lewat `webView.post`.

<!-- TAMBAHKAN: diagram alur halaman web - NativeBridge - server, serta pengalaman nyata Anda menghadapi CORS di WebView. -->

## Keamanan WebView

Jembatan native membuka pintu dari JavaScript ke kode Android, jadi perlakukan dengan hati-hati:

- **Muat hanya konten yang Anda percaya.** Jangan mengaktifkan `addJavascriptInterface` pada halaman yang bisa memuat konten pihak lain.
- **Batasi akses file.** Matikan `allowFileAccess` dan `allowContentAccess` seperti pada contoh di atas.
- **Ekspos seminimal mungkin.** Hanya beri anotasi `@JavascriptInterface` pada fungsi yang benar-benar dibutuhkan.
- **Validasi semua masukan dari JavaScript.** Periksa alamat tujuan dengan daftar yang diizinkan dan bersihkan parameter yang disisipkan ke kode JavaScript, seperti pada contoh `panggilApi`.
- **Batasi navigasi.** Tangani tautan eksternal dengan membukanya di peramban, bukan di dalam WebView.
- **Jangan simpan rahasia di aset.** Berkas di folder `assets` mudah diambil dari APK.

## Kamera, unduhan, dan tombol kembali

Tiga hal ini hampir selalu menjadi masalah:

- **Izin dan kamera.** Jika halaman memakai kamera, minta izin `CAMERA` saat runtime di sisi Android, lalu teruskan permintaan lewat `WebChromeClient.onPermissionRequest`. Untuk memilih berkas atau mengambil foto dari input file, implementasikan `onShowFileChooser`.
- **Unduhan.** WebView tidak menangani unduhan secara otomatis. Pasang `DownloadListener` dan serahkan pengunduhannya ke `DownloadManager`.
- **Tombol kembali.** Secara bawaan, tombol kembali menutup aplikasi. Atur agar menelusuri riwayat WebView lebih dulu:

```kotlin
onBackPressedDispatcher.addCallback(this, object : OnBackPressedCallback(true) {
    override fun handleOnBackPressed() {
        if (webView.canGoBack()) webView.goBack() else finish()
    }
})
```

## Menguji dan menyiapkan rilis ke Play Store

Sebelum rilis:

- Uji di beberapa ukuran layar dan versi Android, termasuk perangkat lama.
- Uji tanpa koneksi internet dan saat koneksi lambat. Tentukan apa yang tampil saat jaringan gagal.
- Tambahkan ikon aplikasi, nama, dan tangkapan layar yang sesuai persyaratan Play Console.
- Siapkan **kebijakan privasi** yang bisa diakses lewat tautan, dan isi formulir keamanan data di Play Console dengan jujur.
- Bangun paket dalam format **AAB** dan pastikan memenuhi persyaratan target API terbaru. Persyaratan ini berubah dari tahun ke tahun, jadi baca [dokumentasi resmi Android Developers](https://developer.android.com/distribute/best-practices/launch/target-sdk) dan pusat bantuan Play Console sebelum rilis.

## Pelajaran dari pengalaman saya

<!-- TAMBAHKAN (wajib, 3-5 butir dari pengalaman Anda): hal yang baru Anda ketahui setelah membungkus web app ke Android, misalnya soal performa, izin kamera, pembaruan aplikasi, atau penolakan di Play Store. Bagian ini yang membuat tulisan Anda unik. -->

## Kesimpulan

WebView memungkinkan Anda mengubah web app menjadi aplikasi Android dengan cepat. Kuncinya adalah memuat aset lewat `WebViewAssetLoader`, mengatasi CORS dengan benar, membatasi jembatan native, dan menyiapkan hal-hal kecil seperti tombol kembali dan unduhan. Mulailah dari versi paling sederhana, uji di perangkat sungguhan, lalu tambahkan fitur native hanya jika memang dibutuhkan.

Anda juga mungkin tertarik membaca [Panduan Digitalisasi Arsip untuk Kantor Kecil]({{ site.baseurl }}/2026/10/09/panduan-digitalisasi-arsip-kantor-kecil/).
