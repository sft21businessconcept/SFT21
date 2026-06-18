// Postavi globalnu varijablu za praćenje trenutno prikazane vijesti
let currentNewsIndex = 0;

// Definiranje DOM elemenata za navigaciju
const prevBtn = document.getElementById('prev-news-btn');
const nextBtn = document.getElementById('next-news-btn');

// --- FUNKCIJE ZA DEEP LINKING ---
function getNewsIdFromHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#news-')) {
        const id = parseInt(hash.substring(6));
        // SFT21 logično polje počinje od 1, ali index niza od 0
        const index = typeof sfNews !== 'undefined' ? sfNews.findIndex(item => item.id === id) : 0;
        return index !== -1 ? index : 0;
    }
    return 0;
}

function updateUrlHash(newsId) {
    window.location.hash = `#news-${newsId}`;
}

// --- GLAVNA FUNKCIJA ZA UČITAVANJE VIJESTI ---
window.loadNews = function(index) {
    if (typeof sfNews === 'undefined' || index < 0 || index >= sfNews.length) return;

    currentNewsIndex = index;
    const newsItem = sfNews[currentNewsIndex];
    updateUrlHash(newsItem.id);

// Ažuriranje tekstova
    const titleEl = document.getElementById('news-title');
    const infoEl = document.getElementById('news-info');
    
    if (titleEl) {
        // Provjerava i HR/SR verziju i EN verziju naslova
        if (newsItem.title.includes("EKSKLUZIVNI INTERVJU Domizio Cipriani")) {
            titleEl.innerHTML = "EKSKLUZIVNI INTERVJU<br>Domizio Cipriani";
        } else if (newsItem.title.includes("EXCLUSIVE INTERVIEW: Domizio Cipriani")) {
            titleEl.innerHTML = "EXCLUSIVE INTERVIEW<br>Domizio Cipriani";
        } else {
            titleEl.textContent = newsItem.title;
        }
    }
    
    const lang = document.documentElement.lang || 'hr'; 
    const publishedText = lang === 'en' ? 'Published:' : 'Objavljeno:';
    if (infoEl) infoEl.textContent = `${publishedText} ${newsItem.date}`;
    
    // Ažuriranje glavne slike
    const newsImage = document.getElementById('news-image');
    if (newsImage) {
        if (newsItem.imageSrc && newsItem.imageSrc.trim() !== "") {
            newsImage.src = newsItem.imageSrc;
            newsImage.alt = newsItem.title;
            newsImage.style.display = 'block'; 
        } else {
            newsImage.style.display = 'none'; 
        }
    }

    // Učitavanje HTML sadržaja (uključujući slajder)
    const newsText = document.getElementById('news-text');
    if (newsText) newsText.innerHTML = newsItem.contentHTML;

    // Ažuriranje navigacije i slajdera
    updateSlider(sfNews.length);
    
    // Resetiraj slajder galerije na 0 svaku put kad otvorimo novu vijest
    window.currentNewsSlideIdx = 0;

    // Popravak za klik na certifikat
    const certThumb = document.getElementById('certificate-thumbnail');
    if (certThumb) {
        certThumb.classList.add('cursor-pointer', 'hover:opacity-90', 'transition-opacity');
        certThumb.onclick = () => window.openModal(certThumb.src, certThumb.alt);
    }

    // Skrolaj na vrh
    window.scrollTo({ top: 0, behavior: 'smooth' });
};

// --- AŽURIRANJE NAVIGACIJSKOG SLAJDERA ---
function updateSlider(totalNews) {
    const navContainer = document.getElementById('news-navigation');
    if (!navContainer) return;
    navContainer.innerHTML = '';

    for (let i = 0; i < totalNews; i++) {
        const newsID = i + 1;
        const shortTitle = sfNews[i].shortTitle;
        const button = document.createElement('button');

        button.textContent = newsID;
        button.className = `w-9 h-9 rounded-full font-bold transition-all text-sm flex items-center justify-center shadow-sm`;
        button.onclick = () => window.loadNews(i);

        if (i === currentNewsIndex) {
            button.classList.add('bg-purple-600', 'text-white', 'scale-110');
            const titleSpan = document.createElement('span');
            titleSpan.textContent = ` – ${shortTitle}`;
            titleSpan.className = 'text-white text-md ml-2 font-normal hidden sm:inline-block news-slider-text';
            navContainer.appendChild(button);
            navContainer.appendChild(titleSpan);
        } else {
            button.classList.add('bg-white', 'text-purple-600', 'hover:bg-purple-50');
            navContainer.appendChild(button);
        }
    }

    if (prevBtn && nextBtn) {
        [prevBtn, nextBtn].forEach(btn => {
            btn.className = "bg-white text-purple-600 w-9 h-9 rounded-full flex items-center justify-center font-bold hover:bg-purple-50 transition-all mx-2 shadow-sm";
        });
        prevBtn.style.opacity = currentNewsIndex === 0 ? '0.3' : '1';
        nextBtn.style.opacity = currentNewsIndex === sfNews.length - 1 ? '0.3' : '1';
        prevBtn.classList.toggle('pointer-events-none', currentNewsIndex === 0);
        nextBtn.classList.toggle('pointer-events-none', currentNewsIndex === sfNews.length - 1);
    }
}

// --- POVEZIVANJE STRELICA ---
if (prevBtn) prevBtn.onclick = () => window.loadNews(currentNewsIndex - 1);
if (nextBtn) nextBtn.onclick = () => window.loadNews(currentNewsIndex + 1);

// --- POČETNA INICIJALIZACIJA ---
window.onload = () => {
    if (typeof sfNews !== 'undefined' && sfNews.length > 0) {
        window.loadNews(getNewsIdFromHash());
    }
};

// ==========================================
// UNIVERZALNI LIGHTBOX (UVEĆANJE SLIKA)
// ==========================================
window.openModal = (src, alt) => {
    const modal = document.getElementById('image-modal');
    const modalImg = document.getElementById('modal-image-content');
    
    if (!modal || !modalImg) return;

    modalImg.src = src;
    modalImg.alt = alt || "Uvećana slika";
    
    modal.classList.remove('hidden');
    modal.style.display = 'flex'; 
    document.body.style.overflow = 'hidden'; 

    setTimeout(() => {
        modal.classList.remove('opacity-0');
        modal.classList.add('opacity-100');
    }, 10);
};

window.closeImageModal = () => {
    const modal = document.getElementById('image-modal');
    if (!modal) return;

    modal.classList.remove('opacity-100');
    modal.classList.add('opacity-0');
    document.body.style.overflow = ''; 

    setTimeout(() => {
        modal.classList.add('hidden');
        modal.style.display = 'none'; 
        document.getElementById('modal-image-content').src = ''; 
    }, 300);
};

// ==========================================
// LOGIKA ZA SLAJDER UNUTAR VIJESTI
// ==========================================
window.currentNewsSlideIdx = 0;

window.moveNewsSlider = (direction) => {
    const slides = document.querySelectorAll('.news-slide-img');
    if (!slides || slides.length === 0) return;
    
    // Sakrij trenutnu sliku
    slides[window.currentNewsSlideIdx].classList.add('hidden');
    slides[window.currentNewsSlideIdx].classList.remove('animate-fade-in');
    
    // Izračunaj koja je iduća slika (Beskonačni krug)
    window.currentNewsSlideIdx += direction;
    
    if (window.currentNewsSlideIdx >= slides.length) {
        window.currentNewsSlideIdx = 0; 
    }
    if (window.currentNewsSlideIdx < 0) {
        window.currentNewsSlideIdx = slides.length - 1; 
    }
    
    // Pokaži novu sliku
    slides[window.currentNewsSlideIdx].classList.remove('hidden');
    slides[window.currentNewsSlideIdx].classList.add('animate-fade-in'); 
};
