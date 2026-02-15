// js/auth.js
import { showLoading } from "./utils.js";

// URL Backend (Sesuaikan jika nanti online)
import { USER_API } from "./config.js";

// Fungsi untuk memunculkan Popup Login / Register
export function showAuthModal(isLogin = true) {
  // Hapus modal lama jika ada
  const existingModal = document.getElementById("auth-modal");
  if (existingModal) existingModal.remove();

  const modalHtml = `
    <div id="auth-modal" class="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-fadeIn p-4">
        <div class="bg-[#121212] border border-gray-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative">
            
            <button onclick="document.getElementById('auth-modal').remove()" class="absolute top-4 right-4 text-gray-500 hover:text-white transition">
                <i class="fas fa-times text-xl"></i>
            </button>

            <div class="p-8">
                <div class="text-center mb-8">
                    <div class="w-12 h-12 bg-purple-600 rounded-xl flex items-center justify-center mx-auto mb-4 shadow-lg shadow-purple-600/30">
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
                        <div class="relative">
                            <i class="fas fa-user absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                            <input type="text" id="auth-username" required class="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-purple-500 focus:outline-none transition">
                        </div>
                    </div>
                    `
                        : ""
                    }

                    <div class="mb-4">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Email Address</label>
                        <div class="relative">
                            <i class="fas fa-envelope absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                            <input type="email" id="auth-email" required class="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-purple-500 focus:outline-none transition">
                        </div>
                    </div>

                    <div class="mb-6">
                        <label class="block text-[10px] font-black text-gray-400 uppercase tracking-widest mb-2">Password</label>
                        <div class="relative">
                            <i class="fas fa-lock absolute left-4 top-1/2 -translate-y-1/2 text-gray-600"></i>
                            <input type="password" id="auth-password" required class="w-full bg-gray-900/50 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-sm text-white focus:border-purple-500 focus:outline-none transition">
                        </div>
                    </div>

                    <p id="auth-error" class="text-red-500 text-[10px] font-bold text-center mb-4 hidden"></p>

                    <button type="submit" class="w-full bg-purple-600 hover:bg-purple-500 text-white font-black py-3 rounded-xl uppercase tracking-widest transition shadow-lg shadow-purple-600/20 text-xs">
                        ${isLogin ? "Login Now" : "Register"}
                    </button>
                </form>

                <div class="mt-6 text-center">
                    <p class="text-[10px] font-bold text-gray-500 uppercase tracking-widest">
                        ${isLogin ? "Don't have an account?" : "Already have an account?"} 
                        <span onclick="window.app.showAuthModal(${!isLogin})" class="text-purple-500 hover:text-white cursor-pointer transition ml-1">
                            ${isLogin ? "Register Here" : "Login Here"}
                        </span>
                    </p>
                </div>
            </div>
        </div>
    </div>`;

  document.body.insertAdjacentHTML("beforeend", modalHtml);
}

// Logika Proses Register
export async function handleRegister() {
  const username = document.getElementById("auth-username").value;
  const email = document.getElementById("auth-email").value;
  const password = document.getElementById("auth-password").value;
  const errorEl = document.getElementById("auth-error");

  showLoading(true);
  try {
    const res = await fetch(`${USER_API}/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, email, password }),
    });
    const data = await res.json();

    if (data.status === "success") {
      alert("Registrasi Berhasil! Silakan Login.");
      showAuthModal(true); // Lempar ke form login
    } else {
      errorEl.innerText = data.message;
      errorEl.classList.remove("hidden");
    }
  } catch (err) {
    errorEl.innerText = "Gagal terhubung ke server.";
    errorEl.classList.remove("hidden");
  }
  showLoading(false);
}

// Logika Proses Login
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
      // Simpan token dan data user di LocalStorage
      localStorage.setItem("kuzen_token", data.token);
      localStorage.setItem("kuzen_user", JSON.stringify(data.user));

      document.getElementById("auth-modal").remove();
      checkAuthUI(); // Update tampilan navbar
      alert(`Selamat datang kembali, ${data.user.username}!`);
    } else {
      errorEl.innerText = data.message;
      errorEl.classList.remove("hidden");
    }
  } catch (err) {
    errorEl.innerText = "Gagal terhubung ke server.";
    errorEl.classList.remove("hidden");
  }
  showLoading(false);
}

// Cek apakah user sudah login untuk mengubah tombol di Navbar
export function checkAuthUI() {
  const user = JSON.parse(localStorage.getItem("kuzen_user"));
  const loginBtnDesktop = document.getElementById("nav-login-btn");

  if (user) {
    if (loginBtnDesktop) {
      loginBtnDesktop.innerHTML = `<i class="fas fa-user-circle text-lg text-purple-500"></i> <span class="ml-1">${user.username}</span>`;
      loginBtnDesktop.onclick = () => {
        if (confirm("Apakah Anda yakin ingin Logout?")) {
          localStorage.removeItem("kuzen_token");
          localStorage.removeItem("kuzen_user");
          checkAuthUI();
        }
      };
    }
  } else {
    if (loginBtnDesktop) {
      loginBtnDesktop.innerHTML = `<i class="fas fa-sign-in-alt mr-1"></i> Login`;
      loginBtnDesktop.onclick = () => window.app.showAuthModal(true);
    }
  }
}
