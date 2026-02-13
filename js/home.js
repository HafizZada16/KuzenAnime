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
  list
    .slice(0, 6)
    .forEach(
      (a) =>
        (html += createAnimeCard(
          a,
          `app.loadDetail('${a.slug}', '${a.thumb}')`,
        )),
    );
  html += `</div>`;
  display.insertAdjacentHTML("beforeend", html);
}

export async function handleSearch() {
  const q = document.getElementById("search-input").value;
  if (!q) return;

  showLoading(true);

  // Update URL browser agar user bisa menekan tombol 'Back'
  history.pushState(null, null, `/search?q=${q}`);

  const data = await fetchData(`/search?q=${q}`);
  const display = document.getElementById("content-display");

  if (display) {
    display.innerHTML = `
      <div class="animate-fadeIn">
        <h2 class="text-xl font-bold mb-6 mt-6 border-l-4 border-purple-500 pl-3 uppercase">
          Hasil Pencarian: <span class="text-purple-500">${q}</span>
        </h2>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
    `;

    if (data && data.length > 0) {
      let html = "";
      data.forEach((a) => {
        // Gunakan app.loadDetail agar konsisten dengan kartu lainnya
        html += createAnimeCard(a, `app.loadDetail('${a.slug}')`);
      });
      display.querySelector(".grid").innerHTML = html;
    } else {
      display.innerHTML += `
        <div class="col-span-full text-center py-20">
          <p class="text-gray-500 uppercase font-black text-xs tracking-widest">Anime tidak ditemukan</p>
        </div>
      `;
    }
    display.innerHTML += `</div></div>`;
  }
  showLoading(false);
}
