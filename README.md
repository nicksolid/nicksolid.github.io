# dicksonli.com

Source for [dicksonli.com](https://dicksonli.com). Plain HTML/CSS/vanilla JS.
No build step. No framework. Edit files, push to GitHub, GitHub Pages serves it.

## Structure

```
dicksonli-com/
├── index.html              Home (about me)
├── professional.html       Career Gantt + write-ups
├── writing.html            Substack feed + subscribe
├── takeaways.html          Takeaways (notes on books, podcasts, articles)
├── projects.html           Side projects
├── css/main.css            All styles
├── js/site.js              Shared nav + footer
├── js/professional.js      Career data (ROLES) + Gantt rendering
├── js/writing.js           Substack RSS loader
├── js/takeaways.js         Takeaways data (ENTRIES) + render
├── favicon.svg             Tab icon (navy "DL" mark)
├── images/                 Profile pic and any future images
├── brand/                  Local-only: brand exports for the Cloud Operator
│                           Substack (NOT deployed; see `.gitignore`)
├── CNAME                   Custom domain for GitHub Pages
└── .nojekyll               Tells GitHub Pages to skip Jekyll
```

The `brand/` folder is `.gitignore`'d. It contains the Substack profile
picture, header banner, email banner, post cover images, the Inter font
cache, and the `export.py` script that regenerates them. None of it is
served from dicksonli.com — those PNGs are uploaded directly to Substack.

## Brand basics

These three values appear inline across the site and in the brand exports.
If you ever change them, search-and-replace across the repo + re-run
`brand/export.py`.

| Element        | Value                                                |
| -------------- | ---------------------------------------------------- |
| Accent (links) | `#0099ff` (the dicksonli.com link blue, set in `css/main.css :root`) |
| Cloud Operator | `#7f1d1d` burgundy (used as the Writing-page card border) |
| Cream paper    | `#fbf6ed` (Cloud Operator publication background)    |
| Headline font  | Inter — body uses Helvetica Neue / Arial system stack |
| Cloud Operator mark | Refinery silhouette, master SVGs in `brand/`    |

## Editing cheat sheet

| If you want to…                        | Edit                              |
| -------------------------------------- | --------------------------------- |
| Update the About blurb                 | `index.html`                      |
| Add a role / edit a write-up           | `js/professional.js` (ROLES)      |
| Recolour the career bars by geo        | `js/professional.js` (GEO_COLORS) |
| Add a Takeaways entry                  | `js/takeaways.js` (ENTRIES)       |
| Add a project                          | `projects.html`                   |
| Change colors / spacing                | `css/main.css` (`:root` block)    |
| Change the tab icon                    | `favicon.svg`                     |
| Add or rename a nav link               | `js/site.js` (NAV array)          |

# Writing rules

These are prescriptive rules for content on the site. They reflect decisions
made; they aren't preferences to revisit.

## Takeaways (`js/takeaways.js`)

Format: WIRTW-lite. Each entry is a bold headline, a source line, and one
or more paragraphs of take.

Source-line components, in order: source name, publication date, "read →"
or "listen →" link. The render function handles the formatting; the
`ENTRIES` object just needs the fields populated.

Default to paragraph prose. Bullets are only acceptable if the source
itself is a numbered list (rare).

No stars, no rating systems. Anything that needs flagging gets flagged in
the take itself.

For books: lead with the argument the book makes, not "what stuck for me."
Keep tight — 2 to 4 sentences. Length should match substance: a single
strong idea is one paragraph; layered arguments (e.g. the Gavin Baker
podcast entry) can run several. No ceremony either way.

URLs go to publisher pages for books, primary source for podcasts and
articles. Avoid Amazon links and aggregators.

The entry schema:

```js
{
    type:      "podcast",       // book | podcast | reading | show | tweet
    date:      "2026-05-26",    // when YOU consumed it (sorts the list)
    published: "2026-05-26",    // when the SOURCE came out (shown to readers)
    title:     "Headline",
    source:    "Show / author / publisher",
    url:       "https://...",   // optional — adds the "read →" / "listen →" link
    take:      "Paragraph."     // string, or array of strings for multiple paragraphs
}
```

Phone edit path: github.com → repo → `js/takeaways.js` → pencil → edit →
commit. Goes live in ~30 seconds.

## Professional Journey (`js/professional.js`)

First-person, conversational. Each entry leads with the substantive learning
from that chapter. "Where it started, and a formative few years." "My
first real job, and where I learned the craft of consulting." Not
resume-bullet phrasing.

No "Spearheaded," "Led," "Drove $XM" framing. No internal numbers. No
employer-internal terminology. No client names. Safe-for-public.

Length is consistent across entries — about 4 lines of prose each.

Specific phrasings settled on (don't re-write these):

- "Trained in economics," not "trained as an economist."
- "Where the value sits," not "where the money is leaking."
- No public-version "why I left" content for any role.

Geography is the visual differentiator: orange for United States, blue for
Singapore. The `GEO_COLORS` map in `js/professional.js` controls this; the
legend above the chart updates automatically.

## About / Home page (`index.html`)

Reflects the current you: based in Singapore, currently at AWS, previously
Google + Bain + Kearney, MIT Sloan + UChicago, new dad. Mentions Cloud
Operator inline as the side writing.

Style: terse + factual + first-person, with one personal hook at the end
(the Cloud Operator + new-dad line). En-dashes only. No em-dashes anywhere
on the public site.

## Substack post structure (affects the parser)

`writing.html` pulls Cloud Operator posts via RSS and renders the first
~150 words on dicksonli.com as a preview. The parser preserves paragraph
structure and section headings.

For the preview to render cleanly, follow these conventions when writing on
Substack:

- Open every post with an `<h2>` section heading followed by `<p>` paragraphs.
- Don't open with an image-only block, a quote, a bulleted list, or a
  callout. Those are skipped or render oddly.
- Section headings appear as bold mini-headings in the dicksonli.com preview,
  so they should read as legible structure. The SCQA pattern from Issue 01
  (Situation, Complication, Question, Answer, Takeaway) works well.

Editorial rules for Cloud Operator (voice, audience, length, employer
disclosures, what not to publish) live with the publication, not here.
See `Docs/newsletter/soul.md` and the working notes in `Docs/newsletter/`.

# Site architecture

Most pages are static HTML. Two are data-driven (Professional, Takeaways)
and one pulls live data (Writing).

## Shared chrome

Every page mounts the same nav and footer via `js/site.js`. Each HTML page
includes the script and calls `renderChrome("home" | "professional" | …)`
to mark the active link. To add a nav item, edit the `NAV` array in
`js/site.js` only — every page picks it up.

## Data-driven pages

**Professional** — career data lives in the `ROLES` array at the top of
`js/professional.js`. Each role:

```js
{
    company: "Google",
    role:    "Country Strategy & Operations Lead, Southeast Asia (Chief of Staff)",
    short:   "Chief of Staff",      // label shown inside the bar
    start:   2021.4,                 // decimal year (e.g. .4 ≈ Q2)
    end:     2024.4,
    geo:     "Singapore",            // must match a key in GEO_COLORS
    present: false,                  // set true on the current role
    did:     "Plain-language paragraph."
}
```

The renderer builds the Gantt bars and detail cards. Bar width comes from
`start`/`end`; bar colour comes from `geo`; clicking a bar smooth-scrolls
to and flashes the detail card. `FIRST_YEAR` and `LAST_YEAR` constants
control the chart's x-axis range.

**Takeaways** — entries live in the `ENTRIES` array at the top of
`js/takeaways.js`. Schema documented in the Writing rules section above.
The renderer sorts by `date` desc, colour-codes by `type` via the `TYPES`
map, and auto-builds filter buttons for whichever types are present. To
add a new media type or recolour an existing one, edit `TYPES`.

Italics inside a take string: wrap the phrase in `*asterisks*` (markdown
style). The renderer converts `*phrase*` to `<em>phrase</em>`.

## Live data: Writing page (`js/writing.js`)

Pulls the latest 5 posts from the Cloud Operator Substack RSS feed at
`cloudoperator.substack.com/feed` via the `api.rss2json.com` CORS proxy.
Renders each as a card with title, date, "read on Substack →" link,
subtitle, and a 150-word excerpt that preserves paragraph structure and
section headings.

The excerpt parser:

- Strips Substack's cover image / `<figure>` / `<picture>` blocks first
  (they contain `srcset` attributes that confuse a naive paragraph regex).
- Walks the article body block by block, picking out only `<p>` and
  `<h1>`-`<h6>` elements.
- Drops a leading block that exactly matches the post subtitle (Substack
  sometimes wraps the subtitle as the first paragraph).
- Stops when it has 150 words; partial truncation keeps the last
  paragraph's structure intact.

Word limit is the `EXCERPT_WORD_LIMIT` constant. Section-heading rendering
uses the `excerpt-heading` CSS class; paragraph spacing is set in `css/main.css`
under `.post-card .post-excerpt`.

If the proxy ever fails, the page falls back to a "Couldn't load the feed
right now. Visit Substack →" link. Standalone fallback paths (Cloudflare
Worker, hand-maintained list) are documented in `js/writing.js`.

## Brand exports (`brand/export.py`)

Generates Cloud Operator's profile picture, publication header, email
banner, and per-issue post cover images from one Python script. Renders
with Pillow (no Cairo / Inkscape dependency); fonts cached in
`brand/_fonts_cache/` from Google Fonts on first run.

To add a new issue cover, edit the `main()` function — there's a one-block
`draw_post_cover(issue_number=…, title=…, subtitle=…)` call to copy. Run
`python export.py` from the brand folder. PNGs go directly to Substack;
the brand folder is `.gitignore`'d, so nothing here ships to dicksonli.com.

## CSS organisation (`css/main.css`)

One stylesheet, organised top-to-bottom roughly:

1. `:root` palette + page basics (lines ~1-50)
2. Layout, navbar, content typography, mobile breakpoints (~50-300)
3. Page-specific blocks: Professional Gantt, Writing post cards,
   Projects list, Takeaways entries (~200-450)

Common vars are at the top — accent colour, max widths, image size. The
mobile breakpoint at `@media (max-width: 500px)` uses flexbox + gap on the
nav so links wrap to a second row when the screen is narrow.

# Local preview

Open any HTML file in a browser. The Substack iframe on `writing.html`
won't load from `file://` — that's a browser security restriction and not
a code problem. To preview the iframe and the RSS loader, run a local server:

```
python -m http.server 8000
```

Then visit `http://localhost:8000`. Both work the same as production once
served over a real protocol.

# Deploy

```
git add .
git commit -m "what changed"
git push
```

Three commands. Site is served by GitHub Pages from
`nicksolid/nicksolid.github.io`; push to `master` and the new version is
live within ~30 seconds. The `CNAME` file points the custom domain at the
repo. The `.nojekyll` file disables Jekyll so the plain HTML/JS is served
as-is.
