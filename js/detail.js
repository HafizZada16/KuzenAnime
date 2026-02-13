import { fetchData } from "./api.js";
import { showLoading } from "./utils.js";

export async function loadDetail(slug, thumbFromHome = null) {
  showLoading(true);

  // WAJIB: Ganti URL browser
  history.pushState(null, null, `/anime/${slug}`);

  const data = await fetchData(`/anime/${slug}`);
  const display = document.getElementById("content-display");
  const poster =
    data.thumb || thumbFromHome || "https://via.placeholder.com/300x450";

  localStorage.setItem("current_anime_slug", slug);

  display.innerHTML = `
        <div class="animate-fadeIn px-1">
            <span onclick="history.back()" class="text-[10px] font-bold text-gray-500 hover:text-white cursor-pointer mb-6 inline-block uppercase tracking-wider"><i class="fas fa-arrow-left mr-2"></i> Back</span>
            
            <div class="flex flex-col md:flex-row gap-6 md:gap-10 mb-10">
                <div class="w-48 mx-auto md:mx-0 md:w-72 flex-shrink-0">
                    <img src="${poster}" class="w-full rounded-2xl shadow-2xl border border-gray-800 aspect-[3/4] object-cover">
                </div>
                <div class="flex-grow pt-2 text-center md:text-left">
                    <div class="text-[9px] font-bold text-gray-500 mb-2 uppercase tracking-[0.2em]">TV • ONGOING • JAN 08, 2026</div>
                    <h1 class="text-2xl md:text-5xl font-black mb-2 tracking-tight">${data.title}</h1>
                    <p class="text-lg text-gray-400 italic mb-6">${data.japanese || ""}</p>
                    <div class="flex flex-wrap justify-center md:justify-start gap-2 mb-8">
                        ${data.genres.map((g) => `<span class="bg-gray-900 border border-gray-800 px-4 py-1.5 rounded-full text-[10px] font-bold uppercase">${g}</span>`).join("")}
                    </div>
                    <div class="flex flex-col sm:flex-row gap-3">
                        <button onclick="app.loadPlayer('${data.episodes[0]?.slug}')" class="bg-red-600 hover:bg-red-700 px-8 py-3 rounded-xl font-black transition flex items-center justify-center gap-3 text-sm"><i class="fas fa-play"></i> Watch Now</button>
                        <button class="bg-gray-900 border border-gray-800 px-6 py-3 rounded-xl font-black transition flex items-center justify-center gap-3 text-sm"><i class="fas fa-heart text-red-500"></i> Add to List</button>
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 lg:grid-cols-3 gap-12">
                <div class="lg:col-span-2">
                    <h3 class="text-xl font-bold mb-4 border-l-4 border-purple-500 pl-3 uppercase tracking-tighter">Synopsis</h3>
                    <div class="bg-gray-900/40 border border-gray-800 p-6 rounded-2xl text-gray-400 text-sm leading-relaxed mb-10">
                        Menceritakan tentang perjalanan seru di dunia anime... (Gunakan data sinopsis jika ada).
                    </div>
                    
                    <h3 class="text-xl font-bold mb-6 border-l-4 border-purple-500 pl-3 uppercase tracking-tighter">Episodes <span class="text-xs text-gray-500 ml-2 font-normal lowercase">${data.episodes.length} items</span></h3>
                    <div class="space-y-3">
                        ${data.episodes
                          .map(
                            (ep) => `
                            <div onclick="app.loadPlayer('${ep.slug}')" class="bg-gray-900/60 p-4 rounded-2xl border border-gray-800 hover:bg-purple-600/10 cursor-pointer flex justify-between items-center group transition">
                                <div class="flex items-center gap-4 text-white">
                                    <div class="w-10 h-10 bg-gray-800 rounded-xl flex items-center justify-center group-hover:bg-purple-600 transition"><i class="fas fa-play text-xs"></i></div>
                                    <div>
                                        <h4 class="text-sm font-bold group-hover:text-purple-500 transition">${ep.title}</h4>
                                        <span class="text-[10px] text-gray-500 font-bold uppercase tracking-widest">${ep.date}</span>
                                    </div>
                                </div>
                                <i class="fas fa-chevron-right text-gray-700"></i>
                            </div>
                        `,
                          )
                          .join("")}
                    </div>
                </div>
                
                <div class="space-y-10">
                    <div class="bg-gray-900/40 p-6 rounded-2xl border border-gray-800 text-white">
                        <h3 class="font-bold mb-5 border-b border-gray-800 pb-3 text-xs uppercase tracking-widest text-purple-500">Info Anime</h3>
                        <div class="space-y-4 text-[10px] font-bold uppercase tracking-widest">
                            <div class="flex justify-between"><span class="text-gray-500">Type</span><span>TV</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Status</span><span class="text-purple-500">Ongoing</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Duration</span><span>23 Min.</span></div>
                            <div class="flex justify-between"><span class="text-gray-500">Studio</span><span>Ashi Productions</span></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
  showLoading(false);
}
