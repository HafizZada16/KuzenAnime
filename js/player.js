import { fetchData } from "./api.js";
import { showLoading } from "./utils.js";

export async function loadPlayer(epSlug) {
  showLoading(true);
  history.pushState(null, null, `/episode/${epSlug}`);

  const data = await fetchData(`/episode/${epSlug}`);
  const display = document.getElementById("content-display");

  // Validasi jika data API kosong atau tidak sesuai
  if (!data || !data.mirrors) {
    display.innerHTML = `<div class="text-center py-20"><p class="text-red-500 mb-4">Gagal memuat data episode.</p>
                         <button onclick="location.reload()" class="bg-gray-800 px-4 py-2 rounded-lg text-xs">Coba Lagi</button></div>`;
    showLoading(false);
    return;
  }

  const homeData = await fetchData("/home");
  const recommendations = homeData?.ongoing?.slice(0, 10) || [];

  // Ambil semua resolusi unik yang tersedia (misal: 360p, 480p, 720p)
  const qualities = [
    ...new Set(data.mirrors.map((m) => m.payload?.q).filter(Boolean)),
  ];
  const defaultQuality = qualities.includes("720p")
    ? "720p"
    : qualities[0] || "";

  display.innerHTML = `
    <div class="flex flex-col lg:flex-row gap-6 animate-fadeIn">
        <div class="lg:w-[75%]">
            <div id="video-wrapper" class="bg-black rounded-2xl overflow-hidden shadow-2xl border border-gray-800 aspect-video mb-6">
                <iframe src="${data.default_stream || ""}" allowfullscreen class="w-full h-full border-none"></iframe>
            </div>

            <div class="mb-8 flex flex-col md:flex-row justify-between items-start gap-4">
                <div class="max-w-full overflow-hidden">
                    <h1 class="text-xl md:text-2xl font-black mb-2 truncate">${data.title}</h1>
                    <div class="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                        <span><i class="fas fa-desktop mr-1"></i> Episode</span>
                        <span><i class="fas fa-clock mr-1"></i> Auto-Synced</span>
                    </div>
                </div>
                <div class="flex gap-2 w-full md:w-auto">
                    <button onclick="history.back()" class="flex-1 md:flex-none bg-gray-900 border border-gray-800 px-6 py-2 rounded-xl text-xs font-bold transition">Back</button>
                    <button class="flex-1 md:flex-none bg-purple-600 px-8 py-2 rounded-xl text-xs font-bold shadow-lg shadow-purple-600/20 text-white">Next <i class="fas fa-chevron-right ml-2"></i></button>
                </div>
            </div>

            <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl mb-8">
                <div class="flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div class="flex-grow w-full">
                        <h3 class="text-[10px] font-black mb-4 flex items-center gap-2 uppercase tracking-[0.2em] text-gray-400">
                            <i class="fas fa-server text-purple-500"></i> Streaming Servers
                        </h3>
                        <div id="mirror-list" class="flex flex-wrap gap-2"></div>
                    </div>
                    <div class="flex-shrink-0 w-full md:w-auto md:text-right">
                        <h3 class="text-[10px] font-black mb-4 uppercase tracking-[0.2em] text-gray-400">Select Quality</h3>
                        <div class="flex bg-gray-800 p-1 rounded-xl w-fit md:ml-auto">
                            ${qualities
                              .map(
                                (q) => `
                                <button onclick="app.changeQuality('${q}', '${btoa(JSON.stringify(data.mirrors))}')" 
                                    id="q-${q}"
                                    class="quality-btn px-4 py-1.5 rounded-lg text-[10px] font-black transition uppercase ${q === defaultQuality ? "bg-white text-black" : "text-gray-400 hover:text-white"}">
                                    ${q}
                                </button>`,
                              )
                              .join("")}
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="lg:w-[25%]">
            <div class="bg-[#121212] border border-gray-800 p-5 rounded-2xl">
                <h3 class="text-xs font-black mb-6 border-b border-gray-800 pb-3 flex items-center gap-2 uppercase tracking-widest text-gray-300">
                    <i class="fas fa-list-ul text-purple-500"></i> You Might Like
                </h3>
                <div class="space-y-4">
                    ${recommendations
                      .map(
                        (anime) => `
                        <div onclick="app.loadDetail('${anime.slug}', '${anime.thumb}')" class="flex gap-3 group cursor-pointer">
                            <div class="w-20 h-28 flex-shrink-0 overflow-hidden rounded-xl bg-gray-800">
                                <img src="${anime.thumb}" class="w-full h-full object-cover group-hover:scale-110 transition duration-300" onerror="this.src='https://via.placeholder.com/150x200'">
                            </div>
                            <div class="flex flex-col justify-center">
                                <h4 class="text-[11px] font-bold line-clamp-2 group-hover:text-purple-500 transition leading-snug">${anime.title}</h4>
                                <span class="text-[9px] text-gray-500 mt-2 font-bold uppercase tracking-tighter">${anime.episode || "Ongoing"}</span>
                            </div>
                        </div>`,
                      )
                      .join("")}
                </div>
            </div>
        </div>
    </div>`;

  // Jalankan inisialisasi server untuk kualitas default
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
      btn.classList.remove("bg-white", "text-black");
      btn.classList.add("text-gray-400");
    });

    const targetBtn = document.getElementById(`q-${selectedQ}`);
    if (targetBtn) targetBtn.classList.add("bg-white", "text-black");

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
  wrapper.innerHTML = `<div class="flex items-center justify-center h-full text-white bg-black/50">
                        <i class="fas fa-circle-notch animate-spin text-4xl text-purple-600"></i>
                      </div>`;

  try {
    const res = await fetch(`https://api.kanata.web.id/otakudesu/stream`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    const data = await res.json();

    if (data && data.iframe) {
      wrapper.innerHTML = `<iframe src="${data.iframe}" allowfullscreen class="w-full h-full border-none shadow-inner"></iframe>`;
    } else {
      throw new Error("Iframe not found");
    }
  } catch (err) {
    wrapper.innerHTML = `<div class="flex items-center justify-center h-full text-red-500">Gagal memuat server. Coba server lain.</div>`;
  }
}
