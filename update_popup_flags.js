const fs = require('fs');
const path = require('path');

const dirPath = "c:\\Users\\Sara\\Desktop\\NOVI SISTEM\\SFT21-main";
const files = ['index.html', 'index_en.html', 'index_sr.html'];

const newSwitcherHtml = `
<div class="popup-lang-switcher-container" style="position: absolute; top: 15px; left: 15px; display: flex; gap: 8px; z-index: 10;">
    <a href="index.html" class="popup-lang-switcher-btn" onclick="sessionStorage.removeItem('sft21_welcome_shown');" style="display: flex; align-items: center; gap: 4px; color: #e5e7eb; text-decoration: none; font-size: 14px; padding: 5px 8px; border-radius: 5px; background-color: rgba(255, 255, 255, 0.1); transition: background-color 0.2s ease;">
        <img src="https://flagcdn.com/w20/hr.png" alt="HRV" style="width: 20px;"> 
    </a>
    <a href="index_en.html" class="popup-lang-switcher-btn" onclick="sessionStorage.removeItem('sft21_welcome_shown');" style="display: flex; align-items: center; gap: 4px; color: #e5e7eb; text-decoration: none; font-size: 14px; padding: 5px 8px; border-radius: 5px; background-color: rgba(255, 255, 255, 0.1); transition: background-color 0.2s ease;">
        <img src="https://flagcdn.com/w20/gb.png" alt="ENG" style="width: 20px;"> 
    </a>
    <a href="index_sr.html" class="popup-lang-switcher-btn" onclick="sessionStorage.removeItem('sft21_welcome_shown');" style="display: flex; align-items: center; gap: 4px; color: #e5e7eb; text-decoration: none; font-size: 14px; padding: 5px 8px; border-radius: 5px; background-color: rgba(255, 255, 255, 0.1); transition: background-color 0.2s ease;">
        <img src="https://flagcdn.com/w20/rs.png" alt="SRP" style="width: 20px;"> 
    </a>
</div>
`.trim();

for (const file of files) {
    const fullPath = path.join(dirPath, file);
    if (!fs.existsSync(fullPath)) continue;
    
    let content = fs.readFileSync(fullPath, 'utf8');
    
    // Original switcher to replace
    const oldSwitcherRe = /<a href="#" id="popup-lang-switcher"[^>]*>[\s\S]*?<\/a>/;
    
    if (oldSwitcherRe.test(content)) {
        content = content.replace(oldSwitcherRe, newSwitcherHtml);
        fs.writeFileSync(fullPath, content);
        console.log("Updated " + file + " popup language switcher.");
    } else {
        console.log("Could not find old switcher in " + file + ".");
    }
}
