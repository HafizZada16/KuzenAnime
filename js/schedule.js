import { fetchData } from "./api.js";
import { showLoading, createSkeletonList } from "./utils.js"; // Pastikan createSkeletonList di-import

export async function loadSchedule() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  // 1. Matikan loading spinner bawaan
  showLoading(false);
  history.pushState(null, null, `/schedule`);

  const display = document.getElementById("content-display");

  // 2. TAMPILKAN SKELETON JADWAL (Sesuai Desain Daily Cards)
  if (display) {
    let skeletonHtml = `
      <div class="animate-fadeIn max-w-6xl mx-auto">
          <h2 class="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter text-gray-500 animate-pulse">
              <div class="w-6 h-6 bg-gray-700 rounded-md"></div> Memuat Jadwal...
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
    `;

    // Buat 6 kartu skeleton (Senin - Sabtu) untuk mengisi layar
    for (let i = 0; i < 6; i++) {
      skeletonHtml += `
          <div class="bg-[#121212] border border-gray-800 p-6 rounded-3xl shadow-lg flex flex-col">
              <div class="h-5 w-24 bg-gray-700 rounded mb-5 animate-pulse"></div>
              
              <div class="flex flex-col gap-3 flex-grow">
                  ${createSkeletonList(3)}
              </div>
          </div>
      `;
    }
    skeletonHtml += `</div></div>`;
    display.innerHTML = skeletonHtml;
  }

  try {
    // 3. Ambil data dari API
    const data = await fetchData(`/schedule`);

    if (!data || data.length === 0) {
      if (display)
        display.innerHTML = `<div class="text-center py-20 text-red-500 font-bold uppercase tracking-widest text-[10px]">Gagal memuat jadwal rilis.</div>`;
      return;
    }

    // 4. TIMPA SKELETON DENGAN DATA ASLI (Kode Aslimu yang Rapi)
    let html = `
      <div class="animate-fadeIn max-w-6xl mx-auto">
          <h2 class="text-2xl md:text-3xl font-black mb-8 flex items-center gap-3 uppercase tracking-tighter text-white">
              <i class="fas fa-calendar-alt text-purple-500"></i> Jadwal Rilis
          </h2>
          <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
      `;

    data.forEach((dayData) => {
      html += `
          <div class="bg-[#121212] border border-gray-800 p-6 rounded-3xl shadow-lg flex flex-col">
              <h3 class="text-lg font-black mb-5 flex items-center gap-3 uppercase tracking-widest text-orange-500 border-b border-gray-800 pb-3">
                  <i class="fas fa-clock"></i> ${dayData.day}
              </h3>
              <div class="flex flex-col gap-3 flex-grow">
      `;

      if (dayData.animeList && dayData.animeList.length > 0) {
        dayData.animeList.forEach((anime) => {
          const title = anime.anime_name || anime.title || "Unknown";
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
        html += `
              <div class="flex items-center justify-center h-full min-h-[80px] border border-dashed border-gray-800 rounded-xl bg-gray-900/20">
                  <p class="text-[10px] text-gray-600 font-bold uppercase tracking-widest flex items-center gap-2">
                      <i class="fas fa-bed"></i> Tidak ada rilis
                  </p>
              </div>
        `;
      }

      html += `</div></div>`;
    });

    html += `</div></div>`;

    if (display) display.innerHTML = html;
  } catch (error) {
    console.error("Schedule Error:", error);
    if (display)
      display.innerHTML = `<div class="text-center py-20 text-red-500 font-bold uppercase tracking-widest text-[10px]">Terjadi kesalahan pada server.</div>`;
  }
}
