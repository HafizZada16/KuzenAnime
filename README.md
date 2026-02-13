
---

# 🚀 KuzenAnime - Streaming Anime Indonesia

* **Link Website**: https://anime.hapizweb.my.id

Aplikasi web streaming anime modern yang dibangun dengan **Vanilla JavaScript (ES6+)** dan **Tailwind CSS**. Website ini mengambil data secara real-time dari API Otakudesu untuk menyajikan informasi anime ongoing, complete, jadwal rilis, hingga pencarian berdasarkan genre.

## 🛠️ Tech Stack

* **Frontend**: HTML5, Tailwind CSS (via CDN).
* **Logic**: Vanilla JavaScript Modules (ESM).
* **Backend/Server**: Node.js (Internal HTTP Server).
* **Iconography**: Font Awesome 6.0.0.

---

## 📂 Struktur Proyek

```text
web_anime2/
├── css/
│   └── style.css      # Animasi FadeIn & Glassmorphism
├── js/
│   ├── api.js         # Konfigurasi Fetch & BASE_URL
│   ├── home.js        # Logika Home, Category, & Search
│   ├── detail.js      # Halaman Informasi & Daftar Episode
│   ├── player.js      # Pemutar Video & Switch Server
│   ├── schedule.js    # Halaman Jadwal Rilis (Release Schedule)
│   ├── genres.js      # Halaman Filter Genre
│   └── utils.js       # Helper UI (Loading, Card, Pagination)
├── index.html         # Main Entry & Client-side Router
├── server.js          # Node.js Static File Server
└── package.json       # Konfigurasi Project & Scripts

```

---

## 📡 Detail API (Otakudesu Wrapper)

Aplikasi ini menggunakan API pihak ketiga sebagai sumber data.

* **Base URL**: `https://api.kanata.web.id/otakudesu`
* **Endpoints Utama**:
* `GET /home`: Mengambil data anime ongoing dan complete terbaru.
* `GET /anime/{slug}`: Mengambil detail informasi anime, genre, dan list episode.
* `GET /episode/{slug}`: Mengambil data streaming dan mirror server untuk episode tertentu.
* `GET /search?q={query}`: Melakukan pencarian anime berdasarkan judul.
* `GET /schedule`: Mengambil jadwal rilis anime mingguan.
* `GET /genres/{slug}?page={n}`: Mengambil daftar anime berdasarkan genre tertentu.
* `POST /stream`: Endpoint untuk menukar payload mirror menjadi iframe video aktif.



---

## 🚀 Cara Menjalankan

1. **Instalasi**: Pastikan Anda memiliki Node.js terinstal.
2. **Jalankan Server**:
Buka terminal di dalam folder proyek dan jalankan:
```bash
npm start

```


atau
```bash
node server.js

```


3. **Akses Web**: Buka browser dan arahkan ke `http://localhost:3000`.

---

## 📝 Fitur Unggulan

* **Client-Side Routing**: Perpindahan halaman mulus tanpa reload menggunakan `history.pushState`.
* **Responsive Card**: Grid sistem yang menyesuaikan ukuran layar (2 kolom mobile, 6 kolom desktop).
* **Quality Selector**: Memungkinkan pengguna memilih resolusi video (360p, 480p, 720p) sesuai ketersediaan.
* **Auto-Synced Header**: Navigasi sticky dengan efek blur (Glassmorphism).

---

## ⚠️ Catatan Penting untuk Developer

* **Path Absolut**: Selalu gunakan `/js/...` atau `/css/...` (dengan awalan slash) saat mengimpor file agar tidak terjadi error 404 saat berada di sub-path seperti `/anime/slug` atau `/genres/slug`.
* **Referrer Policy**: Tag `<meta name="referrer" content="no-referrer">` sangat penting agar gambar poster dari server Otakudesu dapat dimuat dengan benar.

---

Apakah Anda ingin saya menambahkan bagian khusus mengenai cara melakukan *deployment* ke VPS atau hosting seperti Vercel/Netlify?
