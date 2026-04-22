import json
import re
import os

def extract_data():
    base_path = r'D:\RepoTCG\Deckmanager\apk-project\app\src\main\assets'
    index_json_path = os.path.join(base_path, 'sets', 'index.json')
    backup_html_path = os.path.join(base_path, 'index-backup.html')
    output_dir = os.path.join(base_path, 'sets')

    if not os.path.exists(index_json_path):
        print(f"Error: {index_json_path} not found")
        return
    if not os.path.exists(backup_html_path):
        print(f"Error: {backup_html_path} not found")
        return

    # 1. Get required siglas from index.json
    with open(index_json_path, 'r', encoding='utf-8') as f:
        index_data = json.load(f)
    all_siglas = [s['sigla'] for s in index_data]

    # 2. Check existing CSVs
    existing_csvs = [f.replace('.csv', '') for f in os.listdir(output_dir) if f.endswith('.csv')]
    missing_siglas = [s for s in all_siglas if s not in existing_csvs]

    print(f"Required siglas: {all_siglas}")
    print(f"Existing CSVs: {existing_csvs}")
    print(f"Missing siglas: {missing_siglas}")

    if not missing_siglas:
        print("No missing sets to extract.")
        return

    # 3. Read index-backup.html
    with open(backup_html_path, 'r', encoding='utf-8') as f:
        content = f.read()

    # 4. Find the SET_COLLECTIONS block
    # We look for the array starting after 'const SET_COLLECTIONS = '
    start_marker = 'const SET_COLLECTIONS = ['
    start_idx = content.find(start_marker)
    if start_idx == -1:
        print("Could not find start of SET_COLLECTIONS")
        return
    
    # Find the end of the array. It's followed by '];'
    # But since there might be arrays inside, we need to find the matching '];'
    # Actually, looking at the file, it's pretty clean.
    end_marker = '];'
    end_idx = content.find(end_marker, start_idx)
    if end_idx == -1:
        print("Could not find end of SET_COLLECTIONS")
        return
    
    sets_data_str = content[start_idx + len(start_marker) - 1 : end_idx + 1]
    
    # 5. Extract each set object
    # Format is { sigla: "...", name: "...", cards: [...] }
    # We can use a regex for each set
    set_pattern = re.compile(r'\{\s*sigla:\s*"(\w+)",.*?cards:\s*(\[.*?\])\s*\}', re.DOTALL)
    
    count = 0
    for match in set_pattern.finditer(sets_data_str):
        sigla = match.group(1)
        if sigla in missing_siglas:
            cards_json = match.group(2)
            try:
                # The data in the file uses double quotes for keys and strings, which is lucky!
                # If it didn't, we'd need a more robust JS-to-JSON parser.
                cards = json.loads(cards_json)
                
                csv_path = os.path.join(output_dir, f"{sigla}.csv")
                with open(csv_path, 'w', encoding='utf-8') as csv_file:
                    csv_file.write("id,name,number\n")
                    for card in cards:
                        name = card.get('name', '').replace('"', '""')
                        card_id = card.get('id', '')
                        number = card.get('number', '')
                        csv_file.write(f"{card_id},\"{name}\",{number}\n")
                print(f"Successfully extracted {sigla} ({len(cards)} cards)")
                count += 1
            except Exception as e:
                print(f"Error processing {sigla}: {e}")
                # Fallback: simple regex for individual cards if JSON fails
                # cards looks like: [{"id":"...","name":"...","set":"...","number":"..."}, ...]
                card_pattern = re.compile(r'\{"id":"(.*?)","name":"(.*?)","set":"(.*?)","number":"(.*?)"\}')
                cards = card_pattern.findall(cards_json)
                if cards:
                    csv_path = os.path.join(output_dir, f"{sigla}.csv")
                    with open(csv_path, 'w', encoding='utf-8') as csv_file:
                        csv_file.write("id,name,number\n")
                        for cid, cname, cset, cnum in cards:
                            escaped_name = cname.replace('"', '""')
                            csv_file.write(f"{cid},\"{escaped_name}\",{cnum}\n")
                    print(f"Extracted {sigla} using regex fallback ({len(cards)} cards)")
                    count += 1
                else:
                    print(f"Failed to extract {sigla} even with regex.")

    print(f"Total sets extracted: {count}")

if __name__ == "__main__":
    extract_data()
