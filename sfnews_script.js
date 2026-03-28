// Postavi globalnu varijablu za praćenje trenutno prikazane vijesti
let currentNewsIndex = 0;

// Definiranje DOM elemenata za navigaciju i modal
// OVO JE BIO KRITIČNI DIO KOJI JE NEDOSTAJAO ILI JE BIO NEISPRAVNO POZICIONIRAN:
const prevBtn = document.getElementById('prev-news-btn');
const nextBtn = document.getElementById('next-news-btn');
const imageModal = document.getElementById('image-modal'); // MORA BITI DEFINIRANO
const modalImageContent = document.getElementById('modal-image-content'); // MORA BITI DEFINIRANO
const closeModalBtn = document.getElementById('close-modal-btn'); // MORA BITI DEFINIRANO
const popupOverlay = document.getElementById('popup-overlay');

// --- FUNKCIJE ZA DEEP LINKING ---
function getNewsIdFromHash() {
    const hash = window.location.hash;
    if (hash && hash.startsWith('#news-')) {
        const id = parseInt(hash.substring(6));
        const index = sfNews.findIndex(item => item.id === id);
        return index !== -1 ? index : 0;
    }
    return 0;
}

function updateUrlHash(newsId) {
    // Ažuriraj URL bez ponovnog učitavanja stranice
    window.location.hash = `#news-${newsId}`;
}
// --- KRAJ FUNKCIJA ZA DEEP LINKING ---


// Funkcija za učitavanje i prikazivanje vijesti
function loadNews(index) {
    // Provjera granica
    if (index < 0 || index >= sfNews.length) {
        return;
    }

    currentNewsIndex = index;
    const newsItem = sfNews[currentNewsIndex];

    // NOVO: Ažurira URL adresu u pregledniku!
    updateUrlHash(newsItem.id);

    // 1. Ažuriranje glavnih elemenata
    document.getElementById('news-title').textContent = newsItem.title;
    const lang = document.documentElement.lang || 'hr'; // Provjeri jezik stranice
    const publishedText = lang === 'en' ? 'Published:' : 'Objavljeno:';
    document.getElementById('news-info').textContent = `${publishedText} ${newsItem.date}`;
    
    // Ažuriranje glavne slike (iznad teksta)
    const newsImage = document.getElementById('news-image');
    if (newsItem.imageSrc && newsItem.imageSrc.trim() !== "") {
        newsImage.src = newsItem.imageSrc;
        newsImage.alt = newsItem.title;
        newsImage.style.display = 'block'; // Prikaži sliku ako postoji link
    } else {
        newsImage.style.display = 'none'; // Sakrij sliku ako je link prazan
    }

    // Ažuriranje teksta
    document.getElementById('news-text').innerHTML = newsItem.contentHTML;

    // 2. Ažuriranje slajdera
    updateSlider(sfNews.length);

    // 3. Povezivanje click događaja za Certifikat (mora biti nakon što se HTML učita)
    setTimeout(attachImageModalListeners, 100);

    // Pomakni korisnika na vrh članka
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Funkcija za generiranje/ažuriranje navigacijskog slajdera (Ostatak je isti...)
function updateSlider(totalNews) {
    const navContainer = document.getElementById('news-navigation');
    navContainer.innerHTML = '';

    for (let i = 0; i < totalNews; i++) {
        const newsID = i + 1;
        const shortTitle = sfNews[i].shortTitle;
        const button = document.createElement('button');

        button.textContent = newsID;
        // Osnovni stil gumba: fiksna veličina (w-9 h-9) da budu savršeni krugovi
        button.className = `w-9 h-9 rounded-full font-bold transition-all text-sm flex items-center justify-center shadow-sm`;
        button.onclick = () => loadNews(i);

        if (i === currentNewsIndex) {
            // AKTIVNI GUMB: Ljubičasta pozadina, bijeli broj
            button.classList.add('bg-purple-600', 'text-white', 'scale-110');

            const titleSpan = document.createElement('span');
            titleSpan.textContent = ` – ${shortTitle}`;
            
            // TRAŽENO: Bijela boja, NIJE bold (font-normal)
            // Dodajemo 'news-slider-text' klasu za lakšu kontrolu preko CSS-a ako zatreba
            titleSpan.className = 'text-white text-md ml-2 font-normal hidden sm:inline-block news-slider-text';
            titleSpan.style.color = "white"; 
            navContainer.appendChild(button);
            navContainer.appendChild(titleSpan);
        } else {
            // TRAŽENO: NEAKTIVNI GUMBI -> Bijela pozadina, ljubičasti brojevi
            button.classList.add('bg-white', 'text-purple-600', 'hover:bg-purple-50');
            navContainer.appendChild(button);
        }
    }

    // Stil za strelice < i > 
    if (prevBtn && nextBtn) {
        // Postavljamo i strelice u isti stil (bijela pozadina, ljubičasta ikona)
        [prevBtn, nextBtn].forEach(btn => {
            btn.className = "bg-white text-purple-600 w-9 h-9 rounded-full flex items-center justify-center font-bold hover:bg-purple-50 transition-all mx-2 shadow-sm";
        });

        prevBtn.style.opacity = currentNewsIndex === 0 ? '0.3' : '1';
        nextBtn.style.opacity = currentNewsIndex === sfNews.length - 1 ? '0.3' : '1';
        prevBtn.classList.toggle('pointer-events-none', currentNewsIndex === 0);
        nextBtn.classList.toggle('pointer-events-none', currentNewsIndex === sfNews.length - 1);
    }
}
// FUNKCIJE ZA MODAL/UVEĆANJE SLIKE

function openModal(src, alt) {
    modalImageContent.src = src;
    modalImageContent.alt = alt;
    imageModal.classList.remove('hidden');
    document.body.classList.add('overflow-hidden');

    setTimeout(() => {
        imageModal.classList.add('opacity-100');
    }, 10);
}

function closeModal() {
    imageModal.classList.remove('opacity-100');
    document.body.classList.remove('overflow-hidden');

    setTimeout(() => {
        imageModal.classList.add('hidden');
    }, 300);
}

// Povezivanje modala (sada kad su definirani na vrhu)
if (closeModalBtn && imageModal) {
    closeModalBtn.addEventListener('click', closeModal);
    imageModal.addEventListener('click', (e) => {
        if (e.target === imageModal) {
            closeModal();
        }
    });
}


// Funkcija koja veže click događaj na Certifikat nakon učitavanja vijesti
function attachImageModalListeners() {
    const certificateThumbnail = document.getElementById('certificate-thumbnail');

    if (certificateThumbnail) {
        certificateThumbnail.classList.add('cursor-pointer', 'hover:opacity-90', 'transition-opacity');
        certificateThumbnail.onclick = () => {
            openModal(certificateThumbnail.src, certificateThumbnail.alt);
        };
    }
}


// Povezivanje funkcija na klik strelica
if (prevBtn) {
    prevBtn.addEventListener('click', () => {
        loadNews(currentNewsIndex - 1);
    });
}

if (nextBtn) {
    nextBtn.addEventListener('click', () => {
        loadNews(currentNewsIndex + 1);
    });
}

// POČETNA INICIJALIZACIJA (Sada čitamo iz URL-a)
window.onload = () => {
    if (typeof sfNews !== 'undefined' && sfNews.length > 0) {
        const initialIndex = getNewsIdFromHash();
        loadNews(initialIndex);
    }
};

