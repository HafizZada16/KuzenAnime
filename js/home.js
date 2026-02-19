import { fetchData } from "./api.js";
import {
  showLoading,
  createAnimeCard,
  createPagination,
  createSkeletonGrid,
} from "./utils.js";

// Variabel global untuk menyimpan "timer hantu" agar bisa dimatikan
let heroInterval;

export async function loadHome() {
  window.scrollTo({ top: 0, behavior: "smooth" });
  // Matikan loading muter-muter bawaan
  showLoading(false);

  const display = document.getElementById("content-display");
  if (display) {
    // TAMPILKAN SKELETON HOME (Hero Besar + 2 Baris Kategori)
    display.innerHTML = `
      <div class="animate-fadeIn">
        <div class="w-full h-[200px] md:h-[450px] rounded-2xl md:rounded-3xl bg-gray-800 animate-pulse mb-8 md:mb-10 border border-gray-700"></div>
        
        <div class="h-6 md:h-8 w-48 bg-gray-800 rounded animate-pulse mb-4 mt-8"></div>
        ${createSkeletonGrid(6)}
        
        <div class="h-6 md:h-8 w-48 bg-gray-800 rounded animate-pulse mb-4 mt-8"></div>
        ${createSkeletonGrid(6)}
      </div>
    `;
  }

  const data = await fetchData("/home");

  if (data && display) {
    display.innerHTML = ""; // Bersihkan skeleton

    // 1. Render Hero Slider (Ambil 5 anime pertama dari Ongoing)
    if (data.ongoing && data.ongoing.length > 0) {
      renderHeroSlider(data.ongoing.slice(0, 5));
    }

    // 2. Render List Kategori
    renderPreview(data.ongoing, "Ongoing Anime", "ongoing");
    renderPreview(data.complete, "Complete Anime", "complete");
  }
}

// ==========================================
// FITUR BARU: RENDER HERO SLIDER (PERBAIKAN DOTS)
// ==========================================
function renderHeroSlider(animeList) {
  const display = document.getElementById("content-display");

  let slidesHtml = "";
  let dotsHtml = "";

  animeList.forEach((anime, index) => {
    // Slide Aktif Pertama
    const isActive = index === 0 ? "opacity-100 z-10" : "opacity-0 z-0";

    slidesHtml += `
      <div class="hero-slide absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive}" data-index="${index}">
          
          <div class="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/70 via-[#0b0b0b]/30 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/60 via-[#0b0b0b]/40 to-transparent z-10"></div>
          
          <img src="${anime.thumb || anime.thumbnail}" class="w-full h-full object-cover opacity-60" alt="${anime.title}">
          
          <div class="absolute bottom-5 left-4 md:bottom-12 md:left-12 z-20 w-[90%] md:w-1/2 animate-slideUp">
              
              <h2 class="text-sm md:text-4xl font-black text-white leading-tight mb-1.5 md:mb-2 drop-shadow-2xl line-clamp-2">${anime.title}</h2>
              
              <div class="flex items-center gap-3 text-[10px] md:text-sm text-gray-300 font-bold mb-3 md:mb-5">
                  <span><i class="fas fa-play-circle text-[#ff6600]"></i> Ep: ${anime.episode || anime.eps || "?"}</span>
              </div>
              
              <button onclick="app.loadDetail('${anime.slug}', '${anime.thumb}')" 
                      class="bg-[#ff6600] hover:bg-[#e65c00] text-white px-4 py-1.5 md:px-8 md:py-3 rounded-full font-bold text-[10px] md:text-sm transition shadow-[0_0_15px_rgba(255,102,0,0.5)]">
                  <i class="fas fa-play mr-1 md:mr-2"></i> Tonton
              </button>
          </div>
      </div>
    `;

    // Titik Navigasi (Dots) - PERBAIKAN DI SINI
    // Jika index 0 (aktif): Lebar (w-6), Warna Orange
    // Jika index lain: Kecil (w-2), Warna Abu
    const dotClass =
      index === 0
        ? "bg-[#ff6600] w-4 md:w-6"
        : "bg-gray-500 w-1.5 md:w-2 hover:bg-gray-400";

    dotsHtml += `<div class="hero-dot h-1.5 md:h-2 rounded-full transition-all duration-300 cursor-pointer ${dotClass}" data-index="${index}"></div>`;
  });

  const heroContainer = `
    <div class="relative w-full h-[200px] md:h-[450px] rounded-2xl md:rounded-3xl overflow-hidden mb-8 md:mb-10 shadow-2xl group border border-gray-800">
        ${slidesHtml}
        
        <button id="hero-prev" class="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-[#ff6600] text-white w-6 h-6 md:w-12 md:h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
            <i class="fas fa-chevron-left text-[10px] md:text-lg"></i>
        </button>
        <button id="hero-next" class="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 z-30 bg-black/50 hover:bg-[#ff6600] text-white w-6 h-6 md:w-12 md:h-12 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition backdrop-blur-sm">
            <i class="fas fa-chevron-right text-[10px] md:text-lg"></i>
        </button>

        <div class="absolute bottom-2 md:bottom-6 right-3 md:right-6 z-30 flex gap-1.5 md:gap-2 items-center">
            ${dotsHtml}
        </div>
    </div>
  `;

  display.insertAdjacentHTML("afterbegin", heroContainer);
  initHeroSlider(animeList.length);
}

function initHeroSlider(totalSlides) {
  let currentSlide = 0;
  const slides = document.querySelectorAll(".hero-slide");
  const dots = document.querySelectorAll(".hero-dot");
  const prevBtn = document.getElementById("hero-prev");
  const nextBtn = document.getElementById("hero-next");

  if (!slides.length) return;

  if (heroInterval) clearInterval(heroInterval);

  // FUNGSI UPDATE SLIDER (PERBAIKAN LOGIKA DOTS)
  const updateSlider = (newIndex) => {
    // 1. Matikan Slide & Dot Lama
    slides[currentSlide].classList.remove("opacity-100", "z-10");
    slides[currentSlide].classList.add("opacity-0", "z-0");

    // Dot Lama: Jadi Abu & Kecil
    dots[currentSlide].classList.remove("bg-[#ff6600]", "w-4", "md:w-6");
    dots[currentSlide].classList.add("bg-gray-500", "w-1.5", "md:w-2");

    // 2. Hitung Index Baru (Looping)
    currentSlide = (newIndex + totalSlides) % totalSlides;

    // 3. Hidupkan Slide & Dot Baru
    slides[currentSlide].classList.remove("opacity-0", "z-0");
    slides[currentSlide].classList.add("opacity-100", "z-10");

    // Dot Baru: Jadi Orange & Lebar
    dots[currentSlide].classList.remove("bg-gray-500", "w-1.5", "md:w-2");
    dots[currentSlide].classList.add("bg-[#ff6600]", "w-4", "md:w-6");
  };

  // Event Listeners
  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      updateSlider(currentSlide + 1);
      resetInterval();
    });

  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      updateSlider(currentSlide - 1);
      resetInterval();
    });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      updateSlider(index);
      resetInterval();
    });
  });

  // Auto Slide
  const startInterval = () => {
    heroInterval = setInterval(() => {
      // Cek apakah elemen masih ada di DOM (Penting untuk SPA)
      if (!document.querySelector(".hero-slide")) {
        clearInterval(heroInterval);
        return;
      }
      updateSlider(currentSlide + 1);
    }, 4000);
  };

  const resetInterval = () => {
    clearInterval(heroInterval);
    startInterval();
  };

  startInterval();
}
// ==========================================

export async function loadCategory(type, page = 1) {
  const display = document.getElementById("content-display");

  window.scrollTo({ top: 0, behavior: "smooth" });
  // 1. Matikan loading spinner jadul & ubah URL
  showLoading(false);
  history.pushState(null, null, `/${type}?page=${page}`);

  // 2. TAMPILKAN SKELETON DULU (Tergantung tipe device, kita render 10-12 kotak kosong)
  display.innerHTML = `
    <h2 class="text-xl md:text-2xl font-black mb-6 border-l-4 border-[#ff6600] pl-4 tracking-tighter text-gray-700 bg-gray-800/20 w-max rounded-r-md animate-pulse">MEMUAT DATA...</h2>
    ${createSkeletonGrid(12)}
  `;

  // 3. Ambil data dari API
  const data = await fetchData(`/${type}?page=${page}`);

  // 4. Setelah data dapat, TIMPA skeleton dengan data asli
  display.innerHTML = `<h2 class="text-xl md:text-2xl font-black mb-6 border-l-4 border-[#ff6600] pl-4 uppercase tracking-tighter text-white capitalize">${type} Anime</h2>`;

  let html = `<div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 lg:grid-cols-6 gap-4 md:gap-6">`;
  data.forEach(
    (a) =>
      (html += createAnimeCard(a, `app.loadDetail('${a.slug}', '${a.thumb}')`)),
  );
  html += `</div>` + createPagination(page, type);

  display.insertAdjacentHTML("beforeend", html);
}

function renderPreview(list, title, type) {
  const display = document.getElementById("content-display");
  let html = `
        <div class="flex justify-between items-center mb-4 mt-8">
            <h2 class="text-lg md:text-2xl font-black border-l-4 border-[#ff6600] pl-3 uppercase tracking-tighter">${title}</h2>
            <span onclick="app.loadCategory('${type}', 1)" class="text-[10px] font-bold text-gray-500 hover:text-white cursor-pointer transition uppercase">View All <i class="fas fa-chevron-right ml-1"></i></span>
        </div>
        <div class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6">
    `;
  list.slice(0, 6).forEach((a) => {
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
  const mobileInput = document.getElementById("search-input-mobile");
  const desktopInput = document.getElementById("search-input-desktop");
  const q = (mobileInput?.value || desktopInput?.value || "").trim();

  if (!q) return;

  // Matikan loading muter-muter
  showLoading(false);
  history.pushState(null, null, `/search?q=${encodeURIComponent(q)}`);

  const display = document.getElementById("content-display");

  if (display) {
    // TAMPILKAN SKELETON PENCARIAN
    display.innerHTML = `
      <div class="animate-fadeIn">
        <div class="flex items-center gap-3 mb-6 mt-2">
          <div class="w-1 h-6 bg-gray-700 rounded-full animate-pulse"></div>
          <h2 class="text-xl font-black uppercase tracking-tighter text-gray-500 animate-pulse">
            Mencari: "${q}"...
          </h2>
        </div>
        ${createSkeletonGrid(12)}
      </div>
    `;
  }

  try {
    const data = await fetchData(`/search?q=${encodeURIComponent(q)}`);

    if (display) {
      if (data && data.length > 0) {
        display.innerHTML = `
          <div class="animate-fadeIn">
            <div class="flex items-center gap-3 mb-6 mt-2">
              <div class="w-1 h-6 bg-[#ff6600] rounded-full"></div>
              <h2 class="text-xl font-black uppercase tracking-tighter text-white">
                Search Results: <span class="text-[#ff6600]">"${q}"</span>
              </h2>
            </div>
            <div id="search-results-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6"></div>
          </div>
        `;

        const grid = document.getElementById("search-results-grid");
        let html = "";
        data.forEach((anime) => {
          const imageUrl = anime.thumb || anime.thumbnail || "";
          html += createAnimeCard(
            anime,
            `app.loadDetail('${anime.slug}', '${imageUrl}')`,
          );
        });
        grid.innerHTML = html;
      } else {
        // Tampilan Error Normal
        display.innerHTML = `
          <div class="text-center py-32 opacity-50">
            <i class="fas fa-search-minus text-5xl mb-4 text-gray-600"></i>
            <p class="font-bold font-['Poppins'] text-sm text-white">Anime tidak ditemukan</p>
            <p class="text-[10px] text-gray-400 mt-2 max-w-xs mx-auto">
              Tidak ada hasil untuk "${q}". Coba gunakan satu atau dua kata kunci utama saja.
            </p>
            <button onclick="app.navigateTo('/')" class="mt-6 text-[10px] bg-gray-900 border border-gray-700 px-6 py-2.5 rounded-full font-bold hover:text-[#ff6600] transition uppercase tracking-widest text-white">
              Kembali ke Home
            </button>
          </div>
        `;
      }
    }
  } catch (error) {
    console.error("Search Error:", error);
  }
}
