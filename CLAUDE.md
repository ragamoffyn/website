# Michael Stiso — portfolio site

Static site, no build step. Plain HTML/CSS/vanilla JS, served by GitHub
Pages from the `gh-pages` branch (which is the repo's default branch).
Open `index.html` directly in a browser to preview, or run
`python3 -m http.server` from the repo root.

- `index.html` — the single-page site: sidebar rail + Introduction, CV,
  Projects, AI & UX, Contact.
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
| `.timeline` | `#cv`, below the diagram | The original text timeline. The work-history phase diagram now covers the same ground, and its "Show all details" panel carries the same prose. |

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
- The case-study links inside the work-history diagram's balloons were
  **inferred** from dates and domain (Yara → Coffee Ecosystem and Sewer
  Corrosion; DNV → National Security and Maritime Refueling; SINTEF →
  Search and Rescue; Threadbare → Mobile Games). These have not been
  confirmed by Michael.

## The work-history diagram

Lives at the top of `#cv` (`#wh`). A vertical spine where **height is
proportional to time** — roughly 22px per year at the desktop chart
height. Phases and roles are sized with flex weights equal to their
duration in years (`style="flex:12"` = 12 years), so the proportions hold
at any chart height. If you add or edit a role, set its flex weight to
its duration and adjust the enclosing phase's weight to match the sum.

Beware: the dot and arrowhead marking the direction of time are
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
