# বোধন — Design Direction Notes

## Three stylistic approaches

### Theme Name: শিউলি সকাল
**Very Brief Intro:** A soft editorial Bengali festival direction built from cream paper, marigold, vermilion and the quiet rhythm of kashful in morning light. It treats the site like a contemporary puja invitation with tactile warmth.
**Probability:** 0.07

### Theme Name: মহাশক্তির রাত্রি
**Very Brief Intro:** A dramatic cosmic direction where Durga’s gaze, constellations and ritual fire glow from a deep red-black atmosphere. It makes the opening feel cinematic and devotional without losing interface clarity.
**Probability:** 0.03

### Theme Name: পাড়ার প্যান্ডেল ডায়েরি
**Very Brief Intro:** A lively, human-centered street guide inspired by hand-painted para posters, tram tickets and neighborhood maps. It feels social, useful and full of small discoveries.
**Probability:** 0.09

## Selected direction: শিউলি সকাল

### Design Movement
Contemporary Bengali editorial — a fusion of Indian modernist poster composition, hand-made alpona geometry, and quiet luxury hospitality design. The interface should feel like a premium digital puja invitation that opens into a living city guide.

### Core Principles
1. **Soft ceremony:** Every section should feel like a ritual reveal — calm, spacious and intentional rather than noisy.
2. **Tactile Bengal:** Use paper-like cream surfaces, vermilion marks, brass details, alpona lines, and kashful movement as recurring physical cues.
3. **Asymmetric storytelling:** Avoid a centered stack. Let copy, imagery and timelines sit in layered editorial compositions with generous breathing room.
4. **Useful wonder:** Every magical interaction should lead to a practical next step: learn, count down, plan a route, or listen.

### Color Philosophy
The base is warm off-white and cream so the page feels like a hand-held puja invitation under morning light. Marigold yellow carries celebration and sacred radiance; vermilion red is reserved for decisive moments, active states and the Durga gaze; deep ink brown anchors long reading passages. A muted leaf green appears only in the map layer to connect the digital guide to Bengal’s landscape.

### Layout Paradigm
A vertical scroll journey with alternating **wide cinematic moments** and **offset editorial panels**. The hero is full-bleed and immersive, the “Who is Durga Ma?” section uses a two-column narrative with a floating portrait, the timeline pins to a vertical alpona rail, and the pandal guide becomes a split-screen map + scrollable discovery list. On small screens the compositions collapse into a single story rail without losing the offset rhythm.

### Signature Elements
- A thin vermilion **third-eye thread** that appears as a route line, timeline spine and focus ring.
- Small brass **alpona rings** around dates, map points and audio controls.
- A soft **kashful veil**: grain, cream haze and grass-like linework behind major reveals.

### Interaction Philosophy
Interactions should feel like touching a ceremonial object: hover states lift by a few pixels, route points glow with a brief vermilion pulse, and buttons respond with a tactile press. The map guide prioritizes confidence and orientation; the user should always know where they are, what is nearby, and how to return.

### Animation
Use GSAP ScrollTrigger for one-time, low-drama reveals. The opening video remains in a slow loop while text rises in a staggered sequence. Durga’s cosmic portrait drifts in with a masked radial reveal; alpona rings draw themselves around the next milestone; the timeline line grows with scroll progress; the map section enters by sliding the list and map into alignment. Keep transitions between 180–700ms, use ease-out or custom cubic curves, and disable non-essential motion under `prefers-reduced-motion`.

### Typography System
Use **Noto Serif Bengali** for Bengali display text and **Manrope** for English utility labels, dates, and interface controls. Display titles are heavy and closely tracked; body copy is regular with wide line-height; English metadata is uppercase or small-caps with generous letter spacing. Never use Inter.

### Brand Essence
**বোধন is a quiet, cinematic digital guide to Durga Puja 2026 for Bengali hearts who want to feel the arrival, understand the ritual, and move through Kolkata and West Bengal with confidence.**
Personality: **devotional, warm, contemporary**.

### Brand Voice
Headlines sound intimate, poetic and clear. CTAs are verbs with a sense of invitation, never generic conversion language. Microcopy is helpful, lightly lyrical, and specific.

Example lines:
- “আসছেন তো? শহর জুড়ে মায়ের আলো জ্বলবে।”
- “প্যান্ডেল ঘুরবেন? বোধন দেখাক, কোথা থেকে শুরু করবেন।”

### Wordmark & Logo
The mark is a compact, text-free symbol: a vermilion third eye nested inside a marigold petal, framed by one imperfect alpona ring. The wordmark “বোধন” should be typeset in Noto Serif Bengali with a custom vermilion accent line under the final letter, never as a default logo font.

### Signature Brand Color
**Bodhon Vermilion — `#B52A22`**, a deep ritual red with enough brown warmth to feel hand-painted rather than synthetic. It owns decisive moments across the page: active navigation, the third-eye thread, route buttons, and the final “শুভ বিজয়া” close.

## File-level style reminder
- `client/src/index.css`: warm paper, Bodhon Vermilion, marigold, ink brown, leaf green map accent; Noto Serif Bengali + Manrope; alpona motifs and reduced-motion rules.
- `client/src/pages/Home.tsx`: cinematic scroll sequence; asymmetric editorial layouts; all major moments should have a practical interaction.
- `client/src/pages/PandalGuide.tsx`: map-first confidence, soft cream panel, vermilion route emphasis, scrollable list with clear escape route.
- `client/src/App.tsx`: public story navigation with a persistent, contrast-safe floating header.

## Style Decisions

- All cards, panels, and navigation chrome should read as tactile cream paper with brass/alpona accents, never as generic glassmorphism or SaaS-style rounded containers.
- Vermilion `#B52A22` is reserved for decisive ritual signals — third eye, route/thread, active state, primary invitation, and final blessing — and should not dominate large background fields except at a deliberate climactic close.
- Imagery must stay in the “morning invitation” world: kashful, cream haze, hand-painted map texture, warm idol photography, and editorial crops; avoid black-heavy cosmic or poster-like red imagery unless softened back into paper and daylight.
- The guide page should feel like a quiet ritual reveal before becoming functional: tactile intro framing first, map/list orientation second.
