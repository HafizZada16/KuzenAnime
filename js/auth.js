// js/auth.js
import { showLoading } from "./utils.js";
import { USER_API } from "./config.js";

// ==========================================
// HELPER POPUP TEMA KUZENANIME
// ==========================================
const showPopup = (title, text, icon = "success") => {
  Swal.fire({
    title: title,
    text: text,
    icon: icon,
    width: "320px",
    background: "#1a1a1a",
    color: "#ffffff",
    confirmButtonColor: "#ff6600",
    customClass: { popup: "rounded-3xl" },
    timer: 3000,
    timerProgressBar: true,
  });
};

// ==========================================
// 1. AUTH MODAL (LOGIN/REGISTER POPUP)
// ==========================================
export function showAuthModal(isLogin = true) {
  const existingModal = document.getElementById("auth-modal");
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div id="auth-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
        <div class="bg-[#121212] border border-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
            <button onclick="document.getElementById('auth-modal').remove()" class="absolute top-4 right-4 text-gray-500 hover:text-white transition"><i class="fas fa-times text-xl"></i></button>

            <div class="p-8">
                <div class="text-center mb-8">
                    <div class="w-12 h-12 bg-[#ff6600] rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-[#ff6600]/30">
                        <i class="fas ${isLogin ? "fa-sign-in-alt" : "fa-user-plus"} text-white text-xl"></i>
                    </div>
                    <h2 class="text-2xl font-black uppercase tracking-tighter text-white">${isLogin ? "Welcome Back" : "Create Account"}</h2>
                    <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-1">${isLogin ? "Login to access your history" : "Join KuzenAnime today"}</p>
                </div>

                <form id="auth-form" onsubmit="event.preventDefault(); window.app.${isLogin ? "handleLogin()" : "handleRegister()"}">
                    ${
                      !isLogin
                        ? `
                    <div class="mb-4">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Username</label>
                        <div class="relative"><i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                            <input type="text" id="auth-username" required class="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#ff6600] focus:outline-none transition">
                        </div>
                    </div>`
                        : ""
                    }

                    <div class="mb-4">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                        <div class="relative"><i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                            <input type="email" id="auth-email" required class="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#ff6600] focus:outline-none transition">
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Password</label>
                        <div class="relative"><i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                            <input type="password" id="auth-password" required class="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-[#ff6600] focus:outline-none transition">
                        </div>
                    </div>

                    <p id="auth-error" class="text-red-500 text-[10px] font-bold text-center mb-4 hidden"></p>

                    <button type="submit" class="w-full bg-[#ff6600] hover:bg-[#e65c00] text-white font-black py-3 rounded-xl uppercase tracking-widest transition shadow-lg shadow-[#ff6600]/20 text-xs">
                        ${isLogin ? "Login Now" : "Register"}
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        ${isLogin ? "Don't have an account?" : "Already have an account?"} 
                        <span onclick="window.app.showAuthModal(${!isLogin})" class="text-[#ff6600] hover:text-white cursor-pointer transition ml-1">
                            ${isLogin ? "Register Here" : "Login Here"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>`;
  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

// ==========================================
// 2. LOGIKA REGISTER & LOGIN
// ==========================================
export async function handleRegister() {
  const username = document.getElementById("auth-username").value.trim();
  const email = document.getElementById("auth-email").value.trim();
  const password = document.getElementById("auth-password").value;
  const errorEl = document.getElementById("auth-error");

  if (username.length < 3)
    return showError(errorEl, "Username minimal 3 karakter!");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    return showError(errorEl, "Format email tidak valid!");
  if (!/^(?=.*[a-zA-Z])(?=.*\d).{8,}$/.test(password))
    return showError(errorEl, "Password min 8 char (Huruf + Angka)!");

  errorEl.classList.add("hidden");
  showLoading(true);

  try {
    const res = await fetch(`${USER_API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();

    if (data.status === "success") {
      showPopup("Registrasi Berhasil!", "Silakan Login.", "success");
      showAuthModal(true);
    } else {
      showError(errorEl, data.message);
    }
  } catch (err) {
    showError(errorEl, "Gagal terhubung ke server.");
  }
  showLoading(false);
}

export async function handleLogin() {
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;
  const errorEl = document.getElementById("auth-error");

  showLoading(true);
  try {
    const res = await fetch(`${USER_API}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });
    const data = await res.json();

    if (data.status === "success") {
      // 1. Simpan Data
      localStorage.setItem("kuzen_token", data.token);
      localStorage.setItem("kuzen_user", JSON.stringify(data.user));

      // 2. Bersihkan UI
      document.getElementById("auth-modal").remove();

      // 3. Update Navbar (PENTING!)
      checkAuthUI();

      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: "success",
        title: "Selamat Datang!",
        text: `Halo ${data.user.username}!`,
        background: "#1a1a1a",
        color: "#ffffff",
      });

      // 4. Refresh jika di halaman khusus
      const currentPath = window.location.pathname;
      if (currentPath === "/mylist" || currentPath === "/history") {
        window.location.reload();
      }
    } else {
      showError(errorEl, data.message);
    }
  } catch (err) {
    showError(errorEl, "Gagal terhubung ke server.");
  }
  showLoading(false);
}

function showError(el, msg) {
  el.innerText = msg;
  el.classList.remove("hidden");
}

// ==========================================
// 3. LOGIKA LOGOUT (PERBAIKAN UTAMA DI SINI)
// ==========================================
window.handleLogout = () => {
  Swal.fire({
    title: "Logout?",
    text: "Yakin ingin keluar akun?",
    icon: "warning",
    background: "#1a1a1a",
    color: "#ffffff",
    showCancelButton: true,
    confirmButtonColor: "#d33",
    cancelButtonColor: "#444",
    confirmButtonText: "Ya, Logout",
    cancelButtonText: "Batal",
  }).then((result) => {
    if (result.isConfirmed) {
      // 1. Hapus Data dari Memory
      localStorage.removeItem("kuzen_token");
      localStorage.removeItem("kuzen_user");

      // 2. PAKSA Reset Tampilan Navbar SEKARANG JUGA
      checkAuthUI();

      // 3. Notifikasi
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 2000,
        icon: "info",
        title: "Logout Berhasil",
        background: "#1a1a1a",
        color: "#ffffff",
      });

      // 4. Arahkan ke Home dan RELOAD halaman agar bersih total
      // Menggunakan replace agar user tidak bisa back ke halaman login
      setTimeout(() => {
        window.location.replace("/");
      }, 500);
    }
  });
};

// ==========================================
// 4. LOGIKA RENDER NAVBAR (ANTI-ZOMBIE)
// ==========================================
export function checkAuthUI() {
  const userStr = localStorage.getItem("kuzen_user");
  const token = localStorage.getItem("kuzen_token");

  let user = null;
  if (userStr && token) {
    try {
      user = JSON.parse(userStr);
    } catch (e) {
      user = null;
    }
  }

  const loginBtnDesktop = document.getElementById("nav-login-btn");
  const loginBtnMobile = document.getElementById("nav-login-btn-mobile");

  const goToProfile = () => {
    if (window.app && typeof window.app.loadProfile === "function")
      window.app.loadProfile();
    else window.location.href = "/";
  };

  if (user) {
    // --- MODE LOGIN (Tampilkan Username) ---

    // Desktop
    if (loginBtnDesktop) {
      // Hapus uppercase, pakai font Poppins biar estetik
      loginBtnDesktop.classList.remove("uppercase", "tracking-widest");
      loginBtnDesktop.classList.add("tracking-wide", "font-['Poppins']");

      loginBtnDesktop.innerHTML = `<i class="fas fa-user-circle text-base text-[#ff6600]"></i> <span class="ml-1.5 truncate max-w-[100px] font-semibold">${user.username}</span>`;

      if (loginBtnDesktop.tagName === "A")
        loginBtnDesktop.removeAttribute("href");
      loginBtnDesktop.onclick = (e) => {
        if (e) e.preventDefault();
        goToProfile();
      };
    }

    // Mobile
    if (loginBtnMobile) {
      loginBtnMobile.innerHTML = `<i class="fas fa-user-circle w-5 text-center mr-1 text-[#ff6600]"></i> <span class="font-['Poppins'] font-semibold truncate max-w-[100px]">${user.username}</span>`;
      loginBtnMobile.classList.remove("text-red-500");
      loginBtnMobile.classList.add("text-gray-300");

      if (loginBtnMobile.tagName === "A")
        loginBtnMobile.removeAttribute("href");
      loginBtnMobile.onclick = (e) => {
        if (e) e.preventDefault();
        goToProfile();
        const mobileMenuBtn = document.getElementById("mobile-menu-btn");
        if (mobileMenuBtn) mobileMenuBtn.click();
      };
    }
  } else {
    // --- MODE LOGOUT (Tampilkan Tombol Login) ---

    // Desktop
    if (loginBtnDesktop) {
      // Kembalikan style tombol login
      loginBtnDesktop.classList.remove("tracking-wide");
      loginBtnDesktop.classList.add(
        "uppercase",
        "tracking-widest",
        "font-['Poppins']",
      );

      loginBtnDesktop.innerHTML = `<i class="fas fa-sign-in-alt mr-1"></i> <span class="font-bold">Login</span>`;

      if (loginBtnDesktop.tagName === "A")
        loginBtnDesktop.removeAttribute("href");
      loginBtnDesktop.onclick = (e) => {
        if (e) e.preventDefault();
        window.app.showAuthModal(true);
      };
    }

    // Mobile
    if (loginBtnMobile) {
      loginBtnMobile.innerHTML = `<i class="fas fa-sign-in-alt w-5 text-center mr-1 text-[#ff6600]"></i> <span class="font-['Poppins'] font-bold uppercase tracking-widest">Login</span>`;
      loginBtnMobile.classList.remove("text-red-500");
      loginBtnMobile.classList.add("text-gray-300");

      if (loginBtnMobile.tagName === "A")
        loginBtnMobile.removeAttribute("href");
      loginBtnMobile.onclick = (e) => {
        if (e) e.preventDefault();
        window.app.showAuthModal(true);
        const mobileMenuBtn = document.getElementById("mobile-menu-btn");
        if (mobileMenuBtn) mobileMenuBtn.click();
      };
    }
  }
}
