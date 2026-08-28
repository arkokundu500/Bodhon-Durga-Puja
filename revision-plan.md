# Bodhon Revision Plan

## Goal

Update the existing “বোধন — Durga Puja 2026” website to make the `/guide` experience reliable and genuinely useful, while shifting the overall language toward a Bengali–English mix, removing the fillout form, and replacing the current footer audio dock with a Spotify-like glider player that is ready for the user’s future song files.

## Current context and assumptions

The website is a managed static React + Vite + Tailwind project with Wouter routing, a scaffolded `MapView` component that loads Google Maps through the Manus proxy, GSAP, Dayjs, and Zustand already installed. The duplicate API warning is caused by the current map script loader being invoked more than once when map components mount or hot-reload. The implementation will preserve the provided `MapView` integration and will not add a second map library or a second Google Maps script tag.

The user’s supplied Google Maps key will not be committed directly into source code. The map component will continue to use the project’s `VITE_FRONTEND_FORGE_API_KEY`/proxy configuration, with the supplied key treated as the value to configure in the project environment if it is the key intended for this deployment. This avoids exposing an unrestricted credential in the repository; if the key is restricted to a domain, the allowed deployed domain must also be configured in Google Cloud.

The existing pandal entries are assumed to be valid starting content. Future entries will be added manually by editing one clearly documented data array rather than by changing component markup. Songs will be provided later; the player will ship with an obvious `TRACKS` data handoff containing title, subtitle, cover image, and audio source fields.

## Phase 1 — Diagnose and fix Google Maps initialization

Refactor the scaffolded map script loader into an idempotent singleton promise. It should reuse an already loaded `window.google.maps` instance, reuse an in-flight promise while the first script is loading, and reject cleanly on script failure instead of appending another script tag. The map component should initialize at most one map instance per mounted container, cancel or ignore stale initialization after unmount, and avoid re-running initialization solely because callback references change.

Add a visible map loading state, a useful error/fallback state, and a retry path so `/guide` still presents the illustrated West Bengal route map if the Google Maps proxy is unavailable. Keep the fallback useful rather than blank. Preserve the provided Manus proxy integration and make marker creation defensive around the `AdvancedMarkerElement` availability.

## Phase 2 — Improve the guide and route behavior

Keep `/guide` as a dedicated route with a clear English CTA named **Guide Me** from the home page and header. Rename the map/list section heading to **Pandal Directory** and use English names for map controls and the section’s practical labels while keeping Bengali festival context in supporting copy.

Improve the guide layout so the map has a strong visual hierarchy: Google Maps when available, the supplied illustrated map as a fallback/texture, selected-marker emphasis, and an explicit “Use my location” action. On geolocation success, show the user’s approximate location, sort pandals by calculated distance, and focus the map. On failure or denial, show a friendly non-blocking message and retain the default Kolkata view.

Add route actions per pandal: a **Get Directions**/“Guide Me” action should build a Google Maps directions URL using the selected destination coordinates and open it safely in a new tab. The in-page guide should continue to show transit chips for metro, rail, bus, and auto, with selected-state synchronization through Zustand.

## Phase 3 — Create a future-proof pandal data handoff

Move or preserve all editable pandal content in `client/src/lib/bodhon-data.ts` under a clearly named `PANDALS` array. Add a nearby comment explaining that the user can add a new object with `id`, `name`, `neighborhood`, `district`, `mood`, `note`, `distance`, `lat`, `lng`, and `transit` fields. Add a short `PANDAL_DATA_GUIDE.md` in the project root documenting exactly where to edit, an example new entry, and the requirement that coordinates be latitude/longitude decimal pairs.

The UI will render all future entries automatically in both the map markers and the scrollable directory, without requiring additional component changes. Any final location verification remains dependent on the user supplying official committee names, coordinates, and route details.

## Phase 4 — Make the language intentionally Bengali–English mixed

Retain Bengali for devotional storytelling, section intros, and emotional microcopy. Use English for practical interface labels and navigation where requested: **Pandal Directory**, **Guide Me**, **Use my location**, **Get Directions**, **Transit**, **Distance**, **Mahalaya Countdown**, and the music player controls. Update the header, guide cards, map controls, countdown labels, footer, and player so the bilingual treatment feels systematic rather than incidental.

Keep the exact 2026 festival dates unchanged and preserve Bengali date display where it supports the invitation-like tone. Add accessible English `aria-label` values to icon-only controls.

## Phase 5 — Replace the audio dock with a Spotify-like glider

Replace the current compact footer dock with a horizontally sliding **Bodhon Radio** player. The active track should be a large featured card with cover art, title, subtitle, progress bar, play/pause, previous/next, mute/volume, and a row of swipeable or arrow-controlled track cards. Use CSS transform transitions or GSAP for the glider motion, keep playback state in Zustand, and keep the native `<audio>` element accessible and synchronized with active track changes.

Create a single `TRACKS` array as the handoff point for the user’s future audio. Each song entry should have `id`, `title`, `subtitle`, `cover`, and `src`. Include safe placeholder URLs only until the user provides real audio; make the UI visibly ready for replacement. Keep the player responsive: full glider on desktop, compact horizontal carousel on mobile, and no autoplay without a user gesture.

## Phase 6 — Remove the fillout form and rebalance the closing story

Delete the “What are you most excited about?” form section and its submitted state. Replace it with a quieter closing invitation focused on **Guide Me**, the Mahalaya countdown, and a final “শুভ শারদীয়া”/“See you under the lights” message so the site ends with purpose rather than a form. Keep the footer contact details and the new music player.

## Verification plan

Run TypeScript checks and a production build. Preview `/` and `/guide` at desktop and mobile sizes. Confirm the browser no longer reports multiple Google Maps API inclusions, the guide route loads without a blank map, map fallback remains visible on proxy failure, marker selection updates the directory, geolocation failure does not crash the page, and the directions action opens a valid Google Maps URL.

Verify that the home-page CTA and header both navigate to `/guide`, the English section labels are present, the form section is gone, the glider player can switch tracks and play/pause after a user click, the future pandal data instructions are present, and reduced-motion behavior remains respected. Save one final checkpoint after all checks; do not publish or make irreversible external changes without separate user approval.

## Open risks

The Google Maps proxy or supplied key may be restricted, unavailable, or blocked by browser policy; the fallback map and error state are therefore required. Browser geolocation requires HTTPS and user permission. The placeholder audio URLs may be unavailable in some environments, so the player must fail gracefully and remain usable as a data-driven shell until the user provides licensed files. Exact route times and pandal locations should be treated as content to verify before the 2026 event.
