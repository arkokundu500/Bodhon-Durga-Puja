# Bodhon Revision Checklist

- [x] Make Google Maps loading singleton and idempotent; eliminate duplicate API warnings.
- [x] Improve map rendering, markers, selected-location focus, and route guidance with a visible fallback state.
- [x] Document the editable pandal data source and preserve support for adding future entries.
- [x] Rename the pandal list section and primary guide CTA in English.
- [x] Blend Bengali and English copy more intentionally across the experience.
- [x] Replace the music dock with a Spotify-like glider/carousel player and provide a clear song data handoff point.
- [x] Remove the excitement/fillout form section and rebalance the closing composition.
- [x] Verify `/` and `/guide` routes, typecheck, production build, and responsive screenshots; confirm no duplicate-loader warning in the latest session.

- [x] Resolve the full-stack scaffold merge conflicts while preserving the existing Bodhon pages and routes.
- [x] Add file-storage-backed media metadata and upload/serving flow for supplied songs and covers.
- [x] Upload the four supplied cover images and four audio tracks to managed storage.
- [x] Replace all four Bodhon Radio tracks and covers with the supplied media.
- [x] Remove the song-list handoff sentence from Bodhon Radio.
- [x] Add a GSAP gramophone/tape-reel rotation tied to play and pause state.
- [x] Add or update Vitest coverage for the media catalog/storage contract and run the full check/build/test suite.
- [x] Implement real full-stack file storage with server-side S3 uploads, public listing, and an admin media manager UI.
- [x] Add persistent media metadata storage for title, subtitle, cover/audio URLs, storage keys, MIME types, and timestamps.
- [x] Add Vitest coverage for media catalog validation and media-router authorization/listing success paths.

- [x] Extract every pandal placemark from the supplied Kolkata Durga Pujo Guide KML.
- [x] Replace the hand-maintained PANDALS directory with KML-backed data and document the update workflow.
- [x] Use the supplied map/KML geography as the guide source while keeping Google Maps directions as the live navigation surface.
- [x] Add current-location-to-selected-pandal routing with Google Maps directions and nearest metro/bus context.
- [x] Add A* shortest-path logic over the normalized guide network without inventing unsupported road/transit facts.
- [x] Verify all extracted pandals, map states, route states, responsive guide UX, tests, and build.

- [x] Replace fabricated nearest-neighbor A* links with a supported Google route/polyline representation or remove the pseudo-network claim.
- [x] Fix the running cookie import/runtime error and re-verify `/guide` after restart.
- [x] Add deterministic validation for KML data and guide loading/error/success states, including one successful live-route response.

- [x] Audit and normalize the supplied pandal CSV plus metro and bus JSON files.
- [x] Replace the KML-backed directory with a deduplicated CSV-backed pandal dataset.
- [x] Replace embedded transit lookup assumptions with supplied JSON station/stop datasets and accurate nearest-distance calculations.
- [x] Paginate the pandal directory in groups of 10 with smooth, accessible controls.
- [x] Highlight the selected pandal with a red marker on the custom map.
- [x] Verify duplicate names, nearest-stop examples, map interactions, responsive layout, tests, and production build.

- [x] Make normalized metro and bus JSON datasets authoritative in the server route procedure.
- [x] Enrich those exact dataset-selected stops with Google walking directions, without replacing them via Places search.
- [x] Make the guide UI prefer dataset-selected nearest stops and verify Jagat Mukherjee Park resolves to Shobhabazar Sutanuti.
- [x] Isolate transient storage-proxy errors and re-verify pagination, selected red marker, transit cards, responsive guide, and live route behavior.

- [x] Make the selected pandal pointer dynamic, map-anchored, and visibly update on every selection.
- [x] Remove the previous-year Kolkata Durga Pujo Guide embed from the home map and keep the home map on the Bodhon source.
- [x] Update footer phone to 7439817750 and email to arkokundu.tech@gmail.com.
- [x] Rename the top navbar label from “মা কে?” to “জাগো মা দুর্গা”.
- [x] Verify home and guide map visuals, selected-marker behavior, responsive layout, tests, and production build.

- [x] Remove the map surface from Home while keeping the Pandal Directory content and controls unchanged.
- [x] Render the live map only on `/guide`.
- [x] Track the user after “Use my location” and show a green location pointer on the map.
- [x] Verify home/guide separation, location updates, responsive behavior, tests, and production build.
- [x] Re-run mobile screenshots for `/` and `/guide` after the Home map removal.
- [x] Exercise “Use my location” on `/guide` and confirm the green live-location marker appears and updates with watchPosition.

- [x] Make `/guide` show a properly loaded interactive map instead of leaving the illustrated fallback as the primary surface.
- [x] Show and track the user’s location on the guide map after clicking “Use my location”.
- [x] Repair guide-page navbar and home navigation links.
- [x] Verify map load, geolocation marker, route navigation, responsive layout, tests, and production build.

- [x] Verify the selected-destination Guide Me link on `/guide` points to the external Google Maps directions URL with the active origin.
- [x] Re-run mobile/responsive `/guide` verification after the final MapView-mounted fix, including interactive map and live-location UI.
- [x] Add a secure owner-only entry point for `/media-manager` without exposing admin controls to public visitors.
- [x] Add or update Vitest coverage for the owner-only media-manager access behavior and run check/test/build.
- [x] Save a final checkpoint after the continuation audit.
- [x] Harden the async Google Maps loader so a fast location click cannot leave the guide in illustrated fallback mode.
- [x] Re-verify `/guide` in a mobile viewport after the final map hardening by activating `Use my location`, confirming the live map stays mounted, and confirming the green marker updates.

- [x] Trace the duplicate green live-location marker to the fallback pin rendering outside the SDK fallback layer.
- [x] Add regression coverage proving live-location markers are deduplicated while the red selected-pandal marker remains separate.
- [x] Replace README.md with a polished, accurate guide to Bodhon’s architecture, data workflows, maps, media, authentication, testing, and maintenance.
- [x] Run final typecheck, tests, build, map verification, and save a new checkpoint.
- [x] Extend marker-layer regression coverage to prove the selected red marker remains independent while only one green live-location marker is rendered.
