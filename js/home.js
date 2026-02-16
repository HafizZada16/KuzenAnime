import { fetchData } from "./api.js";
import { showLoading, createAnimeCard, createPagination } from "./utils.js";

// Variabel global untuk menyimpan "timer hantu" agar bisa dimatikan
let heroInterval;

export async function loadHome() {
  showLoading(true);
  const data = await fetchData("/home");
  const display = document.getElementById("content-display");
  display.innerHTML = "";

  if (data) {
    // 1. Render Hero Slider (Ambil 5 anime pertama dari Ongoing)
    if (data.ongoing && data.ongoing.length > 0) {
      renderHeroSlider(data.ongoing.slice(0, 5));
    }

    // 2. Render List Kategori
    renderPreview(data.ongoing, "Ongoing Anime", "ongoing");
    renderPreview(data.complete, "Complete Anime", "complete");
  }
  showLoading(false);
}

// ==========================================
// FITUR BARU: RENDER HERO SLIDER
// ==========================================
function renderHeroSlider(animeList) {
  const display = document.getElementById("content-display");

  let slidesHtml = "";
  let dotsHtml = "";

  animeList.forEach((anime, index) => {
    const isActive = index === 0 ? "opacity-100 z-10" : "opacity-0 z-0";

    slidesHtml += `
      <div class="hero-slide absolute inset-0 transition-opacity duration-1000 ease-in-out ${isActive}" data-index="${index}">
          
          <div class="absolute inset-0 bg-gradient-to-t from-[#0b0b0b]/70 via-[#0b0b0b]/30 to-transparent z-10"></div>
          <div class="absolute inset-0 bg-gradient-to-r from-[#0b0b0b]/60 via-[#0b0b0b]/40 to-transparent z-10"></div>
          
          <img src="${anime.thumb || anime.thumbnail}" class="w-full h-full object-cover opacity-60" alt="${anime.title}">
          
          <div class="absolute bottom-5 left-4 md:bottom-12 md:left-12 z-20 w-[90%] md:w-1/2 animate-slideUp">
              
              <span class="bg-[#ff6600] text-white text-[8px] md:text-xs font-black px-1.5 py-0.5 md:px-3 md:py-1 rounded shadow-lg uppercase tracking-widest mb-1.5 md:mb-3 inline-block">
                <i class="fas fa-fire mr-1"></i> Trending
              </span>
              
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

    // Titik navigasi (dots) - Diperkecil sedikit di HP
    const dotActive =
      index === 0 ? "bg-[#ff6600] w-4 md:w-6" : "bg-gray-500 w-1.5 md:w-2";
    dotsHtml += `<div class="hero-dot h-1.5 md:h-2 rounded-full transition-all duration-300 cursor-pointer ${dotActive}" data-index="${index}"></div>`;
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

        <div class="absolute bottom-2 md:bottom-6 right-3 md:right-6 z-30 flex gap-1.5 md:gap-2">
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

  const updateSlider = (newIndex) => {
    slides[currentSlide].classList.replace("opacity-100", "opacity-0");
    slides[currentSlide].classList.replace("z-10", "z-0");
    dots[currentSlide].classList.replace("bg-[#ff6600]", "bg-gray-500");
    dots[currentSlide].classList.replace("w-6", "w-2");

    currentSlide = (newIndex + totalSlides) % totalSlides;

    slides[currentSlide].classList.replace("opacity-0", "opacity-100");
    slides[currentSlide].classList.replace("z-0", "z-10");
    dots[currentSlide].classList.replace("bg-gray-500", "bg-[#ff6600]");
    dots[currentSlide].classList.replace("w-2", "w-6");
  };

  const nextSlide = () => updateSlider(currentSlide + 1);
  const prevSlide = () => updateSlider(currentSlide - 1);

  if (nextBtn)
    nextBtn.addEventListener("click", () => {
      nextSlide();
      resetInterval();
    });
  if (prevBtn)
    prevBtn.addEventListener("click", () => {
      prevSlide();
      resetInterval();
    });

  dots.forEach((dot, index) => {
    dot.addEventListener("click", () => {
      updateSlider(index);
      resetInterval();
    });
  });

  const startInterval = () => {
    heroInterval = setInterval(() => {
      if (!document.querySelector(".hero-slide")) {
        clearInterval(heroInterval);
        return;
      }
      nextSlide();
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
  showLoading(true);
  history.pushState(null, null, `/${type}?page=${page}`);
  const data = await fetchData(`/${type}?page=${page}`);
  const display = document.getElementById("content-display");
  display.innerHTML = `<h2 class="text-xl md:text-2xl font-black mb-6 border-l-4 border-[#ff6600] pl-4 uppercase tracking-tighter">${type} Anime</h2>`;
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

  showLoading(true);
  history.pushState(null, null, `/search?q=${encodeURIComponent(q)}`);

  try {
    const data = await fetchData(`/search?q=${q}`);
    const display = document.getElementById("content-display");

    if (display) {
      display.innerHTML = `
        <div class="animate-fadeIn">
          <div class="flex items-center gap-3 mb-6 mt-2">
            <div class="w-1 h-6 bg-[#ff6600] rounded-full"></div>
            <h2 class="text-xl font-black uppercase tracking-tighter">
              Search Results: <span class="text-[#ff6600]">"${q}"</span>
            </h2>
          </div>
          <div id="search-results-grid" class="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4 md:gap-6"></div>
        </div>
      `;

      const grid = document.getElementById("search-results-grid");

      if (data && data.length > 0) {
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
        display.innerHTML = `
          <div class="text-center py-32 opacity-50">
            <i class="fas fa-search-minus text-5xl mb-4"></i>
            <p class="font-black uppercase text-xs tracking-[0.2em]">Anime tidak ditemukan</p>
            <button onclick="app.navigateTo('/')" class="mt-6 text-[10px] bg-gray-900 px-6 py-2 rounded-full font-bold hover:text-[#ff6600] transition">Kembali ke Home</button>
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
