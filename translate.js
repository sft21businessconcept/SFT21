const fs = require('fs');
const path = require('path');

const filePath = path.join("c:\\Users\\Sara\\Desktop\\NOVI SISTEM\\SFT21-main", "index_sr.html");
let content = fs.readFileSync(filePath, 'utf-8');

const replacements = [
    [/tijekom/g, "tokom"],
    [/Tijekom/g, "Tokom"],
    [/\bsiječanj\b/g, "januar"], [/\bSiječanj\b/g, "Januar"],
    [/\bsiječnja\b/g, "januara"], [/\bSiječnja\b/g, "Januara"],
    [/\bveljača\b/g, "februar"], [/\bVeljača\b/g, "Februar"],
    [/\bveljače\b/g, "februara"], [/\bVeljače\b/g, "Februara"],
    [/\božujak\b/g, "mart"], [/\bOžujak\b/g, "Mart"],
    [/\božujka\b/g, "marta"], [/\bOžujka\b/g, "Marta"],
    [/\btravanj\b/g, "april"], [/\bTravanj\b/g, "April"],
    [/\btravnja\b/g, "aprila"], [/\bTravnja\b/g, "Aprila"],
    [/\bsvibanj\b/g, "maj"], [/\bSvibanj\b/g, "Maj"],
    [/\bsvibnja\b/g, "maja"], [/\bSvibnja\b/g, "Maja"],
    [/\blipanj\b/g, "jun"], [/\bLipanj\b/g, "Jun"],
    [/\blipnja\b/g, "juna"], [/\bLipnja\b/g, "Juna"],
    [/\bsrpanj\b/g, "jul"], [/\bSrpanj\b/g, "Jul"],
    [/\bsrpnja\b/g, "jula"], [/\bSrpnja\b/g, "Jula"],
    [/\bkolovoz\b/g, "avgust"], [/\bKolovoz\b/g, "Avgust"],
    [/\bkolovoza\b/g, "avgusta"], [/\bKolovoza\b/g, "Avgusta"],
    [/\brujan\b/g, "septembar"], [/\bRujan\b/g, "Septembar"],
    [/\brujna\b/g, "septembra"], [/\bRujna\b/g, "Septembra"],
    [/\blistopad\b/g, "oktobar"], [/\bListopad\b/g, "Oktobar"],
    [/\blistopada\b/g, "oktobra"], [/\bListopada\b/g, "Oktobra"],
    [/\bstudeni\b/g, "novembar"], [/\bStudeni\b/g, "Novembar"],
    [/\bstudenog\b/g, "novembra"], [/\bStudenog\b/g, "Novembra"],
    [/\bprosinac\b/g, "decembar"], [/\bProsinac\b/g, "Decembar"],
    [/\bprosinca\b/g, "decembra"], [/\bProsinca\b/g, "Decembra"],
    
    [/uvjet/g, "uslov"], [/Uvjet/g, "Uslov"],
    [/tvrtk/g, "kompanij"], [/Tvrtk/g, "Kompanij"], // tvrtka -> kompanija, tvrtke -> kompanije
    [/korištenj/g, "korišćenj"], [/Korištenj/g, "Korišćenj"],
    [/suradnj/g, "saradnj"], [/Suradnj/g, "Saradnj"],
    [/sudjelovač/g, "učesnik"], // edge case
    [/sudjelov/g, "učestvov"], [/Sudjelov/g, "Učestvov"],
    [/sudionik/g, "učesnik"], [/Sudionik/g, "Učesnik"],
    [/sudionici/g, "učesnici"], [/Sudionici/g, "Učesnici"],
    [/sudjeluje/g, "učestvuje"], [/Sudjeluje/g, "Učestvuje"],
    [/sudjeluju/g, "učestvuju"], [/Sudjeluju/g, "Učestvuju"],
    [/sustav/g, "sistem"], [/Sustav/g, "Sistem"],
    [/osobn/g, "ličn"], [/Osobn/g, "Ličn"], // osobni -> lični
    [/financij/g, "finansij"], [/Financij/g, "Finansij"],
    [/\bobavijest\b/g, "obaveštenje"], [/\bObavijest\b/g, "Obaveštenje"],
    [/\bobavijesti\b/g, "obaveštenja"], [/\bObavijesti\b/g, "Obaveštenja"],
    [/obavještavam/g, "obaveštavam"], [/Obavještavam/g, "Obaveštavam"],
    [/\beuro\b/g, "evro"], [/\bEuro\b/g, "Evro"],
    [/\beura\b/g, "evra"], [/\bEura\b/g, "Evra"],
    [/\beurima\b/g, "evrima"], [/\bEurima\b/g, "Evrima"],
    [/milijun/g, "milion"], [/Milijun/g, "Milion"],
    [/tisuć/g, "hiljad"], [/Tisuć/g, "Hiljad"],
    [/\bopć(e|a|u|i)\b/g, "opšt$1"], [/\bOpć(e|a|u|i)\b/g, "Opšt$1"],
    [/povijest/g, "istorija"], [/Povijest/g, "Istorija"],
    [/\btko\b/g, "ko"], [/\bTko\b/g, "Ko"],
    [/\bovdje\b/g, "ovde"], [/\bOvdje\b/g, "Ovde"],
    [/\bgdje\b/g, "gde"], [/\bGdje\b/g, "Gde"],
    [/\bumjesto\b/g, "umesto"], [/\bUmjesto\b/g, "Umesto"],
    [/vjerojatn/g, "verovatn"], [/Vjerojatn/g, "Verovatn"],
    [/\bvijest\b/g, "vest"], [/\bVijest\b/g, "Vest"],
    [/\bvijesti\b/g, "vesti"], [/\bVijesti\b/g, "Vesti"],
    [/\bobitelj(i|a)?\b/g, (match) => {
        if (match === 'obitelj') return 'porodica';
        if (match === 'Obitelj') return 'Porodica';
        if (match === 'obitelji') return 'porodice';
        if (match === 'Obitelji') return 'Porodice';
        return match;
    }],
    [/točk/g, "tačk"], [/Točk/g, "Tačk"],
    [/priopćenj/g, "saopštenj"], [/Priopćenj/g, "Saopštenj"],
    [/\bŠto je/g, "Šta je"], [/\bšto je/g, "šta je"],
    [/obvez/g, "obavez"], [/Obvez/g, "Obavez"],
    [/\bprije\b/g, "pre"], [/\bPrije\b/g, "Pre"],
    [/\bposlije\b/g, "posle"], [/\bPoslije\b/g, "Posle"],
    [/\buvijek\b/g, "uvek"], [/\bUvijek\b/g, "Uvek"],
    [/uvjetuju/g, "uslovljavaju"],
    [/\brazina\b/g, "nivo"], [/\bRazina\b/g, "Nivo"],
    [/\brazine\b/g, "nivoa"], [/\bRazine\b/g, "Nivoa"],
    [/\brazinu\b/g, "nivo"], [/\bRazinu\b/g, "Nivo"],
    [/\bpromiče\b/g, "promoviše"], [/\bPromiče\b/g, "Promoviše"],
    [/\bpromicati\b/g, "promovisati"], [/\bPromicati\b/g, "Promovisati"],
    [/potrebnoj/g, "neophodnoj"],
    [/Zrak/g, "Vazduh"], [/zrak/g, "vazduh"],
    [/\bDio\b/g, "Deo"], [/\bdio\b/g, "deo"],
    [/\bdijel(ov)?/g, "del$1"], [/\bDijel(ov)?/g, "Del$1"],
    [/\butjecaj/g, "uticaj"], [/\bUtjecaj/g, "Uticaj"],
    [/\btijek\b/g, "tok"], [/\bTijek\b/g, "Tok"],
    [/\buspješn/g, "uspešn"], [/\bUspješn/g, "Uspešn"],
    [/\bprijevod/g, "prevod"], [/\bPrijevod/g, "Prevod"],
    [/\buporab/g, "upotreb"], [/\bUporab/g, "Upotreb"],
    [/\bcjelokupn/g, "celokupn"], [/\bCjelokupn/g, "Celokupn"],
    [/\bzajedno sa/g, "zajedno sa"],
    [/\bovisn/g, "zavisn"], [/\bOvisn/g, "Zavisn"], // ovisno -> zavisno
    [/\bsigurnosn/g, "bezbednosn"], [/\bSigurnosn/g, "Bezbednosn"], // sigurnosni -> bezbednosni
    [/\bkutij/g, "kutij"], // kutija -> kutija (same)
    [/\bučinkovit/g, "efikasn"], [/\bUčinkovit/g, "Efikasn"] // učinkovit -> efikasan
];

for (const [pattern, repl] of replacements) {
    content = content.replace(pattern, repl);
}

fs.writeFileSync(filePath, content, 'utf-8');
console.log("Translation applied successfully.");
