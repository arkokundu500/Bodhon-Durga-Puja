from pathlib import Path
import json
import re
import xml.etree.ElementTree as ET

source = Path('/tmp/kolkata-pujo-guide.kml')
root = ET.parse(source).getroot()
parent_map = {child: parent for parent in root.iter() for child in parent}

def local_name(tag):
    return tag.rsplit('}', 1)[-1]

def text_for(node, target):
    for child in node.iter():
        if local_name(child.tag) == target and child.text:
            return re.sub(r'\s+', ' ', child.text).strip()
    return ''

rows = []
seen = set()
for placemark in root.iter():
    if local_name(placemark.tag) != 'Placemark':
        continue
    name = text_for(placemark, 'name')
    description = text_for(placemark, 'description')
    coordinates = text_for(placemark, 'coordinates')
    if not name or not coordinates:
        continue
    first = coordinates.split()[0].split(',')
    if len(first) < 2:
        continue
    try:
        lng, lat = float(first[0]), float(first[1])
    except ValueError:
        continue
    key = (name, round(lat, 7), round(lng, 7))
    if key in seen:
        continue
    seen.add(key)
    ancestor = parent_map.get(placemark)
    folder = ''
    while ancestor is not None:
        if local_name(ancestor.tag) == 'Folder':
            folder = text_for(ancestor, 'name')
            break
        ancestor = parent_map.get(ancestor)
    rows.append({'id': f'kml-{len(rows) + 1:03d}', 'name': name, 'description': description, 'category': folder, 'lat': lat, 'lng': lng})

output = Path('/home/ubuntu/bodhon-durga-puja/kml-pandals.json')
output.write_text(json.dumps(rows, ensure_ascii=False, indent=2), encoding='utf-8')
print(json.dumps({'count': len(rows), 'categories': sorted({row['category'] for row in rows}), 'output': str(output), 'sample': rows[:8]}, ensure_ascii=False, indent=2))
