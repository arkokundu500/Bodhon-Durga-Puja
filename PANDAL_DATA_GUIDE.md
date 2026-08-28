# Bodhon Pandal Data Guide

## Current sources

The public guide directory is generated from the supplied `mapular-locations-export.csv`. The normalized source is `client/src/data/csv-pandals.json`, imported by `client/src/lib/bodhon-data.ts`. The current CSV contains 347 valid coordinate rows, reduced to 317 unique pandal names.

Nearest-transit lookup uses the supplied `metro_data.json` and `bus_stops_data.json`. They are normalized into `client/src/data/metro-stations.json` and `client/src/data/bus-stops.json`. The guide chooses the closest station or stop by geographic distance to the selected pandal. When the visitor grants location access, Google Maps Directions supplies the live current-location transit route and walking legs.

## Updating a future edition

Replace the three source files in `/home/ubuntu/upload/` and run:

```bash
python3 scripts/normalize_guide_data.py
```

The script rewrites the three JSON files under `client/src/data/`, removes duplicate pandal names by normalized name, validates latitude/longitude values, and writes `csv-transit-audit.md`. Do not manually add pandal names, coordinates, metro stations, bus stops, or distance values to the UI source.

## Map behavior

The guide uses the managed Google Maps SDK for an own-built map with one marker per CSV pandal. The selected pandal is rendered as a larger red pointer; transit stations and bus stops are data-backed nearest matches shown in the selected-destination panel. The `Guide Me` link opens Google Maps directions for the selected coordinates, using the browser’s current location when available.

A* is used only over the ordered endpoint steps returned by Google Directions, never over fabricated links between unrelated CSV points. Google Maps remains authoritative for road, transit, and walking geometry.
