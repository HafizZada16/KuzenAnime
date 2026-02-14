import { fetchData } from "/js/api.js";
import { showLoading } from "/js/utils.js";

export async function loadPlayer(epSlug) {
  if (!epSlug) return;
  showLoading(true);

  history.pushState(null, null, `/episode/${epSlug}`);

  const data = await fetchData(`/episode/${epSlug}`);
  const display = document.getElementById("content-display");
  if (display) display.innerHTML = "";

  if (!data || !data.mirrors) {
    display.innerHTML = `<div class="text-center py-20 text-red-500 font-bold uppercase text-[10px]">Gagal memuat data episode.</div>`;
    showLoading(false);
    return;
  }

  // Mengambil slug anime dari localStorage
  let animeSlug = localStorage.getItem("current_anime_slug");

  if (!animeSlug) {
    if (data.anime_url) {
      animeSlug = data.anime_url.split("/").filter(Boolean).pop();
    } else {
      animeSlug = epSlug.split("-episode-")[0] + "-sub-indo";
    }
  }

  const animeData = await fetchData(`/anime/${animeSlug}`);

  // --- LOGIKA FILTER EPISODE REGULER ---
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

  display.innerHTML = `
    <div class="flex flex-col lg:flex-row gap-6 animate-fadeIn px-1">
        <div class="lg:w-[75%]">
            <div id="video-wrapper" class="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 aspect-video mb-6 relative">
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
                    <span class="text-purple-500"><i class="fas fa-tv mr-1"></i> ${animeData?.title || "Streaming"}</span>
                    <span><i class="fas fa-clock mr-1"></i> ${data.posted || "Updated"}</span>
                </div>
            </div>

            <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl mb-6 shadow-sm">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div class="flex-grow w-full">
                        <h3 class="text-[10px] font-black mb-4 flex items-center gap-2 uppercase tracking-[0.2em] text-gray-400">
                            <i class="fas fa-server text-purple-500"></i> Pilih Server
                        </h3>
                        <div id="mirror-list" class="flex flex-wrap gap-2"></div>
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
                        <i class="fas fa-th-large text-purple-500"></i> Pilih Episode
                    </h3>
                    <span class="text-[9px] text-gray-600 font-black uppercase">Total: ${regularEpisodes.length}</span>
                </div>
                
                <div class="flex flex-wrap gap-2">
                    ${regularEpisodes
                      .map((ep, index) => {
                        const isCurrent = ep.slug === epSlug;
                        return `
                            <button onclick="app.loadPlayer('${ep.slug}')" 
                                class="px-3 py-1.5 min-w-[32px] rounded-lg text-[10px] font-black transition-all duration-300 uppercase
                                ${isCurrent ? "bg-pink-500 text-white shadow-lg shadow-pink-500/30 ring-1 ring-pink-400" : "bg-gray-800/60 text-gray-400 border border-gray-700/50 hover:bg-gray-700 hover:text-white"}">
                                ${index + 1}
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
                                <h4 class="text-[10px] font-bold line-clamp-2 group-hover:text-purple-500 transition-colors leading-tight">${anime.title}</h4>
                                <span class="text-[8px] text-gray-500 mt-1 font-black uppercase tracking-tighter">${anime.episode || "Ongoing"}</span>
                            </div>
                        </div>`,
                      )
                      .join("")}
                </div>
            </div>
        </div>
    </div>`;

  if (defaultQuality) {
    window.app.changeQuality(
      defaultQuality,
      btoa(JSON.stringify(data.mirrors)),
    );
  }
  showLoading(false);
}

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
    container.innerHTML = filtered
      .map(
        (m) => `
        <button onclick="app.switchServer('${btoa(JSON.stringify(m.payload))}')" 
            class="bg-gray-800/80 hover:bg-purple-600 border border-gray-700 px-4 py-2 rounded-lg text-[10px] font-black transition uppercase text-white active:scale-95 shadow-sm">
            ${m.name}
        </button>`,
      )
      .join("");
  } catch (e) {
    console.error("Error changing quality:", e);
  }
};

export async function switchServer(encodedPayload) {
  const payload = JSON.parse(atob(encodedPayload));
  const wrapper = document.getElementById("video-wrapper");
  wrapper.innerHTML = `<div class="flex items-center justify-center h-full text-white bg-black/50"><i class="fas fa-circle-notch animate-spin text-4xl text-purple-600"></i></div>`;

  try {
    const res = await fetch(`https://api.kanata.web.id/otakudesu/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data && data.iframe) {
      // Sama seperti di atas, tambahkan referrerpolicy
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
