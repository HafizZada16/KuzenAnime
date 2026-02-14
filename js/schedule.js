import { fetchData } from "/js/api.js";
import { showLoading } from "/js/utils.js";

export async function loadSchedule() {
  showLoading(true);

  // Update URL agar bisa di-refresh/share
  history.pushState(null, null, `/schedule`);

  const data = await fetchData(`/schedule`);
  const display = document.getElementById("content-display");

  if (!data || data.length === 0) {
    display.innerHTML = `<div class="text-center py-20 text-red-500 font-bold uppercase tracking-widest text-[10px]">Gagal memuat jadwal rilis.</div>`;
    showLoading(false);
    return;
  }

  let html = `
    <div class="animate-fadeIn max-w-6xl mx-auto">
        <h2 class="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter text-white">
            <i class="fas fa-calendar-alt text-purple-500"></i> Jadwal Rilis
        </h2>
        
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    `;

  // Looping berdasarkan Hari (Senin, Selasa, dll)
  data.forEach((dayData) => {
    html += `
        <div class="bg-[#121212] border border-gray-800 p-6 rounded-3xl shadow-lg flex flex-col">
            <h3 class="text-lg font-black mb-5 flex items-center gap-3 uppercase tracking-widest text-orange-500 border-b border-gray-800 pb-3">
                <i class="fas fa-clock"></i> ${dayData.day}
            </h3>
            
            <div class="flex flex-col gap-3 flex-grow">
        `;

    // Looping daftar anime per hari
    if (dayData.animeList && dayData.animeList.length > 0) {
      dayData.animeList.forEach((anime) => {
        const title = anime.anime_name || anime.title || "Unknown";
        // Mengambil huruf pertama dari judul untuk dijadikan logo
        const initial = title.charAt(0).toUpperCase();

        html += `
                    <div onclick="app.loadDetail('${anime.slug}')" class="group cursor-pointer bg-gray-900/50 hover:bg-gray-800 border border-gray-800 hover:border-purple-500/50 p-3 rounded-xl transition-all flex items-center gap-4 shadow-sm">
                        
                        <div class="w-10 h-10 flex-shrink-0 rounded-lg bg-gray-800 border border-gray-700 flex items-center justify-center group-hover:bg-purple-600 group-hover:border-purple-500 transition-colors duration-300">
                            <span class="text-lg font-black text-gray-400 group-hover:text-white">${initial}</span>
                        </div>
                        
                        <div class="flex-grow min-w-0">
                            <h4 class="text-xs font-bold text-gray-300 group-hover:text-purple-400 transition-colors line-clamp-2 leading-snug">
                                ${title}
                            </h4>
                        </div>
                        
                        <i class="fas fa-chevron-right text-gray-600 group-hover:text-purple-500 transition-colors text-[10px] mr-2"></i>
                    </div>
                `;
      });
    } else {
      // Jika hari tersebut libur/kosong
      html += `
                <div class="flex items-center justify-center h-full min-h-[80px] border border-dashed border-gray-800 rounded-xl bg-gray-900/20">
                    <p class="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-2">
                        <i class="fas fa-bed"></i> Tidak ada rilis
                    </p>
                </div>
            `;
    }

    html += `
            </div>
        </div>`;
  });

  html += `
        </div>
    </div>`;

  display.innerHTML = html;
  showLoading(false);
}
