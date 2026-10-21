# Design

## Context

See proposal.md for why. Relevant current state, after `add-regression-safety-net`:

- Eleven files under `src/` contain JSX but use the `.js` extension: `index`, `App`, `Board`, `Cell`, `MarkedCell`, `MiniBoard`, `Header`, `HelpDialog`, `NewGameDialog`, `ConfirmationDialog`, `GitHubLink`. Hooks, utils, and puzzles are plain JS.
- `HelpDialog` imports `{ version }` from `../package.json`.
- `src/` has no `process.env` or `%PUBLIC_URL%` usage. `public/index.html` uses `%PUBLIC_URL%` for the favicon and manifest.
- Unit tests use Jest globals (`describe`/`it`/`expect`) without imports and no `jest.*` APIs. None need a DOM.
- Playwright starts the app with `npm start` on port 3000.

## Goals / Non-Goals

**Goals:**
- A dev server, production build, unit tests, and lint that all run on current Node LTS with no flags.
- No change in behavior or rendering: the e2e and visual suites pass with zero snapshot updates.

**Non-Goals:**
- Any runtime library upgrade (React, MUI, styled-components, Ramda). All of that is in `upgrade-runtime-libraries`.
- TypeScript.
- Fixing existing lint findings beyond what's needed for a clean `npm run lint`.

## Decisions

**1. Vite with `@vitejs/plugin-react`, latest stable majors at implementation time.**
Vite is the standard CRA replacement, and the React team now recommends it over CRA. The plugin's automatic JSX runtime works with React 16.14, which has `react/jsx-runtime`.
*Alternatives:* Next.js or another framework. Rejected: this is a single static page with no routing or SSR need. Using webpack 5 directly would mean maintaining a hand-written config.

**2. Rename JSX files to `.jsx` rather than configuring a `.js` JSX loader.**
Vite and its esbuild/Rollup pipeline only treat `.jsx`/`.tsx` as JSX by default. Forcing JSX on `.js` would need custom `esbuild` and `optimizeDeps` loader settings. Renaming with `git mv` keeps history and is the standard layout. Imports are extensionless, so most import sites don't change.

**3. Root `index.html` mirrors `public/index.html`.**
Copy the existing head (meta tags, title, favicon, apple-touch-icon, manifest), replace `%PUBLIC_URL%/` with `/`, drop CRA's comments, and add `<script type="module" src="/src/index.jsx">`. `public/` keeps the favicon, logos, manifest, and `robots.txt`, which Vite copies verbatim.

**4. Keep the `npm start` script name and port 3000.**
`start: "vite"` with `server: { port: 3000, strictPort: true }`. This keeps the Playwright config and muscle memory working. Add `build: "vite build"` and `preview: "vite preview"`.

**5. Vitest, `node` environment, `globals: true`.**
With `globals: true`, the existing and newly added unit tests run without edits. None of them touch the DOM, so jsdom isn't needed. `include: ['src/**/*.test.{js,jsx}']` keeps Playwright's `e2e/*.spec.js` out. `npm test` runs `vitest`, which watches in a TTY and runs once when `CI` is set or with `vitest run`.
*Alternative:* Jest 29+ with Babel. Rejected: it duplicates the transform pipeline that Vite already provides.

**6. ESLint 9 flat config close to CRA's `react-app` preset.**
Use `@eslint/js` recommended, `eslint-plugin-react` (flat recommended plus `jsx-runtime`), `eslint-plugin-react-hooks` (recommended), and browser globals plus Vitest globals for test files. Turn off `react/prop-types`, which the codebase never used and CRA never enforced. Any remaining findings are fixed only if trivial and behavior-neutral; otherwise they're disabled per line with a comment.

**7. Keep output in `build/`.**
The site is deployed by hand from the build output, so set `build.outDir: 'build'` to keep the same directory as now. `.gitignore` already covers it.
*Alternative:* Vite's default `dist/`. Rejected for now: it would quietly change the manual deploy step. Revisit when deployment is addressed.

## Risks / Trade-offs

- [MUI v4 or styled-components v5 may rely on CommonJS interop or `process.env.NODE_ENV` in ways Vite's dependency pre-bundling handles differently from webpack] → Vite replaces `process.env.NODE_ENV` in dependencies by default. If a runtime error shows up, add the package to `optimizeDeps.include` or add a narrowly scoped `define`. The e2e suite surfaces any such failure right away.
- [Vite serves ES modules in dev but bundles with Rollup in production, so dev-only success can hide build problems] → Run the e2e and visual suites against `vite preview` (the production build) once, in addition to the dev server.
- [CSS injection order could differ, because styled-components and MUI's JSS inject at runtime in import order] → The visual suite catches it. Import order in `src/` doesn't change.
- [A new ESLint config can produce many findings in untouched code] → The config deliberately mirrors CRA's rule strength, not stricter presets.

## Migration Plan

Single branch, committed in order:
1. Vite and `index.html`, with the renames.
2. Vitest.
3. ESLint.
4. Cleanup and docs.

Each commit passes unit tests. The full e2e and visual suites gate the final commit. Rollback is a git revert. There's no deployment.
