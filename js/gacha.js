import { SANKA_API } from "./config.js";

export async function gachaAnime() {
    // Tampilkan loading ala gacha (SweetAlert2)
    const Swal = window.Swal;
    if (Swal) {
        Swal.fire({
            title: '🎉 Gacha Berjalan...',
            html: 'Mencari anime kejutan untukmu...',
            timer: 1500,
            timerProgressBar: true,
            showConfirmButton: false,
            background: '#121212',
            color: '#fff',
            didOpen: () => {
                Swal.showLoading();
            }
        });
    }

    try {
        // Pilih antara Ongoing atau Complete secara acak
        const type = Math.random() > 0.5 ? 'ongoing-anime' : 'complete-anime';
        // Ambil halaman secara acak (1-5 agar respon cepat)
        const page = Math.floor(Math.random() * 5) + 1;
        
        const res = await fetch(`${SANKA_API}/${type}?page=${page}`);
        if (!res.ok) throw new Error("Gagal mengambil data gacha");
        
        const json = await res.json();
        const animeList = json?.data?.animeList || [];
        
        if (animeList.length === 0) throw new Error("List anime kosong");
        
        // Pilih satu anime secara acak dari list
        const randomIdx = Math.floor(Math.random() * animeList.length);
        const anime = animeList[randomIdx];
        
        // Arahkan ke detail anime tersebut
        const slug = anime.animeId || anime.slug;
        const thumb = anime.poster || anime.thumb;
        
        if (window.app && window.app.loadDetail) {
            window.app.loadDetail(slug, thumb);
        } else {
            // Fallback jika app.loadDetail belum siap
            window.location.href = `/anime/${slug}`;
        }
        
    } catch (error) {
        console.error("Gacha Error:", error);
        if (Swal) {
            Swal.fire({
                icon: 'error',
                title: 'Ops!',
                text: 'Gacha gagal, coba lagi ya!',
                background: '#1a1a1a',
                color: '#fff',
                confirmButtonColor: '#ff6600'
            });
        }
    }
}
