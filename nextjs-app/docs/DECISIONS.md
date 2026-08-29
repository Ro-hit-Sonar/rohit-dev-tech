# Decisions

### Scroll-scored sections with CSS scroll-driven animations — 2026-08-30
**Tier:** Architecture
**Decision:** Rebuilt the "Figuring out" and "Maintenant" sections around the *shape* of their copy,
and drove the reveals with **CSS scroll-driven animations** (`animation-timeline`) rather than a
JavaScript scroll library. Only the Maintenant word-swap is a client island; the lead-line reveal,
the supporting prose, and the arc closing are pure CSS. No animation dependency was added.
**Why:** The sections were not short of animation, they were short of hierarchy — measured, the
largest type anywhere on the homepage was 36px, so nothing could announce itself. The fix was
structural: split `leadLines` out of the body so the thesis could be set at 72px, store Maintenant's
shared stem once (`"Something currently being"`) so the anaphora becomes the mechanic instead of
three repeated row-headings, and delete the `01/02` markers that were imposing list semantics on
prose that is not a list.
For the motion, CSS won on accessibility rather than on bundle size. With `animation-timeline` the
"not yet revealed" state exists *only* inside `@supports (animation-timeline: view()) and
(prefers-reduced-motion: no-preference)`. Everywhere else the element renders finished. There is no
moment where content sits at `opacity: 0` waiting for a script — which is exactly the failure mode a
JS reveal library introduces when its bundle fails to load.
**Alternatives considered:** framer-motion or GSAP ScrollTrigger — rejected: the repo has 18 runtime
deps and hand-rolls every existing interaction, so the dependency would have been a bigger change
than the feature. Pinned/scroll-jacked sections — rejected by the user; `position: sticky` gives the
held stem without ever taking over the scrollbar. A CSS-only word swap using a clipped translated
stack — rejected because in a browser without scroll timelines it would hide two of the three words
entirely; that one effect earns its client island.
**Concepts for the learner:** Two traps cost real debugging time here, both worth knowing.
*First*, `animation-timeline: view()` resolves against the **nearest scroll container**, and
`overflow: hidden` silently creates one. The section clipped its bleeding arc with `overflow-hidden`,
which made the arc's progress freeze at a constant — it never closed. `overflow: clip` clips without
establishing a scroll container, and fixed it. Related: a bare `view()` measures *the animated
element's own* pass through the viewport, so a near-viewport-height graphic never completes its range
while its section is still being read — naming a `view-timeline-name` on the section and referencing
it from the child is what ties the animation to the thing the reader is actually moving through.
*Second*, `animation-fill-mode: both` holds the keyframe's final value, which will overwrite an
inline style. Each lead line carries its own resting opacity so the statement brightens toward its
last line; the keyframe had to end on `var(--line-opacity)` rather than a flat `1`, or the animation
would flatten the gradient it was supposed to arrive at. And a custom property only interpolates if
it is registered with `@property` — an unregistered one is just a string to the engine, so the arc
would have snapped rather than closed.

### The "reveal" is a Portable Text annotation, not a field — 2026-08-30
**Tier:** Pattern
**Decision:** The Maintenant section's inline reveal — the span of body text that is the *answer*,
dotted-underlined, linking to a post and showing that post's cover image on hover — is authored as a
custom Portable Text annotation (`reveal`) carrying a reference to a `post`. It is exported as a
plain object literal from `studio/src/schemaTypes/objects/revealAnnotation.ts`, mirroring
`portableTextLinkAnnotation`, so it can be inlined into any `marks.annotations` array without being
registered as a top-level schema type.
**Why:** The alternative was a sibling field — `body` plus `answer` plus `answerPost`. That splits
one sentence across three inputs, and nothing keeps them in sync: change the wording of the sentence
and the `answer` string silently stops matching anything in it. As an annotation the answer *is* the
selection, so it can be one word or a whole clause, it can sit anywhere in the sentence, and it
cannot drift. Both the href and the thumbnail derive from the referenced post, so renaming or
re-imaging that post keeps this section correct with no edit here.
**Alternatives considered:** A separate `answer` string field — rejected for the drift above.
Reusing the existing `link` annotation — rejected because a plain link and a reveal need different
rendering, and `_type` is what the serializer discriminates on. Extending the shared `linkReference`
GROQ fragment to dereference the post into an object — rejected outright: `linkResolver` guards on
`typeof link.post === "string"`, so widening that projection would have made *every existing post
link on the site* silently degrade to unlinked text. `reveal` got its own flat fragment instead.
**Concept for the learner:** Portable Text stores marks out-of-band. The `children` spans hold the
text and a `marks: [key]` array; the actual annotation data lives in the block's `markDefs`, matched
by `_key`. That indirection is why an annotation can wrap any arbitrary selection and survive the
text around it being rewritten — and it is also why the GROQ has to re-project `markDefs[]`
explicitly to resolve references, since a plain `...` returns the raw `_ref` and nothing else.
Relatedly, when a serializer must hand data to a client component, resolve it on the server first:
here the server builds the Sanity image URL and `RevealLink` receives only strings, which is what
keeps the section a server component with one small client island inside it.

### A `homePage` singleton, not a page-builder block — 2026-08-30
**Tier:** Architecture
**Decision:** Added a `homePage` singleton document (pinned in the desk structure, hidden from the
document-type list via `DISABLED_TYPES`) holding a `figuringOutSection` object. The section's `body`
is Portable Text with `styles` pinned to `normal` and `lists: []`, reusing the `link` annotation now
exported from `objects/blockContent.tsx` as `portableTextLinkAnnotation`.
**Why:** The home page is hardcoded — `app/page.tsx` composes `CircleHero`, `FiguringOut` and
`CircleFeatures` directly rather than mapping over a `pageBuilder` array. Making this a page-builder
block would have made it placeable on `/[slug]` pages while still needing separate wiring for the one
page it actually appears on. A singleton also gives the remaining hardcoded sections somewhere to
migrate to later without another schema decision.
The `body` restriction matters more than it looks. The shared `blockContent` type leaves `styles` and
`lists` unspecified, so Sanity applies its defaults and hands editors H1–H6, blockquotes and lists.
This section renders every paragraph through a serializer that prefixes it with a number and a
marker, so a heading or a bullet list would render with an `03` beside it and break the layout.
Restricting the field is what keeps the design and the CMS from fighting.
**Alternatives considered:** A dedicated `figuringOut` singleton — rejected as one pinned sidebar
item per homepage section, which does not scale. Reusing `blockContent` and filtering unwanted styles
at render time — rejected: it lets an editor produce content the site silently discards, which is
worse than not offering it. An array of plain strings — rejected, it removes bold and links from body
copy entirely.
**Concept for the learner:** In Sanity, *what the schema allows* is the real contract, not what the
frontend happens to render. Portable Text `block` members are permissive by default — omitting
`styles`/`lists` is not "no styles", it is "all the built-in ones". Any field whose output has a
fixed visual shape should have that shape enforced in the schema, because the editor UI is the only
place the constraint is visible to the person writing the content.

### Adopt the circle design system; Tailwind v3 -> v4 to do it — 2026-08-30
**Tier:** Architecture
**Decision:** Migrated `nextjs-app` from Tailwind v3 (JS config) to Tailwind v4 (CSS-first
`@theme` in `app/globals.css`), adopted the oklch neutral token set from the `circle-page-elements`
v0 export as the site-wide palette, wired `next-themes` for light + dark, and replaced the
homepage with the concentric-circle hero. `tailwind.config.ts` and `postcss.config.js` are gone;
`circle-page-elements/` was deleted after porting.
**Why:** The circle CSS is authored against v4 primitives that have no v3 equivalent —
`@import "tailwindcss"`, `@theme inline`, `@custom-variant dark`, and `tw-animate-css`. Backporting
it would have meant hand-rewriting the token layer *and* giving up opacity modifiers on the token
colours: v3 resolves `bg-primary/60` by substituting `<alpha-value>` into a channel-split custom
property, which an `oklch(...)` value cannot supply. The ported components lean on `/60`, `/40`,
`/10` and `/5` throughout, so that loss was not cosmetic. The v3 config was small enough (six colour
ramps, one shadow, one font family, the typography plugin) that porting it forward was the smaller
job.
**Alternatives considered:** Staying on v3 and expressing the tokens as HSL channel triples —
rejected as a rewrite of the design source that would drift from it on every future v0 export.
Repointing `--primary` at the brand red — rejected: the footer renders a `bg-primary` slab, and a
full-width red slab is not the design. Red became a separate `--brand` accent instead. Letting the
footer use `--primary` so it inverts with the theme — rejected after looking at it: a near-white
slab at the bottom of a dark page reads as glare, so the footer got its own `--footer` /
`--footer-foreground` pair that stays dark in both themes.
**Concept for the learner:** Tailwind v4 moves configuration out of JavaScript and into CSS custom
properties, which means the *design tokens are now real CSS variables at runtime* rather than
build-time constants. That is what makes `.dark { --background: ... }` work with no rebuild and no
`dark:` variant on every element — you restyle by swapping variable values on an ancestor, and
every utility that references them follows. The corollary is that `@theme` and `@theme inline`
differ: plain `@theme` emits the variable, `@theme inline` substitutes the value at use site, which
is why the semantic tokens (which must stay live for theming) are declared in `:root`/`.dark` and
only *mapped* through `@theme inline`.

### Split eslint majors across workspaces (studio 10, nextjs-app 9) — 2026-08-30
**Tier:** Architecture
**Decision:** Upgraded `studio` to eslint 10 + `@sanity/eslint-config-studio` v7 with a flat
`eslint.config.mjs`, but deliberately left `nextjs-app` on eslint 9.
**Why:** eslint 8 was dragging six deprecated transitive packages into every install
(`rimraf@3` → `glob@7` → `inflight`, plus both `@humanwhocodes/*`). Studio upgrades cleanly.
`nextjs-app` cannot: `eslint-config-next@16.3.3` bundles `eslint-plugin-react@7.37.x`, which
calls `context.getFilename()` — removed in eslint 10 — so linting dies with
`contextOrFilename.getFilename is not a function` before reporting a single rule.
**Alternatives considered:** Forcing eslint 10 everywhere via `overrides` — rejected, it turns a
loud install warning into a hard lint failure. Dropping eslint from studio entirely (it had no
`lint` script, so it was never run) — rejected as losing real coverage for a cosmetic win; a
`lint` script was added instead.
**Concept for the learner:** A *peer dependency* is a plugin declaring "I work inside host X,
version range Y" without installing X itself. When npm can't satisfy every peer range with one
copy, it silently installs a second — which is how eslint 8 survived here long after the
top-level pin moved on. Peer ranges are also just metadata: `eslint-plugin-react` advertising
`^9` isn't a suggestion, it's the last version whose rule API it was written against.

### Pin `next` with a root `overrides` to collapse a phantom copy — 2026-08-30
**Tier:** Pattern
**Decision:** Added `"overrides": { "next": "^16.3.2" }` to the root `package.json` and
regenerated `package-lock.json` from scratch.
**Why:** `@vercel/speed-insights` peers `next >= 13`. npm satisfied that at the monorepo root by
installing a *second* Next — 15.5.23 — alongside the workspace's 16.3.2. Vercel's preview-comments
check read the root copy, saw a version older than its `16.3.0-canary.32` threshold, and disabled
the feature. After the override there is one deduped `next@16.3.3`.
**Alternatives considered:** Bumping `@vercel/speed-insights` — its peer range is already
open-ended, so it would change nothing. Hoisting `next` into the root `dependencies` — rejected as
misrepresenting a root with no source files of its own.
**Concept for the learner:** `npm install` will not *downgrade* or prune an existing lockfile
entry just because a manifest changed; it only adds what's missing. Resolution bugs like a
duplicated peer therefore survive every incremental install. Deleting `package-lock.json` and
`node_modules` forces a real re-solve — and is the only local reproduction of what CI does.
Relatedly, `npm warn deprecated` only prints on *fresh downloads*, so a warm `node_modules` will
falsely look clean.
