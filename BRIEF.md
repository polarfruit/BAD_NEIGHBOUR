# BAD NEIGHBOUR — WEBSITE BUILD BRIEF
### For: AI Agent / Developer
### Version: 2.0 — COMPLETE (all menu content included)

---

## WHAT YOU ARE BUILDING

A single-page marketing website for **Bad Neighbour** — a café located at Harbour Town, Adelaide, Australia. The site serves one purpose: make someone who stumbles on it immediately understand what this place is, want to go there, and know what to order. It is not a blog. It is not a brand story. It is a venue page with attitude.

---

## WHO BAD NEIGHBOUR IS

Bad Neighbour is a café that sells coffee, sandwiches (sandos), and trouble — and chocolate. The full extended tagline seen on their branding is "COFFEE SANDOS TROUBLE & CHOCOLATE BOYS!" Their dessert menu is literally called "TROUBLE." The tagline is not metaphor — it is the menu structure. They are located in Harbour Town, Adelaide.

The brand is **witty, not warm**. **Mischievous, not rude**. They do not explain themselves. They do not apologise for what they are. They subvert hospitality clichés. Where a normal café says "crafted with love and care," Bad Neighbour says nothing — or says something that makes you laugh.

The name is the concept. A bad neighbour shows up uninvited, makes noise, doesn't apologise, and somehow you still like them. That energy lives in every line of copy, every design decision, every interaction on the site.

**What it sounds like:**
- Short sentences. Full stops. No fluff.
- "Coffee. Sandos. Trouble." — not "Expertly curated beverages and artisanal food offerings."
- "Worth. Every. Calorie." — not a paragraph of food description.
- Dry. Deadpan. One beat of wit, then move on.

**What it feels like:**
- Bold. Graphic. A little confrontational.
- Like a venue that knows exactly what it is and doesn't need your validation.
- The checkerboard motif, the stacked logo, the all-caps display type — it's confident, not loud.

**What it should NEVER look like or sound like:**
- Warm beige minimalism ("clean and calm café vibes")
- Cursive script fonts
- Pastel colours
- Words like "artisan," "crafted," "journey," "passionate," "proud to serve"
- Stock photo energy — people smiling at lattes, overhead flat lays of avocado toast
- Lengthy About sections explaining the founder's story
- Any copy that hedges or qualifies itself

**Visual references to draw from:**
- Classic New York deli signage — bold, stacked, functional
- 70s sports branding — geometric, high contrast, no decoration for decoration's sake
- Risograph print aesthetic — slightly rough edges, high contrast, limited colour palette
- Checkerboard as a motif (it appears prominently in the brand guidelines)

---

## COLOUR SYSTEM

Use these exact values. Do not approximate.

| Name | Hex | Role |
|---|---|---|
| Forest Green | `#1B3427` | Primary — backgrounds, logo, heavy UI elements |
| Cream | `#F5F2E8` | Background — page default, light sections |
| White | `#FFFFFF` | Canvas — cards, content panels, contrast zones |
| Mid Green | `#3D6B4F` | Accent / Highlight — hover states, dividers, secondary elements |

**Usage rules:**
- Default page background: `#F5F2E8` (Cream)
- Logo on dark backgrounds: White text on `#1B3427`
- Logo on cream/white backgrounds: `#1B3427` text
- Buttons: `#1B3427` background, `#F5F2E8` or `#FFFFFF` text — all caps, no border radius or very subtle (2–4px max)
- Never use colours outside this palette. No greys, no off-brand tones.

---

## TYPOGRAPHY

### Display / Headlines — Etna
- Use for: all major headings, the logo wordmark, section titles, any large statement copy
- Style: **ALL CAPS always**. Heavy weight. Tight letter-spacing (tracking: -0.02em to 0em).
- Load via: Google Fonts does not carry Etna. Source it from [Fontshare](https://www.fontshare.com/) — search "Etna" — or use a self-hosted webfont. If unavailable, fallback to `'Anton', sans-serif` from Google Fonts as a close substitute.
- CSS: `font-family: 'Etna', 'Anton', sans-serif; text-transform: uppercase; font-weight: 900;`

### Body / UI — Barlow
- Use for: all body copy, nav items, labels, captions, price points, descriptors
- Load via: Google Fonts — `https://fonts.googleapis.com/css2?family=Barlow:wght@400;500;600;700&display=swap`
- Style: Regular (400) for descriptions, SemiBold (600) for labels/prices, Bold (700) for UI emphasis
- CSS: `font-family: 'Barlow', system-ui, sans-serif;`

---

## FRAMEWORK & TECH STACK

Build this as a **single HTML file** with embedded or linked CSS and minimal vanilla JavaScript. No React, no build step, no dependencies unless absolutely necessary. The deliverable should be one file a non-developer can open in a browser or drop into any static host (Netlify, Vercel, GitHub Pages).

If the agent prefers a framework: **Next.js with static export** is acceptable, but the default target is plain HTML/CSS/JS.

**CSS approach:** Write custom CSS. Use CSS custom properties (variables) for the colour system. No Tailwind, no Bootstrap — the design is specific enough that a utility framework will fight it.

```css
:root {
  --green: #1B3427;
  --cream: #F5F2E8;
  --white: #FFFFFF;
  --mid-green: #3D6B4F;
  --font-display: 'Etna', 'Anton', sans-serif;
  --font-body: 'Barlow', system-ui, sans-serif;
}
```

---

## LAYOUT STRUCTURE

The page is a single scroll. No multi-page routing. Sections in order:

### 1. NAVIGATION (fixed top)
- Background: `#1B3427`
- Logo: "BAD NEIGHBOUR" horizontal lockup, left-aligned, white, Etna font
- Right side: two links — **"VIEW MENU"** (links to `menu.html`) and **"FIND US"** (smooth scrolls to the location section on the homepage) — cream text, Barlow SemiBold, all caps, spaced. No online ordering exists, so no ORDER NOW button.
- On mobile: collapse to hamburger. Menu opens full-screen overlay, `#1B3427` background, stacked nav links in Etna.

### 2. HERO
- Full viewport height (`100vh`)
- Background: `#1B3427`
- Centre: Stacked logo — "BAD" / "NEIGH" / "BOUR" in Etna, white, enormous. Think 15–20vw font size on desktop.
- Below logo: tagline "COFFEE · SANDOS · TROUBLE" in Barlow, spaced caps, cream colour
- Bottom of hero or overlaid: checkerboard border strip — alternating `#1B3427` and `#F5F2E8` squares, 20–30px each, running full width. This is a key brand motif.
- Optional subtle animation: logo fades or slides up on load. Keep it fast (300–500ms). Do not be precious about it.

### 3. MANIFESTO STRIP
- Background: `#F5F2E8`
- Full-width, tall enough for one or two lines of very large text
- Text: rotating or static brand statements in Etna, `#1B3427`:
  - "COFFEE. SANDOS. TROUBLE."
  - "WE DON'T EXPLAIN OURSELVES."
  - "HARBOUR TOWN, ADELAIDE."
- If static: pick one. If animated: marquee scroll or slow text swap. Keep it dead simple.

### 4. MENU SECTION
The menu has three named sections that mirror the tagline: **COFFEE**, **SANDOS**, **TROUBLE**. Each gets its own full-width block. Treat them as three distinct panels, not a single table.

- **Global:** Section intro "THE MENU" — Etna, `#1B3427`, all caps, centred, large. Checkerboard strip above this section.
- **COFFEE block** — background `#1B3427`, white/cream text. Two sub-columns: HOT DRINKS left, ICED DRINKS right (desktop). Stacked on mobile.
- **SANDOS block** — background `#F5F2E8`. Numbered items in a grid (2 col desktop, 1 col mobile). Item number in `#3D6B4F`, name in Etna bold, descriptor in Barlow Regular below.
- **TROUBLE block** — background `#FFFFFF`. Single column centred list. Ends with the tagline "WORTH. EVERY. CALORIE." in Etna, large, centred.
- Each block is separated by a full-width checkerboard strip.
- Item name: Barlow SemiBold. Price: right-aligned, Barlow Bold. Descriptor: Barlow Regular 14px, `#3D6B4F`.
- See MENU CONTENT section below for all copy.

### 5. ABOUT / LOCATION STRIP
- Background: `#1B3427`
- White text
- Two columns (desktop) / stacked (mobile):
  - Left: Short brand statement. 2–3 sentences max. No fluff. See copy below.
  - Right: Address, hours, a "GET DIRECTIONS" button (links to Google Maps)
- Checkerboard strip top or bottom edge.

### 6. FOOTER
- Background: `#1B3427`
- Logo (small, white)
- Tagline: "COFFEE · SANDOS · TROUBLE"
- Location: "HARBOUR TOWN, ADELAIDE"
- Social links if applicable (Instagram icon, no text)
- Copyright line: "© BAD NEIGHBOUR PTY LTD"

---

## INTERACTIONS & DETAILS

- **Hover on nav links:** underline slides in from left, `#F5F2E8` colour
- **Hover on buttons:** invert — if filled green, go cream background with green text. Transition: 150ms ease.
- **Hover on menu items:** subtle left border appears in `#3D6B4F`, or item shifts 4px right. Keep it minimal.
- **Scroll behaviour:** `scroll-behavior: smooth` on the html element.
- **Checkerboard motif:** appears as a decorative strip between major sections. CSS implementation:
  ```css
  .checkerboard {
    background-image: repeating-conic-gradient(#1B3427 0% 25%, #F5F2E8 0% 50%);
    background-size: 24px 24px;
    height: 24px;
    width: 100%;
  }
  ```
- **Mobile first:** Design for 375px width upward. The logo stacks naturally on mobile. Menu goes single column.
- **No parallax. No scroll-triggered animations beyond a simple fade-in.** This brand is direct — the design should be too.

---

## COPY — SITE TEXT

All copy below is final. Do not rewrite it. Do not improve it. Do not add words.

**Hero tagline:** COFFEE · SANDOS · TROUBLE

**Extended brand tagline (use on hero or manifesto strip):** COFFEE SANDOS TROUBLE & CHOCOLATE BOYS!

**Nav buttons:** ORDER NOW | VIEW MENU

**Manifesto strip options (pick one or rotate as marquee):**
- COFFEE. SANDOS. TROUBLE.
- WORTH. EVERY. CALORIE.
- HARBOUR TOWN, ADELAIDE.
- WE'RE NOT HERE TO BE YOUR FRIEND.

**About copy (for location strip):**
> Bad Neighbour. Harbour Town, Adelaide.
> Coffee done right. Sandos built to make you feel something. We're not here to be your friend.
> Come anyway.

**TROUBLE section closing line:** WORTH. EVERY. CALORIE.

**Sandos note (display beneath sandos section header):** ALL OUR SANDOS ARE MADE TO ORDER AND TOASTED. GLUTEN FREE +$2.

**Coffee note (display at bottom of iced drinks):** CHECK OUT OUR VIRAL DRINKS ON OUR SOCIALS!

**Footer tagline:** COFFEE · SANDOS · TROUBLE

---

## MENU CONTENT

All content transcribed directly from the physical menu boards. Use exactly as written.

---

### COFFEE

#### HOT DRINKS
*Reg / Large*

| Item | Regular | Large |
|---|---|---|
| Latte | $5.50 | $6.20 |
| Cappuccino | $5.50 | $6.20 |
| Flat White | $5.50 | $6.20 |
| Long Black | $5.50 | $6.20 |
| Mochaccino | $6.50 | $7.50 |
| Belgian Hot Choc | $6.50 | $7.50 |
| Dirty/Chai Latte | $6.50 | $7.50 |
| Matcha Latte | $6.50 | $7.50 |
| Espresso | $4.00 | — |
| Macchiato | $4.00 | — |
| Teas | $4.00 | — |

**Tea options:** English Breakfast / Earl Grey / Camomile / Peppermint / Green / Lemongrass

**Alternative Milks:** +$1 — Oat / Soy / Almond / Lactose

---

#### ICED DRINKS
*Made with Ice Cream — Large only*

| Item | Price |
|---|---|
| Iced Coffee | $10.00 |
| Iced Chocolate | $10.00 |
| Iced Mocha | $10.00 |

#### HOUSE MADE ICED CAN DRINKS
*Large only*

| Item | Price |
|---|---|
| Iced Latte | $9.00 |
| Iced Biscoff Latte | $11.00 |
| Iced Bueno Latte | $11.00 |
| Iced Nutella Latte | $11.00 |
| Iced Pistachio Latte | $11.00 |
| Iced Matcha | $11.00 |
| Iced Strawberry Matcha | $11.00 |

---

### SANDOS
*All made to order and toasted. Gluten Free +$2.*

| # | Item | Price | Description |
|---|---|---|---|
| 1 | MORTADELLA MELT | $17 | Mortadella, fior di latte, basil pesto, hot honey and crushed pistachios. |
| 2 | THREE MEATS MELT | $20 | Nino's salami, mortadella, gypsy ham, ajvar, roast capsicum and provolone cheese. |
| 3 | CHICKEN COTOLETTA MELT | $20 | Chicken cotoletta, basil pesto, fior di latte, rocket, tomato and garlic aioli. |
| 4 | MUSHROOM RAGU MELT (VG) | $19 | Mushroom ragu with provolone cheese and truffle oil. |
| 5 | SMOKED BRISKET MELT | $20 | Slow cooked pulled brisket, American cheese, provolone, pickles, sauerkraut & mustard. |
| 6 | SALAMI MELT | $18 | Nino's salami, roast capsicum, smoked mozzarella and hot honey. |
| 7 | TUNA MELT | $16 | Tuna, diced onion, pickles, American cheese and garlic aioli. |
| 8 | HAM AND CHEESE MELT | $14 | Gypsy ham and three cheeses. |
| 9 | BREKKIE MELT *(available til 12pm)* | $19 | Bacon, egg, hashbrown, guacamole, provolone cheese and chipotle. |

---

### TROUBLE
*Desserts*

| Item | Price |
|---|---|
| Chocolate Strawberries | $13.00 |
| Biscoff Strawberries | $15.00 |
| Pistachio Strawberries | $15.00 |
| Strawberries & Cream | $15.00 |
| Dubai Chocolate Brownies | $13.00 |
| Loaded Cookies | $7.90 |
| 4 Pack Cookies | $30.00 |
| Tiramisu in a Can | $9.00 |
| Dubai Chocolate Blocks | $25.00 |

*Closing line under this section:* **WORTH. EVERY. CALORIE.**

---

## PHOTOGRAPHY & VIDEO

All assets are local in the project directory. Do not use external stock imagery.

### Photo assets — `PHOTOS/` folder
~120 professional JPG photos. Key content identified:

| Filename range | Content |
|---|---|
| `_DSC2842.jpg` | Wide venue shot — full Bad Neighbour counter at Harbour Town, staff in branded tees, menu boards visible. **Use for: About/location section.** |
| `_DSC2874.jpg` | Barista close-up — tattooed arms, espresso machine, branded green cups being filled. Cinematic, dark-ish tone. **Use for: hero background or coffee section.** |
| `_DSC3051.jpg` | Tuna melt cross-section — stacked, dramatic, dark moody background. Studio food photography. **Use for: sandos hero image.** |
| `_DSC3296.jpg` | Chocolate strawberries being drizzled — "Chocolate Boys" branded cups. Multiple in background. **Use for: TROUBLE section.** |
| `_DSC3677.jpg` | Multiple sandos on branded paper, parmesan grated over the top. **Use for: homepage photo strip or sandos section header.** |
| Remaining photos | Mix of sando cross-sections, coffee prep, venue atmosphere, dessert close-ups. Use selectively — pick 8–12 best across the site. |

**How to use photos:**
- Compress all to WebP at 85% quality, max 300kb each, before embedding.
- Do NOT use as full-bleed hero backgrounds with text overlay — too generic. Let the typography be the hero.
- Best uses: horizontal auto-scrolling strip (no controls, looping), masonry grid in the about section, individual item hero per menu section.
- Photos are portrait-oriented for the most part. Plan grid layouts accordingly.

### Video assets — `VIDEOS/` folder

| File | Likely content | Use |
|---|---|---|
| `fire.mov` | Dramatic food prep or flame element | Autoplay loop, muted, no controls — hero section background or between-section divider |
| `gif.mov` | Short looping clip (named like a GIF) | Looping background element or inline accent |
| `1107(1).mov` | Unknown — review before use | If suitable, use as secondary loop |

**Video rules:**
- All video: `autoplay`, `muted`, `loop`, `playsinline`. No controls. Never autoplays with sound.
- Convert `.mov` to `.mp4` (H.264) + `.webm` for cross-browser. Use `<source>` tags with both formats.
- If `fire.mov` is a flame/dramatic food shot, it works perfectly as a full-width muted loop above the TROUBLE dessert section.
- Keep videos short loops — if over 10 seconds, trim to the best 4–6 second loop.

---

## ORDERING

There is no online ordering. Do not add an ORDER NOW button anywhere on the site. The nav has two links only: VIEW MENU (→ menu.html) and FIND US (→ location section). If a customer wants to order, they come in.

---

## SITE STRUCTURE

Two files. No routing library needed.

```
index.html   — Homepage
menu.html    — Full menu page
```

Both share the same nav, footer, CSS variables, and font imports. Extract shared styles to `style.css` and shared JS to `main.js`. Do not duplicate code across files.

---

## MENU PAGE — `menu.html`

This is a dedicated, full-design menu page. Not a PDF. Not a table. A designed page that matches the brand exactly. The customer should be able to browse it comfortably on mobile at the counter.

### Menu page layout — sections in order:

**1. NAV** — identical to homepage nav. "VIEW MENU" link is active/underlined state.

**2. MENU HEADER**
- Background: `#1B3427`
- Large Etna heading: "THE MENU" — white, centred
- Subline: "COFFEE · SANDOS · TROUBLE" in Barlow, cream, spaced caps
- Checkerboard strip at bottom edge

**3. COFFEE SECTION**
- Background: `#1B3427`, white/cream text throughout
- Section label: "COFFEE" — Etna, enormous, white
- Two-column layout (desktop) / stacked (mobile):
  - **Left column — HOT DRINKS:**
    - Sub-header: "HOT DRINKS" — Barlow Bold, `#3D6B4F`, all caps, small
    - Each item: name left (Barlow SemiBold, white) + price right (Barlow Bold, cream)
    - Reg/Large prices displayed as: "$5.50 / $6.20"
    - Teas listed as one item with varieties below in smaller text
    - Alternative Milks note at bottom: "+$1 — OAT / SOY / ALMOND / LACTOSE" in Barlow Regular, small, `#3D6B4F`
  - **Right column — ICED DRINKS:**
    - Sub-header: "ICED DRINKS" — same style
    - Sub-sub-header: "MADE WITH ICE CREAM" — tiny, spaced caps, `#3D6B4F`
    - Items listed with Large price only
    - Rule/divider
    - Sub-sub-header: "HOUSE MADE ICED CAN DRINKS"
    - Items listed
    - Note at bottom: "CHECK OUT OUR VIRAL DRINKS ON OUR SOCIALS!" — Etna, medium, cream, centred
- Photo accent: use `_DSC2874.jpg` (barista/espresso machine) as a half-width image beside or below this section on desktop

**4. CHECKERBOARD DIVIDER STRIP**

**5. SANDOS SECTION**
- Background: `#F5F2E8`
- Section label: "SANDOS" — Etna, enormous, `#1B3427`
- Note below header: "ALL OUR SANDOS ARE MADE TO ORDER AND TOASTED" + "GLUTEN FREE +$2" — Barlow Regular, `#3D6B4F`
- Grid: 2 columns desktop, 1 column mobile
- Each sando card:
  - Number: "#1" — Etna, large, `#3D6B4F`
  - Name: Etna, medium, `#1B3427`, all caps
  - Price: Barlow Bold, `#1B3427`, right-aligned or inline
  - Description: Barlow Regular, 14px, `#3D6B4F`, sentence case
  - Subtle `#1B3427` bottom border on each card
- Photo: use `_DSC3677.jpg` (sandos on branded paper) as a full-width strip above or between the grid rows

**6. CHECKERBOARD DIVIDER STRIP**

**7. TROUBLE SECTION**
- Background: `#FFFFFF`
- Section label: "TROUBLE" — Etna, enormous, `#1B3427`
- Sub-label: "DESSERTS" — Barlow, `#3D6B4F`, spaced caps, small
- Single centred column, generous line height
- Each item: name (Barlow SemiBold, `#1B3427`) + price (Barlow Bold, right-aligned or tabbed)
- Photo: use `_DSC3296.jpg` (chocolate strawberries) prominently — either as a half-panel beside the list or as a top image for this section
- Closing line: "WORTH. EVERY. CALORIE." — Etna, large, centred, `#1B3427`. This is the last thing the customer reads on this page. Make it land.

**8. FOOTER** — identical to homepage footer

---

## WHAT GOOD LOOKS LIKE

The finished site should feel like someone ripped a page from a 1970s sports program, ran it through a risograph, and then made it load in under 2 seconds. It should be immediately, unmistakably Bad Neighbour. A stranger who has never heard of the café should look at it for 5 seconds and know exactly what it is and whether they'd go.

If any section looks like it could belong to a generic café — warm, soft, friendly, beige-and-script — it's wrong. Start that section again.

---

*Brief version 1.0 — Bad Neighbour PTY LTD — Harbour Town, Adelaide*
