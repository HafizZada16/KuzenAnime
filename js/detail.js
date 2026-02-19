import { USER_API } from "./config.js";
import { fetchData } from "/js/api.js";
import { showLoading } from "/js/utils.js";

// Fungsi rahasia mengambil sinopsis dari API Sanka menggunakan "slug" yang sama
async function fetchSynopsisFromSanka(slug) {
  try {
    const response = await fetch(
      `https://www.sankavollerei.com/anime/anime/${slug}`,
    );

    if (!response.ok) throw new Error("Gagal mengambil data dari Sanka");

    const result = await response.json();

    if (
      result.data &&
      result.data.synopsis &&
      result.data.synopsis.paragraphs
    ) {
      const paragraphsArray = result.data.synopsis.paragraphs;

      if (paragraphsArray.length > 0) {
        const joinedSynopsis = paragraphsArray.join("<br><br>");
        return joinedSynopsis;
      }
    }

    return "Sinopsis belum tersedia untuk anime ini.";
  } catch (error) {
    console.warn("Sanka API Error, menggunakan teks default:", error);
    return "Sinopsis resmi belum tersedia. Selamat menonton!";
  }
}

export async function loadDetail(slug, thumbFromHome = null) {
  window.scrollTo({ top: 0, behavior: "smooth" });
  // 1. Matikan loading spinner bawaan!
  showLoading(false);

  if (thumbFromHome) {
    localStorage.setItem(`saved_thumb_${slug}`, thumbFromHome);
  }

  localStorage.setItem("current_anime_slug", slug);
  history.pushState(null, null, `/anime/${slug}`);

  const display = document.getElementById("content-display");

  // 2. TAMPILKAN SKELETON DETAIL (Meniru Layout Asli)
  if (display) {
    display.innerHTML = `
      <div class="animate-fadeIn relative">
          <div class="w-16 h-4 bg-gray-800 rounded animate-pulse mb-6"></div>

          <div class="flex flex-col md:flex-row gap-6 md:gap-8 mb-10">
              <div class="w-48 sm:w-56 md:w-72 mx-auto md:mx-0 flex-shrink-0">
                  <div class="w-full aspect-[3/4] bg-gray-800 rounded-2xl animate-pulse border border-gray-700 shadow-2xl"></div>
              </div>
              
              <div class="flex-grow text-center md:text-left flex flex-col items-center md:items-start">
                  <div class="w-3/4 h-10 md:h-12 bg-gray-800 rounded-lg animate-pulse mb-4"></div>
                  
                  <div class="w-32 h-8 bg-gray-800 rounded-xl animate-pulse mb-6"></div>

                  <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                      <div class="w-16 h-6 bg-gray-800 rounded-lg animate-pulse"></div>
                      <div class="w-20 h-6 bg-gray-800 rounded-lg animate-pulse"></div>
                      <div class="w-14 h-6 bg-gray-800 rounded-lg animate-pulse"></div>
                  </div>
                  
                  <div class="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8 text-left w-full">
                      <div class="bg-gray-800/50 h-16 rounded-2xl animate-pulse border border-gray-700"></div>
                      <div class="bg-gray-800/50 h-16 rounded-2xl animate-pulse border border-gray-700"></div>
                      <div class="bg-gray-800/50 h-16 rounded-2xl animate-pulse border border-gray-700"></div>
                      <div class="bg-gray-800/50 h-16 rounded-2xl animate-pulse border border-gray-700"></div>
                  </div>

                  <div class="bg-gray-900/30 p-6 rounded-2xl border border-gray-800 w-full animate-pulse">
                      <div class="h-3 w-full bg-gray-700 rounded-full mb-3"></div>
                      <div class="h-3 w-5/6 bg-gray-700 rounded-full mb-3"></div>
                      <div class="h-3 w-4/6 bg-gray-700 rounded-full"></div>
                  </div>
              </div>
          </div>

          <div class="bg-[#121212] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-inner">
              <div class="w-40 h-6 bg-gray-800 rounded-lg animate-pulse mb-6"></div>
              <div class="flex flex-col gap-3">
                  <div class="h-14 w-full bg-gray-800/50 rounded-xl animate-pulse border border-gray-700"></div>
                  <div class="h-14 w-full bg-gray-800/50 rounded-xl animate-pulse border border-gray-700"></div>
                  <div class="h-14 w-full bg-gray-800/50 rounded-xl animate-pulse border border-gray-700"></div>
              </div>
          </div>
      </div>
    `;
  }

  // 3. Ambil data utama dari API Kanata
  const data = await fetchData(`/anime/${slug}`);

  // PERBAIKAN LOGIKA ERROR
  if (!data) {
    if (display) {
      display.innerHTML = `<div class="text-center py-20 text-red-500 font-bold uppercase tracking-widest text-[10px]">Gagal memuat detail anime.</div>`;
    }
    // Ganti judul ke pesan error agar user tahu
    document.title = "Gagal Memuat Detail - KuzenAnime";
    return;
  }

  // --- LOGIKA SEO: JALANKAN HANYA JIKA DATA ADA ---
  // 1. Update Judul Tab Browser Secara Dinamis
  const title = data.title || "Unknown Title";
  const rating = data.score || data.rating || "N/A";
  const type = data.type || "TV";
  let thumb =
    data.thumb ||
    data.thumbnail ||
    localStorage.getItem(`saved_thumb_${slug}`) ||
    "https://via.placeholder.com/300x400?text=Loading+Image...";
  document.title = `${title} Sub Indo - KuzenAnime`;

  // 2. Update Schema Markup untuk Google
  const oldSchema = document.getElementById("anime-schema");
  if (oldSchema) oldSchema.remove();

  const schemaData = {
    "@context": "https://schema.org",
    "@type": "Movie",
    name: title,
    description: data.synopsis || "Nonton streaming anime gratis di KuzenAnime",
    image: thumb,
    url: window.location.href,
  };

  const script = document.createElement("script");
  script.id = "anime-schema";
  script.type = "application/ld+json";
  script.text = JSON.stringify(schemaData);
  document.head.appendChild(script);

  // --- LOGIKA STATUS DINAMIS ---
  const statusVal = data.status || "";
  const isCompleted =
    statusVal.toLowerCase().includes("lengkap") ||
    statusVal.toLowerCase().includes("complete") ||
    statusVal.toLowerCase().includes("tamat");

  const statusText = isCompleted ? "Completed" : "Ongoing";
  const statusTextColor = isCompleted ? "text-blue-400" : "text-[#ff6600]";

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

  // 4. TIMPA SKELETON DENGAN HTML ASLI
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
                <h1 class="text-3xl md:text-5xl font-black mb-4 tracking-tighter leading-none text-white">${title}</h1>
                
                <div id="bookmark-container" class="flex justify-center md:justify-start mb-6"></div>

                <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-6">
                    ${
                      data.genres
                        ? data.genres
                            .map((g) => {
                              const genreName =
                                typeof g === "string" ? g : g.name || "";
                              return genreName
                                ? `<span class="bg-gray-800/50 border border-gray-700 px-3 py-1 rounded-lg text-[10px] font-bold text-gray-400 uppercase tracking-widest">${genreName}</span>`
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
                        <p class="text-xs font-bold text-white uppercase tracking-widest">${type}</p>
                    </div>
                </div>

                <div class="bg-gray-900/30 p-6 rounded-2xl border border-gray-800 italic text-left">
                    <p id="anime-synopsis" class="text-sm text-gray-400 leading-relaxed">
                        <span class="animate-pulse text-gray-500">Menarik data sinopsis...</span>
                    </p>
                </div>
            </div>
        </div>

        <div class="bg-[#121212] border border-gray-800 rounded-3xl p-6 md:p-8 shadow-inner">
            <h2 class="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tighter text-white">
                <i class="fas fa-list-ul text-[#ff6600]"></i> Episode List
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
                    <i class="fas fa-play text-[#ff6600]"></i> Streaming Reguler
                </h3>
                <div class="flex flex-col gap-3">
                    ${
                      regularEpisodes.length > 0
                        ? regularEpisodes
                            .map(
                              (ep) => `
                        <div onclick="app.loadPlayer('${ep.slug}')" class="bg-gray-900/50 hover:bg-[#ff6600] border border-gray-800 hover:border-[#ff6600] p-4 rounded-xl cursor-pointer transition-all group">
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

  // 5. EKSEKUSI API SANKA & BOOKMARK (Setelah HTML Tampil)
  const synopsisEl = document.getElementById("anime-synopsis");
  if (synopsisEl) {
    const sinopsisAsli = await fetchSynopsisFromSanka(slug);
    synopsisEl.innerHTML = sinopsisAsli;
  }

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
                <i class="far fa-heart text-[#ff6600]"></i> Login to Add My List
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
            class="${isBookmarked ? "bg-[#ff6600] shadow-[#ff6600]/30" : "bg-gray-800/80"} hover:scale-105 text-white px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all flex items-center gap-2 shadow-lg border border-white/5">
            <i class="${isBookmarked ? "fas text-white" : "far text-[#ff6600]"} fa-heart ${isBookmarked ? "animate-pulse" : ""}"></i> 
            ${isBookmarked ? "Saved to My List" : "Add to My List"}
        </button>
    `;
}

window.handleBookmarkToggle = async (slug, title, thumb) => {
  const token = localStorage.getItem("kuzen_token");
  if (!token) return window.app.showAuthModal(true);

  try {
    const res = await fetch(`${USER_API}/bookmarks/toggle`, {
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

      const isAdded = result.action === "added";
      Swal.fire({
        toast: true,
        position: "top-end",
        showConfirmButton: false,
        timer: 3000,
        timerProgressBar: true,
        icon: isAdded ? "success" : "info",
        title: isAdded ? "Tersimpan!" : "Dihapus!",
        text: result.message,
        background: "#1a1a1a",
        color: "#ffffff",
        customClass: {
          popup: "border border-gray-800 rounded-2xl shadow-2xl mt-16 md:mt-4",
        },
      });
    }
  } catch (err) {
    console.error("Error toggle bookmark:", err);
  }
};

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
