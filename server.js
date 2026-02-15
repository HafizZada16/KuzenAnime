import "dotenv/config"; // <-- Baris ini otomatis membaca file .env
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Mengambil port dari .env, atau gunakan 3000 jika kosong
const PORT = process.env.PORT || 3000;

const app = express();

app.use(cors());
app.use(express.json());

// ==========================================
// 1. KONEKSI DATABASE MYSQL DARI .ENV
// ==========================================
const db = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASS,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// ==========================================
// 2. ENDPOINT API (BACKEND)
// ==========================================
app.get("/api/test-db", async (req, res) => {
  try {
    const [rows] = await db.query(
      "SELECT 'Koneksi ke KuzenAnime DB Berhasil!' AS pesan",
    );
    res.json({ status: "success", data: rows[0] });
  } catch (error) {
    console.error("Database error:", error);
    res.status(500).json({
      status: "error",
      message: "Gagal konek ke database",
      error: error.message,
    });
  }
});

// ==========================================
// 3. PENGATURAN FRONTEND (SPA)
// ==========================================
app.use(express.static(__dirname));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, "index.html"));
});

// ==========================================
// 4. JALANKAN SERVER
// ==========================================
app.listen(PORT, () => {
  console.log(`-------------------------------------------`);
  console.log(`🚀 KuzenAnime API & Web live at http://localhost:${PORT}`);
  console.log(`-------------------------------------------`);
});
