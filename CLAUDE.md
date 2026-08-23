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

## Resolved: the parked CV blocks

Both blocks that used to be hidden behind a `parked` class are settled,
and the class and its rule are gone from `style.css`:

- The three `.cv-summary` lead-ins at the top of `#cv` are **live
  again** — they sit between the section head and the work-history
  diagram.
- The original text timeline below the diagram was **deleted**, along
  with its `.timeline` / `.tl-*` rules, once its two unique phrases —
  DNV's design-system work, and Yara's evangelism and measurable
  criteria — were folded into the diagram's balloons.

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

## The design variant (`index-variant.html`)

A second, unlinked home page (`noindex`) trying a different shape: a top
bar instead of the left rail, and a **vertical, proportional work-history
timeline** rebuilt from a Claude Design handoff. Its own `variant.css`
and `variant.js`; it still loads `style.css` for the shared tokens.

The timeline (`#wt`) is data-driven. Each role is an `<li>` carrying
`data-months` and `data-phase`, and `variant.js` computes every top and
height from those — segment height = months x scale, floored at a
minimum. **Correct a duration in the markup and the whole figure
re-flows; never write a pixel height by hand.**

- The scale is chosen so no row is shorter than its own contents, at any
  width and in either state. Expanding the details raises the scale
  rather than growing individual rows, which is what keeps every segment
  proportional to every other one. It also makes the expanded figure
  tall (~3000px at 1280) — `breath` and the `.wt` measure in
  `variant.css` are the dials if that ever needs tightening.
- Only the three internships hit the minimum height, which is why they
  are hatched and footnoted. Everything else is strictly to scale.
- DNV spans two phases: `data-phase-to` and `data-split-at` end the
  Innovation band partway down it and start Industrial UX there. The
  split fraction is a judgment call, not a fact.
- Roles that ran *concurrently* with others (the Texas A&M Ph.D., and
  Threadbare Games alongside SINTEF) cannot be segments of a single
  stacked scale, so they sit in the "Alongside" strip under the
  footnote. The design handoff omitted both; they are kept here so the
  Mobile Games case study stays reachable.
- Without JS the figure degrades to a plain list of roles with their
  descriptions — `variant.js` adds `.is-live` before it positions
  anything. Keep that split if you touch the CSS.
- Phase colours are one hue each at matching lightness, with the site
  accent carrying the innovation years.

## Conventions

- Fonts: Newsreader (serif, body and headings) and Archivo (sans,
  eyebrows, labels, meta). Accent `#c05a1e`, page `#f7f4ee`, ink
  `#211d19`. Squared-off — no rounded cards, no drop shadows.
- Phase labels sit 2px lower than their boxes so their baselines line up
  with the employer rows beside them, which are set in a larger face.
  Keep that nudge if you touch the label typography.
- Verify changes at 1280 / 820 / 390px. The page must never scroll
  horizontally.
