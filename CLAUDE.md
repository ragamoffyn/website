# Michael Stiso — portfolio site

Static site, no build step. Plain HTML/CSS/vanilla JS, served by GitHub
Pages from the `gh-pages` branch (which is the repo's default branch).
Open `index.html` directly in a browser to preview, or run
`python3 -m http.server` from the repo root.

- `index.html` — the single-page site: sidebar rail + Introduction, CV,
  Projects, AI & UX, Contact.
- `index-variant1.html` — a snapshot of `index.html` taken before the
  work-history diagram was rebuilt, kept so the two can be compared. It
  is the only page still using the proportional diagram. It shares
  `style.css` and `script.js` with the home page, so **check it before
  changing anything named `.wh-*`**.
- `foursubsea.html`, `national-security.html`, `maritime-refueling.html`,
  `coffee-ecosystem.html`, `sewer-corrosion.html`, `search-rescue.html`,
  `mobile-games.html` — one case-study page per project.
- `v2/` — a dashboard-style multi-page version, built from Michael's
  "CV site.pptx" layout (2026-09-24): `index.html` (home),
  `work-history.html`, `projects.html`, with its own `v2.css` and
  `v2.js`. On 2026-09-29 Michael dropped the dashboard look for the home
  page, first for a golden-spiral layout of squares (now kept as
  `v2/index-spiral.html`, CSS section 9), then the same day for a fluid
  modular type scale on a 4 : 3 ratio grid, which is the current
  `v2/index.html` (CSS section 10; one scale sets type and spacing).
  The dashboard home is kept as `v2/index-dashboard.html`.
  The menu's "Experience" link goes to `v2/work-history.html`, which since
  2026-09-30 is the horizontal layout (CSS section 12): the four eras as
  columns on a left-to-right spine, oldest left, employers below with
  tooltips and a "Show all descriptions" toggle; below 1000px it stacks
  newest first. It used to live at `v2/work-history-horizontal.html`,
  which is now only a redirect. Alternates, each linking to itself in its
  own menu: `v2/work-history-vertical.html` (the 2026-09-29 vertical
  era diagram on the modular scale, CSS section 11, newest first),
  `v2/work-history-gantt.html` (Gantt with the eras built in, CSS
  section 13) and `v2/work-history-dashboard.html` (the original Gantt
  dashboard). Since 2026-10-01 `v2/projects.html` is on the same scale
  and grid too (CSS section 14): the project index on the smaller side,
  sticky, and the chosen case study on the larger side (kept as
  `v2/projects-longform.html`); the dashboard version is kept as
  `v2/projects-dashboard.html`. Later on 2026-10-01 `v2/projects.html`
  became a compact list (title, year and topics per row; Mobile Games dropped) beside a bordered panel
  (CSS section 15) that leads with four key points per project, Problem,
  Role, Approach and Outcome, set large for scanning, with the full case
  study folded into a "Read the full case study" `<details>`. Below
  1000px the panel opens under its row like an accordion. The key points
  were condensed from the case-study text by Claude, not written by
  Michael, so they are not in the root case-study pages. On 2026-10-03
  that list-beside-panel version moved to `v2/projects-list.html` and
  `v2/projects.html` became tiles (CSS section 16, building on 15): the
  six projects in a row of tiles across the top (3 x 2 on tablets), the
  chosen project full width below with its key points in a 2 x 2 grid,
  and previous/next links added by `v2.js`; below 640px it is still the
  accordion list. On 2026-10-04 that 2 x 2 version moved to
  `v2/projects-grid.html` and `v2/projects.html` now puts the key points
  in one column with the intro image to their right (CSS section 17),
  under a tighter heading and shorter tiles so the first points show on
  a laptop screen; a project without an image (4Subsea) lets its points
  run wider. Independent of the root pages and `style.css`. Its project
  articles are copied from the root case-study pages, so edits to a
  case study need making in both places.
- `style.css` — all styles. `script.js` — sidebar nav, scroll-spy, and the
  work-history diagram's pinning and details toggle.

## Parked content — settled

`index.html` used to carry two hidden blocks with the `parked` class: the
three CV lead-in summaries (`.cv-summary`) and the original text timeline
(`.timeline`). On 2026-09-20 Michael asked for both to be **deleted from
`index.html`**, so they are gone from that page. Nothing is parked there
any more, and there is nothing left to remind him about.

Both still exist in `index-variant1.html`, because that page is a
snapshot of the home page as it stood before the diagram was rebuilt —
leave them alone there. `.parked { display: none }` stays in `style.css`
for that reason.

## Other open items

- The sidebar portrait is a placeholder (`.portrait-placeholder`, shows
  "MS"). Michael said he would supply a photo later. Swapping it in is a
  one-line change — there is a commented `<img class="portrait">` right
  above the placeholder.
- Project thumbnails and case-study hero images are labelled
  placeholders, pending real assets.
- The era diagram's copy (era names and the four prose blocks) is
  transcribed from the reference image Michael supplied on 2026-09-20.
  "Digital transformation" replaces what the old diagram called
  "Innovation skunkworks".
- Threadbare Games (2012–2013) is not in that reference image, and on
  2026-09-20 Michael asked for it to be removed from `index.html`. Its
  case study, `mobile-games.html`, is still reachable from the Projects
  grid and from `search-rescue.html`, so nothing is orphaned. The row is
  still in `index-variant1.html`, along with the `.wh-row.concurrent`
  styling it needs.
- The case-study links inside the work-history diagram's balloons were
  **inferred** from dates and domain (Yara → Coffee Ecosystem and Sewer
  Corrosion; DNV → National Security and Maritime Refueling; SINTEF →
  Search and Rescue; Threadbare → Mobile Games). These have not been
  confirmed by Michael.

## The work-history diagram

There are two of them, sharing one stylesheet and one script.

**The era diagram** — `index.html`, top of `#cv` (`#wh`, wrapper class
`wh-eras`, CSS section 6c). Four eras: Foundations, Applied research,
Digital transformation, Industrial UX. Each is one grid row — the era's
prose on the left, the spine in the middle, that era's employers on the
right. Height is set by the prose, **not** by duration; the per-role
dates carry the time scale instead. Below 860px, and in the expanded
view at any width, it restacks with the spine on the left edge and the
prose and employers in one column beside it.

Enterprise UX (2005–2008) is a `.wh-aside` set beside the Applied
research prose, and Oracle's row carries `.aside` so the same rule marks
it on the employer side.

**The proportional diagram** — `index-variant1.html` only (CSS section
6b). A vertical spine where height is proportional to time, phases and
roles sized with flex weights equal to their duration in years
(`style="flex:12"` = 12 years). If you edit a role there, set its flex
weight to its duration and adjust the enclosing phase to match the sum.

Both share the `.wh-item` / `.wh-balloon` / toggle styling and all of
`script.js`. Section 6c overrides 6b by scoping to `.wh-eras`, which is
also what lets those rules beat 6b's entries inside the media queries —
so keep new era-diagram rules scoped that way.

Beware in both: the dot and arrowhead marking the direction of time are
absolutely positioned pseudo-elements on `.wh-bar`. As ordinary
pseudo-elements they would become flex items of the bar column and steal
height from the phases, silently breaking the scale.

## Conventions

- Fonts: Newsreader (serif, body and headings) and Archivo (sans,
  eyebrows, labels, meta). Accent `#c05a1e`, page `#f7f4ee`, ink
  `#211d19`. Squared-off — no rounded cards, no drop shadows.
- Phase labels sit 2px lower than their boxes so their baselines line up
  with the employer rows beside them, which are set in a larger face.
  Keep that nudge if you touch the label typography.
- Verify changes at 1280 / 820 / 390px. The page must never scroll
  horizontally.
