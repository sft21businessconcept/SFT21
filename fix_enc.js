const fs = require('fs');

// Windows-1252 to UTF-8 original bytes mapping
const map1252 = {
    0x20AC: 0x80, // €
    0x0081: 0x81, // undefined
    0x201A: 0x82, // ‚
    0x0192: 0x83, // ƒ
    0x201E: 0x84, // „
    0x2026: 0x85, // …
    0x2020: 0x86, // †
    0x2021: 0x87, // ‡
    0x02C6: 0x88, // ˆ
    0x2030: 0x89, // ‰
    0x0160: 0x8A, // Š
    0x2039: 0x8B, // ‹
    0x0152: 0x8C, // Œ
    0x008D: 0x8D, // undefined
    0x017D: 0x8E, // Ž
    0x008F: 0x8F, // undefined
    0x0090: 0x90, // undefined
    0x2018: 0x91, // ‘
    0x2019: 0x92, // ’
    0x201C: 0x93, // “
    0x201D: 0x94, // ”
    0x2022: 0x95, // •
    0x2013: 0x96, // –
    0x2014: 0x97, // —
    0x02DC: 0x98, // ˜
    0x2122: 0x99, // ™
    0x0161: 0x9A, // š
    0x203A: 0x9B, // ›
    0x0153: 0x9C, // œ
    0x009D: 0x9D, // undefined
    0x017E: 0x9E, // ž
    0x0178: 0x9F  // Ÿ
};

function fixEncoding(filePath) {
    let content = fs.readFileSync(filePath, 'utf8');
    let bytes = [];
    
    for (let i = 0; i < content.length; i++) {
        let code = content.charCodeAt(i);
        
        if (code <= 0x7F || (code >= 0xA0 && code <= 0xFF)) {
            bytes.push(code);
            continue;
        }
        
        if (map1252[code] !== undefined) {
            bytes.push(map1252[code]);
            continue;
        }
        
        // Handling surrogate pairs (e.g. emojis) which got somehow mangled?
        // Wait, if Get-Content read UTF-8, it would read emojis as 4 bytes of 1252! 
        // So no emoji surrogate pairs would exist in the corrupted string. It would just be 4 characters from 1252.
        // If there's anything else, just push the code point (though it shouldn't happen unless originally not UTF-8).
        if (code > 0xFF) {
            // Push low byte if no 1252 map matched? This indicates some unknown character.
            // But if it's completely reversible, map1252 covers all 0x80-0x9F.
            console.log(`Warning: Unmapped character ${code.toString(16)} at index ${i} in ${filePath}`);
            bytes.push(code & 0xFF);
        } else {
            bytes.push(code);
        }
    }
    
    let buffer = Buffer.from(bytes);
    let recoveredString = buffer.toString('utf8');
    fs.writeFileSync(filePath, recoveredString, 'utf8');
    console.log(`Repaired ${filePath}`);
}

const dirPath = "c:\\Users\\Sara\\Desktop\\NOVI SISTEM\\SFT21-main";

// Process all _sr.html files
const files = fs.readdirSync(dirPath).filter(f => f.endsWith('_sr.html'));
for (let file of files) {
    fixEncoding(dirPath + '\\' + file);
}
