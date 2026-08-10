import os
import subprocess

def add_portfolio_item():
    print("🎬 Welcome to the Asadullah Portfolio Automator\n")
    
    # 1. Gather inputs
    category = input("Enter Category (e.g., fashion, commercial, film, colorgrading): ").strip().lower()
    label = input("Enter Label (e.g., FB REEL, COMMERCIAL, YOUTUBE): ").strip().upper()
    title = input("Enter Video Title: ").strip()
    desc = input("Enter Description: ").strip()
    
    print("\nPaste your FULL <iframe> code below and press Enter:")
    iframe_code = input("> ").strip()

    # 2. Modify iframe to include loading="lazy" for performance
    if 'loading="lazy"' not in iframe_code:
        iframe_code = iframe_code.replace('<iframe ', '<iframe loading="lazy" ')

    # 3. Format the new HTML block
    new_card_html = f"""
          <!-- Auto-Generated Card -->
          <div class="portfolio-card" data-category="{category}">
            <div class="video-container">
              <div class="port-label" style="position: absolute; top: 14px; left: 14px; z-index: 10;">{label}</div>
              {iframe_code}
            </div> 
            <div class="port-info">
              <h3 class="port-title">{title}</h3>
              <p class="port-desc">{desc}</p>
            </div>
          </div>
          
          <!-- AUTO_INJECT_MARKER -->"""

    # 4. Inject into index.html
    html_file_path = 'index.html'
    
    with open(html_file_path, 'r', encoding='utf-8') as file:
        html_content = file.read()

    if '<!-- AUTO_INJECT_MARKER -->' not in html_content:
        print("❌ ERROR: Could not find <!-- AUTO_INJECT_MARKER --> in index.html")
        return

    # Replace the marker with the new card AND a new marker for the next time
    updated_html = html_content.replace('<!-- AUTO_INJECT_MARKER -->', new_card_html)

    with open(html_file_path, 'w', encoding='utf-8') as file:
        file.write(updated_html)
        
    print("✅ Successfully added to index.html!")

    # 5. Push to GitHub automatically
    push = input("\nDo you want to push these changes to GitHub now? (y/n): ").strip().lower()
    if push == 'y':
        print("Pushing to GitHub...")
        subprocess.run(['git', 'add', 'index.html'])
        subprocess.run(['git', 'commit', '-m', f"Auto-added portfolio item: {title}"])
        subprocess.run(['git', 'push'])
        print("🚀 Website updated successfully!")
    else:
        print("Changes saved locally, but not pushed.")

if __name__ == "__main__":
    add_portfolio_item()