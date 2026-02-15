import { USER_API } from "./config.js";
import { fetchData } from "/js/api.js";
import { showLoading } from "/js/utils.js";

export async function loadDetail(slug, thumbFromHome = null) {
  showLoading(true);

  // 1. SIMPAN THUMBNAIL DARI HALAMAN SEBELUMNYA KE LOCALSTORAGE (CACHING)
  if (thumbFromHome) {
    localStorage.setItem(`saved_thumb_${slug}`, thumbFromHome);
  }

  localStorage.setItem("current_anime_slug", slug);
  history.pushState(null, null, `/anime/${slug}`);

  const data = await fetchData(`/anime/${slug}`);
  const display = document.getElementById("content-display");
  if (display) display.innerHTML = "";

  if (!data) {
    display.innerHTML = `<div class="text-center py-20 text-red-500 font-bold uppercase tracking-widest text-[10px]">Gagal memuat detail anime.</div>`;
    showLoading(false);
    return;
  }

  // 2. TENTUKAN GAMBAR (Prioritas: API -> Cache LocalStorage -> Loading Placeholder)
  let thumb =
    data.thumb ||
    data.thumbnail ||
    localStorage.getItem(`saved_thumb_${slug}`) ||
    "https://via.placeholder.com/300x400?text=Loading+Image...";

  const title = data.title || "Unknown Title";
  const sinopsis =
    data.sinopsis || data.synopsis || "Tidak ada sinopsis tersedia.";
  const rating = data.score || data.rating || "N/A";
  const type = data.type || "TV";

  // --- LOGIKA STATUS DINAMIS ---
  const statusVal = data.status || "";
  const isCompleted =
    statusVal.toLowerCase().includes("lengkap") ||
    statusVal.toLowerCase().includes("complete") ||
    statusVal.toLowerCase().includes("tamat");

  const statusText = isCompleted ? "Completed" : "Ongoing";
  const statusTextColor = isCompleted ? "text-blue-400" : "text-purple-400";

  // --- LOGIKA FILTER BATCH & EPISODE REGULER ---
  const batchEpisodes = [];
  const regularEpisodes = [];

  if (data.episodes) {
    data.episodes.forEach((ep) => {
      const titleLower = ep.title.toLowerCase();
      if (titleLower.includes("batch") || titleLower.includes("sub indo :")) {
        batchEpisodes.push(ep);
      } else {
        regularEpisodes.push(ep);
      }
    });
  }

  const totalEps =
    regularEpisodes.length > 0
      ? regularEpisodes.length
      : data.total_episodes || data.total_episode || "?";

  // RENDER HTML
  display.innerHTML = `
    <div class="animate-fadeIn relative">
        <button onclick="window.history.back()" class="flex items-center gap-2 text-gray-300 hover:text-white font-bold text-sm mb-6 transition-colors w-fit group">
            <i class="fas fa-arrow-left group-hover:-translate-x-1 transition-transform"></i> Back
        </button>

        <div class="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">
            <div class="w-48 sm:w-56 md:w-72 mx-auto md:mx-0 flex-shrink-0">
                <img id="detail-poster" src="${thumb}" 
                     class="w-full rounded-2xl shadow-2xl border border-gray-800 object-cover aspect-[3/4] transition-all duration-500" 
                     onerror="this.onerror=null; this.src='https://via.placeholder.com/300x400?text=No+Image';">
            </div>
            
            <div class="flex-grow text-center md:text-left">
                <h1 class="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-none">${title}</h1>
                
                <div id="bookmark-container" class="flex justify-center md:justify-start mb-6"></div>

                <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    ${
                      data.genres
                        ? data.genres
                            .map((g) => {
                              const genreName =
                                typeof g === "string" ? g : g.name || "";
                              return genreName
                                ? `<span class="bg-gray-800/50 border border-gray-700 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-400">${genreName}</span>`
                                : "";
                            })
                            .join("")
                        : ""
                    }
                </div>
                
                <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left">
                    <div class="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                        <p class="text-[9px] font-black text-gray-500 uppercase mb-1">Status</p>
                        <p class="text-xs font-bold ${statusTextColor}">${statusText}</p>
                    </div>
                    <div class="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                        <p class="text-[9px] font-black text-gray-500 uppercase mb-1">Rating</p>
                        <p class="text-xs font-bold text-yellow-500"><i class="fas fa-star mr-1"></i> ${rating}</p>
                    </div>
                    <div class="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                        <p class="text-[9px] font-black text-gray-500 uppercase mb-1">Total Episode</p>
                        <p class="text-xs font-bold text-white">${totalEps}</p>
                    </div>
                    <div class="bg-gray-900/50 p-4 rounded-2xl border border-gray-800">
                        <p class="text-[9px] font-black text-gray-500 uppercase mb-1">Type</p>
                        <p class="text-xs font-bold text-white">${type}</p>
                    </div>
                </div>

                <div class="bg-gray-900/30 p-6 rounded-2xl border border-gray-800 italic text-left">
                    <p class="text-sm text-gray-400 leading-relaxed">"${sinopsis}"</p>
                </div>
            </div>
        </div>

        <div class="bg-[#121212] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-inner">
            <h2 class="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter">
                <i class="fas fa-list-ul text-purple-500"></i> Episode List
            </h2>

            ${
              batchEpisodes.length > 0
                ? `
                <div class="mb-8 bg-orange-900/10 border border-orange-900/30 p-5 rounded-2xl">
                    <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                        <i class="fas fa-box-open text-orange-500"></i> Download Batch & Lengkap
                    </h3>
                    <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                        ${batchEpisodes
                          .map(
                            (ep) => `
                            <div onclick="app.loadBatch('${ep.slug}')" class="bg-orange-900/20 hover:bg-orange-600 border border-orange-700/50 hover:border-orange-400 p-4 rounded-xl cursor-pointer transition-all group shadow-sm">
                                <div class="flex justify-between items-center">
                                    <span class="text-xs font-bold text-orange-400 group-hover:text-white transition truncate pr-4">${ep.title}</span>
                                    <i class="fas fa-download text-orange-600 group-hover:text-white transition text-lg"></i>
                                </div>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
            `
                : ""
            }

            <div>
                <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                    <i class="fas fa-play text-purple-500"></i> Streaming Reguler
                </h3>
                <div class="flex flex-col gap-3">
                    ${
                      regularEpisodes.length > 0
                        ? regularEpisodes
                            .map(
                              (ep) => `
                        <div onclick="app.loadPlayer('${ep.slug}')" class="bg-gray-900/50 hover:bg-purple-600 border border-gray-800 hover:border-purple-400 p-4 rounded-xl cursor-pointer transition-all group">
                            <div class="flex justify-between items-center">
                                <span class="text-xs font-bold group-hover:text-white transition truncate pr-4 text-gray-300">${ep.title}</span>
                                <i class="fas fa-play-circle text-gray-700 group-hover:text-white transition text-lg"></i>
                            </div>
                        </div>
                    `,
                            )
                            .join("")
                        : '<p class="text-gray-500 text-[10px] uppercase font-bold tracking-widest ml-1">Belum ada episode reguler.</p>'
                    }
                </div>
            </div>
        </div>
    </div>
    `;

  showLoading(false);

  // Jalankan Inisialisasi Bookmark
  initBookmarkButton({
    slug: slug,
    title: title,
    thumb: thumb,
  });

  if (
    !data.thumb &&
    !data.thumbnail &&
    !localStorage.getItem(`saved_thumb_${slug}`)
  ) {
    fetchThumbBackground(slug);
  }
}

// ==========================================
// LOGIKA BOOKMARK (MY LIST)
// ==========================================

async function initBookmarkButton(animeData) {
  const token = localStorage.getItem("kuzen_token");
  const container = document.getElementById("bookmark-container");
  if (!container) return;

  if (!token) {
    container.innerHTML = `
            <button onclick="window.app.showAuthModal(true)" class="bg-gray-800/50 hover:bg-gray-700 text-white px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 border border-gray-700">
                <i class="far fa-heart text-purple-500"></i> Login to Add My List
            </button>`;
    return;
  }

  try {
    const res = await fetch(`${USER_API}/bookmarks/check/${animeData.slug}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const result = await res.json();
    renderBookmarkButton(result.isBookmarked, animeData);
  } catch (err) {
    console.error("Gagal cek status bookmark:", err);
  }
}

function renderBookmarkButton(isBookmarked, animeData) {
  const container = document.getElementById("bookmark-container");
  const titleClean = animeData.title.replace(/'/g, "\\'");

  container.innerHTML = `
        <button onclick="handleBookmarkToggle('${animeData.slug}', '${titleClean}', '${animeData.thumb}')" 
            class="${isBookmarked ? "bg-purple-600 shadow-purple-600/30" : "bg-gray-800/80"} hover:scale-105 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg border border-white/5">
            <i class="${isBookmarked ? "fas text-white" : "far text-purple-500"} fa-heart ${isBookmarked ? "animate-pulse" : ""}"></i> 
            ${isBookmarked ? "Saved to My List" : "Add to My List"}
        </button>
    `;
}

window.handleBookmarkToggle = async (slug, title, thumb) => {
  const token = localStorage.getItem("kuzen_token");
  if (!token) return window.app.showAuthModal(true);

  try {
    const res = await fetch(`${API_URL}/bookmarks/toggle`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        anime_slug: slug,
        anime_title: title,
        anime_thumb: thumb,
      }),
    });
    const result = await res.json();

    if (result.status === "success") {
      initBookmarkButton({ slug, title, thumb });
    }
  } catch (err) {
    console.error("Error toggle bookmark:", err);
  }
};

// Fungsi Background Fetch
async function fetchThumbBackground(slug) {
  try {
    const query = slug
      .replace(/-episode-\d+|-sub-indo|-batch/g, "")
      .replace(/-/g, " ")
      .trim();
    const searchData = await fetchData(`/search/${query}`);
    if (searchData && searchData.length > 0) {
      const match =
        searchData.find(
          (item) => item.slug.includes(slug) || slug.includes(item.slug),
        ) || searchData[0];
      const realThumb = match.thumb || match.thumbnail;
      if (realThumb) {
        const posterEl = document.getElementById("detail-poster");
        if (posterEl) posterEl.src = realThumb;
        localStorage.setItem(`saved_thumb_${slug}`, realThumb);
      }
    }
  } catch (e) {
    console.log("Background thumb fetch failed");
  }
}
