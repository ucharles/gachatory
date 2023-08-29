import json

# Load JSON data from file
with open("product_list.json", "r", encoding="utf-8") as file:
    data = json.load(file)

# Use a dictionary to keep track of unique items based on the 'id' key
unique_data = {item["detail_url"]: item for item in data}

# Write the unique data back to the file
with open("data.json", "w", encoding="utf-8") as file:
    json.dump(list(unique_data.values()), file, indent=4, ensure_ascii=False)
