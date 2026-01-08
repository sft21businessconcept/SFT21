// ======================================================
//             GLAVNE VARIJABLE APLIKACIJE
// ======================================================
let currentNewsIndex = 0;
let pdfDoc = null;
let pageNum = 1;
let pageRendering = false;
let pageNumPending = null;

// DOM Elementi
const prevBtn = document.getElementById('prev-news-btn');
const nextBtn = document.getElementById('next-news-btn');
const popupOverlay = document.getElementById('popup-overlay');
const contractPopup = document.getElementById('contract-popup');
const imageModal = document.getElementById('image-modal');

// PDF Preglednik Elementi (unutar popupa)
const pdfCanvas = document.getElementById('pdf-canvas');
const prevPageBtn = document.getElementById('prev-page');
const nextPageBtn = document.getElementById('next-page');
const pageNumDisplay = document.getElementById('page-num-display');
const downloadPdfBtn = document.getElementById('download-pdf-btn');
const pdfLoader = document.getElementById('pdf-loader');
const modalImageContent = document.getElementById('modal-image-content');
const closeModalBtn = document.getElementById('close-modal-btn');


// ======================================================
//         FUNKCIJE ZA UPRAVLJANJE VIJESTIMA
// ======================================================

/**
 * Učitava i prikazuje vijest na temelju njenog indeksa u nizu `sfNews`.
 * @param {number} index - Index vijesti za prikaz.
 */
function loadNews(index) {
    if (index < 0 || index >= sfNews.length) {
        console.warn("Pokušaj učitavanja nepostojeće vijesti, index:", index);
        return;
    }

    currentNewsIndex = index;
    const newsItem = sfNews[currentNewsIndex];

    updateUrlHash(newsItem.id);

    // Ažuriranje glavnih elemenata članka
    document.getElementById('news-title').innerHTML = newsItem.title || "Naslov nije dostupan";
    document.getElementById('news-info').textContent = newsItem.date ? `Objavljeno: ${newsItem.date}` : "";
    document.getElementById('news-text').innerHTML = newsItem.contentHTML || "<p>Sadržaj nije dostupan.</p>";

    // Prikaz ili skrivanje glavne slike vijesti
    const newsImageContainer = document.getElementById('news-image-container');
    const newsImage = document.getElementById('news-image');
    if (newsItem.imageSrc) {
        newsImage.src = newsItem.imageSrc;
        newsImage.alt = newsItem.title;
        if (newsImageContainer) newsImageContainer.style.display = 'block';
    } else {
        if (newsImageContainer) newsImageContainer.style.display = 'none';
    }

    updateSliderNavigation();
    attachDynamicEventListeners();

    // Glatko skrolanje na vrh članka
    const articleContainer = document.querySelector('.main-article-container');
    if(articleContainer) {
        articleContainer.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

/**
 * Ažurira navigacijske gumbe (slider) na vrhu stranice.
 */
function updateSliderNavigation() {
    const navContainer = document.getElementById('news-navigation');
    if (!navContainer) return;
    navContainer.innerHTML = ''; // Očisti prethodne gumbe

    sfNews.forEach((news, i) => {
        const button = document.createElement('button');
        button.textContent = news.id;
        button.className = 'p-2 rounded-full font-bold transition-all text-sm w-8 h-8 flex items-center justify-center flex-shrink-0';
        button.onclick = () => loadNews(i);

        if (i === currentNewsIndex) {
            button.classList.add('bg-purple-600', 'text-white', 'scale-110');
            navContainer.appendChild(button);
            
            const titleSpan = document.createElement('span');
            titleSpan.textContent = news.shortTitle;
            titleSpan.className = 'text-white text-md ml-2 font-semibold hidden sm:inline-block whitespace-nowrap';
            navContainer.appendChild(titleSpan);
        } else {
            button.classList.add('bg-gray-700', 'text-gray-300', 'hover:bg-purple-500');
            navContainer.appendChild(button);
        }
    });

    // Ažuriranje stanja strelica
    if (prevBtn) {
        prevBtn.style.opacity = currentNewsIndex === 0 ? '0.3' : '1';
        prevBtn.classList.toggle('pointer-events-none', currentNewsIndex === 0);
    }
    if (nextBtn) {
        nextBtn.style.opacity = currentNewsIndex === sfNews.length - 1 ? '0.3' : '1';
        nextBtn.classList.toggle('pointer-events-none', currentNewsIndex === sfNews.length - 1);
    }
}

/**
 * Povezuje događaje (klikove) na elemente koji se dinamički stvaraju.
 */
function attachDynamicEventListeners() {
    // Povezivanje za thumbnail certifikata (ako postoji)
    const certificateThumbnail = document.getElementById('certificate-thumbnail');
    if (certificateThumbnail) {
        certificateThumbnail.onclick = () => openImageModal(certificateThumbnail.src, certificateThumbnail.alt);
    }

    // Povezivanje za gumb za otvaranje ugovora
    const openContractBtn = document.getElementById('open-contract-popup-btn');
    if (openContractBtn) {
        openContractBtn.addEventListener('click', () => {
            const isEnglish = document.documentElement.lang === 'en';
            const pdfUrl = isEnglish ? 'dokumenti/license-agreement-sft21.pdf' : 'dokumenti/ugovor-sft21.pdf';
            
            if (popupOverlay && contractPopup) {
                popupOverlay.style.display = 'flex';
                contractPopup.style.display = 'flex';
                document.body.classList.add('overflow-hidden');
                loadPdf(pdfUrl);
            }
        });
    }
}


// ======================================================
//              FUNKCIJE ZA URL I DEEP LINKING
// ======================================================
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


// ======================================================
//              FUNKCIJE ZA MODALE I POPUPE
// ======================================================
function openImageModal(src, alt) {
    if(modalImageContent && imageModal) {
        modalImageContent.src = src;
        modalImageContent.alt = alt;
        imageModal.classList.remove('hidden');
        document.body.classList.add('overflow-hidden');
        setTimeout(() => imageModal.classList.add('opacity-100'), 10);
    }
}

function closeAllPopups() {
    if (popupOverlay) popupOverlay.style.display = 'none';
    if (contractPopup) contractPopup.style.display = 'none';
    if (imageModal) {
        imageModal.classList.remove('opacity-100');
        setTimeout(() => imageModal.classList.add('hidden'), 300);
    }
    document.body.classList.remove('overflow-hidden');
}


// ======================================================
//              LOGIKA ZA PDF PREGLEDNIK
// ======================================================
function renderPage(num) {
    pageRendering = true;
    if(pdfLoader) pdfLoader.style.display = 'block';

    pdfDoc.getPage(num).then(page => {
        const viewerContainer = document.getElementById('pdf-viewer-container');
        const scale = viewerContainer.clientWidth / page.getViewport({ scale: 1.0 }).width;
        const viewport = page.getViewport({ scale: scale });

        pdfCanvas.height = viewport.height;
        pdfCanvas.width = viewport.width;

        const renderContext = {
            canvasContext: pdfCanvas.getContext('2d'),
            viewport: viewport
        };
        page.render(renderContext).promise.then(() => {
            pageRendering = false;
            if(pdfLoader) pdfLoader.style.display = 'none';
            if (pageNumPending !== null) {
                renderPage(pageNumPending);
                pageNumPending = null;
            }
        });
    });

    if(pageNumDisplay) pageNumDisplay.textContent = `Stranica ${num} / ${pdfDoc.numPages}`;
}

function queueRenderPage(num) {
    if (pageRendering) {
        pageNumPending = num;
    } else {
        renderPage(num);
    }
}

function loadPdf(url) {
    if (!pdfjsLib) {
        console.error("PDF.js biblioteka nije učitana.");
        return;
    }
    if(pdfLoader) pdfLoader.style.display = 'block';
    
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://mozilla.github.io/pdf.js/build/pdf.worker.js';

    pdfjsLib.getDocument(url).promise.then(pdfDoc_ => {
        pdfDoc = pdfDoc_;
        pageNum = 1;
        renderPage(pageNum);
        if(downloadPdfBtn) downloadPdfBtn.href = url;
    }, reason => {
        console.error("Greška pri učitavanju PDF-a:", reason);
        if(pdfLoader) pdfLoader.textContent = "Greška pri učitavanju PDF-a.";
    });
}


// ======================================================
//          GLAVNI EVENT LISTENERI I INICIJALIZACIJA
// ======================================================
document.addEventListener('DOMContentLoaded', () => {
    // Navigacija vijesti
    if (prevBtn) prevBtn.addEventListener('click', () => loadNews(currentNewsIndex - 1));
    if (nextBtn) nextBtn.addEventListener('click', () => loadNews(currentNewsIndex + 1));

    // Navigacija PDF-a
    if (prevPageBtn) prevPageBtn.addEventListener('click', () => { if (pageNum > 1) { pageNum--; queueRenderPage(pageNum); } });
    if (nextPageBtn) nextPageBtn.addEventListener('click', () => { if (pageNum < pdfDoc.numPages) { pageNum++; queueRenderPage(pageNum); } });

    // Zatvaranje modala i popupa
    if (closeModalBtn) closeModalBtn.addEventListener('click', closeAllPopups);
    if (imageModal) imageModal.addEventListener('click', e => { if (e.target === imageModal) closeAllPopups(); });
    if (popupOverlay) {
        popupOverlay.addEventListener('click', e => { if (e.target === popupOverlay) closeAllPopups(); });
        popupOverlay.querySelectorAll('.popup-close').forEach(btn => btn.addEventListener('click', closeAllPopups));
    }

    // Inicijalno učitavanje prve vijesti (ili one iz URL-a)
    if (typeof sfNews !== 'undefined' && sfNews.length > 0) {
        const initialIndex = getNewsIdFromHash();
        loadNews(initialIndex);
    } else {
        console.error("Datoteka 'sfnews_data.js' nije pronađena ili je prazna.");
    }
});
