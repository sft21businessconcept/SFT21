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
const contractPopup = document.getElementById('contract-popup');

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
    document.getElementById('news-image').src = newsItem.imageSrc;
    document.getElementById('news-image').alt = newsItem.title;

    // Ažuriranje teksta
    document.getElementById('news-text').innerHTML = newsItem.contentHTML;

    // 2. Ažuriranje slajdera
    updateSlider(sfNews.length);

    // 3. Povezivanje click događaja za Certifikat (mora biti nakon što se HTML učita)
    setTimeout(attachDynamicEventListeners, 100);

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
        button.className = `p-2 rounded-full font-bold transition-all text-sm`;
        button.onclick = () => loadNews(i);

        if (i === currentNewsIndex) {
            button.classList.add('bg-purple-600', 'text-white');
            button.classList.remove('bg-gray-700', 'text-gray-300', 'hover:bg-purple-500');

            const titleSpan = document.createElement('span');
            titleSpan.textContent = ` – ${shortTitle}`;
            titleSpan.className = 'text-white text-md ml-1 font-semibold hidden sm:inline-block';
            navContainer.appendChild(button);
            navContainer.appendChild(titleSpan);
        } else {
            button.classList.add('bg-gray-700', 'text-gray-300', 'hover:bg-purple-500');
            navContainer.appendChild(button);
        }
    }

    if (prevBtn && nextBtn) {
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


// Funkcija koja veže click događaje na dinamičke elemente
function attachDynamicEventListeners() {
    // Povezivanje za thumbnail certifikata (ako postoji)
    const certificateThumbnail = document.getElementById('certificate-thumbnail');
    if (certificateThumbnail) {
        certificateThumbnail.onclick = () => openModal(certificateThumbnail.src, certificateThumbnail.alt);
    }

    // Povezivanje za gumb za otvaranje ugovora (ako postoji)
    const openContractBtn = document.getElementById('open-contract-popup-btn');
    if (openContractBtn) {
        openContractBtn.addEventListener('click', openContractPopup);
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

// FUNKCIJE ZA POPUP UGOVORA
const pdfPath = "dokumenti/ugovor-sft21.pdf"; 

function openContractPopup() {
    if (contractPopup && popupOverlay && pdfIframe) {
        // Postavi izvor PDF-a TEK KAD se otvara
        pdfIframe.setAttribute('src', pdfPath);
        
        popupOverlay.style.display = 'flex';
        contractPopup.style.display = 'flex';
        document.body.classList.add('overflow-hidden');
    }
}
function closeContractPopup() {
    if (contractPopup && popupOverlay && pdfIframe) {
        popupOverlay.style.display = 'none';
        contractPopup.style.display = 'none';
        document.body.classList.remove('overflow-hidden');
        
        // Obriši izvor PDF-a KAD se zatvori
        pdfIframe.removeAttribute('src');
    }
}

// Povezivanje zatvaranja za SVE popupe
if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            closeContractPopup(); // Zatvara popup ugovora
            closeModal(); // Zatvara popup za slike
        }
    });

    // Povezivanje 'x' gumba za zatvaranje ugovora
    const contractCloseBtn = contractPopup.querySelector('.popup-close');
    if (contractCloseBtn) {
        contractCloseBtn.addEventListener('click', closeContractPopup);
    }
}

    // Pronalazi SVE gumbe za zatvaranje unutar overlay-a i dodaje im funkcionalnost
    popupOverlay.querySelectorAll('.popup-close').forEach(btn => {
        btn.addEventListener('click', () => {
            popupOverlay.style.display = 'none';
            if (contractPopup) contractPopup.style.display = 'none';
            document.body.classList.remove('overflow-hidden');
        });
    });
}

