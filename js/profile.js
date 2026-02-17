import { USER_API } from "./config.js";
import { showLoading } from "./utils.js";

export async function loadProfile() {
  const token = localStorage.getItem("kuzen_token");

  // 1. Proteksi Halaman: Usir jika belum login
  if (!token) {
    Swal.fire({
      icon: "error",
      title: "Akses Ditolak",
      text: "Silakan login terlebih dahulu untuk membuka profil.",
      background: "#1a1a1a",
      color: "#ffffff",
    });
    window.history.back(); // Kembalikan ke halaman sebelumnya
    return;
  }

  showLoading(true);
  history.pushState(null, null, `/profile`);

  const display = document.getElementById("content-display");
  if (!display) return;

  // 2. Ambil Data User Saat Ini (Opsional: Sesuaikan dengan endpoint backend kamu)
  let currentUsername = "User";
  try {
    const res = await fetch(`${USER_API}/profile`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) {
      const data = await res.json();
      currentUsername = data.username || "User";
    }
  } catch (err) {
    console.warn("Gagal menarik data profil awal:", err);
  }

  // 3. Render UI Profil
  display.innerHTML = `
        <div class="animate-fadeIn max-w-3xl mx-auto px-2 pb-10">
            <button onclick="window.history.back()" class="flex items-center gap-2 text-gray-300 hover:text-white font-bold text-sm mb-8 transition-colors w-fit group">
                <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back
            </button>

            <div class="text-center mb-10">
                <div class="w-24 h-24 bg-gradient-to-tr from-[#ff6600] to-orange-400 rounded-full mx-auto mb-4 flex items-center justify-center shadow-lg shadow-orange-500/30">
                    <i class="fas fa-user text-4xl text-white"></i>
                </div>
                <h1 class="text-2xl md:text-3xl font-black text-white tracking-tight">Akun Saya</h1>
                <p class="text-gray-400 text-sm mt-1">Kelola informasi profil dan keamanan akunmu.</p>
            </div>

            <div class="space-y-6">
                <div class="bg-[#121212] border border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                    <h2 class="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <i class="fas fa-id-badge text-blue-500"></i> Ganti Username
                    </h2>
                    
                    <form onsubmit="handleUpdateUsername(event)" class="space-y-4">
                        <div>
                            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Username Saat Ini / Baru</label>
                            <input type="text" id="input-username" value="${currentUsername}" required
                                class="w-full bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 transition-colors">
                        </div>
                        <div class="flex justify-end pt-2">
                            <button type="submit" class="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95">
                                Simpan Username
                            </button>
                        </div>
                    </form>
                </div>

                <div class="bg-[#121212] border border-gray-800 p-6 md:p-8 rounded-3xl shadow-sm relative overflow-hidden">
                    <div class="absolute top-0 left-0 w-1 h-full bg-[#ff6600]"></div>
                    <h2 class="text-lg font-black text-white mb-6 flex items-center gap-2 uppercase tracking-widest">
                        <i class="fas fa-lock text-[#ff6600]"></i> Ganti Password
                    </h2>
                    
                    <form onsubmit="handleUpdatePassword(event)" class="space-y-4">
                        <div>
                            <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Password Lama</label>
                            <input type="password" id="input-old-password" required placeholder="Masukkan password saat ini"
                                class="w-full bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#ff6600] transition-colors">
                        </div>
                        <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Password Baru</label>
                                <input type="password" id="input-new-password" required minlength="6" placeholder="Minimal 6 karakter"
                                    class="w-full bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#ff6600] transition-colors">
                            </div>
                            <div>
                                <label class="block text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-2">Konfirmasi Password</label>
                                <input type="password" id="input-confirm-password" required placeholder="Ulangi password baru"
                                    class="w-full bg-gray-900/50 border border-gray-700 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-[#ff6600] transition-colors">
                            </div>
                        </div>
                        <div class="flex justify-end pt-4">
                            <button type="submit" class="bg-[#ff6600] hover:bg-[#e65c00] text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg shadow-[#ff6600]/20 active:scale-95">
                                Update Password
                            </button>
                        </div>
                    </form>
                </div>
                
                <div class="flex justify-center pt-8">
                    <button onclick="handleLogout()" class="text-red-500 hover:text-white bg-red-500/10 hover:bg-red-500 border border-red-500/30 hover:border-red-500 px-8 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all flex items-center gap-2">
                        <i class="fas fa-sign-out-alt"></i> Logout Akun
                    </button>
                </div>
            </div>
        </div>
    `;
  showLoading(false);
}

// ==========================================
// FUNGSI AKSI (Terkait API Backend Kamu)
// ==========================================

window.handleUpdateUsername = async (e) => {
  e.preventDefault();
  const newUsername = document.getElementById("input-username").value.trim();
  const token = localStorage.getItem("kuzen_token");

  try {
    showLoading(true);
    const res = await fetch(`${USER_API}/profile/update-username`, {
      method: "PUT", // Atau POST, sesuaikan backendmu
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ username: newUsername }),
    });

    const result = await res.json();
    showLoading(false);

    if (res.ok && result.status === "success") {
      Swal.fire({
        toast: true,
        position: "top-end",
        icon: "success",
        title: "Username diupdate!",
        showConfirmButton: false,
        timer: 3000,
        background: "#1a1a1a",
        color: "#ffffff",
      });
    } else {
      throw new Error(result.message || "Gagal mengupdate username");
    }
  } catch (err) {
    showLoading(false);
    Swal.fire({
      icon: "error",
      title: "Oops...",
      text: err.message,
      background: "#1a1a1a",
      color: "#ffffff",
    });
  }
};

window.handleUpdatePassword = async (e) => {
  e.preventDefault();
  const oldPassword = document.getElementById("input-old-password").value;
  const newPassword = document.getElementById("input-new-password").value;
  const confirmPassword = document.getElementById(
    "input-confirm-password",
  ).value;
  const token = localStorage.getItem("kuzen_token");

  // Validasi Frontend
  if (newPassword !== confirmPassword) {
    Swal.fire({
      icon: "warning",
      title: "Password Tidak Sama",
      text: "Konfirmasi password baru tidak cocok!",
      background: "#1a1a1a",
      color: "#ffffff",
    });
    return;
  }

  try {
    showLoading(true);
    const res = await fetch(`${USER_API}/profile/update-password`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        old_password: oldPassword,
        new_password: newPassword,
      }),
    });

    const result = await res.json();
    showLoading(false);

    if (res.ok && result.status === "success") {
      // Bersihkan form input setelah sukses
      document.getElementById("input-old-password").value = "";
      document.getElementById("input-new-password").value = "";
      document.getElementById("input-confirm-password").value = "";

      Swal.fire({
        icon: "success",
        title: "Sukses!",
        text: "Password berhasil diubah.",
        background: "#1a1a1a",
        color: "#ffffff",
      });
    } else {
      throw new Error(result.message || "Password lama salah / gagal update");
    }
  } catch (err) {
    showLoading(false);
    Swal.fire({
      icon: "error",
      title: "Gagal",
      text: err.message,
      background: "#1a1a1a",
      color: "#ffffff",
    });
  }
};

window.handleLogout = () => {
  Swal.fire({
    title: "Yakin ingin keluar?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#3085d6",
    confirmButtonText: "Ya, Logout",
    cancelButtonText: "Batal",
    background: "#1a1a1a",
    color: "#ffffff",
  }).then((result) => {
    if (result.isConfirmed) {
      localStorage.removeItem("kuzen_token");
      // Bisa hapus memori lain jika perlu (misal current_anime_slug)
      window.location.href = "/"; // Arahkan kembali ke Home
    }
  });
};
