export function showLoading(status) {
  const loader = document.getElementById("loading");
  const display = document.getElementById("content-display");
  if (loader) loader.style.display = status ? "block" : "none";
  if (display) display.style.display = status ? "none" : "block";
}

export function createAnimeCard(anime, onClick) {
  // Logika penentuan status secara dinamis
  // Biasanya API Otakudesu memberikan info status di property 'status' atau kita bisa cek dari 'type'
  const isCompleted =
    anime.status?.toLowerCase() === "complete" ||
    anime.type?.toLowerCase() === "complete";
  const statusText = isCompleted ? "COMPLETED" : "ONGOING";
  const statusColor = isCompleted ? "bg-blue-600" : "bg-purple-600";

  return `
        <div class="cursor-pointer group animate-fadeIn" onclick="${onClick}">
            <div class="relative overflow-hidden rounded-xl aspect-[3/4] bg-gray-900 mb-2 shadow-lg">
                <img src="${anime.thumb}" class="w-full h-full object-cover group-hover:scale-110 transition duration-500" onerror="this.src='https://via.placeholder.com/300x400'">
                <div class="absolute top-2 left-2 ${statusColor} text-[9px] font-black px-2 py-0.5 rounded text-white shadow-md uppercase">
                    ${statusText}
                </div>
                <div class="absolute top-2 right-2 bg-black/60 text-white font-bold text-[9px] px-2 py-0.5 rounded backdrop-blur-sm">
                    ${anime.episode || anime.eps || "?"}
                </div>
            </div>
            <h3 class="text-sm font-bold group-hover:text-purple-500 line-clamp-2 leading-tight">${anime.title}</h3>
        </div>
    `;
}

export function createPagination(currentPage, type) {
  return `
        <div class="flex justify-center items-center gap-4 mt-8 mb-8">
            <button onclick="app.loadCategory('${type}', ${currentPage - 1})" 
                ${currentPage <= 1 ? 'disabled class="opacity-30"' : 'class="bg-gray-800 hover:bg-purple-600 px-6 py-2 rounded-xl font-bold transition"'}>Prev</button>
            <span class="bg-purple-600 px-4 py-2 rounded-xl font-bold">Page ${currentPage}</span>
            <button onclick="app.loadCategory('${type}', ${currentPage + 1})" 
                class="bg-gray-800 hover:bg-purple-600 px-6 py-2 rounded-xl font-bold transition">Next</button>
        </div>
    `;
}
