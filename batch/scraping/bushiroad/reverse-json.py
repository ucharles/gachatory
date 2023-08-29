import json
import datetime


# Reading the file
file_list = [
    "product_list_001_144.json",
    "product_list_145_774.json",
]

for file in file_list:
    with open(file, "r", encoding="utf-8") as f:
        data = json.load(f)

    updated_data = []

    for doc in data:
        if isinstance(doc, dict):  # Check if each item is a dictionary.
            # doc["createdAt"] = datetime.datetime.utcnow().isoformat()
            # doc["lng"] = "ja"
            updated_data.append(doc)

    # If you want to reverse the order
    updated_data = list(reversed(updated_data))

    # Write back the updated data as pretty-printed/linted JSON for readability.
    with open("updated_" + file, "w", encoding="utf-8") as f:
        json.dump(updated_data, f, ensure_ascii=False, indent=4)
