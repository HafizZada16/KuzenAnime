# 🎬 KuzenAnime - Modern Anime Streaming Web

* **Link Website**: https://anime.hapizweb.my.id

Sebuah aplikasi web *Single Page Application* (SPA) modern, ringan, dan responsif untuk *streaming* anime. Project ini dibangun menggunakan Vanilla JavaScript (ES6 Modules) dan Tailwind CSS, serta mengkonsumsi REST API dari Kanata (Otakudesu).

Fokus utama dari *project* KuzenAnime adalah memberikan *User Experience* (UX) yang sangat mulus dengan performa tinggi, menghindari masalah umum pada web *streaming* bajakan seperti *infinite loop* pada gambar, *render-blocking*, dan *spam request* API.

## ✨ Fitur & Optimasi Utama

* **⚡ Smooth SPA Navigation:** Transisi antar halaman yang instan tanpa *full-page reload*. Dilengkapi dengan *custom buffering overlay* elegan untuk UX yang lebih baik saat *fetching* data.
* **🎬 Smart Video Player:** * Pemfilteran otomatis yang memisahkan episode reguler dari file *Batch/Lengkap* pada navigasi *player*.
    * Dukungan multi-resolusi dan pergantian server (mirror) yang dinamis.
    * Iframe dioptimalkan dengan `referrerpolicy="no-referrer"` untuk memblokir pelacak pihak ketiga dan menghindari *error spam* di *console browser*.
* **🖼️ Intelligent Detail Page (Anti-Direct Link Issue):**
    * Jika *thumbnail* gagal dimuat dari API detail, sistem akan melakukan **background fetching** (menggunakan *slug*) ke API pencarian untuk mencari gambar tanpa memblokir proses *render* antarmuka (Non-blocking UI).
    * Implementasi **Smart Caching** menggunakan `localStorage` agar gambar yang sudah di-*load* dari halaman *Home* tidak perlu di-*request* ulang.
    * Penanganan *infinite loop error* bawaan *browser* pada *fallback image* (`this.onerror=null`).
* **📅 Lightweight Schedule Menu:** Menghindari limitasi API (Rate Limit/Error 429) dengan menggunakan metode **Initial Avatar** (huruf pertama judul) sebagai pengganti *thumbnail* massal. Ini membuat halaman jadwal berisi puluhan anime termuat secara instan tanpa membebani server.
* **🃏 Dynamic Anime Cards:** Komponen UI cerdas yang mendeteksi status anime (Ongoing/Completed) dan secara otomatis merender *badge rating* berdasarkan *extra data* dari API.

## 🛠️ Tech Stack

* **Frontend:** HTML5, Vanilla JavaScript (ES6 Modules, Async/Await)
* **Styling:** Tailwind CSS (via CDN), FontAwesome (Icons)
* **Data Fetching:** Fetch API 
* **State/Cache Management:** LocalStorage, History API (pushState)

## 🚀 Cara Menjalankan Project (Local Development)

Karena project ini menggunakan arsitektur ES6 Modules (`import/export`), Anda tidak bisa sekadar mengklik dua kali file `index.html`. Anda memerlukan *local web server*.

1.  **Clone repositori ini:**
    ```bash
    git clone [https://github.com/HafizZada16/KuzenAnime.git](https://github.com/HafizZada16/KuzenAnime.git)
    cd KuzenAnime
    ```
2.  **Jalankan menggunakan Live Server:**
    * Jika menggunakan editor **VS Code**, instal ekstensi **Live Server** dan klik tombol "Go Live" di pojok kanan bawah.
    * Atau jika menggunakan Node.js (`http-server`):
        ```bash
        npx http-server .
        ```
3.  Buka browser Anda di `http://localhost:8080` (atau port yang diberikan oleh *local server* Anda).

## 📂 Struktur Direktori

```text
📁 KuzenAnime/
├── 📄 index.html        # Entry point utama & struktur layout dasar (Overlay loading)
├── 📄 main.js           # Router & inisialisasi aplikasi SPA
└── 📁 js/
    ├── 📄 api.js        # Konfigurasi Fetch & Base URL API (Kanata/Otakudesu)
    ├── 📄 utils.js      # Utility functions (Loading UI, Card Renderer dinamis)
    ├── 📄 home.js       # Logika halaman Home & Category (Ongoing/Complete)
    ├── 📄 detail.js     # Halaman detail anime, background fetching & caching
    ├── 📄 player.js     # Logika streaming, filter episode reguler, dan iframe
    └── 📄 schedule.js   # Jadwal rilis dengan optimasi Initial Avatar UX
