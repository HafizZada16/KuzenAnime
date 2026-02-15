import { fetchData } from "./api.js";
import { showLoading, createAnimeCard, createPagination } from "./utils.js";

export async function loadHome() {
  showLoading(true);
  const data = await fetchData("/home");
  const display = document.getElementById("content-display");
  display.innerHTML = "";
  if (data) {
    renderPreview(data.ongoing, "Ongoing Anime", "ongoing");
    renderPreview(data.complete, "Complete Anime", "complete");
  }
  showLoading(false);
}

export async function loadCategory(type, page = 1) {
  showLoading(true);
  // URL ganti saat buka kategori
  history.pushState(null, null, `/${type}?page=${page}`);
  const data = await fetchData(`/${type}?page=${page}`);
  const display = document.getElementById("content-display");
  display.innerHTML = `<h2 class="text-xl md:text-2xl font-black mb-6 border-l-4 border-purple-500 pl-4 uppercase tracking-tighter">${type} Anime</h2>`;
  let html = `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 md:gap-6">`;
  data.forEach(
    (a) =>
      (html += createAnimeCard(a, `app.loadDetail('${a.slug}', '${a.thumb}')`)),
  );
  html += `</div>` + createPagination(page, type);
  display.innerHTML = html;
  showLoading(false);
}

function renderPreview(list, title, type) {
  const display = document.getElementById("content-display");
  let html = `
        <div class="flex justify-between items-center mb-4 mt-8">
            <h2 class="text-lg md:text-2xl font-black border-l-4 border-purple-500 pl-3 uppercase tracking-tighter">${title}</h2>
            <span onclick="app.loadCategory('${type}', 1)" class="text-[10px] font-bold text-gray-500 hover:text-white cursor-pointer transition uppercase">View All <i class="fas fa-chevron-right ml-1"></i></span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
    `;
  list.slice(0, 6).forEach((a) => {
    // Tambahkan info status ke objek anime sebelum dikirim ke createAnimeCard
    const animeWithStatus = {
      ...a,
      status: type === "ongoing" ? "ongoing" : "complete",
    };
    html += createAnimeCard(
      animeWithStatus,
      `app.loadDetail('${a.slug}', '${a.thumb}')`,
    );
  });
  html += `</div>`;
  display.insertAdjacentHTML("beforeend", html);
}

export async function handleSearch() {
  // 1. Ambil nilai dari input yang tersedia (Mobile atau Desktop)
  const mobileInput = document.getElementById("search-input-mobile");
  const desktopInput = document.getElementById("search-input-desktop");
  const q = (mobileInput?.value || desktopInput?.value || "").trim();

  // 2. Validasi: Jangan jalankan jika input kosong
  if (!q) return;

  showLoading(true);

  // 3. Update URL browser agar user bisa menekan tombol 'Back'
  // Gunakan format /search agar router bisa mengenali halaman ini
  history.pushState(null, null, `/search?q=${encodeURIComponent(q)}`);

  try {
    const data = await fetchData(`/search?q=${q}`);
    const display = document.getElementById("content-display");

    if (display) {
      // Judul Hasil Pencarian
      display.innerHTML = `
        <div class="animate-fadeIn">
          <div class="flex items-center gap-3 mb-6 mt-2">
            <div class="w-1 h-6 bg-purple-500 rounded-full"></div>
            <h2 class="text-xl font-black uppercase tracking-tighter">
              Search Results: <span class="text-purple-500">"${q}"</span>
            </h2>
          </div>
          <div id="search-results-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6"></div>
        </div>
      `;

      const grid = document.getElementById("search-results-grid");

      if (data && data.length > 0) {
        let html = "";
        data.forEach((anime) => {
          // Gunakan app.loadDetail agar konsisten dengan kartu lainnya
          const imageUrl = anime.thumb || anime.thumbnail || "";
          html += createAnimeCard(
            anime,
            `app.loadDetail('${anime.slug}', '${imageUrl}')`,
          );
        });
        grid.innerHTML = html;
      } else {
        // Tampilan jika tidak ditemukan
        display.innerHTML = `
          <div class="text-center py-32 opacity-50">
            <i class="fas fa-search-minus text-5xl mb-4"></i>
            <p class="font-black uppercase text-xs tracking-[0.2em]">Anime tidak ditemukan</p>
            <button onclick="app.navigateTo('/')" class="mt-6 text-[10px] bg-gray-900 px-6 py-2 rounded-full font-bold hover:text-purple-500 transition">Kembali ke Home</button>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Search Error:", error);
  } finally {
    showLoading(false);
  }
}
