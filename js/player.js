import { fetchData } from "/js/api.js";
import { showLoading } from "/js/utils.js";
import { USER_API, SANKA_API, ANIME_API } from "./config.js";

function getServerInfo(rawName) {
  const name = (rawName || "").toLowerCase();

  // KELOMPOK VIP (NO IKLAN) - Warna Hijau
  if (name.includes("ondesu")) {
    return {
      name: "ONDESU HD",
      badge: "No Iklan",
      color: "text-green-500 bg-green-500/10 border-green-500/20",
    };
  } else if (name.includes("otaku")) {
    return {
      name: "OTAKUWATCH HD",
      badge: "No Iklan",
      color: "text-green-500 bg-green-500/10 border-green-500/20",
    };
  } else if (name.includes("odstream")) {
    return {
      name: "ODSTREAM HD",
      badge: "No Iklan",
      color: "text-green-500 bg-green-500/10 border-green-500/20",
    };
  } else if (name.includes("mega")) {
    return {
      name: "MEGA",
      badge: "No Iklan",
      color: "text-green-500 bg-green-500/10 border-green-500/20",
    };
  } else if (name.includes("gdrive")) {
    return {
      name: "GDRIVE",
      badge: "No Iklan",
      color: "text-green-500 bg-green-500/10 border-green-500/20",
    };
  } else if (name.includes("moedesu")) {
    return {
      name: "MOEDESU HD",
      badge: "No Iklan",
      color: "text-green-500 bg-green-500/10 border-green-500/20",
    };
  }
  // KELOMPOK RAWAN IKLAN - Warna Kuning
  else if (name.includes("vidhide")) {
    return {
      name: "VIDHIDE",
      badge: "Iklan VAST",
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    };
  } else if (name.includes("filedon")) {
    return {
      name: "FILEDON",
      badge: "Iklan VAST",
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    };
  } else if (name.includes("yourupload")) {
    return {
      name: "YOURUPLOAD",
      badge: "Iklan VAST",
      color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20",
    };
  }
  // DEFAULT
  else {
    return {
      name: rawName.toUpperCase(),
      badge: "Auto",
      color: "text-gray-400 bg-gray-800/50 border-gray-700",
    };
  }
}

export async function loadPlayer(epSlug, forceAnimeSlug = null) {
  if (!epSlug) return;

  window.scrollTo({ top: 0, behavior: "smooth" });

  // 1. Matikan loading muter-muter jadul!
  showLoading(false);

  if (forceAnimeSlug) {
    localStorage.setItem("current_anime_slug", forceAnimeSlug);
  }

  history.pushState(null, null, `/episode/${epSlug}`);

  const display = document.getElementById("content-display");

  // 2. TAMPILKAN SKELETON PLAYER LANGSUNG SECARA INSTAN
  if (display) {
    let sidebarSkeleton = "";
    for (let i = 0; i < 6; i++) {
      sidebarSkeleton += `
            <div class="flex gap-3 group">
                <div class="w-16 h-20 flex-shrink-0 rounded-lg bg-gray-800 animate-pulse border border-gray-700"></div>
                <div class="flex flex-col justify-center min-w-0 flex-grow">
                    <div class="h-2.5 w-full bg-gray-700 rounded mb-2 animate-pulse"></div>
                    <div class="h-2 w-2/3 bg-gray-700 rounded animate-pulse"></div>
                </div>
            </div>`;
    }

    display.innerHTML = `
      <div class="flex flex-col lg:flex-row gap-6 animate-fadeIn px-1">
          <div class="lg:w-[75%]">
              <div class="bg-gray-800 rounded-2xl overflow-hidden aspect-video mb-6 relative animate-pulse border border-gray-700 flex items-center justify-center">
                  <i class="fas fa-play text-gray-700 text-6xl"></i>
              </div>

              <div class="mb-8">
                  <div class="h-6 md:h-8 w-3/4 bg-gray-800 rounded animate-pulse mb-3"></div>
                  <div class="flex gap-4">
                      <div class="h-3 w-24 bg-gray-800 rounded animate-pulse"></div>
                      <div class="h-3 w-20 bg-gray-800 rounded animate-pulse"></div>
                  </div>
              </div>

              <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl mb-6 shadow-sm">
                  <div class="h-3 w-32 bg-gray-800 rounded animate-pulse mb-5"></div>
                  <div class="flex gap-2">
                      <div class="h-8 w-20 bg-gray-800 rounded-lg animate-pulse"></div>
                      <div class="h-8 w-20 bg-gray-800 rounded-lg animate-pulse"></div>
                  </div>
              </div>

              <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl mb-8 shadow-sm">
                  <div class="flex justify-between items-center mb-5">
                      <div class="h-3 w-32 bg-gray-800 rounded animate-pulse"></div>
                      <div class="h-3 w-16 bg-gray-800 rounded animate-pulse"></div>
                  </div>
                  <div class="flex flex-wrap gap-2">
                      ${Array(12).fill('<div class="h-8 w-10 bg-gray-800 rounded-lg animate-pulse"></div>').join("")}
                  </div>
              </div>
          </div>

          <div class="lg:w-[25%] hidden lg:block">
              <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl sticky top-24">
                  <div class="h-4 w-32 bg-gray-800 rounded mb-6 animate-pulse border-b border-gray-800 pb-3"></div>
                  <div class="space-y-4">
                      ${sidebarSkeleton}
                  </div>
              </div>
          </div>
      </div>
    `;
  }

  // 3. SEKARANG JALANKAN PROSES FETCH YANG BERAT DI LATAR BELAKANG
  const data = await fetchData(`/episode/${epSlug}`);

  if (!data || !data.mirrors) {
    if (display)
      display.innerHTML = `<div class="text-center py-20 text-red-500 font-bold uppercase text-[10px]">Gagal memuat data episode.</div>`;
    return;
  }

  document.title = `Nonton ${data.title} - KuzenAnime`;
  let animeSlug = forceAnimeSlug;

  if (!animeSlug) {
    try {
      const sankaRes = await fetch(`${SANKA_API}/episode/${epSlug}`);
      if (sankaRes.ok) {
        const sankaJson = await sankaRes.json();
        if (sankaJson.data && sankaJson.data.animeId) {
          animeSlug = sankaJson.data.animeId;
        }
      }
    } catch (e) {
      console.warn("Sanka API gagal dihubungi, lanjut pakai fallback.");
    }
  }

  if (!animeSlug) {
    if (data.anime_url) {
      animeSlug = data.anime_url.split("/").filter(Boolean).pop();
    } else {
      animeSlug = epSlug.split("-episode-")[0] + "-sub-indo";
    }
  }

  localStorage.setItem("current_anime_slug", animeSlug);
  const animeData = await fetchData(`/anime/${animeSlug}`);
  console.log("TOTAL EPISODE ASLI DARI API:", animeData.episodes.length);
  saveToHistory(data, animeData, animeSlug, epSlug);

  let regularEpisodes = [];
  if (animeData?.episodes) {
    regularEpisodes = animeData.episodes
      .filter((ep) => {
        const titleLower = ep.title.toLowerCase();
        return (
          !titleLower.includes("batch") && !titleLower.includes("sub indo :")
        );
      })
      .reverse();
  }

  const homeData = await fetchData("/home");
  const recommendations = homeData?.ongoing?.slice(0, 10) || [];

  const qualities = [
    ...new Set(data.mirrors.map((m) => m.payload?.q).filter(Boolean)),
  ];
  const defaultQuality = qualities.includes("720p")
    ? "720p"
    : qualities[0] || "";

  const currentIndex = regularEpisodes.findIndex((ep) => ep.slug === epSlug);
  const prevEp = currentIndex > 0 ? regularEpisodes[currentIndex - 1] : null;
  const nextEp =
    currentIndex !== -1 && currentIndex < regularEpisodes.length - 1
      ? regularEpisodes[currentIndex + 1]
      : null;

  const navigationHtml = `
      <div class="flex justify-end items-center gap-2 md:gap-3 mb-6 w-full animate-fadeIn">
          ${
            prevEp
              ? `<button onclick="app.loadPlayer('${prevEp.slug}', '${animeSlug}')" class="bg-gray-800/60 hover:bg-[#ff6600] text-gray-400 hover:text-white py-1.5 px-3 md:px-4 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 border border-gray-700/50 hover:border-[#ff6600] group shadow-sm">
                  <i class="fas fa-chevron-left text-[8px] group-hover:-translate-x-0.5 transition-transform"></i> <span>Prev</span>
                 </button>`
              : ``
          }
          ${
            nextEp
              ? `<button onclick="app.loadPlayer('${nextEp.slug}', '${animeSlug}')" class="bg-[#ff6600] hover:bg-[#e65c00] text-white py-1.5 px-3 md:px-4 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 shadow-md shadow-[#ff6600]/20 group border border-[#ff6600]">
                  <span>Next</span> <i class="fas fa-chevron-right text-[8px] group-hover:translate-x-0.5 transition-transform"></i>
                 </button>`
              : ``
          }
      </div>
  `;

  // 4. SETELAH SEMUA DATA SIAP, TIMPA SKELETON DENGAN HTML ASLI
  if (display) {
    display.innerHTML = `
        <div class="flex flex-col lg:flex-row gap-6 animate-fadeIn px-1">
            <div class="lg:w-[75%]">
                <div id="video-wrapper" class="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 aspect-video mb-6 relative group">
                    <iframe src="${data.default_stream || ""}" 
                        allowfullscreen="true" 
                        webkitallowfullscreen="true" 
                        mozallowfullscreen="true" 
                        frameborder="0" 
                        scrolling="no" 
                        referrerpolicy="no-referrer"
                        class="w-full h-full border-none absolute top-0 left-0">
                    </iframe>
                </div>

                <div class="mb-8">
                    <h1 class="text-xl md:text-2xl font-black mb-2 tracking-tight text-white">${data.title}</h1>
                    <div class="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span class="text-[#ff6600]"><i class="fas fa-tv mr-1"></i> ${animeData?.title || "Streaming"}</span>
                        <span><i class="fas fa-clock mr-1"></i> ${data.posted || "Updated"}</span>
                    </div>
                </div>

                ${navigationHtml}

                <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl mb-6 shadow-sm">
                    <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                        <div class="flex-grow w-full">
                            <h3 class="text-[10px] font-black mb-4 flex items-center gap-2 uppercase tracking-[0.2em] text-gray-400">
                                <i class="fas fa-server text-[#ff6600]"></i> Pilih Server
                            </h3>
                            <div id="mirror-list" class="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 md:gap-3"></div>
                        </div>
                        <div class="flex-shrink-0 w-full md:w-auto">
                            <h3 class="text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-gray-400 md:text-right">Kualitas</h3>
                            <div class="flex bg-gray-800 p-1 rounded-xl w-fit md:ml-auto">
                                ${qualities
                                  .map(
                                    (q) => `
                                    <button onclick="app.changeQuality('${q}', '${btoa(JSON.stringify(data.mirrors))}')" 
                                        id="q-${q}"
                                        class="quality-btn px-4 py-1.5 rounded-lg text-[10px] font-black transition uppercase ${q === defaultQuality ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-white"}">
                                        ${q}
                                    </button>`,
                                  )
                                  .join("")}
                            </div>
                        </div>
                    </div>
                </div>

                <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl mb-8 shadow-sm">
                    <div class="flex justify-between items-center mb-5">
                        <h3 class="text-[10px] font-black uppercase tracking-widest text-gray-400 flex items-center gap-2">
                            <i class="fas fa-th-large text-[#ff6600]"></i> Pilih Episode
                        </h3>
                        <span class="text-[9px] text-gray-600 font-black uppercase">Total: ${regularEpisodes.length}</span>
                    </div>
                    
                    <div class="flex flex-wrap gap-2 max-h-64 overflow-y-auto pr-2 custom-scrollbar">
                        ${regularEpisodes
                          .map((ep, index) => {
                            const isCurrent = ep.slug === epSlug;

                            // LOGIKA BARU: Ekstrak nomor episode asli dari judul
                            let epNumber = index + 1; // Fallback
                            // Cari pola kata "Episode 1155" atau "Eps 1155" di judul
                            const match = ep.title.match(
                              /(?:Episode|Eps)\s*([\d\.]+)/i,
                            );
                            if (match) {
                              epNumber = match[1];
                            } else {
                              // Jika tidak ada kata "Episode", cari angka pertama yang muncul
                              const numMatch =
                                ep.title.match(/\b\d+(\.\d+)?\b/);
                              if (numMatch) epNumber = numMatch[0];
                            }

                            return `
                                <button onclick="app.loadPlayer('${ep.slug}')" 
                                    class="px-3 py-1.5 min-w-[32px] rounded-lg text-[10px] font-black transition-all duration-300 uppercase
                                    ${isCurrent ? "bg-[#ff6600] text-white shadow-lg shadow-orange-500/30 ring-1 ring-orange-400" : "bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:bg-gray-700 hover:text-white"}">
                                    ${epNumber}
                                </button>
                            `;
                          })
                          .join("")}
                    </div>
                </div>
            </div>

            <div class="lg:w-[25%] text-white">
                <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl sticky top-24">
                    <h3 class="text-xs font-black mb-6 border-b border-gray-800 pb-3 flex items-center gap-2 uppercase tracking-widest text-gray-300">
                        <i class="fas fa-fire text-orange-500"></i> Rekomendasi
                    </h3>
                    <div class="space-y-4">
                        ${recommendations
                          .map(
                            (anime) => `
                            <div onclick="app.loadDetail('${anime.slug}')" class="flex gap-3 group cursor-pointer">
                                <div class="w-16 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800 border border-gray-700">
                                    <img src="${anime.thumb}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300" onerror="this.onerror=null; this.src='https://via.placeholder.com/150x200?text=No+Image';">
                                </div>
                                <div class="flex flex-col justify-center min-w-0">
                                    <h4 class="text-[10px] font-bold line-clamp-2 group-hover:text-[#ff6600] transition-colors leading-tight">${anime.title}</h4>
                                    <span class="text-[8px] text-gray-500 mt-1 font-black uppercase tracking-tighter">${anime.episode || "Ongoing"}</span>
                                </div>
                            </div>`,
                          )
                          .join("")}
                    </div>
                </div>
            </div>
        </div>`;
  }

  if (defaultQuality) {
    window.app.changeQuality(
      defaultQuality,
      btoa(JSON.stringify(data.mirrors)),
    );
  }
}

// SISA FUNGSI DI BAWAH INI SAMA PERSIS (changeQuality, switchServer, saveToHistory)
export const changeQuality = (selectedQ, encodedMirrors) => {
  try {
    const mirrors = JSON.parse(atob(encodedMirrors));
    const container = document.getElementById("mirror-list");

    document.querySelectorAll(".quality-btn").forEach((btn) => {
      btn.classList.remove("bg-white", "text-black", "shadow-md");
      btn.classList.add("text-gray-400");
    });

    const targetBtn = document.getElementById(`q-${selectedQ}`);
    if (targetBtn)
      targetBtn.classList.add("bg-white", "text-black", "shadow-md");

    const filtered = mirrors.filter((m) => m.payload?.q === selectedQ);

    // Looping dengan fungsi getServerInfo
    container.innerHTML = filtered
      .map((m) => {
        const info = getServerInfo(m.name);
        return `
        <button onclick="app.switchServer('${btoa(JSON.stringify(m.payload))}', this)" 
            class="server-btn flex flex-col items-start p-2.5 rounded-xl border border-gray-700 hover:border-[#ff6600] bg-gray-800/50 hover:bg-gray-800 transition-all flex-1 sm:flex-none min-w-[120px] text-left group shadow-sm active:scale-95 overflow-hidden">
            
            <span class="server-title font-black text-[9px] md:text-[10px] tracking-widest uppercase mb-1.5 text-gray-300 group-hover:text-white transition-colors truncate w-full">
                <i class="mr-1 text-[#ff6600]"></i> ${info.name}
            </span>
            
            <span class="text-[7px] md:text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${info.color} whitespace-nowrap">
                ${info.badge}
            </span>
        </button>`;
      })
      .join("");
  } catch (e) {
    console.error("Error changing quality:", e);
  }
};

export async function switchServer(encodedPayload, btnElement = null) {
  // LOGIKA PENANDA SERVER AKTIF (Biar tombol tetep Oren)
  if (btnElement) {
    // Hapus warna oren dari SEMUA tombol server dulu
    document.querySelectorAll(".server-btn").forEach((btn) => {
      btn.classList.remove(
        "border-[#ff6600]",
        "bg-gray-800",
        "ring-1",
        "ring-[#ff6600]/50",
      );
      btn.classList.add("border-gray-700", "bg-gray-800/50");

      const title = btn.querySelector(".server-title");
      if (title) {
        title.classList.remove("text-white");
        title.classList.add("text-gray-300");
      }
    });

    // Tambahkan warna oren & ring terang ke tombol YANG DIKLIK
    btnElement.classList.remove("border-gray-700", "bg-gray-800/50");
    btnElement.classList.add(
      "border-[#ff6600]",
      "bg-gray-800",
      "ring-1",
      "ring-[#ff6600]/50",
    );

    const title = btnElement.querySelector(".server-title");
    if (title) {
      title.classList.remove("text-gray-300");
      title.classList.add("text-white");
    }
  }

  // KODE FETCH IFRAME (Tetap Sama Persis)
  const payload = JSON.parse(atob(encodedPayload));
  const wrapper = document.getElementById("video-wrapper");
  wrapper.innerHTML = `<div class="flex items-center justify-center h-full text-white bg-black/50"><i class="fas fa-circle-notch animate-spin text-4xl text-[#ff6600]"></i></div>`;

  try {
    const res = await fetch(`${ANIME_API}/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data && data.iframe) {
      wrapper.innerHTML = `
        <iframe src="${data.iframe}" 
            allowfullscreen="true" 
            webkitallowfullscreen="true" 
            mozallowfullscreen="true" 
            frameborder="0" 
            scrolling="no" 
            referrerpolicy="no-referrer"
            class="w-full h-full border-none absolute top-0 left-0">
        </iframe>`;
    } else {
      throw new Error("Iframe not found");
    }
  } catch (err) {
    wrapper.innerHTML = `<div class="flex items-center justify-center h-full text-red-500 text-[10px] font-bold uppercase">Gagal memuat server.</div>`;
  }
}

async function saveToHistory(episodeData, animeData, animeSlug, epSlug) {
  const token = localStorage.getItem("kuzen_token");
  if (!token) return;

  try {
    const res = await fetch(`${USER_API}/history`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        anime_slug: animeSlug,
        anime_title: animeData?.title || "Unknown Anime",
        anime_thumb:
          localStorage.getItem(`saved_thumb_${animeSlug}`) || animeData?.thumb,
        episode_slug: epSlug,
        episode_title: episodeData.title,
      }),
    });
    if (!res.ok) throw new Error("Server bermasalah");
  } catch (err) {
    console.error("🚨 DETAIL ERROR:", err);
    console.log("Gagal auto-save history");
  }
}
