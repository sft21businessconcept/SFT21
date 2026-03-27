import os
import re
import shutil

dir_path = r"c:\Users\Sara\Desktop\NOVI SISTEM\SFT21-main"

# Find all HTML files
html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

base_files = []
for f in html_files:
    # Ignore english, serbian, and specific english names
    if f.endswith('_en.html') or f.endswith('_sr.html') or f in ['terms-of-use.html']:
        continue
    base_files.append(f)

# 1. Create _sr files from base files
for base in base_files:
    name, ext = os.path.splitext(base)
    sr_name = f"{name}_sr{ext}"
    
    src = os.path.join(dir_path, base)
    dst = os.path.join(dir_path, sr_name)
    
    if not os.path.exists(dst):
        shutil.copy2(src, dst)
        
    # update lang in dst
    with open(dst, 'r', encoding='utf-8') as file:
        content = file.read()
    
    # Replace hr or en with sr
    content = re.sub(r'<html\s+lang="hr">', '<html lang="sr">', content)
    content = re.sub(r'<html\s+lang="en">', '<html lang="sr">', content)
    
    with open(dst, 'w', encoding='utf-8') as file:
        file.write(content)

# Refresh html_files to include new _sr files
html_files = [f for f in os.listdir(dir_path) if f.endswith('.html')]

# 2. Update language dropdowns in all files
def get_base_name(filename):
    if filename == 'terms-of-use.html':
        return 'uvjeti-koristenja'
    if filename.endswith('_en.html'):
        return filename[:-8]
    if filename.endswith('_sr.html'):
        return filename[:-8]
    return filename[:-5]

for f in html_files:
    path = os.path.join(dir_path, f)
    with open(path, 'r', encoding='utf-8') as file:
        content = file.read()
    
    base_name = get_base_name(f)
    sr_link = f"{base_name}_sr.html"
    
    if '<span>SRP</span>' not in content:
        # Regex to find the HRV anchor tag and append the SRP anchor tag after it.
        # It handles multiline anchors.
        pattern = re.compile(r'(<a[^>]*href="[^"]*(?:\.html|/)[^>]*>\s*<img[^>]*>\s*<span>HRV</span>\s*</a>)', re.DOTALL | re.IGNORECASE)
        
        def replacer(match):
            full_hrv_link = match.group(1)
            # Find indentation of the last line to match it
            lines = full_hrv_link.split('\n')
            if len(lines) > 1:
                last_line = lines[-1]
                indent = len(last_line) - len(last_line.lstrip())
                indent_str = ' ' * indent
            else:
                indent_str = ''
            
            srp_link = f'\n{indent_str}<a href="{sr_link}" class="language-item"> <img src="https://flagcdn.com/w20/rs.png" alt="Srpski" class="flag-image"> <span>SRP</span> </a>'
            return full_hrv_link + srp_link
            
        new_content = re.sub(pattern, replacer, content)
        
        if new_content != content:
            with open(path, 'w', encoding='utf-8') as file:
                file.write(new_content)
            print(f"Updated {f}")
        else:
            print(f"Could not find HRV pattern in {f}")
            
print("Done!")
