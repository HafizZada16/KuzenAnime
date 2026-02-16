import { showLoading } from "./utils.js";

import { USER_API } from "./config.js";

export async function loadHistory() {
  showLoading(true);

  // Update URL di browser
  history.pushState(null, null, "/history");

  const content = document.getElementById("content-display");
  const token = localStorage.getItem("kuzen_token");

  // Proteksi: Cek apakah user sudah login
  if (!token) {
    content.innerHTML = `
            <div class="flex flex-col items-center justify-center py-20 animate-fadeIn">
                <div class="w-20 h-20 bg-gray-900 rounded-full flex items-center justify-center mb-6 border border-gray-800">
                    <i class="fas fa-history text-[#ff6600] text-3xl"></i>
                </div>
                <h2 class="text-xl font-black uppercase tracking-tighter mb-2">Riwayat Terkunci</h2>
                <p class="text-xs text-gray-500 font-bold uppercase tracking-widest mb-6">Login untuk melihat apa yang terakhir Anda tonton</p>
                <button onclick="window.app.showAuthModal(true)" class="bg-[#ff6600] hover:bg-[#ff5500] text-white px-8 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition shadow-lg shadow-[#ff6600]/20">
                    Login Sekarang
                </button>
            </div>
        `;
    showLoading(false);
    return;
  }

  try {
    // Ambil data dari server.js
    const res = await fetch(`${USER_API}/history`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();

    let html = `
            <div class="animate-fadeIn">
                <div class="flex items-center justify-between mb-8">
                    <div>
                        <h2 class="text-2xl md:text-4xl font-black uppercase tracking-tighter italic">Recent Activity</h2>
                        <p class="text-[10px] text-[#ff6600] font-black uppercase tracking-[0.3em]">Lanjutkan tontonan Anda</p>
                    </div>
                </div>
        `;

    if (!result.data || result.data.length === 0) {
      html += `
                <div class="text-center py-20 bg-gray-900/20 rounded-3xl border border-dashed border-gray-800">
                    <i class="fas fa-play-circle text-gray-800 text-5xl mb-4"></i>
                    <p class="text-xs font-bold text-gray-600 uppercase tracking-widest">Belum ada riwayat menonton.</p>
                </div>
            `;
    } else {
      html += `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">`;

      result.data.forEach((item) => {
        // Format waktu (opsional)
        const watchDate = new Date(item.updated_at).toLocaleDateString(
          "id-ID",
          { day: "numeric", month: "short" },
        );

        html += `
                    <div class="group flex bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-[#ff6600] transition-all cursor-pointer shadow-lg" 
                         onclick="app.loadPlayer('${item.episode_slug}')">
                        
                        <div class="w-24 h-32 flex-shrink-0 relative">
                            <img src="${item.anime_thumb}" class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500">
                            <div class="absolute inset-0 bg-[#ff6600]/20 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
                                <i class="fas fa-play text-white text-xs"></i>
                            </div>
                        </div>

                        <div class="p-4 flex flex-col justify-center flex-1 min-w-0">
                            <p class="text-[9px] font-black text-[#ff6600] uppercase tracking-widest mb-1">${watchDate}</p>
                            <h3 class="text-xs font-black text-white truncate uppercase tracking-tighter mb-1">${item.anime_title}</h3>
                            <p class="text-[10px] text-gray-500 font-bold truncate italic">Terakhir: ${item.episode_title.replace("Episode", "EP")}</p>
                            
                            <div class="mt-3 w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                                <div class="bg-[#ff6600] h-full w-full opacity-50"></div>
                            </div>
                        </div>
                    </div>
                `;
      });

      html += `</div>`;
    }

    html += `</div>`;
    content.innerHTML = html;
  } catch (err) {
    content.innerHTML = `<p class="text-center text-red-500 py-20 uppercase font-black text-xs">Gagal memuat riwayat.</p>`;
  }
  showLoading(false);
}
