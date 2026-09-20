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
- `style.css` — all styles. `script.js` — sidebar nav, scroll-spy, and the
  work-history diagram's pinning and details toggle.

## ⚠ Parked content — remind Michael about this

Two blocks in `index.html` are **hidden but deliberately not deleted**,
both carrying the `parked` class (`.parked { display: none }` in
`style.css`). Michael asked to hide them while he decides, and asked to
be **reminded that they are still there**.

**Bring either back by deleting its `parked` class. Do not delete the
markup without asking him first.**

| Block | Where | Why it was parked |
|---|---|---|
| `.cv-summary` | top of `#cv` | The three lead-in summaries (Research & UX / Innovation / Across domains). |
| `.timeline` | `#cv`, below the diagram | The original text timeline. The work-history diagram now covers the same ground, and its "Show all details" panel carries the same prose. |

Both blocks are parked in `index-variant1.html` too, since that page is a
copy of `index.html`.

If a conversation touches the CV section, the timeline, or that part of
the page, mention that these are still parked and ask whether he wants
them restored or removed for good.

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
- Threadbare Games (2012–2013) is not in that reference image. It was
  kept in the Applied research era, marked as running alongside SINTEF,
  rather than dropped — Michael has not confirmed either way.
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
