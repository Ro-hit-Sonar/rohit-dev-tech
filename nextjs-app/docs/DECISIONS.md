# Decisions

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
