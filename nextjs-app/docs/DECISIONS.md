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

### The blogs index filters on the client, over a fully server-rendered list — 2026-09-03
**Tier:** Pattern
**Decision:** `/blogs` fetches every post on the server with a dedicated `blogsIndexQuery`, renders
the whole list, and hands it to one client island (`BlogsIndex`) that narrows it in memory. The
category pills, the search box and `VIEW MORE` are all local state — no URL search params, no
refetch, no server round-trip. Filtering is *derived during render*; there is no `useEffect`
anywhere in the file.
**Why:** The list is already on the page. Once the server has sent all 48 rows, narrowing them is a
question about text the reader can already see — turning that into a network request would make an
instant interaction slower and add a loading state that has nothing to load. It also settles the
no-JavaScript story in the direction this codebase already committed to: the island server-renders,
so without JS a reader still gets the masthead, the rules and the first page of rows. Only the
narrowing is missing. Nothing sits hidden waiting for a script.
The no-effect part is not stylistic. `react-hooks/set-state-in-effect` is an **error** in this repo,
and the thing an effect would be reached for here — resetting the "how many rows are shown" counter
when a filter changes — is exactly the wrong tool: the pill and search callbacks set both pieces of
state in the same tick, so they cannot disagree in the first place. An effect would introduce a
render where the count and the filter are out of step.
**Alternatives considered:** `?category=…&q=…` in the URL with server-side filtering — rejected for
now: it buys shareable filtered links, but costs a round-trip per keystroke and a debounce, on a
dataset small enough to filter in under a millisecond. Worth revisiting if the archive grows large
enough to need real pagination, at which point the URL becomes the right place for the state.
Extending the shared `postFields` fragment instead of writing a new query — rejected: the index
needs `category` and `readingMinutes`, and `readingMinutes` costs a `pt::text(content)` over every
post's whole body, which `morePostsQuery` and `postQuery` should not pay for.
**Concept for the learner:** "Where does this state live?" has three answers — the URL, the server,
or the component — and the deciding question is *who else needs it*. URL state is for anything
someone might link to, bookmark, or hit Back on. Server state is for anything that requires data the
client does not have. Component state is for everything else, and a filter over an already-loaded
list is squarely in the third bucket. Choosing the URL here would have been "more correct" in the
abstract while being slower and more code in practice.
The second idea worth keeping: *derive, don't synchronise*. Every time you feel the urge to write an
effect that copies one piece of state into another, look for the place where both can be set
together, or for a value that can simply be computed from what you already have. `matches` here is
recomputed on every render from `rows`, `active` and `query` — there is no `filteredRows` state to
fall out of date, and that is why the component has no bugs of the "stale list" kind.

### `/posts` becomes `/blogs`, with a 307 rather than a 308 — 2026-09-03
**Tier:** Pattern
**Decision:** The post index lives at `/blogs`, and the nav, the footer and the featured ledger's
trailing link all say "Blogs" and point there. Post *detail* pages stay at `/posts/[slug]`.
`/posts` is redirected to `/blogs` in `next.config.ts` with `permanent: false`.
**Why:** Three separate links — Header, Footer, and the "All posts" link under the featured ledger —
pointed at `/posts`, which had no route file. Requests fell through to `app/[slug]/page.tsx`, found
no `page` document with that slug, and rendered the Sanity template's `PageOnboarding`: a red slab
reading "About Page (/about) does not exist yet". So the site's main navigation had three dead ends
into template scaffolding.
The detail routes did not move with the index because `/posts/[slug]` is the permalink shape: it is
built by `linkResolver`, by the `reveal` annotation's serializer, by `sitemap.ts`, and by every
existing shared or indexed URL. Renaming it would break all of them to buy nothing but symmetry.
`permanent: false` because `/posts` never actually resolved to an index. A 308 tells browsers to
cache the move *forever*, and browsers honour that aggressively — it is very hard to take back. A
307 costs one extra request per visit to a URL nobody was successfully using, and stays reversible.
**Alternatives considered:** Building the index at `/posts` instead — a real option, and it needs no
redirect, but the page is titled "Blogs" and Rohit wanted the word to be "Blogs" everywhere, so a
`/posts` URL would have been the one place it wasn't. Adding a rewrite instead of a redirect —
rejected: a rewrite would serve the index at two URLs, which splits search-engine signal between
them for no benefit.
**Concept for the learner:** `permanent: true`/`false` maps to HTTP 308/301 and 307/302, and the
difference is caching, not semantics — a permanent redirect can be cached by browsers and
intermediaries indefinitely, which makes it the one routing decision that is genuinely hard to
reverse. Reach for it only once a URL has real history worth consolidating.
Also worth noting where redirects sit in the pipeline: Next checks them *before* the filesystem, so
`source: "/posts"` wins over any route file at that path. And it is an exact match by default —
`/posts/some-slug` does not match `/posts`, which is why the detail routes need no protecting.

### Post titles rest quiet and lift on hover — 2026-09-03
**Tier:** Pattern
**Decision:** Reversed the hover treatment on editorial post titles in both lists. They were
`text-foreground` at rest dimming to `group-hover:opacity-60`; they are now `text-muted-foreground`
at rest brightening to `group-hover:text-foreground`, with `transition-colors` in place of
`transition-opacity`. Applied to `app/blogs/BlogEntry.tsx` **and** `app/components/circle/
FeaturedEntry.tsx`. Separately, the blogs row's hover cover-image thumbnail was removed, and with it
`coverImage` from `blogsIndexQuery`.
**Why:** The old direction was backwards as an affordance. Dimming on hover means the element you
are pointing at is the *least* legible thing on screen at the moment you are reading it, and in
light mode it made the list read dark-then-washed-out. The new direction also matches what every
control on the site already does — nav links, filter pills, VIEW MORE, footer links are all
`text-muted-foreground` → `hover:text-foreground`. Titles were the only thing running the other way.
Both lists changed rather than only the one that was reported: a reader who learns the interaction
on `/blogs` should find the same thing on the homepage, and two post lists responding in opposite
directions to the same gesture is a bug you cannot see in either one alone.
Two solid tokens, not an alpha. This file already records that `text-muted-foreground/70` measured
**3.01:1** on the light ground — under AA for 12px — and that the alpha needed to clear 4.5 left no
visible step. Measured after the change: `/blogs` title 5.51 → 18.05 light, 7.66 → 18.97 dark;
Featured 6.01 → 19.68 light, 7.19 → 17.8 dark. All resting values clear AA.
The blogs row's date came down from `text-foreground/80` (10.43:1) to plain `text-muted-foreground`
at the same time. With the title resting muted, a near-black date would have made the *metadata*
the loudest thing in every row.
**Alternatives considered:** Lifting the whole row on hover rather than the title alone — rejected
by Rohit; four things moving at once is a weaker signal than one. Keeping the date dark for the
tonal step the design shows — rejected for the hierarchy inversion above. Deleting
`useHoverThumbnail.tsx` after removing it from the blogs row — rejected: `FeaturedEntry` and
`RevealLink` still use it, so the file stays and only the one call site went.
**Concepts for the learner:** First, *hover should add signal, not remove it*. The question to ask
of any hover state is "does this make the thing under the cursor easier to act on?" Dimming fails
that test even when it looks stylish, and it is worth noticing that the codebase had already got
this right everywhere except the titles — the inconsistency was the tell.
Second, a measurement trap worth remembering: `transition-colors duration-300` means the computed
colour is a *moving value* for 300ms after any change. Sampling `getComputedStyle(...).color` 120ms
after toggling the theme returned mid-interpolation garbage that looked exactly like a real contrast
regression — the dark title read 4.88:1 at rest and 3.72:1 on hover, i.e. hover *worse* than rest,
which is impossible for the classes involved. The neighbouring date, which has no transition,
snapped to its correct value in the same sample and was the clue. Always let transitions settle
before measuring, and treat a physically impossible reading as a broken instrument first.
Third, when a feature is removed, follow it back up the chain: dropping the thumbnail made the
`imageUrl` prop dead, which made `urlForImage` dead, which made `coverImage` in the GROQ projection
dead. A query that still fetches fields nothing reads is how the data layer quietly rots.

### The reading page ranks headings by tier, not by tag — 2026-09-04
**Tier:** Architecture
**Decision:** Rebuilt `/posts/[slug]` around a centred 45rem measure with a collapsible contents
panel. `app/posts/[slug]/outline.ts` walks the body once and returns two things from the same pass:
the blocks to render, with each heading augmented with a `headingId` and a `headingTier`, and the
list the panel shows. A heading's rank comes from `min(level - shallowestLevelInThisPost, 2)` —
tier 0 renders `<h2>`, tier 1 `<h3>`, tier 2+ `<h4>` — rather than from whatever tag the author
typed. Body typography is hand-rolled in `PostBody.tsx`; the shared `PortableText.tsx` keeps `prose`
for the page builder and was not touched.
**Why:** The content disagrees with itself. Measured across all 48 posts: 291 headings sit at the
shallowest level and 41 one step in, but *which tag* that shallowest level uses varies — "Docker"
and "What Is the Cloud" use h3 with no h2 anywhere, "Load Balancers" and "The Art of Downtime" use
h2. Ranking by tag would render half the archive's section headings at sub-heading size, and a
contents panel built on "list the h2s" would have been **empty on a third of the posts**.
Deriving the id and the rank in the same walk is what makes the panel structurally incapable of
lying about the body. The page it replaced is the cautionary tale: its h1/h2 serializers rendered an
anchor link to `#{_key}` while nothing on the page ever carried a matching `id`, so every one of
those links was dead. Verified after the rebuild: **332 contents links across 48 posts, zero dead
anchors**, and exactly one `<h1>` per page (there was previously none — the title was an `<h2>`).
Two edge cases turned out to be real rather than theoretical, which is the argument for handling
them up front: one heading in the archive slugs to the empty string (it would have produced
`id=""` on every such heading, colliding them all), and one post has no headings at all.
**Alternatives considered:** `@tailwindcss/typography` with `prose-*` overrides — rejected on ~22
overrides plus `max-w-none`, but decisively because `prose` sizes headings *by tag* and this page
sizes them *by rank*; no `prose-h3:` configuration can say "large when it is the shallowest heading
here". Normalising only the contents panel and leaving the body on its raw tags — rejected: the two
halves of the page would then describe different documents. Editing the shared `PortableText.tsx` —
rejected, it renders `InfoSection` and would have silently restyled `/about`.
**Concepts for the learner:** First, *derive once, use twice*. Any time two parts of a page have to
agree about the same structure, generate both from one pass rather than computing each from the
source separately. The old broken anchors are what "computed separately" looks like after a few
months.
Second, a native element beats a component when it exists. The contents panel is a `<details open>`:
keyboard operable, disclosure state exposed to assistive tech, open on the server with no
JavaScript. The only client code is the scroll-spy highlight, so the panel works completely before
any script runs — which is the house rule this repo already committed to.
Third, and the bug worth remembering: the highlight was originally driven by an IntersectionObserver
and landed **one entry short** after every contents-link click. An observer fires when an element
*crosses* a boundary and delivers nothing once the page comes to rest, so the last callback arrived
while the smooth scroll was still moving. A rAF-throttled `scroll` listener that re-measures every
heading from scratch is both simpler and provably correct: it cannot miss a resting position, and a
dropped frame is harmless because nothing is accumulated. Reach for an observer when you care about
*transitions*, not when you care about *current state*.
