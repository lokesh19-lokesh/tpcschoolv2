import os
import re

OLD_FA_CDN = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css"
NEW_FA_CDN = "https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css"

def upgrade_fa(content):
    # Search for any version of Font Awesome 6.4.x and replace it
    # and also handle versions with specific CDN link
    pattern = r'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6\.4\.[0-9]+/css/all\.min\.css'
    
    # Check if NEW_FA_CDN already exists
    if NEW_FA_CDN in content:
        return content

    new_content = re.sub(pattern, NEW_FA_CDN, content)
    
    # Also handle some variations in case of missing matches
    if new_content == content:
        new_content = content.replace(OLD_FA_CDN, NEW_FA_CDN)
        
    return new_content

for root, dirs, files in os.walk('.'):
    for name in files:
        if name.endswith(".html"):
            path = os.path.join(root, name)
            with open(path, 'r') as f:
                content = f.read()
            
            new_content = upgrade_fa(content)
            
            if new_content != content:
                with open(path, 'w') as f:
                    f.write(new_content)
                print(f"Upgraded Font Awesome in {path}")
