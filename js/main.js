// ====================================================================
// GLAVNA SKRIPTA ZA PREVOĐENJE I APLIKACIJU
// ====================================================================

/**
 * Provjerava status prijave i ažurira UI (gumb Prijava/Odjava i Registracija).
 */
function handleLoginState() {
    const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';
    const isEnglish = window.location.pathname.includes('_en');

    // Pronađi sve gumbe za prijavu i registraciju
    const loginButtons = document.querySelectorAll('a[href^="login.html"]');
    const registerButtons = document.querySelectorAll('a[href^="register.html"]');

    if (isLoggedIn) {
        // === KORISNIK JE PRIJAVLJEN ===
        loginButtons.forEach(btn => {
            btn.textContent = isEnglish ? 'Logout' : 'Odjava';
            btn.href = '#';
            btn.id = 'logout-button';
            
            if (!btn.dataset.logoutListener) {
                btn.addEventListener('click', (e) => {
                    e.preventDefault();
                    sessionStorage.removeItem('isLoggedIn');
                    alert(isEnglish ? 'You have been successfully logged out.' : 'Uspješno ste odjavljeni.');
                    window.location.href = isEnglish ? 'index_en.html' : 'index.html';
                });
                btn.dataset.logoutListener = 'true';
            }
        });

        registerButtons.forEach(btn => {
            btn.classList.add('opacity-50', 'cursor-not-allowed');
            btn.onclick = (e) => e.preventDefault();
        });

    } else {
        // === KORISNIK NIJE PRIJAVLJEN ===
        const logoutButton = document.getElementById('logout-button');
        if(logoutButton) {
            logoutButton.textContent = isEnglish ? 'Login' : 'Prijava';
            logoutButton.href = isEnglish ? 'login_en.html' : 'login.html';
            logoutButton.id = '';
            delete logoutButton.dataset.logoutListener;
        }

        registerButtons.forEach(btn => {
            btn.classList.remove('opacity-50', 'cursor-not-allowed');
            btn.onclick = null;
        });
    }
}

/**
 * Glavna funkcija za inicijalizaciju i prevođenje.
 */
async function i18n_init() {
    const savedLang = localStorage.getItem('sft21_lang') || 'hr';
    
    await i18next.use(i18nextHttpBackend).init({
        lng: savedLang,
        fallbackLng: 'hr',
        debug: false,
        backend: {
            loadPath: 'locales/{{lng}}.json',
        },
    });

    updateContent(savedLang);
    
    document.querySelectorAll('[data-lang]').forEach(el => {
        el.addEventListener('click', (e) => {
            e.preventDefault();
            const lang = el.getAttribute('data-lang');
            i18next.changeLanguage(lang, (err, t) => {
                if (err) return console.error('i18next error:', err);
                localStorage.setItem('sft21_lang', lang);
                updateContent(lang);
            });
        });
    });

    // Pokreni ostatak logike NAKON što su prijevodi učitani
    initializeAppLogic();
}


/**
 * Funkcija koja ažurira sav sadržaj na stranici na temelju prijevoda.
 */
const updateContent = (lang) => {
    document.documentElement.lang = lang; 

    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        if (key && i18next.exists(key)) {
            el.innerHTML = i18next.t(key);
        }
    });

    const updateAttribute = (selector, attribute, key) => {
        const element = document.querySelector(selector);
        if (element && i18next.exists(key)) {
            element[attribute] = i18next.t(key);
        }
    };
    
    updateAttribute('#name', 'placeholder', 'contact.placeholderName');
    updateAttribute('#email', 'placeholder', 'contact.placeholderEmail');
    updateAttribute('#subject', 'placeholder', 'contact.placeholderSubject');
    updateAttribute('#message', 'placeholder', 'contact.placeholderMessage');
    updateAttribute('#contact-name-popup', 'placeholder', 'placeholderFullName');
    updateAttribute('#contact-email-popup', 'placeholder', 'placeholderEmail');
    updateAttribute('#contact-phone-popup', 'placeholder', 'placeholderPhone');
    updateAttribute('#starter-package-email-input', 'placeholder', 'starterPopup.placeholderEmail');
    updateAttribute('#investor-name-details', 'placeholder', 'placeholderFullName');
    updateAttribute('#investor-email-details', 'placeholder', 'placeholderEmail');
    updateAttribute('#referrer-name-email', 'placeholder', 'placeholderReferrer');
    updateAttribute('#ip7-custom-amount-details', 'placeholder', 'ip7.placeholderMin');
    updateAttribute('#ip7-amount-input', 'placeholder', 'ip7.placeholderMinLegacy');
    updateAttribute('#user-counter-hide-btn', 'title', 'userCounter.hide');
    updateAttribute('#user-counter-close-btn', 'title', 'userCounter.close');
    updateAttribute('#user-counter-show-btn', 'title', 'userCounter.show');
    updateAttribute('#ai-chat-close-btn', 'aria-label', 'aiChat.close');
};

/**
 * Funkcija koja sadrži svu ostalu logiku aplikacije.
 */
function initializeAppLogic() {
    console.log("DOM spreman, pokrećem skripte...");
    const body = document.body;
    handleLoginState();


    // --- Deklaracija svih varijabli ---
    const desktopLangDropdown = document.getElementById('desktop-lang-dropdown');
    const mobileLangDropdown = document.getElementById('mobile-lang-dropdown');
    const mobileLangIcon = mobileLangTrigger?.querySelector('i.fas.fa-chevron-down');
    const hamburger = document.querySelector('.hamburger');
    const navMenu = document.querySelector('.nav-menu');
    const mobileDropdownToggles = document.querySelectorAll('.nav-menu .mobile-dropdown-toggle:not(.mobile-language-trigger)');


// Logika za Custom Kursor
if (cursor && body) {
    let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
    const speed = 0.1;
    const updateCursorPosition = () => {
        cursorX += (mouseX - cursorX) * speed;
        cursorY += (mouseY - cursorY) * speed;
        if (cursor) {
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
        }
        requestAnimationFrame(updateCursorPosition);
    };
    requestAnimationFrame(updateCursorPosition);
    window.addEventListener('mousemove', (e) => {
        mouseX = e.clientX;
        mouseY = e.clientY;
    });
    document.addEventListener('mouseleave', () => { if (cursor) cursor.style.opacity = '0'; });
    document.addEventListener('mouseenter', () => { if (cursor) cursor.style.opacity = '1'; });

    // Funkcija za vraćanje kursora na zadanu boju ovisno o temi
    const resetCursorColor = () => {
        if (cursor && typeof gsap !== 'undefined') {
            const isLightMode = document.documentElement.classList.contains('light-mode');
            // Dohvaćamo vrijednosti varijabli direktno iz CSS-a
            const darkColor = getComputedStyle(document.documentElement).getPropertyValue('--dark-color').trim();
            const orangeColor = getComputedStyle(document.documentElement).getPropertyValue('--fluorescent-orange').trim();
            
            const targetColor = isLightMode ? darkColor : orangeColor;
            
            gsap.to(cursor, { 
                duration: 0.3, 
                scale: 1, 
                backgroundColor: targetColor
            });
        }
    };

    setTimeout(() => {
        resetCursorColor(); 
        document.querySelectorAll('a, button, .accordion-header, .hamburger, input, textarea, select, .language-trigger, .language-item, label[for], .interactive-card, .swiper-button-next, .swiper-button-prev, .starter-package-select-btn, .trigger-choose-investor-type-popup, .open-investment-details-popup, .member-card, .career-member-avatar')
        .forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (cursor && typeof gsap !== 'undefined') {
                    const isLightMode = document.documentElement.classList.contains('light-mode');
                    const hoverColor = isLightMode ? 'rgba(171, 71, 188, 0.8)' : 'rgba(128, 255, 0, 0.5)'; // Ljubičasta za light, zelena za dark
                    gsap.to(cursor, { 
                        duration: 0.3, 
                        scale: 1.5, 
                        backgroundColor: hoverColor
                    });
                }
            });
            el.addEventListener('mouseleave', resetCursorColor);
        });
    }, 500);
}
// <<< KRAJ BLOKA ZA KURSOR >>>
    const fixedNav = document.querySelector('nav.fixed');
    const navHeight = fixedNav ? fixedNav.offsetHeight : 80;
    const accordionItems = document.querySelectorAll('.accordion-item');
    const extraScrollMarginAccordion = 10;
    const popupOverlay = document.getElementById('popup-overlay');
    const validationPopup = document.getElementById('validation-popup');
    const contactFormPopup = document.getElementById('contact-form-popup');
    const starterPackageInfoPopup = document.getElementById('starter-package-info-popup');
    const starterInfoCloseLink = document.getElementById('starter-info-close-link');
    const starterPackageSelectBtns = document.querySelectorAll('.starter-package-select-btn');
    const starterPackageEmailForm = document.getElementById('starter-package-email-form');
    const starterPackageEmailInput = document.getElementById('starter-package-email-input');
    const ip7AmountInputContainer = document.getElementById('ip7-amount-input-container');
    const ip7AmountInput = document.getElementById('ip7-amount-input');
    const ip7Do10kBtn = document.getElementById('ip7-do-10k');
    const ip7VećiIznosBtn = document.getElementById('ip7-veci-iznos');
    const ip7AmountConfirmBtn = ip7AmountInputContainer?.querySelector('#ip7-amount-confirm');
    const ip7AmountCancelBtn = ip7AmountInputContainer?.querySelector('#ip7-amount-cancel');
    const minAmountDo10k = 2200;
    const maxAmountDo10k = 10000;
    const contactForm = document.querySelector('#contact-form-popup form');
    const contactNameInput = document.getElementById('contact-name-popup');
    const contactEmailInput = document.getElementById('contact-email-popup');
    const contactPhoneInput = document.getElementById('contact-phone-popup');
    const aiChatIcon = document.getElementById('ai-chat-float-icon');
    const aiChatPopup = document.getElementById('ai-chat-popup');
    const aiChatCloseBtn = document.getElementById('ai-chat-close-btn');
    const userCounterWidget = document.getElementById('user-counter-widget');
    const userCounterHeader = document.getElementById('user-counter-header');
    const userCounterList = document.getElementById('user-counter-list');
    const userCounterNumberEl = document.getElementById('user-counter-number');
    const userCounterHideBtn = document.getElementById('user-counter-hide-btn');
    const userCounterCloseBtn = document.getElementById('user-counter-close-btn');
    const userCounterShowBtn = document.getElementById('user-counter-show-btn');
    const chooseInvestorTypePopup = document.getElementById('choose-investor-type-popup');
    const investmentDetailsPopup = document.getElementById('investment-details-popup');
    const triggerChooseInvestorTypeBtns = document.querySelectorAll('.trigger-choose-investor-type-popup');
    const openInvestmentDetailsFromCardBtns = document.querySelectorAll('.open-investment-details-popup');
    const btnRegistriraniKorisnikChoice = document.getElementById('btn-registrirani-korisnik-choice');
    const btnNoviInvestitorChoice = document.getElementById('btn-novi-investitor-choice');
    const investmentDetailsForm = document.getElementById('investment-details-form');
    const investorNameDetailsInput = document.getElementById('investor-name-details');
    const investorEmailDetailsInput = document.getElementById('investor-email-details');
    // Ispravljena deklaracija: Koristite ID forme jer su checkboxovi unutar nje
    const investmentPackageDetailsCheckboxes = document.querySelectorAll('#investment-details-form input[name="ip_package_details"]'); 
    const ip7CheckboxDetails = document.getElementById('ip7-checkbox-details');
    const ip7CustomAmountDetailsInput = document.getElementById('ip7-custom-amount-details');
    const totalInvestmentAmountDetailsSpan = document.getElementById('total-investment-amount-details');
    const referrerYesRadio = document.getElementById('referrer-yes');
    const referrerNoRadio = document.getElementById('referrer-no');
    const referrerInputContainer = document.getElementById('referrer-input-container');
    // Dodana je referenca na defaultReferrerDisplay jer se spominje u initializeReferrerFields
    const defaultReferrerDisplay = document.getElementById('default-referrer-display'); 
    const referrerNameEmailInput = document.getElementById('referrer-name-email');

    // Dodajte reference na elemente novog popup-a (ovo već imate, ali je ponovljeno radi jasnoće)
    const welcomePopup = document.getElementById('welcome-popup');
    const welcomeContinueBtn = document.getElementById('welcome-popup-continue');

    // --- Logika za Welcome Popup ---
    const hasSeenWelcomePopup = localStorage.getItem('hasSeenWelcomePopup');

    if (!hasSeenWelcomePopup) {
        setTimeout(() => {
            if (welcomePopup) {
                showPopup(welcomePopup);
                localStorage.setItem('hasSeenWelcomePopup', 'true');
            }
        }, 500); // 500ms odgode
    }

    if (welcomeContinueBtn) {
        welcomeContinueBtn.addEventListener('click', () => {
            closeAllPopups();
        });
    }

    let isDraggingCounter = false;
    let dragCounterOffsetX = 0;
    let dragCounterOffsetY = 0;
    let counterWidgetVisible = true;
    let submittedEmails = new Set();
    let submittedInvestmentEmails = new Set();
    
    // --- FUNKCIJE ---

    const closeAllLanguageDropdowns = () => {
        if (desktopLangDropdown?.classList.contains('active')) { desktopLangDropdown.classList.remove('active'); }
        if (mobileLangDropdown?.classList.contains('active')) { 
            mobileLangDropdown.classList.remove('active'); 
            if (mobileLangIcon) { 
                mobileLangIcon.classList.remove('fa-chevron-up'); 
                mobileLangIcon.classList.add('fa-chevron-down'); 
            } 
        }
    };
    
    const toggleLanguageDropdown = (dropdownElement, otherDropdownElement, triggerIcon = null) => {
        if (!dropdownElement) return;
        const isActive = dropdownElement.classList.contains('active');
        if (otherDropdownElement?.classList.contains('active')) {
            otherDropdownElement.classList.remove('active');
            const otherMobileIcon = document.getElementById('mobile-lang-trigger')?.querySelector('i.fas');
            if (otherDropdownElement.id === 'mobile-lang-dropdown' && otherMobileIcon?.classList.contains('fa-chevron-up')) {
                otherMobileIcon.classList.replace('fa-chevron-up', 'fa-chevron-down');
            }
        }
        dropdownElement.classList.toggle('active', !isActive);
        if (triggerIcon && dropdownElement.id === 'mobile-lang-dropdown') {
            triggerIcon.classList.toggle('fa-chevron-down', !isActive);
            triggerIcon.classList.toggle('fa-chevron-up', isActive);
        }
    };

    const resetInvestmentDetailsForm = () => {
        if (investmentDetailsForm) investmentDetailsForm.reset();
        investmentPackageDetailsCheckboxes.forEach(cb => cb.checked = false);
        if (ip7CheckboxDetails) ip7CheckboxDetails.checked = false;
        if (ip7CustomAmountDetailsInput) {
            ip7CustomAmountDetailsInput.value = '';
            ip7CustomAmountDetailsInput.disabled = true;
        }
        if (totalInvestmentAmountDetailsSpan) totalInvestmentAmountDetailsSpan.textContent = '0';
    };

    window.closeAllPopups = () => {
        if (validationPopup) validationPopup.style.display = 'none';
        if (contactFormPopup) contactFormPopup.style.display = 'none';
        if (starterPackageInfoPopup) starterPackageInfoPopup.style.display = 'none';
        if (chooseInvestorTypePopup) chooseInvestorTypePopup.style.display = 'none';
        if (investmentDetailsPopup) investmentDetailsPopup.style.display = 'none';
        if (popupOverlay) popupOverlay.style.display = 'none';
        if (body) body.classList.remove('nav-menu-open');
         if (ip7AmountInputContainer) ip7AmountInputContainer.style.display = 'none';
        if (ip7AmountInput) ip7AmountInput.value = '';
        if(starterPackageEmailInput) starterPackageEmailInput.value = '';
        resetInvestmentDetailsForm();
    };

    window.showPopup = (popupContentElement, isErrorPopup = false, returnToPopupId = null) => {
        closeAllPopups();
        if (popupContentElement && popupOverlay && body) {
            popupOverlay.style.display = 'flex';
            popupContentElement.style.display = 'block';
            body.classList.add('overflow-hidden');

            setTimeout(() => {
                popupContentElement.scrollTop = 0;
                const emailInput = popupContentElement.querySelector('input[type="email"]');
                if (emailInput) emailInput.blur();
                popupContentElement.focus();
            }, 50);

            popupContentElement.querySelectorAll('button.popup-close, button[data-action]').forEach(clickable => {
                const newClickable = clickable.cloneNode(true);
                clickable.parentNode.replaceChild(newClickable, clickable);

                if (newClickable.classList.contains('popup-close')) {
                    newClickable.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        closeAllPopups();
                    }, { once: true });
                } else if (newClickable.hasAttribute('data-action')) {
                    newClickable.addEventListener('click', (e) => {
                        e.preventDefault(); e.stopPropagation();
                        let targetPopupForReturn = null;
                        const action = newClickable.getAttribute('data-action');
                        
                        if (returnToPopupId) {
                            targetPopupForReturn = document.getElementById(returnToPopupId);
                        } else if (action === 'return-to-starter-info') {
                            targetPopupForReturn = starterPackageInfoPopup;
                        } else if (action === 'return-to-contact') {
                            targetPopupForReturn = contactFormPopup;
                        } else if (action === 'return-to-investment-details') {
                            targetPopupForReturn = investmentDetailsPopup;
                        }
                        
                        if(validationPopup) validationPopup.style.display = 'none';

                        if (targetPopupForReturn) {
                            showPopup(targetPopupForReturn);
                        } else {
                            closeAllPopups();
                        }
                    }, { once: true });
                }
            });

        } else {
            console.warn(i18next.t('errorPopupNotFound'), popupContentElement);
        }
    };
    
    // --- EVENT LISTENERS I INICIJALIZACIJA ---

    // Navigacija - Hamburger i dropdownovi
    if (desktopLangTrigger && desktopLangDropdown) {
        desktopLangTrigger.addEventListener('click', (event) => { event.stopPropagation(); toggleLanguageDropdown(desktopLangDropdown, mobileLangDropdown); });
        desktopLangDropdown.querySelectorAll('.language-item').forEach(item => { item.addEventListener('click', (event) => { event.stopPropagation(); closeAllLanguageDropdowns(); }); });
        desktopLangDropdown.addEventListener('click', (event) => { event.stopPropagation(); });
    }
    if (mobileLangTrigger && mobileLangDropdown) {
        mobileLangTrigger.addEventListener('click', (event) => { event.preventDefault(); event.stopPropagation(); toggleLanguageDropdown(mobileLangDropdown, desktopLangDropdown, mobileLangIcon); });
        mobileLangDropdown.querySelectorAll('.language-item').forEach(item => { item.addEventListener('click', (event) => { event.stopPropagation(); closeAllLanguageDropdowns(); }); });
        mobileLangDropdown.addEventListener('click', (event) => { event.stopPropagation(); });
    }
    
    if (hamburger && navMenu && body) {
        hamburger.addEventListener('click', () => {
            const isActive = hamburger.classList.toggle('active');
            navMenu.classList.toggle('active', isActive);
            body.classList.toggle('nav-menu-open', isActive); 
            closeAllLanguageDropdowns();
            document.querySelectorAll('.nav-menu .sft21-nav-item.dropdown.open:not(.mobile-language-selector)').forEach(openDropdown => {
                openDropdown.classList.remove('open');
                const icon = openDropdown.querySelector('.mobile-dropdown-toggle i');
                if (icon) icon.style.transform = 'rotate(0deg)';
                const menu = openDropdown.querySelector('.dropdown-menu');
                if (menu) menu.style.display = 'none';
            });
        });

        
document.querySelectorAll('.nav-menu a:not([id*="lang-trigger"]):not(.mobile-dropdown-toggle)').forEach(link => {
    link.addEventListener('click', (event) => {
        // Zaustavljamo defaultnu akciju da bismo mi preuzeli kontrolu
        event.preventDefault();
        const destination = link.href;

        // Zatvaramo hamburger meni
        if (hamburger.classList.contains('active')) {
            hamburger.classList.remove('active');
            navMenu.classList.remove('active');
            body.classList.remove('overflow-hidden');
        }

        // Nakon kratke odgode (da se animacija zatvaranja dovrši), preusmjeravamo
        setTimeout(() => {
            window.location.href = destination;
        }, 300); // 300 milisekundi je dovoljno za glatku tranziciju
    });
});
    }
    
    // =======================================================
// KONAČNA I ISPRAVNA LOGIKA ZA SVE DROPDOWNE (PREUZETO IZ REGISTER.HTML)
// =======================================================
document.addEventListener('DOMContentLoaded', function() {
    
    // === LOGIKA ZA DROPDOWN NA DESKTOPU ===
    const desktopPlatformTrigger = document.getElementById('desktop-platform-trigger');
    const desktopPlatformMenu = document.getElementById('desktop-platform-menu');
    const desktopLangTrigger = document.getElementById('desktop-lang-trigger');
    const desktopLangDropdown = document.getElementById('desktop-lang-dropdown');

    // Funkcija za zatvaranje svih desktop menija
    function closeAllDesktopMenus() {
        if (desktopPlatformMenu) desktopPlatformMenu.classList.remove('active');
        if (desktopLangDropdown) desktopLangDropdown.classList.remove('active');
    }

    if (desktopPlatformTrigger && desktopPlatformMenu) {
        desktopPlatformTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (desktopLangDropdown) desktopLangDropdown.classList.remove('active'); // Zatvori drugi meni
            desktopPlatformMenu.classList.toggle('active');
        });
    }

    if (desktopLangTrigger && desktopLangDropdown) {
        desktopLangTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            e.stopPropagation();
            if (desktopPlatformMenu) desktopPlatformMenu.classList.remove('active'); // Zatvori drugi meni
            desktopLangDropdown.classList.toggle('active');
        });
    }

    // === LOGIKA ZA DROPDOWN NA MOBILNOM ===
    const mobilePlatformToggle = document.querySelector('.nav-menu .mobile-dropdown-toggle');
    const mobileLangTrigger = document.getElementById('mobile-lang-trigger');
    
    // Klik na "Platforme" u mobilnom meniju
    if (mobilePlatformToggle) {
        mobilePlatformToggle.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdownItem = this.closest('.sft21-nav-item.dropdown');
            dropdownItem.classList.toggle('open');
            const dropdownMenu = dropdownItem.querySelector('.dropdown-menu');
            dropdownMenu.style.display = dropdownItem.classList.contains('open') ? 'block' : 'none';
        });
    }


    // Klik na "Jezik" u mobilnom meniju-->
    if (mobileLangTrigger) {
        mobileLangTrigger.addEventListener('click', function(e) {
            e.preventDefault();
            const dropdownItem = this.closest('.sft21-nav-item.dropdown');
            dropdownItem.classList.toggle('open');
            const dropdownMenu = dropdownItem.querySelector('.language-dropdown-mobile');
            dropdownMenu.classList.toggle('active');
        });
    }

    
    // Zatvori sve menije ako se klikne bilo gdje drugdje
    window.addEventListener('click', function() {
        closeAllDesktopMenus();
    });
});
    

    // Pronađi SAMO gumb za Platforme
    const platformToggle = document.querySelector('.nav-menu .mobile-dropdown-toggle:not(.mobile-language-trigger)');
    
    if (platformToggle) {
        platformToggle.addEventListener('click', function(event) {
            event.preventDefault();

            const dropdownItem = this.closest('.sft21-nav-item.dropdown');
            if (!dropdownItem) return;

            const dropdownMenu = dropdownItem.querySelector('.dropdown-menu');
            if (!dropdownMenu) return;
            
            // Otvori ili zatvori SAMO ovaj izbornik
            const isOpen = dropdownItem.classList.toggle('open');
            dropdownMenu.style.display = isOpen ? 'block' : 'none';

            // Rotiraj SAMO ovu ikonu
            const icon = this.querySelector('i.fas');
            if (icon) {
                icon.style.transform = isOpen ? 'rotate(180deg)' : 'rotate(0deg)';
            }
        });

    // Accordion
    if (accordionItems.length > 0) {
        const getAbsoluteOffsetTop = (el) => el.offsetTop + (el.offsetParent ? getAbsoluteOffsetTop(el.offsetParent) : 0);
        accordionItems.forEach(item => {
            const header = item.querySelector('.accordion-header');
            const content = item.querySelector('.accordion-content');
            const icon = header?.querySelector('i');
            if (!header || !content || !icon) return;
            
            content.style.transition = 'max-height 0.5s ease-in-out, padding 0.5s ease-in-out';
            content.style.maxHeight = '0'; content.style.paddingTop = '0'; content.style.paddingBottom = '0'; icon.style.transform = 'rotate(0deg)';
            
            header.addEventListener('click', (event) => {
                const clickedItem = event.currentTarget.closest('.accordion-item');
                if (!clickedItem) return;
                const wasActive = clickedItem.classList.contains('active');
                let closingHappened = false;
                
                accordionItems.forEach(otherItem => {
                    if (otherItem !== clickedItem && otherItem.classList.contains('active')) {
                        closingHappened = true;
                        otherItem.classList.remove('active');
                        const otherContent = otherItem.querySelector('.accordion-content');
                        const otherIcon = otherItem.querySelector('.accordion-header i');
                        if (otherContent) { otherContent.style.maxHeight = '0'; otherContent.style.paddingTop = '0'; otherContent.style.paddingBottom = '0'; }
                        if (otherIcon) otherIcon.style.transform = 'rotate(0deg)';
                    }
                });

                const openAndScroll = () => {
                    clickedItem.classList.add('active');
                    const currentIcon = header.querySelector('i');
                    const currentContent = clickedItem.querySelector('.accordion-content');
                    if (currentContent) {
                        currentContent.style.display = 'block';
                        const scrollHeight = currentContent.scrollHeight;
                        currentContent.style.display = '';
                        currentContent.style.maxHeight = scrollHeight + "px";
                        currentContent.style.paddingTop = '0.5rem';
                        currentContent.style.paddingBottom = '1.5rem';
                    }
                    if (currentIcon) currentIcon.style.transform = 'rotate(180deg)';
                    setTimeout(() => {
                        const finalHeaderOffsetTop = getAbsoluteOffsetTop(header);
                        const finalScrollTargetY = finalHeaderOffsetTop - navHeight - extraScrollMarginAccordion;
                        window.scrollTo({ top: Math.max(0, finalScrollTargetY), behavior: 'smooth' });
                    }, 100);
                };
                
                const closeClicked = () => {
                    clickedItem.classList.remove('active');
                    const currentIcon = header.querySelector('i');
                    const currentContent = clickedItem.querySelector('.accordion-content');
                    if (currentContent) { currentContent.style.maxHeight = '0'; currentContent.style.paddingTop = '0'; currentContent.style.paddingBottom = '0'; }
                    if (currentIcon) currentIcon.style.transform = 'rotate(0deg)';
                };

                if (wasActive) {
                    closeClicked();
                } else {
                    const delayTime = closingHappened ? 550 : 0;
                    setTimeout(openAndScroll, delayTime);
                }
            });
        });
    }


    
    // Zatvaranje popup-a i dropdowna klikom izvan ili Esc tipkom
    document.addEventListener('click', (event) => {
        const isClickInsideLangDesktop = desktopLangDropdown?.contains(event.target);
        const isClickInsideLangMobile = mobileLangDropdown?.contains(event.target);
        const isClickOnLangDesktopTrigger = desktopLangTrigger?.contains(event.target);
        const isClickOnLangMobileTrigger = mobileLangTrigger?.contains(event.target);
        const isClickInsideAIChat = aiChatPopup?.contains(event.target);
        const isClickOnAIIcon = aiChatIcon?.contains(event.target);
        if (!isClickInsideLangDesktop && !isClickInsideLangMobile && !isClickOnLangDesktopTrigger && !isClickOnLangMobileTrigger) {
            closeAllLanguageDropdowns();
        }
        if (aiChatPopup?.classList.contains('active') && !isClickInsideAIChat && !isClickOnAIIcon) {
            aiChatPopup.classList.remove('active');
            if (aiChatIcon) aiChatIcon.style.display = 'flex';
            if (body) body.classList.remove('overflow-hidden');
        }
    });

    document.addEventListener('keydown', (event) => {
        if (event.key === 'Escape') {
            if (hamburger?.classList.contains('active')) { hamburger.classList.remove('active'); navMenu.classList.remove('active'); body?.classList.remove('overflow-hidden'); }
            closeAllLanguageDropdowns();
            if (aiChatPopup?.classList.contains('active')) { aiChatPopup.classList.remove('active'); if (aiChatIcon) aiChatIcon.style.display = 'flex'; if (body) body.classList.remove('overflow-hidden'); }
            closeAllPopups();
        }
    });
    
    if (popupOverlay) {
        popupOverlay.addEventListener('click', (e) => {
            if (e.target === popupOverlay) closeAllPopups();
        });
    }
    document.querySelectorAll('.popup-content').forEach(content => {
        if (content) content.addEventListener('click', (e) => e.stopPropagation());
    });
    
    if (starterInfoCloseLink) {
        starterInfoCloseLink.addEventListener('click', (event) => {
            event.preventDefault(); 
            closeAllPopups();
        });
    }

    // Forma za Starter Package Email
    if (starterPackageEmailForm && starterPackageEmailInput && validationPopup) {
        starterPackageEmailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const email = starterPackageEmailInput.value.trim().toLowerCase();
            let messagePopupContent = '';
            let isError = false;
            let returnToPopup = 'starter-package-info-popup';

            if (starterPackageInfoPopup) starterPackageInfoPopup.style.display = 'none';

            if (email === '' || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                isError = true;
                messagePopupContent = `<button class="popup-close" data-action="return-to-starter-info">×</button><h4>${i18next.t('errorTitle')}</h4><p>${i18next.t('errorEnterValidEmail')}</p>`;
            } else if (submittedEmails.has(email)) {
                isError = false; // Nije greška, samo informacija
                messagePopupContent = `<button class="popup-close" data-action="return-to-starter-info">×</button><h4>${i18next.t('infoTitle')}</h4><p>${i18next.t('starterPopup.emailRegistered', { email })}</p>`;
            } else {
                submittedEmails.add(email);
                console.log("Email za Starter Package obavijest:", email);
                messagePopupContent = `<button class="popup-close" aria-label="Close popup">×</button><h4>${i18next.t('thankYouTitle')}</h4><p>${i18next.t('starterPopup.emailSuccess', { email })}</p>`;
                starterPackageEmailInput.value = '';
                returnToPopup = null;
                setTimeout(closeAllPopups, 4000);
            }
            
            if (validationPopup) {
                validationPopup.innerHTML = messagePopupContent;
                showPopup(validationPopup, isError, returnToPopup);
            }
        });
    }

    // Logika za Investicijske popupe
    if (chooseInvestorTypePopup && investmentDetailsPopup && validationPopup && investmentDetailsForm) {
        
        const updateTotalInvestmentDetails = () => {
            let currentTotal = 0;
            investmentPackageDetailsCheckboxes.forEach(cb => {
                if (cb.checked) {
                    currentTotal += parseFloat(cb.value);
                }
            });
            if (ip7CheckboxDetails && ip7CustomAmountDetailsInput) {
                ip7CustomAmountDetailsInput.disabled = !ip7CheckboxDetails.checked;
                if (ip7CheckboxDetails.checked) {
                    const ip7Value = parseFloat(ip7CustomAmountDetailsInput.value);
                    if (!isNaN(ip7Value)) {
                        currentTotal += ip7Value;
                    }
                } else {
                    ip7CustomAmountDetailsInput.value = '';
                }
            }
            if (totalInvestmentAmountDetailsSpan) {
                totalInvestmentAmountDetailsSpan.textContent = currentTotal.toString();
            }
        };
        
        const allPackageCheckboxes = [...investmentPackageDetailsCheckboxes];
        if (ip7CheckboxDetails) {
            allPackageCheckboxes.push(ip7CheckboxDetails);
        }
        allPackageCheckboxes.forEach(cb => {
            if (cb && !cb.hasAttribute('data-listener-attached')) {
                cb.addEventListener('change', updateTotalInvestmentDetails);
                cb.setAttribute('data-listener-attached', 'true');
            }
        });
        if (ip7CustomAmountDetailsInput && !ip7CustomAmountDetailsInput.hasAttribute('data-listener-attached')) {
            ip7CustomAmountDetailsInput.addEventListener('input', updateTotalInvestmentDetails);
            ip7CustomAmountDetailsInput.setAttribute('data-listener-attached', 'true');
        }

        triggerChooseInvestorTypeBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.removeItem('preselectedPackageName');
                resetInvestmentDetailsForm();
                showPopup(chooseInvestorTypePopup);
            });
        });
        
        openInvestmentDetailsFromCardBtns.forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                sessionStorage.setItem('preselectedPackageName', btn.dataset.packageName);
                resetInvestmentDetailsForm();
                showPopup(chooseInvestorTypePopup);
            });
        });

        if (btnNoviInvestitorChoice) {
            btnNoviInvestitorChoice.addEventListener('click', () => {
                if(chooseInvestorTypePopup) chooseInvestorTypePopup.style.display = 'none';
                const preselectedNameFromStorage = sessionStorage.getItem('preselectedPackageName');
                
                resetInvestmentDetailsForm();
                if (preselectedNameFromStorage) {
                    const targetCheckbox = document.getElementById(preselectedNameFromStorage.toLowerCase() + "-details");
                    if (targetCheckbox) {
                        targetCheckbox.checked = true;
                    }
                }
                updateTotalInvestmentDetails();

                showPopup(investmentDetailsPopup);
                if (investorNameDetailsInput) investorNameDetailsInput.focus();
                
                if (preselectedNameFromStorage) {
                    sessionStorage.removeItem('preselectedPackageName');
                }
            });
        }
        
        if (investmentDetailsForm) {
            investmentDetailsForm.addEventListener('submit', (e) => {
                e.preventDefault();
                const name = investorNameDetailsInput.value.trim();
                const email = investorEmailDetailsInput.value.trim().toLowerCase();
                let errorMessageKey = null;

                if (name.split(' ').filter(p => p).length < 2) {
                    errorMessageKey = 'errorEnterFullName';
                } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
                    errorMessageKey = 'errorEnterValidEmail';
                }
                
                let selectedPackagesData = [];
                investmentPackageDetailsCheckboxes.forEach(cb => {
                    if (cb.checked) selectedPackagesData.push({ name: cb.dataset.packageName, value: cb.value });
                });

                let finalTotal = parseFloat(totalInvestmentAmountDetailsSpan.textContent || '0');
                
                if (ip7CheckboxDetails?.checked) {
                    const customAmount = parseFloat(ip7CustomAmountDetailsInput.value);
                    if (finalTotal < 5000) {
                        if (!errorMessageKey) errorMessageKey = 'investmentPopup.ip7minAmount';
                    }
                    if (ip7CustomAmountDetailsInput.value !== '' && (isNaN(customAmount) || customAmount < 5000)) {
                         if (!errorMessageKey) errorMessageKey = 'investmentPopup.ip7wrongAmount';
                    }
                }
                
                if (finalTotal === 0 && !errorMessageKey) {
                    errorMessageKey = 'investmentPopup.selectPackage';
                }

                if (errorMessageKey) {
                    validationPopup.innerHTML = `<button class="popup-close" data-action="return-to-investment-details">×</button><h4>${i18next.t('errorValidationTitle')}</h4><p>${i18next.t(errorMessageKey)}</p>`;
                    showPopup(validationPopup, true, 'investment-details-popup');
                    return;
                }

                if (submittedInvestmentEmails.has(email)) {
                    validationPopup.innerHTML = `<button class="popup-close" data-action="return-to-investment-details">×</button><h4>${i18next.t('infoTitle')}</h4><p>${i18next.t('investmentPopup.alreadyRegistered', { email })}</p>`;
                    showPopup(validationPopup, false, 'investment-details-popup');
                    return;
                }
                
                submittedInvestmentEmails.add(email);
                console.log("Prijava za investiciju:", { name, email, totalAmount: finalTotal });

                closeAllPopups();
                validationPopup.innerHTML = `<button class="popup-close" aria-label="Zatvori popup">×</button><h4>${i18next.t('thankYouTitle')}</h4><p>${i18next.t('investmentPopup.success', { email, amount: finalTotal })}</p>`;
                showPopup(validationPopup);
                setTimeout(closeAllPopups, 5000);
            });
        }
    }

    // AI Chat
    if (aiChatIcon && aiChatPopup && aiChatCloseBtn && body) {
        aiChatIcon.addEventListener('click', (event) => { event.stopPropagation(); aiChatPopup.classList.add('active'); aiChatIcon.style.display = 'none'; body.classList.add('overflow-hidden'); });
        aiChatCloseBtn.addEventListener('click', (event) => { event.stopPropagation(); aiChatPopup.classList.remove('active'); aiChatIcon.style.display = 'flex'; body.classList.remove('overflow-hidden'); });
    }

    // User Counter Widget
    if (userCounterWidget && userCounterHeader) {
        if (userCounterWidget && userCounterHeader && userCounterList && userCounterNumberEl && userCounterHideBtn && userCounterCloseBtn && userCounterShowBtn && body) {
            userCounterHeader.addEventListener('mousedown', (e) => { 
                if (e.target === userCounterHeader || (userCounterHeader.contains(e.target) && !e.target.closest('button'))) { 
                    isDraggingCounter = true; 
                    userCounterWidget.classList.add('dragging'); 
                    dragCounterOffsetX = e.clientX - userCounterWidget.offsetLeft; 
                    dragCounterOffsetY = e.clientY - userCounterWidget.offsetTop; 
                    e.preventDefault(); 
                } 
            });
            document.addEventListener('mousemove', (e) => { 
                if (!isDraggingCounter) return; 
                let newLeft = e.clientX - dragCounterOffsetX; 
                let newTop = e.clientY - dragCounterOffsetY; 
                const widgetRect = userCounterWidget.getBoundingClientRect(); 
                const maxX = window.innerWidth - widgetRect.width; 
                const maxY = window.innerHeight - widgetRect.height; 
                newLeft = Math.max(0, Math.min(newLeft, maxX)); 
                newTop = Math.max(0, Math.min(newTop, maxY)); 
                userCounterWidget.style.left = `${newLeft}px`; 
                userCounterWidget.style.top = `${newTop}px`; 
            });
            document.addEventListener('mouseup', () => { 
                if (isDraggingCounter) { 
                    isDraggingCounter = false; 
                    userCounterWidget.classList.remove('dragging'); 
                } 
            });
            userCounterCloseBtn.addEventListener('click', hideWidget); 
            userCounterHideBtn.addEventListener('click', hideWidget);
            userCounterShowBtn.addEventListener('click', () => { 
                userCounterWidget.classList.remove('hidden'); 
                userCounterShowBtn.classList.remove('visible'); 
                counterWidgetVisible = true; 
                userCounterWidget.style.top = '100px'; 
                userCounterWidget.style.left = ''; 
                userCounterWidget.style.right = '30px'; 
            });
            let currentUsers = parseInt(userCounterNumberEl?.textContent?.replace(/,/g, '') || '12345'); 
            function simulateNewUser() { 
                if (!counterWidgetVisible || !userCounterList || !userCounterNumberEl) { 
                    setTimeout(simulateNewUser, 20000 + Math.random() * 15000); 
                    return; 
                } 
                const countries = [ { code: 'hr', name: 'Croatia' }, { code: 'rs', name: 'Serbia' }, { code: 'ba', name: 'Bosnia' }, { code: 'si', name: 'Slovenia' }, { code: 'de', name: 'Germany' }, { code: 'at', name: 'Austria' }, { code: 'it', name: 'Italy' }, { code: 'hu', name: 'Hungary' }, { code: 'cz', name: 'Czech Republic' }, { code: 'sk', name: 'Slovakia' } ]; 
                const firstNames = ['Ivan', 'Marko', 'Ana', 'Petra', 'Nikola', 'Luka', 'Maja', 'Sara', 'Josip', 'Tomislav', 'Milan', 'Stefan', 'Amina', 'Jan', 'Matej', 'Zoran', 'Goran', 'Stefan', 'Dragana']; 
                const lastNames = ['Horvat', 'Novak', 'Kovačević', 'Petrović', 'Jurić', 'Marić', 'Pavlović', 'Knežević', 'Babić', 'Vuković', 'Marković', 'Popović', 'Jovanović', 'Mirković']; 
                
                // --- POČETAK IZMJENE ---
                // Prvo nasumično odaberemo ime, prezime i državu
                let randomCountry = countries[Math.floor(Math.random() * countries.length)]; 
                let randomFirstName = firstNames[Math.floor(Math.random() * firstNames.length)]; 
                let randomLastName = lastNames[Math.floor(Math.random() * lastNames.length)]; 

                // Zatim, ako smo izvukli 'Stefan' ili 'Dragana', ispravimo podatke
                if (randomFirstName === 'Stefan') {
                    randomLastName = 'Jovanović';
                    randomCountry = { code: 'rs', name: 'Serbia' }; // Postavi srpsku zastavu
                } else if (randomFirstName === 'Dragana') {
                    randomLastName = 'Mirković';
                    randomCountry = { code: 'rs', name: 'Serbia' }; // Postavi srpsku zastavu
                }
                // --- KRAJ IZMJENE ---

                const username = `${randomFirstName}_${randomLastName.substring(0,3)}`.toLowerCase(); 
                const placeholder = userCounterList.querySelector('.user-counter-placeholder'); 
                if (placeholder) placeholder.remove(); 
                const newUserItem = document.createElement('div'); 
                newUserItem.className = 'user-counter-item'; 
                newUserItem.innerHTML = `<img src="https://flagcdn.com/w40/${randomCountry.code}.png" alt="${randomCountry.name}" class="user-counter-flag"><div class="user-counter-name">${username}</div><div class="user-counter-time">${i18next.t('translation.userCounter.justNow')}</div>`; 
                userCounterList.insertBefore(newUserItem, userCounterList.firstChild); 
                const times = userCounterList.querySelectorAll('.user-counter-time'); 
                times.forEach((time, index) => { 
                    if (index > 0) { 
                        if (time.textContent === i18next.t('translation.userCounter.justNow')) { 
                            time.textContent = i18next.t('translation.userCounter.minutesAgo', { count: 1 }); 
                        } else if (time.textContent.includes('min')) { 
                            const minutes = parseInt(time.textContent.match(/\d+/)?.[0] || '0'); 
                            if (minutes < 59) { 
                                time.textContent = i18next.t('translation.userCounter.minutesAgo', { count: minutes + 1 }); 
                            } 
                        } 
                    } 
                });
                while (userCounterList.children.length > 6) { 
                    userCounterList.removeChild(userCounterList.lastChild); 
                } 
                currentUsers++; 
                userCounterNumberEl.textContent = currentUsers.toLocaleString(); 
                setTimeout(simulateNewUser, 10000 + Math.random() * 25000); 
            } 
            setTimeout(simulateNewUser, 5000);
        }
        }

    // Canvas Animacija
    const canvas = document.getElementById('network-canvas');
    if (canvas) {
        const ctx = canvas.getContext('2d');
        let particles = [];
        const mouse = { x: null, y: null };
        const options = { particleColor: "rgba(128, 255, 0, 0.85)", lineColor: "rgba(170, 0, 255, 0.8)", particleAmount: 120, defaultRadius: 1.3, linkRadius: 150, lineWidth: 0.4, mouseInteractionRadius: 150, mouseEffectStrength: 2, particleSpeed: 0.25 };

        const resizeCanvas = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
        window.addEventListener('resize', resizeCanvas);
        resizeCanvas();

        window.addEventListener('mousemove', (e) => { mouse.x = e.clientX; mouse.y = e.clientY; });
        window.addEventListener('mouseout', () => { mouse.x = null; mouse.y = null; });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.z = Math.random() * 2 - 1;
                this.radius = options.defaultRadius * (1 + this.z * 0.5);
                this.vx = (Math.random() - 0.5) * options.particleSpeed;
                this.vy = (Math.random() - 0.5) * options.particleSpeed;
            }
            draw() {
                let finalRadius = this.radius; let opacity = 1;
                if (mouse.x !== null) {
                    const dx = this.x - mouse.x; const dy = this.y - mouse.y; const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < options.mouseInteractionRadius) {
                        const effect = (1 - dist / options.mouseInteractionRadius);
                        finalRadius += effect * options.mouseEffectStrength;
                        opacity += effect * 0.5;
                    }
                }
                ctx.beginPath(); ctx.arc(this.x, this.y, finalRadius, 0, Math.PI * 2); ctx.fillStyle = `rgba(128, 255, 0, ${opacity * 0.85})`; ctx.fill();
            }
            update() {
                this.x += this.vx * (1 + this.z * 0.5); this.y += this.vy * (1 + this.z * 0.5);
                if (this.x > canvas.width + 5) this.x = -5; else if (this.x < -5) this.x = canvas.width + 5;
                if (this.y > canvas.height + 5) this.y = -5; else if (this.y < -5) this.y = canvas.height + 5;
            }
        }

        const initParticles = () => { particles = []; for (let i = 0; i < options.particleAmount; i++) { particles.push(new Particle()); } };
        const drawLines = () => {
            let pulse = Math.sin(Date.now() * 0.001) * 0.2 + 0.8;
            for (let i = 0; i < particles.length; i++) {
                for (let j = i + 1; j < particles.length; j++) {
                    const p1 = particles[i]; const p2 = particles[j]; const dist = Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
                    if (dist < options.linkRadius) {
                        let opacity = 1 - (dist / options.linkRadius); opacity *= pulse;
                        if (mouse.x !== null) {
                            const distToMouse1 = Math.sqrt(Math.pow(p1.x - mouse.x, 2) + Math.pow(p1.y - mouse.y, 2));
                            const distToMouse2 = Math.sqrt(Math.pow(p2.x - mouse.x, 2) + Math.pow(p2.y - mouse.y, 2));
                            if(distToMouse1 < options.mouseInteractionRadius || distToMouse2 < options.mouseInteractionRadius) { opacity = Math.min(1, opacity + 0.5); }
                        }
                        ctx.beginPath(); ctx.moveTo(p1.x, p1.y); ctx.lineTo(p2.x, p2.y); ctx.strokeStyle = `rgba(170, 0, 255, ${opacity * 0.5})`; ctx.lineWidth = options.lineWidth; ctx.stroke();
                    }
                }
            }
        };
        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            particles.forEach(p => p.update());
            drawLines();
            particles.forEach(p => p.draw());
            requestAnimationFrame(animate);
        };

        initParticles();
        animate();
    }
    
    // Desktop platforme dropdown menu
    const desktopTrigger = document.getElementById('desktop-platform-trigger');
    const desktopMenu = document.getElementById('desktop-platform-menu');
    if (desktopTrigger && desktopMenu) {
        desktopTrigger.addEventListener('click', function(event) {
            event.preventDefault();
            event.stopPropagation();
            desktopMenu.classList.toggle('hidden');
            desktopMenu.classList.toggle('active');
        });
        document.addEventListener('click', function(event) {
            if (desktopMenu.classList.contains('active') && !desktopMenu.contains(event.target) && !desktopTrigger.contains(event.target)) {
                desktopMenu.classList.remove('active');
            }
        });
    }



// --- POKRENI APLIKACIJU ---
// Listener koji čeka da se cijeli HTML dokument učita prije pokretanja i18n_init funkcije.
document.addEventListener('DOMContentLoaded', i18n_init);


// ====================================================================
// SFTEAM STRANICA - SPECIFIČNA FUNKCIONALNOST
// ====================================================================

/**
 * Inicijalizacija funkcionalnosti specifičnih za SFteam stranicu
 */
function initializeSFteamFunctionality() {
    // Provjeri da li smo na SFteam stranici
    if (!window.location.pathname.includes('sfteam.html')) {
        return;
    }

    console.log('Inicijalizacija SFteam funkcionalnosti...');

    // Inicijaliziraj sve SFteam funkcionalnosti
    initializeSFteamThemeToggle();
    initializeSFteamScrollAnimations();
    initializeSFteamMediaSwitching();
    initializeSFteamPulsingCircle();
    initializeSFteamMobileMenu();
    initializeSFteamBackToTop();
    initializeSFteamNetworkCanvas();
    initializeSFteamCustomCursor();
}

/**
 * Theme toggle funkcionalnost za SFteam stranicu
 */
function initializeSFteamThemeToggle() {
    const themeToggle = document.getElementById('theme-toggle');
    const mobileThemeToggle = document.getElementById('mobile-theme-toggle');
    
    if (themeToggle) {
        themeToggle.addEventListener('click', toggleSFteamTheme);
    }
    
    if (mobileThemeToggle) {
        mobileThemeToggle.addEventListener('click', toggleSFteamTheme);
    }
    
    // Postavi početno stanje tema
    updateSFteamThemeUI();
}

function toggleSFteamTheme() {
    const currentTheme = localStorage.getItem('sft21_theme') || 'dark';
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    localStorage.setItem('sft21_theme', newTheme);
    applySft21Theme();
    updateSFteamThemeUI();
}

function updateSFteamThemeUI() {
    const theme = localStorage.getItem('sft21_theme') || 'dark';
    const lightIcons = document.querySelectorAll('.light-icon');
    const darkIcons = document.querySelectorAll('.dark-icon');
    const themeText = document.querySelector('.theme-text');
    
    if (theme === 'light') {
        lightIcons.forEach(icon => icon.classList.remove('hidden'));
        darkIcons.forEach(icon => icon.classList.add('hidden'));
        if (themeText) themeText.textContent = 'Svijetla tema';
    } else {
        lightIcons.forEach(icon => icon.classList.add('hidden'));
        darkIcons.forEach(icon => icon.classList.remove('hidden'));
        if (themeText) themeText.textContent = 'Tamna tema';
    }
}

/**
 * Scroll animacije za SFteam stranicu
 */
function initializeSFteamScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('reveal');
            }
        });
    }, observerOptions);

    // Elementi za animaciju
    const animatedElements = document.querySelectorAll(
        '.team-member-card, .career-status-section, .testimonial-card'
    );

    animatedElements.forEach(el => {
        observer.observe(el);
    });
}

/**
 * Media switching funkcionalnost (slika/video)
 */
function initializeSFteamMediaSwitching() {
    // Hero media switching
    const heroImage = document.getElementById('hero-image');
    const heroVideo = document.getElementById('hero-video');
    
    if (heroImage && heroVideo) {
        heroImage.addEventListener('click', () => {
            switchMedia(heroImage, heroVideo);
        });
    }

    // Team member media switching
    const memberPhotos = document.querySelectorAll('[id$="-photo"]');
    memberPhotos.forEach(photo => {
        const videoId = photo.id.replace('-photo', '-video');
        const video = document.getElementById(videoId);
        
        if (video) {
            photo.addEventListener('click', () => {
                switchMedia(photo, video);
            });
        }
    });
}

function switchMedia(imageElement, videoElement) {
    if (imageElement.classList.contains('hidden')) {
        // Prebaci na sliku
        videoElement.classList.add('hidden');
        videoElement.pause();
        imageElement.classList.remove('hidden');
    } else {
        // Prebaci na video
        imageElement.classList.add('hidden');
        videoElement.classList.remove('hidden');
        videoElement.play();
    }
}

/**
 * Pulsing circle funkcionalnost
 */
function initializeSFteamPulsingCircle() {
    const pulsingCircle = document.getElementById('love-sfteam-btn');
    
    if (pulsingCircle) {
        pulsingCircle.addEventListener('click', () => {
            // Animacija klika
            pulsingCircle.style.transform = 'scale(0.9)';
            setTimeout(() => {
                pulsingCircle.style.transform = 'scale(1)';
            }, 150);
            
            // Scroll do managment sekcije
            const managementSection = document.getElementById('management');
            if (managementSection) {
                managementSection.scrollIntoView({ 
                    behavior: 'smooth',
                    block: 'start'
                });
            }
            
            // Dodaj ripple efekt
            createRippleEffect(pulsingCircle);
        });
    }
}

function createRippleEffect(element) {
    const ripple = document.createElement('div');
    const rect = element.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    
    ripple.style.width = ripple.style.height = size + 'px';
    ripple.style.left = '50%';
    ripple.style.top = '50%';
    ripple.style.transform = 'translate(-50%, -50%)';
    ripple.style.position = 'absolute';
    ripple.style.borderRadius = '50%';
    ripple.style.background = 'rgba(255, 255, 255, 0.3)';
    ripple.style.pointerEvents = 'none';
    ripple.style.animation = 'ripple-effect 0.6s ease-out';
    
    element.style.position = 'relative';
    element.appendChild(ripple);
    
    setTimeout(() => {
        ripple.remove();
    }, 600);
}

/**
 * Mobile menu funkcionalnost za SFteam
 */
function initializeSFteamMobileMenu() {
    const mobileMenuBtn = document.getElementById('mobile-menu-btn');
    const navMenu = document.querySelector('.nav-menu');
    
    if (mobileMenuBtn && navMenu) {
        mobileMenuBtn.addEventListener('click', () => {
            mobileMenuBtn.classList.toggle('active');
            navMenu.classList.toggle('active');
        });
        
        // Zatvori menu kada se klikne link
        const navLinks = navMenu.querySelectorAll('a');
        navLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuBtn.classList.remove('active');
                navMenu.classList.remove('active');
            });
        });
    }
}

/**
 * Back to top gumb za SFteam
 */
function initializeSFteamBackToTop() {
    const backToTopBtn = document.getElementById('back-to-top');
    
    if (backToTopBtn) {
        // Prikaži/sakrij gumb ovisno o scroll poziciji
        window.addEventListener('scroll', () => {
            if (window.pageYOffset > 300) {
                backToTopBtn.classList.add('show');
            } else {
                backToTopBtn.classList.remove('show');
            }
        });
        
        // Scroll to top funkcionalnost
        backToTopBtn.addEventListener('click', () => {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });
    }
}

/**
 * Network canvas animacija za SFteam
 */
function initializeSFteamNetworkCanvas() {
    const canvas = document.getElementById('network-canvas');
    if (!canvas) return;
    
    const ctx = canvas.getContext('2d');
    let animationId;
    
    // Postavi canvas veličinu
    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
    
    // Particles array
    const particles = [];
    const particleCount = 50;
    
    // Stvori particles
    for (let i = 0; i < particleCount; i++) {
        particles.push({
            x: Math.random() * canvas.width,
            y: Math.random() * canvas.height,
            vx: (Math.random() - 0.5) * 0.5,
            vy: (Math.random() - 0.5) * 0.5,
            size: Math.random() * 2 + 1
        });
    }
    
    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Ažuriraj i nacrtaj particles
        particles.forEach(particle => {
            particle.x += particle.vx;
            particle.y += particle.vy;
            
            // Bounce off edges
            if (particle.x < 0 || particle.x > canvas.width) particle.vx *= -1;
            if (particle.y < 0 || particle.y > canvas.height) particle.vy *= -1;
            
            // Nacrtaj particle
            const theme = localStorage.getItem('sft21_theme') || 'dark';
            const color = theme === 'light' ? 'rgba(106, 27, 154, 0.3)' : 'rgba(128, 255, 0, 0.3)';
            
            ctx.beginPath();
            ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
            ctx.fillStyle = color;
            ctx.fill();
        });
        
        // Nacrtaj linije između bliskih particles
        for (let i = 0; i < particles.length; i++) {
            for (let j = i + 1; j < particles.length; j++) {
                const dx = particles[i].x - particles[j].x;
                const dy = particles[i].y - particles[j].y;
                const distance = Math.sqrt(dx * dx + dy * dy);
                
                if (distance < 100) {
                    const theme = localStorage.getItem('sft21_theme') || 'dark';
                    const opacity = (100 - distance) / 100 * 0.1;
                    const color = theme === 'light' ? 
                        `rgba(106, 27, 154, ${opacity})` : 
                        `rgba(128, 255, 0, ${opacity})`;
                    
                    ctx.beginPath();
                    ctx.moveTo(particles[i].x, particles[i].y);
                    ctx.lineTo(particles[j].x, particles[j].y);
                    ctx.strokeStyle = color;
                    ctx.stroke();
                }
            }
        }
        
        animationId = requestAnimationFrame(animate);
    }
    
    animate();
    
    // Cleanup na unload
    window.addEventListener('beforeunload', () => {
        if (animationId) {
            cancelAnimationFrame(animationId);
        }
    });
}

   
    // Hover efekti
    const hoverElements = document.querySelectorAll(
        'a, button, .team-member-card, .career-member-card, .pulsing-circle, .testimonial-video'
    );
    
    hoverElements.forEach(el => {
        el.addEventListener('mouseenter', () => {
            cursor.style.transform = 'scale(1.5)';
            const theme = localStorage.getItem('sft21_theme') || 'dark';
            cursor.style.backgroundColor = theme === 'light' ? 
                'rgba(106, 27, 154, 0.8)' : 
                'rgba(128, 255, 0, 0.5)';
        });
        
        el.addEventListener('mouseleave', () => {
            cursor.style.transform = 'scale(1)';
            const theme = localStorage.getItem('sft21_theme') || 'dark';
            cursor.style.backgroundColor = theme === 'light' ? 
                '#0e076a' : 
                '#80ff00';
        });
    });
}

// CSS za ripple animaciju
const rippleCSS = `
@keyframes ripple-effect {
    0% {
        transform: translate(-50%, -50%) scale(0);
        opacity: 1;
    }
    100% {
        transform: translate(-50%, -50%) scale(2);
        opacity: 0;
    }
}
`;

// Dodaj CSS u head
const style = document.createElement('style');
style.textContent = rippleCSS;
document.head.appendChild(style);

// Dodaj SFteam funkcionalnost u glavnu inicijalizaciju
const originalInitializeAppLogic = initializeAppLogic;
initializeAppLogic = function() {
    originalInitializeAppLogic();
    initializeSFteamFunctionality();
};


// ====================================================================
// INDEX STRANICA - PULSING CIRCLE FUNKCIONALNOST
// ====================================================================

/**
 * Inicijalizacija pulsing circle na index stranici
 */
function initializeIndexPulsingCircle() {
    // Provjeri da li smo na index stranici
    if (window.location.pathname.includes('sfteam.html')) {
        return;
    }

    const pulsingCircleIndex = document.getElementById('love-sfteam-btn-index');
    
    if (pulsingCircleIndex) {
        pulsingCircleIndex.addEventListener('click', () => {
            // Animacija klika
            pulsingCircleIndex.style.transform = 'scale(0.9)';
            setTimeout(() => {
                pulsingCircleIndex.style.transform = 'scale(1)';
            }, 150);
            
            // Dodaj ripple efekt
            createRippleEffect(pulsingCircleIndex);
            
            // Preusmjeri na SFteam stranicu nakon kratke animacije
            setTimeout(() => {
                window.location.href = 'sfteam.html';
            }, 300);
        });
    }
}

// Dodaj index funkcionalnost u glavnu inicijalizaciju
const originalInitializeAppLogic2 = initializeAppLogic;
initializeAppLogic = function() {
    originalInitializeAppLogic2();
    initializeIndexPulsingCircle();
};

// =======================================================
// JEDINSTVENI KOD ZA CUSTOM CURSOR - RADI NA SVIM STRANICAMA
// =======================================================
document.addEventListener('DOMContentLoaded', () => {

    const cursor = document.querySelector('.custom-cursor');
    const body = document.body;

    if (cursor && body) {
        let mouseX = 0, mouseY = 0, cursorX = 0, cursorY = 0;
        const speed = 0.1;

        const updateCursorPosition = () => {
            cursorX += (mouseX - cursorX) * speed;
            cursorY += (mouseY - cursorY) * speed;
            cursor.style.left = `${cursorX}px`;
            cursor.style.top = `${cursorY}px`;
            requestAnimationFrame(updateCursorPosition);
        };
        requestAnimationFrame(updateCursorPosition);

        window.addEventListener('mousemove', (e) => { mouseX = e.clientX; mouseY = e.clientY; });
        document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
        document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });

        // Određivanje elemenata za hover ovisno o stranici
        let hoverSelector = '';
        if (window.location.pathname.includes('sfteam.html')) {
            // Ako smo na SFteam stranici
            hoverSelector = 'a, button, .team-member-card, .career-member-card, .pulsing-circle, .testimonial-video, .swiper-button-next, .swiper-button-prev';
        } else {
            // Za sve ostale stranice (uključujući index.html)
            hoverSelector = 'a, button, .accordion-header, .hamburger, input, textarea, select, .language-trigger, .language-item, label[for], .interactive-card, .starter-package-select-btn, .trigger-choose-investor-type-popup, .open-investment-details-popup';
        }
        
        // Funkcija za vraćanje kursora na zadanu boju ovisno o temi
        const resetCursorColor = () => {
            if (typeof gsap !== 'undefined') {
                const isLightMode = document.documentElement.classList.contains('light-mode');
                const targetColor = isLightMode ? '#0e076a' : '#d9ff00';
                gsap.to(cursor, { 
                    duration: 0.3, 
                    scale: 1, 
                    backgroundColor: targetColor
                });
            }
        };

        // Primijeni hover efekte
        document.querySelectorAll(hoverSelector).forEach(el => {
            el.addEventListener('mouseenter', () => {
                if (typeof gsap !== 'undefined') {
                    const isLightMode = document.documentElement.classList.contains('light-mode');
                    const hoverColor = isLightMode ? 'rgba(171, 71, 188, 0.8)' : 'rgba(128, 255, 0, 0.5)';
                    gsap.to(cursor, { 
                        duration: 0.3, 
                        scale: 1.5, 
                        backgroundColor: hoverColor
                    });
                }
            });
            el.addEventListener('mouseleave', resetCursorColor);
        });

        // Inicijalna boja
        resetCursorColor();
    }
});
