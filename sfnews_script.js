// Postavi globalnu varijablu za praćenje trenutno prikazane vijesti
let currentNewsIndex = 0;

// Definiranje DOM elemenata
const prevBtn = document.getElementById('prev-news-btn');
const nextBtn = document.getElementById('next-news-btn');
const imageModal = document.getElementById('image-modal');
const modalImageContent = document.getElementById('modal-image-content');
const closeModalBtn = document.getElementById('close-modal-btn');

// Elementi za popup ugovora
const popupOverlay = document.getElementById('popup-overlay');
const contractPopup = document.getElementById('contract-popup');
const pdfIframe = document.getElementById('pdf-iframe');

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
    if (history.pushState) {
        history.pushState(null, null, `#news-${newsId}`);
    } else {
        window.location.hash = `#news-${newsId}`;
    }
}

// Funkcija za učitavanje i prikazivanje vijesti
function loadNews(index) {
    if (index < 0 || index >= sfNews.length) return;

    currentNewsIndex = index;
    const newsItem = sfNews[currentNewsIndex];
    updateUrlHash(newsItem.id);

    // Ažuriranje elemenata
    const lang = document.documentElement.lang || 'hr';
    const publishedText = lang === 'en' ? 'Published:' : 'Objavljeno:';
    document.getElementById('news-title').innerHTML = newsItem.title;
    document.getElementById('news-info').textContent = `${publishedText} ${newsItem.date}`;
    document.getElementById('news-text').innerHTML = newsItem.contentHTML;

    // Prikaz ili sakrivanje glavne slike
    const newsImageContainer = document.getElementById('news-image-container');
    const newsImage = document.getElementById('news-image');
    if (newsItem.imageSrc) {
        newsImage.src = newsItem.imageSrc;
        newsImage.alt = newsItem.title;
        newsImageContainer.style.display = 'block';
    } else {
        newsImageContainer.style.display = 'none';
    }

    updateSlider();
    attachDynamicEventListeners();
    document.querySelector('main').scrollIntoView({ behavior: 'smooth' });
}

// Funkcija za generiranje/ažuriranje navigacijskog slajdera
function updateSlider() {
    const navContainer = document.getElementById('news-navigation');
    navContainer.innerHTML = ''; 

    sfNews.forEach((news, i) => {
        const button = document.createElement('button');
        button.textContent = news.id;
        button.className = `p-2 rounded-full font-bold transition-all text-sm w-8 h-8 flex items-center justify-center`;
        button.onclick = () => loadNews(i);

        if (i === currentNewsIndex) {
            button.classList.add('bg-purple-600', 'text-white', 'scale-110');
            const titleSpan = document.createElement('span');
            titleSpan.textContent = news.shortTitle;
            titleSpan.className = 'text-white text-md ml-2 font-semibold hidden sm:inline-block whitespace-nowrap';
            navContainer.appendChild(button);
            navContainer.appendChild(titleSpan);
        } else {
            button.classList.add('bg-gray-700', 'text-gray-300', 'hover:bg-purple-500');
            navContainer.appendChild(button);
        }
    });

    prevBtn.style.opacity = currentNewsIndex === 0 ? '0.3' : '1';
    nextBtn.style.opacity = currentNewsIndex === sfNews.length - 1 ? '0.3' : '1';
    prevBtn.classList.toggle('pointer-events-none', currentNewsIndex === 0);
    nextBtn.classList.toggle('pointer-events-none', currentNewsIndex === sfNews.length - 1);
}

// FUNKCIJE ZA MODAL/UVEĆANJE SLIKE
function openModal(src, alt) {
    if (modalImageContent && imageModal) {
        modalImageContent.src = src;
        modalImageContent.alt = alt;
        imageModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        setTimeout(() => imageModal.classList.add('opacity-100'), 10);
    }
}
function closeModal() {
    if (imageModal) {
        imageModal.classList.remove('opacity-100');
        document.body.classList.remove('overflow-hidden');
        setTimeout(() => imageModal.classList.add('hidden'), 300);
    }
}

// FUNKCIJE ZA POPUP UGOVORA
const pdfPath = "dokumenti/ugovor-sft21.pdf"; 

function openContractPopup() {
    if (contractPopup && popupOverlay && pdfIframe) {
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
        pdfIframe.removeAttribute('src');
    }
}

// Funkcija koja veže click događaje na dinamičke elemente
function attachDynamicEventListeners() {
    const certificateThumbnail = document.getElementById('certificate-thumbnail');
    if (certificateThumbnail) {
        certificateThumbnail.onclick = () => openModal(certificateThumbnail.src, certificateThumbnail.alt);
    }

    const openContractBtn = document.getElementById('open-contract-popup-btn');
    if (openContractBtn) {
        openContractBtn.addEventListener('click', openContractPopup);
    }
}

// Povezivanje event listenera
if (prevBtn) prevBtn.addEventListener('click', () => loadNews(currentNewsIndex - 1));
if (nextBtn) nextBtn.addEventListener('click', () => loadNews(currentNewsIndex + 1));
if (closeModalBtn) closeModalBtn.addEventListener('click', closeModal);
if (imageModal) imageModal.addEventListener('click', (e) => { if (e.target === imageModal) closeModal(); });

if (popupOverlay) {
    popupOverlay.addEventListener('click', (e) => {
        if (e.target === popupOverlay) {
            closeContractPopup();
            closeModal(); // Dodajemo i zatvaranje modala za slike za svaki slučaj
        }
    });
    // Zatvaranje popupa za ugovor
    const contractCloseBtn = contractPopup.querySelector('.popup-close');
    if (contractCloseBtn) {
        contractCloseBtn.addEventListener('click', closeContractPopup);
    }
}

// Inicijalizacija pri učitavanju stranice
window.addEventListener('DOMContentLoaded', () => {
    if (typeof sfNews !== 'undefined' && sfNews.length > 0) {
        const initialIndex = getNewsIdFromHash();
        loadNews(initialIndex);
    }
});
