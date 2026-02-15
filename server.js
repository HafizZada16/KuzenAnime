import "dotenv/config"; // <-- Baris ini otomatis membaca file .env
import express from "express";
import mysql from "mysql2/promise";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";

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

app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;

    // Cek apakah email atau username sudah dipakai
    const [existingUser] = await db.query(
      "SELECT id FROM users WHERE email = ? OR username = ?",
      [email, username],
    );
    if (existingUser.length > 0) {
      return res.status(400).json({
        status: "error",
        message: "Email atau Username sudah terdaftar!",
      });
    }

    // Acak password biar aman (Hashing)
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Simpan ke database
    await db.query(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashedPassword],
    );
    res.json({ status: "success", message: "Registrasi berhasil!" });
  } catch (error) {
    // 👇 TAMBAHKAN BARIS INI UNTUK MELIHAT PENYAKIT ASLINYA 👇
    console.error("🚨 ERROR DETAIL REGISTRASI:", error);

    res
      .status(500)
      .json({ status: "error", message: "Server error saat registrasi." });
  }
});

// Login Akun
app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Cari user berdasarkan email
    const [users] = await db.query("SELECT * FROM users WHERE email = ?", [
      email,
    ]);
    if (users.length === 0) {
      return res
        .status(400)
        .json({ status: "error", message: "Email tidak ditemukan!" });
    }

    const user = users[0];

    // Cocokkan password
    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res
        .status(400)
        .json({ status: "error", message: "Password salah!" });
    }

    // Buat Tiket/Token (berlaku 7 hari)
    const token = jwt.sign(
      { id: user.id, username: user.username },
      process.env.JWT_SECRET,
      { expiresIn: "7d" },
    );

    res.json({
      status: "success",
      message: "Login berhasil!",
      token: token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        avatar: user.avatar,
      },
    });
  } catch (error) {
    res
      .status(500)
      .json({ status: "error", message: "Server error saat login." });
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
