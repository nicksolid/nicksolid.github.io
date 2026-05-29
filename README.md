# dicksonli.com

Source for [dicksonli.com](https://dicksonli.com). Plain HTML/CSS/vanilla JS.
No build step. No framework. Edit files, push to GitHub, GitHub Pages serves it.

## Structure

```
dicksonli-com/
├── index.html              # Home (about me)
├── professional.html       # Career Gantt + write-ups
├── writing.html            # Substack feed + subscribe
├── takeaways.html          # Takeaways (notes on books, podcasts, articles)
├── projects.html           # Side projects
├── css/main.css            # All styles
├── js/site.js              # Shared nav + footer (one place to edit)
├── js/professional.js      # Career data (ROLES) + Gantt rendering
├── js/writing.js           # Substack RSS loader
├── js/takeaways.js         # Takeaways data (ENTRIES) + render
├── favicon.svg             # browser-tab icon (navy "DL" mark)
├── images/                 # Profile pic, future images
├── CNAME                   # custom domain for GitHub Pages
└── .nojekyll               # tells GitHub Pages: don't run Jekyll
```

## Editing

| If you want to…                        | Edit                              |
| -------------------------------------- | --------------------------------- |
| Update the About blurb                 | `index.html`                      |
| Add a role / edit a write-up           | `js/professional.js` (ROLES)      |
| Recolour the career bars (by geo)      | `js/professional.js` (GEO_COLORS) |
| Point Writing at your live Substack    | `writing.html` (substackUrl)      |
| Add a media entry (book, podcast, …)   | `js/takeaways.js` (ENTRIES array) |
| Add a project                          | `projects.html`                   |
| Change colors / spacing                | `css/main.css` (top-level vars)   |
| Change the tab icon                    | `favicon.svg`                     |
| Add or rename a nav link               | `js/site.js` (NAV array)          |

## Local preview

Just open `index.html` in a browser. Or run any static server:

```bash
# Python 3
python -m http.server 8000
# Then visit http://localhost:8000
```

## Deploy

This site is served by GitHub Pages from `nicksolid/nicksolid.github.io`.
Push to `master` and it goes live within ~30 seconds.

The `CNAME` file tells GitHub Pages to serve it at `dicksonli.com`.
The `.nojekyll` file disables Jekyll so the plain HTML/JS is served as-is.

## TODOs (open)

- [ ] Replace the Substack subscribe-form placeholder in `writing.html` once
      The Cloud Operator publication exists.
- [ ] Set `substackUrl` in `writing.html` so the RSS loader can pull posts.
- [ ] Review the plain-language career write-ups in `js/professional.js`.
- [ ] Add a current-day photo to `images/` if you want to update the profile picture.

## Adding a Takeaways entry from your phone

1. github.com → repo → `js/takeaways.js` → pencil icon (Edit).
2. Add an object to the top of `ENTRIES`:
   ```js
   {
       type:      "podcast",       // book | podcast | reading | show | tweet
       date:      "2026-05-26",    // when YOU consumed it (sorts the list)
       published: "2026-05-26",    // when the SOURCE came out (shown to readers)
       title:     "Headline",
       source:    "Show / author / publisher",
       url:       "https://...",   // optional — adds a "listen →" / "read →" link
       star:      true,            // optional — marks a favourite
       take:      "Paragraph."     // string, or array of strings for >1 paragraph
   }
   ```
3. Commit. GitHub Pages redeploys in ~30 seconds.

The page sorts by `date` (newest first), colour-codes each entry by media
type, and builds the filter bar automatically. To add a new media type or
recolour one, edit the `TYPES` map in `js/takeaways.js`.
