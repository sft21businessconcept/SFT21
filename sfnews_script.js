// Postavi globalnu varijablu za praćenje trenutno prikazane vijesti
let currentNewsIndex = 0;

// Definiranje DOM elemenata za navigaciju i modal
const prevBtn = document.getElementById('prev-news-btn');
const nextBtn = document.getElementById('next-news-btn');
const imageModal = document.getElementById('image-modal');
const modalImageContent = document.getElementById('modal-image-content');
const closeModalBtn = document.getElementById('close-modal-btn');

// Funkcija za učitavanje i prikazivanje vijesti
function loadNews(index) {
    // Provjera granica
    if (index < 0 || index >= sfNews.length) {
        return;
    }

    currentNewsIndex = index;
    const newsItem = sfNews[currentNewsIndex];

    // 1. Ažuriranje glavnih elemenata
    document.getElementById('news-title').textContent = newsItem.title;
    document.getElementById('news-info').textContent = `Objavljeno: ${newsItem.date}`;

    // Ažuriranje glavne slike (iznad teksta)
    document.getElementById('news-image').src = newsItem.imageSrc;
    document.getElementById('news-image').alt = newsItem.title;

    // Ažuriranje teksta (učitat će se i Certifikat)
    document.getElementById('news-text').innerHTML = newsItem.contentHTML;

    // 2. Ažuriranje slajdera
    updateSlider(sfNews.length);

    // 3. Povezivanje click događaja za Certifikat (mora biti nakon što se HTML učita)
    // Mali delay (100ms) osigurava da je element `certificate-thumbnail` prisutan u DOM-u.
    setTimeout(attachImageModalListeners, 100);

    // Pomakni korisnika na vrh članka
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

// Funkcija za generiranje/ažuriranje navigacijskog slajdera
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

    // Ažuriranje izgleda strelica (koristimo već definirane prevBtn i nextBtn)
    if (prevBtn && nextBtn) {
        prevBtn.style.opacity = currentNewsIndex === 0 ? '0.3' : '1';
        nextBtn.style.opacity = currentNewsIndex === sfNews.length - 1 ? '0.3' : '1';

        prevBtn.classList.toggle('pointer-events-none', currentNewsIndex === 0);
        nextBtn.classList.toggle('pointer-events-none', currentNewsIndex === sfNews.length - 1);
    }
}

// FUNKCIJE ZA MODAL/UVEĆANJE SLIKE

function openModal(imageSrc, imageAlt) {
    if (!imageModal || !modalImageContent) return; // Osigurač
    modalImageContent.src = imageSrc;
    modalImageContent.alt = imageAlt;
    imageModal.classList.remove('hidden');
    // Koristi setTimeout za tranziciju (opacity: 0 -> opacity: 1)
    setTimeout(() => {
        imageModal.classList.remove('opacity-0');
    }, 10);
}

function closeModal() {
    if (!imageModal) return; // Osigurač
    imageModal.classList.add('opacity-0');
    setTimeout(() => {
        imageModal.classList.add('hidden');
    }, 300); // 300ms je duljina tranzicije
}

// Povezivanje modala s tipkom i klikom izvan slike (Koristimo već definirane elemente)
if (closeModalBtn && imageModal) {
    closeModalBtn.addEventListener('click', closeModal);
    imageModal.addEventListener('click', (e) => {
        // Zatvori modal samo ako se kliknulo na pozadinu (a ne na sliku unutar modala)
        if (e.target === imageModal) {
            closeModal();
        }
    });
}


// Funkcija koja veže click događaj na Certifikat nakon učitavanja vijesti
function attachImageModalListeners() {
    // Tražimo sliku Certifikata unutar dinamički učitanog teksta
    const certificateThumbnail = document.getElementById('certificate-thumbnail');

    if (certificateThumbnail) {
        // Dodajemo klase koje vizualno signaliziraju da se može kliknuti
        certificateThumbnail.classList.add('cursor-pointer', 'hover:opacity-90', 'transition-opacity');

        // Povezujemo funkciju otvaranja modala
        certificateThumbnail.onclick = () => {
            // Putanja slike certifikata: img/certificateofformation.png
            openModal(certificateThumbnail.src, certificateThumbnail.alt);
        };
    }
}


// Povezivanje funkcija na klik strelica (Koristimo već definirane elemente)
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

// POČETNA INICIJALIZACIJA
window.onload = () => {
    if (typeof sfNews !== 'undefined' && sfNews.length > 0) {
        loadNews(0);
    }
};