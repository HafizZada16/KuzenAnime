import { showLoading } from "/js/utils.js";
import { USER_API, SANKA_API } from "./config.js";

function getServerInfo(rawName) {
  const name = (rawName || "").toLowerCase().trim();

  // KELOMPOK VIP (NO IKLAN) - Warna Hijau
  if (name.includes("ondesu")) {
    return { name: "ONDESU HD", badge: "No Iklan", color: "text-green-500 bg-green-500/10 border-green-500/20" };
  } else if (name.includes("otaku")) {
    return { name: "OTAKUWATCH HD", badge: "No Iklan", color: "text-green-500 bg-green-500/10 border-green-500/20" };
  } else if (name.includes("odstream")) {
    return { name: "ODSTREAM HD", badge: "No Iklan", color: "text-green-500 bg-green-500/10 border-green-500/20" };
  } else if (name.includes("mega")) {
    return { name: "MEGA", badge: "No Iklan", color: "text-green-500 bg-green-500/10 border-green-500/20" };
  } else if (name.includes("gdrive")) {
    return { name: "GDRIVE", badge: "No Iklan", color: "text-green-500 bg-green-500/10 border-green-500/20" };
  } else if (name.includes("moedesu")) {
    return { name: "MOEDESU HD", badge: "No Iklan", color: "text-green-500 bg-green-500/10 border-green-500/20" };
  }
  // KELOMPOK RAWAN IKLAN - Warna Kuning
  else if (name.includes("vidhide")) {
    return { name: "VIDHIDE", badge: "Iklan VAST", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
  } else if (name.includes("filedon")) {
    return { name: "FILEDON", badge: "Iklan VAST", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
  } else if (name.includes("yourupload")) {
    return { name: "YOURUPLOAD", badge: "Iklan VAST", color: "text-yellow-500 bg-yellow-500/10 border-yellow-500/20" };
  }
  // DEFAULT
  else {
    return { name: (rawName || "SERVER").toUpperCase(), badge: "Auto", color: "text-gray-400 bg-gray-800/50 border-gray-700" };
  }
}

export async function loadPlayer(epSlug, forceAnimeSlug = null) {
  if (!epSlug) return;

  window.scrollTo({ top: 0, behavior: "smooth" });
  showLoading(false);

  if (forceAnimeSlug) {
    localStorage.setItem("current_anime_slug", forceAnimeSlug);
  }

  history.pushState(null, null, `/episode/${epSlug}`);

  const display = document.getElementById("content-display");

  // --- SKELETON PLAYER ---
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
            <div class="space-y-4">${sidebarSkeleton}</div>
          </div>
        </div>
      </div>`;
  }

  // --- FETCH DATA DARI SANKA API ---
  let epData = null;
  try {
    const res = await fetch(`${SANKA_API}/episode/${epSlug}`);
    if (res.ok) {
      const json = await res.json();
      if (json.data) epData = json.data;
    }
  } catch (e) {
    console.error("Sanka API gagal:", e);
  }

  if (!epData) {
    if (display)
      display.innerHTML = `<div class="text-center py-20 text-red-500 font-bold uppercase text-[10px]">Gagal memuat data episode.</div>`;
    return;
  }

  document.title = `Nonton ${epData.title} - KuzenAnime`;

  // Ambil animeId dari Sanka response
  let animeSlug = forceAnimeSlug || epData.animeId || null;

  if (!animeSlug) {
    animeSlug = epSlug.split("-episode-")[0] + "-sub-indo";
  }

  localStorage.setItem("current_anime_slug", animeSlug);

  // Fetch data anime untuk daftar episode & rekomendasi
  // Gunakan Sanka API untuk daftar episode dari data info
  const episodeList = epData.info?.episodeList || [];
  // Balik urutan supaya terkecil di atas
  const regularEpisodes = [...episodeList].reverse();

  // Fetch rekomendasi dari Sanka home atau gunakan kosong
  let recommendations = [];
  try {
    const homeRes = await fetch(`${SANKA_API}/home`);
    if (homeRes.ok) {
      const homeJson = await homeRes.json();
      recommendations = homeJson.data?.ongoing?.animeList?.slice(0, 10) || [];
    }
  } catch (e) {
    console.warn("Gagal fetch rekomendasi dari Sanka.");
  }

  // Simpan ke history
  saveToHistory(epData, animeSlug, epSlug);

  // --- NAVIGASI PREV/NEXT dari Sanka ---
  const prevEpisode = epData.hasPrevEpisode ? epData.prevEpisode : null;
  const nextEpisode = epData.hasNextEpisode ? epData.nextEpisode : null;

  const navigationHtml = `
    <div class="flex justify-end items-center gap-2 md:gap-3 mb-6 w-full animate-fadeIn">
      ${prevEpisode
        ? `<button onclick="app.loadPlayer('${prevEpisode.episodeId}', '${animeSlug}')" class="bg-gray-800/60 hover:bg-[#ff6600] text-gray-400 hover:text-white py-1.5 px-3 md:px-4 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 border border-gray-700/50 hover:border-[#ff6600] group shadow-sm">
            <i class="fas fa-chevron-left text-[8px] group-hover:-translate-x-0.5 transition-transform"></i> <span>Prev</span>
          </button>`
        : ""}
      ${nextEpisode
        ? `<button onclick="app.loadPlayer('${nextEpisode.episodeId}', '${animeSlug}')" class="bg-[#ff6600] hover:bg-[#e65c00] text-white py-1.5 px-3 md:px-4 rounded-lg text-[9px] md:text-[10px] font-black uppercase tracking-widest transition flex items-center gap-1.5 shadow-md shadow-[#ff6600]/20 group border border-[#ff6600]">
            <span>Next</span> <i class="fas fa-chevron-right text-[8px] group-hover:translate-x-0.5 transition-transform"></i>
          </button>`
        : ""}
    </div>`;

  // --- KUALITAS dari Sanka server.qualities ---
  const qualities = (epData.server?.qualities || [])
    .filter(q => q.serverList && q.serverList.length > 0)
    .map(q => q.title);
  const defaultQuality = qualities.includes("720p") ? "720p" : qualities[0] || "";

  // Encode seluruh qualities array untuk dipakai changeQuality
  const encodedQualities = btoa(JSON.stringify(epData.server?.qualities || []));

  // Temukan episode aktif di list
  const currentEpId = epData.animeId ? null : epSlug; // gunakan episodeId dari list

  if (display) {
    display.innerHTML = `
      <div class="flex flex-col lg:flex-row gap-6 animate-fadeIn px-1">
        <div class="lg:w-[75%]">
          <div id="video-wrapper" class="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 aspect-video mb-6 relative group">
            <iframe src="${epData.defaultStreamingUrl || ""}"
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
            <h1 class="text-xl md:text-2xl font-black mb-2 tracking-tight text-white">${epData.title}</h1>
            <div class="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
              <span class="text-[#ff6600]"><i class="fas fa-tv mr-1"></i> ${epData.info?.type || "Streaming"}</span>
              <span><i class="fas fa-clock mr-1"></i> ${epData.releaseTime || "Updated"}</span>
            </div>
          </div>

          ${navigationHtml}

          </div>

          <!-- SOURCE SWITCHER -->
          <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl mb-6 shadow-sm">
            <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
              <div class="flex-grow w-full">
                <h3 class="text-[10px] font-black mb-4 flex items-center gap-2 uppercase tracking-[0.2em] text-gray-400">
                  <i class="fas fa-server text-[#ff6600]"></i> Pilih Server
                </h3>
                <!-- SOURCE TOGGLE -->
                <div class="flex gap-1 bg-gray-800 p-1 rounded-xl w-fit mb-4">
                  <button id="src-otakudesu" onclick="app.loadOtakudesuServers()"
                    class="source-btn px-4 py-1.5 rounded-lg text-[10px] font-black transition uppercase bg-white text-black shadow-md">
                    <i class="fas fa-tv mr-1"></i> Otakudesu
                  </button>
                  <button id="src-animasu" onclick="app.loadAnimasuServers()"
                    class="source-btn px-4 py-1.5 rounded-lg text-[10px] font-black transition uppercase text-gray-400 hover:text-white">
                    <i class="fas fa-play-circle mr-1"></i> Animasu
                  </button>
                </div>
                <div id="mirror-list" class="grid grid-cols-2 sm:grid-cols-3 lg:flex lg:flex-wrap gap-2 md:gap-3"></div>
              </div>
              <div class="flex-shrink-0 w-full md:w-auto">
                <h3 class="text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-gray-400 md:text-right">Kualitas</h3>
                <div class="flex bg-gray-800 p-1 rounded-xl w-fit md:ml-auto">
                  ${qualities.map(q => `
                    <button onclick="app.changeQuality('${q}', '${encodedQualities}')"
                      id="q-${q}"
                      class="quality-btn px-4 py-1.5 rounded-lg text-[10px] font-black transition uppercase ${q === defaultQuality ? "bg-white text-black shadow-md" : "text-gray-400 hover:text-white"}">
                      ${q}
                    </button>`).join("")}
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
              ${regularEpisodes.map((ep) => {
                const isCurrent = ep.episodeId === epSlug;
                let epNumber = ep.eps || ep.title;
                // Ekstrak nomor episode dari title jika eps tidak ada
                if (!ep.eps) {
                  const match = ep.title.match(/(?:Episode|Eps)\s*([\d\.]+)/i);
                  if (match) epNumber = match[1];
                  else {
                    const numMatch = ep.title.match(/\b\d+(\.\d+)?\b/);
                    if (numMatch) epNumber = numMatch[0];
                  }
                }
                return `<button onclick="app.loadPlayer('${ep.episodeId}')"
                  class="px-3 py-1.5 min-w-[32px] rounded-lg text-[10px] font-black transition-all duration-300 uppercase
                  ${isCurrent ? "bg-[#ff6600] text-white shadow-lg shadow-orange-500/30 ring-1 ring-orange-400" : "bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:bg-gray-700 hover:text-white"}">
                  ${epNumber}
                </button>`;
              }).join("")}
            </div>
          </div>
        </div>

        <div class="lg:w-[25%] text-white">
          <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl sticky top-24">
            <h3 class="text-xs font-black mb-6 border-b border-gray-800 pb-3 flex items-center gap-2 uppercase tracking-widest text-gray-300">
              <i class="fas fa-fire text-orange-500"></i> Rekomendasi
            </h3>
            <div class="space-y-4">
              ${recommendations.map(anime => {
                const slug = anime.animeId || "";
                const thumb = anime.poster || "";
                const title = anime.title || "";
                const ep = anime.episodes ? `Ep ${anime.episodes}` : (anime.latestReleaseDate || "Ongoing");
                return `<div onclick="app.loadDetail('${slug}')" class="flex gap-3 group cursor-pointer">
                  <div class="w-16 h-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-800 border border-gray-700">
                    <img src="${thumb}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300" onerror="this.onerror=null; this.src='https://via.placeholder.com/150x200?text=No+Image';">
                  </div>
                  <div class="flex flex-col justify-center min-w-0">
                    <h4 class="text-[10px] font-bold line-clamp-2 group-hover:text-[#ff6600] transition-colors leading-tight">${title}</h4>
                    <span class="text-[8px] text-gray-500 mt-1 font-black uppercase tracking-tighter">${ep}</span>
                  </div>
                </div>`;
              }).join("")}
            </div>
          </div>
        </div>
      </div>`;
  }

  // Simpan epSlug agar bisa diakses source switcher
  window._currentEpSlug = epSlug;
  window._encodedQualities = encodedQualities;
  window._defaultQuality = defaultQuality;

  // Auto-pilih kualitas default dan source default (otakudesu)
  if (defaultQuality) {
    window.app.changeQuality(defaultQuality, encodedQualities);
  }
}

// Ubah kualitas — pakai struktur Sanka: qualities[].title & serverList[]
export const changeQuality = (selectedQ, encodedQualities) => {
  try {
    const qualities = JSON.parse(atob(encodedQualities));
    const container = document.getElementById("mirror-list");

    document.querySelectorAll(".quality-btn").forEach(btn => {
      btn.classList.remove("bg-white", "text-black", "shadow-md");
      btn.classList.add("text-gray-400");
    });

    const targetBtn = document.getElementById(`q-${selectedQ}`);
    if (targetBtn) targetBtn.classList.add("bg-white", "text-black", "shadow-md");

    const qualityObj = qualities.find(q => q.title === selectedQ);
    const serverList = qualityObj?.serverList || [];

    container.innerHTML = serverList.map(server => {
      const info = getServerInfo(server.title);
      // Encode serverId untuk dipakai switchServer
      const encodedServerId = btoa(JSON.stringify({ serverId: server.serverId, title: server.title }));
      return `
        <button onclick="app.switchServer('${encodedServerId}', this)"
          class="server-btn flex flex-col items-start p-2.5 rounded-xl border border-gray-700 hover:border-[#ff6600] bg-gray-800/50 hover:bg-gray-800 transition-all flex-1 sm:flex-none min-w-[120px] text-left group shadow-sm active:scale-95 overflow-hidden">
          <span class="server-title font-black text-[9px] md:text-[10px] tracking-widest uppercase mb-1.5 text-gray-300 group-hover:text-white transition-colors truncate w-full">
            <i class="mr-1 text-[#ff6600]"></i> ${info.name}
          </span>
          <span class="text-[7px] md:text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${info.color} whitespace-nowrap">
            ${info.badge}
          </span>
        </button>`;
    }).join("");
  } catch (e) {
    console.error("Error changing quality:", e);
  }
};

// ─── SOURCE: OTAKUDESU ───────────────────────────────────────────────────────
export function loadOtakudesuServers() {
  // Toggle active state
  document.querySelectorAll(".source-btn").forEach(b => {
    b.classList.remove("bg-white", "text-black", "shadow-md");
    b.classList.add("text-gray-400");
  });
  const otBtn = document.getElementById("src-otakudesu");
  if (otBtn) { otBtn.classList.add("bg-white", "text-black", "shadow-md"); otBtn.classList.remove("text-gray-400"); }

  // Kembalikan server list Otakudesu (kualitas default)
  const eq = window._encodedQualities;
  const dq = window._defaultQuality;
  if (eq && dq) window.app.changeQuality(dq, eq);
}

// ─── SOURCE: ANIMASU ─────────────────────────────────────────────────────────
export async function loadAnimasuServers() {
  // Toggle active state
  document.querySelectorAll(".source-btn").forEach(b => {
    b.classList.remove("bg-white", "text-black", "shadow-md");
    b.classList.add("text-gray-400");
  });
  const amBtn = document.getElementById("src-animasu");
  if (amBtn) { amBtn.classList.add("bg-white", "text-black", "shadow-md"); amBtn.classList.remove("text-gray-400"); }

  const container = document.getElementById("mirror-list");
  if (!container) return;

  container.innerHTML = `<div class="flex items-center gap-2 text-gray-500 text-[10px] font-bold uppercase"><i class="fas fa-circle-notch animate-spin text-[#ff6600]"></i> Memuat server Animasu...</div>`;

  try {
    const epSlug = window._currentEpSlug;
    const res = await fetch(`${SANKA_API}/animasu/detail/${epSlug}`);
    if (!res.ok) throw new Error("HTTP " + res.status);
    const json = await res.json();
    const streams = json?.streams || [];

    if (streams.length === 0) {
      container.innerHTML = `<div class="text-gray-500 text-[10px] font-bold uppercase">Tidak ada server Animasu untuk episode ini.</div>`;
      return;
    }

    container.innerHTML = streams.map(stream => {
      const info = getServerInfo(stream.name);
      const encodedUrl = btoa(unescape(encodeURIComponent(stream.url)));
      return `
        <button onclick="app.switchServer('${encodedUrl}', this, true)"
          class="server-btn flex flex-col items-start p-2.5 rounded-xl border border-gray-700 hover:border-[#ff6600] bg-gray-800/50 hover:bg-gray-800 transition-all flex-1 sm:flex-none min-w-[120px] text-left group shadow-sm active:scale-95 overflow-hidden">
          <span class="server-title font-black text-[9px] md:text-[10px] tracking-widest uppercase mb-1.5 text-gray-300 group-hover:text-white transition-colors truncate w-full">
            <i class="mr-1 text-[#ff6600]"></i> ${stream.name}
          </span>
          <span class="text-[7px] md:text-[8px] font-bold px-1.5 py-0.5 rounded border uppercase tracking-wider ${info.color} whitespace-nowrap">
            ${info.badge}
          </span>
        </button>`;
    }).join("");
  } catch (e) {
    console.error("Animasu error:", e);
    if (container) container.innerHTML = `<div class="text-red-500 text-[10px] font-bold uppercase">Gagal memuat server Animasu.</div>`;
  }
}

// ─── SWITCH SERVER ────────────────────────────────────────────────────────────
// mode otakudesu: fetch dari Sanka /server/:id
// mode animasu  : URL sudah embed, langsung set ke iframe
export async function switchServer(encodedServerData, btnElement = null, isDirectUrl = false) {
  if (btnElement) {
    document.querySelectorAll(".server-btn").forEach(btn => {
      btn.classList.remove("border-[#ff6600]", "bg-gray-800", "ring-1", "ring-[#ff6600]/50");
      btn.classList.add("border-gray-700", "bg-gray-800/50");
      const title = btn.querySelector(".server-title");
      if (title) { title.classList.remove("text-white"); title.classList.add("text-gray-300"); }
    });

    btnElement.classList.remove("border-gray-700", "bg-gray-800/50");
    btnElement.classList.add("border-[#ff6600]", "bg-gray-800", "ring-1", "ring-[#ff6600]/50");
    const title = btnElement.querySelector(".server-title");
    if (title) { title.classList.remove("text-gray-300"); title.classList.add("text-white"); }
  }

  const wrapper = document.getElementById("video-wrapper");
  wrapper.innerHTML = `<div class="flex items-center justify-center h-full text-white bg-black/50"><i class="fas fa-circle-notch animate-spin text-4xl text-[#ff6600]"></i></div>`;

  try {
    let iframeSrc = null;

    if (isDirectUrl) {
      // Mode Animasu: encodedServerData adalah URL embed yang di-btoa
      iframeSrc = decodeURIComponent(escape(atob(encodedServerData)));
    } else {
      // Mode Otakudesu: encodedServerData adalah JSON { serverId, title }
      const { serverId } = JSON.parse(atob(encodedServerData));
      const res = await fetch(`${SANKA_API}/server/${serverId}`);
      const json = await res.json();
      iframeSrc = json?.data?.url || json?.data?.iframe || null;
    }

    if (iframeSrc) {
      wrapper.innerHTML = `
        <iframe src="${iframeSrc}"
          allowfullscreen="true"
          webkitallowfullscreen="true"
          mozallowfullscreen="true"
          frameborder="0"
          scrolling="no"
          referrerpolicy="no-referrer"
          class="w-full h-full border-none absolute top-0 left-0">
        </iframe>`;
    } else {
      throw new Error("Iframe URL tidak ditemukan");
    }
  } catch (err) {
    console.error("switchServer error:", err);
    wrapper.innerHTML = `<div class="flex items-center justify-center h-full text-red-500 text-[10px] font-bold uppercase">Gagal memuat server.</div>`;
  }
}

async function saveToHistory(episodeData, animeSlug, epSlug) {
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
        anime_title: episodeData.title?.split(" Episode")[0] || "Unknown Anime",
        anime_thumb: localStorage.getItem(`saved_thumb_${animeSlug}`) || "",
        episode_slug: epSlug,
        episode_title: episodeData.title,
      }),
    });
    if (!res.ok) throw new Error("Server bermasalah");
  } catch (err) {
    console.error("Gagal auto-save history:", err);
  }
}
