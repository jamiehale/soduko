# Tasks

## 1. Vite build and dev server

- [x] 1.1 Add `vite` and `@vitejs/plugin-react` as dev dependencies, and add `vite.config.js` with the React plugin and `server: { port: 3000, strictPort: true }`. Verify with `npm ls vite @vitejs/plugin-react`.
- [x] 1.2 `git mv` the 11 JSX-containing files in `src/` from `.js` to `.jsx`, and fix any import that names an extension. Verify that `git status` shows renames, not delete/add pairs.
- [x] 1.3 Create root `index.html` from `public/index.html` (`%PUBLIC_URL%/` → `/`, CRA comments dropped, module script `/src/index.jsx`), then delete `public/index.html`. Verify the favicon and manifest load with no 404s in the dev server's network log.
- [x] 1.4 Change the scripts to `start: vite`, `build: vite build`, `preview: vite preview`, and remove the `NODE_OPTIONS=--openssl-legacy-provider` prefix. Verify that `npm start` serves on port 3000, the Help dialog shows the package version (JSON import works), and `npm run build` writes `build/` (via `build.outDir`) with no flags on Node 24.
- [x] 1.5 Run `npm run test:e2e` against the dev server. Verify that all behavior and visual tests pass with zero snapshot updates.

## 2. Vitest

- [ ] 2.1 Replace `react-scripts` test with Vitest: add `vitest`, configure `test: { environment: 'node', globals: true, include: ['src/**/*.test.{js,jsx}'] }`, and set `test: vitest`. Verify that `npx vitest run` passes every existing unit test with no test-file edits and does not pick up `e2e/`.

## 3. ESLint

- [ ] 3.1 Add `eslint.config.js` (ESLint 9 flat config: `@eslint/js` recommended, `eslint-plugin-react` recommended + `jsx-runtime`, `eslint-plugin-react-hooks` recommended, browser globals, Vitest globals for `**/*.test.*`, `react/prop-types` off, `build/` ignored) and a `lint` script. Verify that `npm run lint` exits 0. Fix only trivial, behavior-neutral findings, and disable the rest per line with a reason.

## 4. Cleanup and documentation

- [ ] 4.1 Uninstall `react-scripts`. Remove the `eslintConfig` and `browserslist` fields. Verify that `npm ls react-scripts` is empty and `grep -rn react-scripts --exclude-dir=node_modules --exclude-dir=.git --exclude=package-lock.json .` finds nothing outside `openspec/`.
- [ ] 4.2 Update `CLAUDE.md` (stack line, commands: `npm start`, `npm run build`, `npm run preview`, `npx vitest run`, a single test file, `-t` filter, `npm run lint`; remove the OpenSSL-flag note) and the README Development section. Note in `CLAUDE.md` that output stays in `build/` for the manual deploy. Verify each documented command runs as written.

## 5. Integration check

- [ ] 5.1 Run `npm run build`, then point Playwright's `webServer` at `npm run preview -- --port 3000` for one run of `npm run test:e2e`, and restore the config afterwards. Verify that the production build passes all behavior and visual tests with zero snapshot updates.
- [ ] 5.2 From a clean checkout under Node 24, run `npm ci`, `npx vitest run`, `npm run lint`, `npm run build`, and `npm run test:e2e`. Verify that all pass.

## Workflow follow-up

- Archive this change before starting `upgrade-runtime-libraries`.
