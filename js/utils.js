// Fungsi Loading (Biarkan seperti semula)
export function showLoading(show) {
  const loader = document.getElementById("loading");
  if (loader) {
    if (show) loader.classList.remove("hidden");
    else loader.classList.add("hidden");
  }
}

// Fungsi Render Card Dinamis untuk SEMUA Halaman
export function createAnimeCard(anime, onClick) {
  let topLeftBadge = "";

  // 1. PRIORITAS UTAMA: Cek apakah ada properti 'extra' (Biasanya dari page Completed)border-[#ff6600]
  if (anime.extra) {
    topLeftBadge = `
            <div class="absolute top-2 left-2 bg-gray-900/90 backdrop-blur-md border border-gray-700 text-yellow-500 text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1 z-10">
                <i class="fas fa-star text-[8px]"></i> ${anime.extra}
            </div>
        `;
  }
  // 2. FALLBACK: Jika tidak ada 'extra', gunakan logika Ongoing / Completed
  else {
    const statusVal = (anime.status || "").toLowerCase();
    const epText = (anime.episode || anime.eps || "").toLowerCase();

    const isCompleted =
      statusVal.includes("complete") ||
      statusVal.includes("tamat") ||
      statusVal.includes("lengkap") ||
      epText.includes("end") ||
      epText.includes("tamat");

    if (isCompleted) {
      const ratingScore = anime.score || anime.rating || "N/A";
      topLeftBadge = `
                <div class="absolute top-2 left-2 bg-gray-900/90 backdrop-blur-md border border-gray-700 text-yellow-500 text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded shadow-lg flex items-center gap-1 z-10">
                    <i class="fas fa-star text-[8px]"></i> ${ratingScore}
                </div>
            `;
    } else {
      topLeftBadge = `
                <div class="absolute top-2 left-2 bg-[#ff6600] text-white text-[8px] md:text-[9px] font-black px-2 py-0.5 rounded shadow-lg uppercase tracking-widest z-10">
                    ONGOING
                </div>
            `;
    }
  }

  // Teks episode di pojok kanan atas
  const displayEp = anime.episode || anime.eps || "?";

  return `
        <div class="cursor-pointer group animate-fadeIn" onclick="${onClick}">
            <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-900 mb-2 shadow-lg">
                <img src="${anime.thumb || anime.thumbnail}" 
                     class="w-full h-full object-cover group-hover:scale-110 transition duration-500" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x400?text=No+Image';">
                
                ${topLeftBadge}
                
                <div class="absolute top-2 right-2 bg-black/80 text-white font-bold text-[8px] md:text-[9px] px-2 py-0.5 rounded backdrop-blur-sm z-10 border border-gray-800">
                    ${displayEp}
                </div>
            </div>
            
            <h3 class="text-xs md:text-sm font-bold group-hover:text-[#ff6600] line-clamp-2 leading-tight text-gray-200 transition-colors">
                ${anime.title}
            </h3>
        </div>
    `;
}

export function createPagination(currentPage, type) {
  return `
        <div class="flex justify-center items-center gap-4 mt-8 mb-8">
            <button onclick="app.loadCategory('${type}', ${currentPage - 1})" 
                ${currentPage <= 1 ? 'disabled class="opacity-30"' : 'class="bg-gray-800 hover:bg-[#ff6600] px-6 py-2 rounded-xl font-bold transition"'}>Prev</button>
            <span class="bg-[#ff6600] px-4 py-2 rounded-xl font-bold">Page ${currentPage}</span>
            <button onclick="app.loadCategory('${type}', ${currentPage + 1})" 
                class="bg-gray-800 hover:bg-[#ff6600] px-6 py-2 rounded-xl font-bold transition">Next</button>
        </div>
    `;
}
