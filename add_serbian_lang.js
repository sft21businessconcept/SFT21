const fs = require('fs');
const path = require('path');

const dirPath = "c:\\Users\\Sara\\Desktop\\NOVI SISTEM\\SFT21-main";

// 1. Find all HTML files
const files = fs.readdirSync(dirPath);
let htmlFiles = files.filter(f => f.endsWith('.html'));

const baseFiles = htmlFiles.filter(f => {
    return !f.endsWith('_en.html') && !f.endsWith('_sr.html') && f !== 'terms-of-use.html';
});

// 2. Create _sr files from base files
for (const base of baseFiles) {
    const parsed = path.parse(base);
    const srName = `${parsed.name}_sr${parsed.ext}`;
    
    const src = path.join(dirPath, base);
    const dst = path.join(dirPath, srName);
    
    if (!fs.existsSync(dst)) {
        fs.copyFileSync(src, dst);
    }
    
    // update lang in dst
    let content = fs.readFileSync(dst, 'utf-8');
    
    content = content.replace(/<html\s+lang="hr">/, '<html lang="sr">');
    content = content.replace(/<html\s+lang="en">/, '<html lang="sr">');
    
    fs.writeFileSync(dst, content, 'utf-8');
}

// Refresh htmlFiles to include new _sr files
const updatedFiles = fs.readdirSync(dirPath);
htmlFiles = updatedFiles.filter(f => f.endsWith('.html'));

// 3. Update language dropdowns in all files
function getBaseName(filename) {
    if (filename === 'terms-of-use.html') {
        return 'uvjeti-koristenja';
    }
    if (filename.endsWith('_en.html')) {
        return filename.slice(0, -8);
    }
    if (filename.endsWith('_sr.html')) {
        return filename.slice(0, -8);
    }
    return filename.slice(0, -5);
}

// Regex to find the HRV anchor tag and append the SRP anchor tag after it.
// It matches: <a ... href="..." ... > ... <span>HRV</span> </a>
const pattern = /(<a[^>]*href="[^"]*(?:\.html|\/)[^>]*>\s*<img[^>]*>\s*<span>HRV<\/span>\s*<\/a>)/ig;

for (const f of htmlFiles) {
    const filepath = path.join(dirPath, f);
    let content = fs.readFileSync(filepath, 'utf-8');
    
    const baseName = getBaseName(f);
    const srLink = `${baseName}_sr.html`;
    
    if (!content.includes('<span>SRP</span>')) {
        let changed = false;
        
        const newContent = content.replace(pattern, (match, p1) => {
            changed = true;
            // Find indentation of the last line to match it
            const lines = p1.split('\n');
            let indentStr = '';
            if (lines.length > 1) {
                const lastLine = lines[lines.length - 1];
                const indent = lastLine.length - lastLine.trimStart().length;
                indentStr = ' '.repeat(indent);
            }
            
            const srpLink = `\n${indentStr}<a href="${srLink}" class="language-item"> <img src="https://flagcdn.com/w20/rs.png" alt="Srpski" class="flag-image"> <span>SRP</span> </a>`;
            return p1 + srpLink;
        });
        
        if (changed && newContent !== content) {
            fs.writeFileSync(filepath, newContent, 'utf-8');
            console.log(`Updated ${f}`);
        } else {
            console.log(`Could not find HRV pattern in ${f}`);
        }
    }
}

console.log("Done!");
