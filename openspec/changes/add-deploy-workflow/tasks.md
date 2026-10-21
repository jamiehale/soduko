# Tasks

Pushing branches, opening PRs, creating the GitHub environment, and running workflows all reach GitHub. Each needs the user's go-ahead at the time. Secret values are entered by the user, never by the agent.

## 1. CI workflow

- [x] 1.1 Add `.github/workflows/ci.yml` as described in design Decisions 1, 8, and 9:
  - **Triggers:** `pull_request` and `workflow_call`.
  - **Settings:** `contents: read`, concurrency per ref, `node-version-file: .nvmrc` with npm cache, and current major action tags.
  - **Steps:** `npm ci`, `npx vitest run`, `npm run lint`, `npm run build`, Playwright Chromium install, and `npm run test:e2e`.
  - **Artifacts:** upload `build/` as artifact `build`, and the Playwright report on failure.

  Verify that `actionlint` (run via `go run` or its Docker image, not installed into the repo) reports no errors.
- [x] 1.2 Push a branch and open a draft PR, with user approval. Verify that the CI run passes on GitHub. If only `visual.spec.js` fails, and its diff images show font or rendering differences with the behavior specs passing, apply the Decision 9 fallback: exclude the visual spec in CI. Re-run until green.
- [x] 1.3 Update `CLAUDE.md` (Commands and Tests sections) and the README's Development section: CI runs on PRs, what it runs, and, if the 1.2 fallback applied, that the visual suite is local-only. Verify that the docs match `ci.yml`.

## 2. Deploy workflow

- [x] 2.1 Add `.github/workflows/deploy.yml` as described in design Decisions 1 to 8:
  - **Triggers:** `push` to `main`, and `workflow_dispatch` with a boolean `dry_run` input (default false).
  - **`ci` job:** calls `./.github/workflows/ci.yml`.
  - **`deploy` job:**
    - `needs: ci`, `environment: { name: production, url: https://soduko.me }`, and `concurrency: deploy-production` without cancel.
    - Downloads the `build` artifact and installs `lftp` from apt.
    - Runs an `lftp` script from a here-doc. The script uses `--env-password`, `ftp:ssl-force` and the protect-data/list settings, and leaves certificate verification at its default. It runs the three mirror passes in Decision 6's order, against `FTP_REMOTE_DIR`. With `dry_run`, every pass gets `--dry-run`.

  Verify that `actionlint` reports no errors and that the script contains no `verify-certificate no` and no password on a command line.
- [x] 2.2 Update `CLAUDE.md` and the README:
  - remove "deployed manually"
  - describe the deploy trigger, the `production` environment and its secrets (`FTP_USER`, `FTP_PASSWORD`) and variables (`FTP_HOST`, `FTP_PORT`, `FTP_REMOTE_DIR`)
  - describe the `dry_run` rehearsal and rollback by revert

  Verify that the names in the docs match `deploy.yml`.

## 3. Environment and first deploy

- [x] 3.1 With user approval, create the `production` environment with a deployment branch policy that allows only `main` (`gh api` or the web UI). Verify that `gh api repos/jamiehale/soduko/environments/production` shows the branch policy.
- [x] 3.2 The user sets the `FTP_HOST`, `FTP_PORT` (if not 21), and `FTP_REMOTE_DIR` variables and the `FTP_USER` and `FTP_PASSWORD` secrets on the environment. Check from the workstation that `openssl s_client -connect "$FTP_HOST:${FTP_PORT:-21}" -starttls ftp -verify_return_error` verifies against that hostname. If it doesn't, follow design Decision 4. Verify that `gh variable list --env production` and `gh secret list --env production` show all five names.
- [ ] 3.3 Merge to `main` with user approval. Verify that the push runs CI and then the deploy job against `production`.
- [ ] 3.4 Run `deploy.yml` by hand with `dry_run: true`. Verify in the log that TLS negotiates with verification on, the login succeeds, and the paths `mirror` would write are under the intended web root. Investigate any `assets/` deletions it lists.
- [ ] 3.5 Run `deploy.yml` for real, or confirm the push-triggered run from 3.3 succeeded after setup. Verify that https://soduko.me loads, the Help dialog shows "soduko v0.3.0", the board accepts input, and the deployment appears under the repo's `production` environment with the soduko.me URL.

## Workflow follow-up

- Archive this change once the first real deploy succeeds.
