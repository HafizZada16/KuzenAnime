import { fetchData } from "./api.js";
import { showLoading } from "./utils.js";

export async function loadSchedule() {
  showLoading(true);
  history.pushState(null, null, "/schedule");

  const data = await fetchData("/schedule");
  const display = document.getElementById("content-display");

  if (!data) {
    display.innerHTML = `<p class="text-center py-20 text-gray-500">Gagal memuat jadwal.</p>`;
    showLoading(false);
    return;
  }

  let html = `
    <div class="animate-fadeIn px-1">
        <div class="flex items-center gap-4 mb-10">
            <div class="w-12 h-12 bg-purple-600/20 rounded-2xl flex items-center justify-center text-purple-500 shadow-xl">
                <i class="fas fa-calendar-alt text-xl"></i>
            </div>
            <div>
                <h1 class="text-3xl font-black uppercase tracking-tighter">Release Schedule</h1>
                <p class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Find out when your favorite anime airs</p>
            </div>
        </div>
        <div class="space-y-12">
  `;

  data.forEach((dayGroup) => {
    html += `
        <section>
            <h2 class="text-xl font-black mb-6 border-l-4 border-purple-500 pl-4 uppercase tracking-tighter">${dayGroup.day}</h2>
            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                ${dayGroup.animeList
                  .map((anime) => {
                    // TRIK: Mengambil gambar langsung dari server Otakudesu berdasarkan slug
                    // Ini jauh lebih cepat daripada fetch API detail satu per satu
                    const predictedThumb = `https://otakudesu.cloud/wp-content/uploads/2023/07/${anime.slug}.jpg`;
                    // Catatan: Jika pola URL di atas berubah, kita bisa gunakan placeholder atau
                    // tetap menggunakan thumb dari detail jika tersedia.

                    return `
                    <div onclick="app.loadDetail('${anime.slug}')" 
                         class="bg-[#121212]/50 border border-gray-800/50 p-3 rounded-2xl flex items-center gap-4 hover:border-purple-500/50 hover:bg-purple-500/5 transition-all duration-300 cursor-pointer group">
                        
                        <div class="w-14 h-20 flex-shrink-0 bg-gray-800 rounded-xl overflow-hidden shadow-lg">
                            <img src="${predictedThumb}" 
                                 class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                                 alt="${anime.title}"
                                 onerror="this.src='https://via.placeholder.com/150x200?text=No+Image'">
                        </div>

                        <div class="flex-grow min-w-0">
                            <h3 class="text-sm font-bold text-gray-200 line-clamp-2 group-hover:text-purple-500 transition-colors leading-tight">${anime.title}</h3>
                            <div class="flex items-center gap-2 mt-2">
                                <span class="w-1.5 h-1.5 rounded-full bg-purple-500 animate-pulse"></span>
                                <span class="text-[9px] font-black text-gray-500 uppercase tracking-widest">Update Weekly</span>
                            </div>
                        </div>

                        <div class="mr-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <i class="fas fa-chevron-right text-purple-500 text-xs"></i>
                        </div>
                    </div>
                `;
                  })
                  .join("")}
            </div>
        </section>
    `;
  });

  html += `</div></div>`;
  display.innerHTML = html;
  showLoading(false);
}
