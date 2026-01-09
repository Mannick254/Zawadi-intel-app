
import os

def update_canonical_links():
    directories_to_search = ['public']
    old_string_1 = "https:/mannick254.github.io/Zawadi-intel-app"
    old_string_2 = "https://mannick254.github.io/Zawadi-intel-app"
    new_string = "https://zawadiintelnews.vercel.app"
    
    files_updated = 0

    for directory in directories_to_search:
        for root, _, files in os.walk(directory):
            for file in files:
                if file.endswith('.html'):
                    filepath = os.path.join(root, file)
                    
                    with open(filepath, 'r', encoding='utf-8') as f:
                        content = f.read()
                    
                    original_content = content
                    
                    content = content.replace(old_string_1, new_string)
                    content = content.replace(old_string_2, new_string)
                    
                    if content != original_content:
                        with open(filepath, 'w', encoding='utf-8') as f:
                            f.write(content)
                        print(f"Updated: {filepath}")
                        files_updated += 1
    
    if files_updated > 0:
        print(f"\nSuccessfully updated {files_updated} files.")
    else:
        print("\nNo files required updating.")

if __name__ == '__main__':
    update_canonical_links()
