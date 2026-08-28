import csv
import json
import math
import re
from pathlib import Path

ROOT = Path('/home/ubuntu/bodhon-durga-puja')
UPLOAD = Path('/home/ubuntu/upload')
OUT = ROOT / 'client/src/data'
OUT.mkdir(parents=True, exist_ok=True)


def clean(value):
    return re.sub(r'\s+', ' ', (value or '').strip())


def key(value):
    return re.sub(r'[^a-z0-9]+', '', value.lower())


def km(a_lat, a_lng, b_lat, b_lng):
    lat = math.radians((a_lat + b_lat) / 2)
    return math.hypot((b_lat - a_lat) * 111.32, (b_lng - a_lng) * 111.32 * math.cos(lat))


def load_osm(path):
    data = json.loads(path.read_text(encoding='utf-8'))
    rows = []
    for element in data.get('elements', []):
        tags = element.get('tags') or {}
        if element.get('type') != 'node' or not tags.get('name'):
            continue
        rows.append({'id': str(element['id']), 'name': clean(tags['name']), 'nameBn': clean(tags.get('name:bn')), 'lat': element['lat'], 'lng': element['lon']})
    return rows

pandal_rows = []
with (UPLOAD / 'mapular-locations-export.csv').open(newline='', encoding='utf-8-sig') as handle:
    for index, row in enumerate(csv.DictReader(handle), start=1):
        name = clean(row.get('Name'))
        try:
            lat = float(row.get('Latitude', ''))
            lng = float(row.get('Longitude', ''))
        except ValueError:
            continue
        if not name or not (-90 <= lat <= 90 and -180 <= lng <= 180):
            continue
        description = clean(row.get('Description'))
        if description.startswith('name: '):
            description = re.sub(r'^name:\s*[^d]*description:\s*', '', description, flags=re.I)
        pandal_rows.append({'id': f'csv-{index}-{key(name)}', 'name': name, 'address': clean(row.get('Address')), 'lat': lat, 'lng': lng, 'description': description, 'phone': clean(row.get('Phone')), 'website': clean(row.get('Website')), 'imageUrl': clean(row.get('Image URL')), 'active': clean(row.get('Active')).lower() == 'true'})

# Deduplicate by normalized name, retaining the first valid source row.
unique = {}
for row in pandal_rows:
    unique.setdefault(key(row['name']), row)
pandals = list(unique.values())
metros = load_osm(UPLOAD / 'metro_data.json')
buses = load_osm(UPLOAD / 'bus_stops_data.json')

(OUT / 'csv-pandals.json').write_text(json.dumps(pandals, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(OUT / 'metro-stations.json').write_text(json.dumps(metros, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')
(OUT / 'bus-stops.json').write_text(json.dumps(buses, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')

report = ['# CSV and transit dataset audit', '', f'- CSV rows with valid coordinates: {len(pandal_rows)}', f'- Deduplicated pandals: {len(pandals)}', f'- Metro nodes with names: {len(metros)}', f'- Bus-stop nodes with names: {len(buses)}', '', '## Duplicate pandal names removed']
counts = {}
for row in pandal_rows:
    counts.setdefault(key(row['name']), []).append(row['name'])
for names in counts.values():
    if len(names) > 1:
        report.append(f'- {names[0]} ({len(names)} source rows)')
report.extend(['', '## Jagat Mukherjee Park nearest-stop audit'])
example = next((row for row in pandals if key(row['name']) == key('Jagat Mukherjee Park')), None)
if example:
    nearest_metro = min(metros, key=lambda stop: km(example['lat'], example['lng'], stop['lat'], stop['lng']))
    nearest_bus = min(buses, key=lambda stop: km(example['lat'], example['lng'], stop['lat'], stop['lng']))
    report.extend([f"- Pandal: {example['name']} ({example['lat']}, {example['lng']})", f"- Nearest metro by supplied coordinates: {nearest_metro['name']} ({km(example['lat'], example['lng'], nearest_metro['lat'], nearest_metro['lng']):.2f} km straight-line)", f"- Nearest bus stop by supplied coordinates: {nearest_bus['name']} ({km(example['lat'], example['lng'], nearest_bus['lat'], nearest_bus['lng']):.2f} km straight-line)"])
else:
    report.append('- Jagat Mukherjee Park was not found in the supplied CSV.')
(ROOT / 'csv-transit-audit.md').write_text('\n'.join(report) + '\n', encoding='utf-8')
print('\n'.join(report))
