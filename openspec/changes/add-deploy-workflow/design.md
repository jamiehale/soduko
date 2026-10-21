# Design

## Context

See proposal.md for why. Current state:

- **No workflows:** the repo has no `.github/`. It is public, its default branch is `main`, and it has no environments.
- **solvemy.codes' `deploy.yaml`** is the model. On push to `main` it runs `npm ci` and the build, installs `lftp`, and uploads over FTPS. Its weaknesses:
  - credentials are repo-level secrets
  - `ssl:verify-certificate no`
  - the password is unquoted on the `lftp` command line, which breaks on special characters and puts it in the process arguments
  - no tests run before the deploy
  - no concurrency control
  - default token permissions
- **This repo's gate:** `npx vitest run`, `npm run lint`, `npm run build` (into `build/`), and `npm run test:e2e` (Playwright, Chromium, starts the Vite dev server itself). `.nvmrc` pins Node 24.
- **Visual baselines** in `e2e/visual.spec.js-snapshots/` were generated on Debian 13. A GitHub `ubuntu-latest` runner may render fonts differently.
- **The live site** is an old CRA build (`index.html` plus `static/`). Vite emits `index.html`, hashed bundles in `assets/`, and the `public/` files.

## Goals / Non-Goals

**Goals:**
- What goes live is exactly the build that passed the gate.
- Credentials are reachable only by jobs that target the `production` environment from `main`.
- A first deploy can be rehearsed without writing to the host.

**Non-Goals:**
- Preview deployments for pull requests.
- Changing hosts, or switching to SFTP. This can be revisited if the host supports it; see Decision 3.
- Release tagging or versioning automation.
- Branch protection rules on `main`. They are worth adding, but they are repo settings outside this change.

## Decisions

**1. Two workflow files. CI is reusable, and the deploy calls it.**
- **`ci.yml`:**
  - triggers on `pull_request` and `workflow_call`
  - runs the full gate
  - uploads `build/` as an artifact named `build`
  - uploads the Playwright report as an artifact on failure
- **`deploy.yml`:**
  - triggers on `push` to `main` and `workflow_dispatch`
  - has a `ci` job (`uses: ./.github/workflows/ci.yml`) and a `deploy` job (`needs: ci`)
  - the `deploy` job downloads the `build` artifact and uploads it to the host

The `deploy` job never rebuilds, so the bytes that passed the e2e suite are the bytes deployed. Pushes to `main` run CI exactly once, through the deploy workflow.
- *Alternative:* a single workflow with `if:` conditions on the deploy job. Rejected: PR runs would show a skipped deploy job, and the deploy-only triggers would be mixed with PR triggers.
- *Alternative:* triggering the deploy with `workflow_run` after CI. Rejected: it runs on the default-branch workflow definition, it's harder to reason about, and passing artifacts across runs needs extra API calls.

**2. GitHub environment `production`.**
- **Secrets:** `FTP_USER`, `FTP_PASSWORD`.
- **Variables:** `FTP_HOST`, `FTP_PORT` (optional, default 21), `FTP_REMOTE_DIR` (the web root as the FTP user sees it, e.g. `/` or `/public_html`). These aren't secret, and seeing them in logs helps with debugging.
- **Deployment branch policy:** only `main`.
- **Environment URL:** `https://soduko.me`, so each deployment links to the site.
- **No required reviewers:** there's one maintainer, and merging to `main` is the approval. Reviewers can be added in settings later without changing the workflow.

The environment is created with `gh api` (`PUT repos/{owner}/{repo}/environments/production`, plus a branch policy) or in the web UI. Secret values are entered by the owner with `gh secret set --env production` or in the UI. They never pass through the agent or the repo.

**3. FTPS with `lftp`, installed from apt.**
- Same protocol and tool as solvemy.codes: explicit TLS (`ftp://` with `ftp:ssl-force true`) and protected data and list channels.
- `lftp` comes from Ubuntu's archive, so no third-party action ever sees the credentials.
- *Alternative:* `SamKirkland/FTP-Deploy-Action`. Rejected: it hands the password to a third-party action, and it keeps a sync-state file on the server.
- *Alternative:* SFTP (SSH). This is better if the host offers it. With `lftp` it's a URL-scheme change (`sftp://`) plus host-key pinning. Not chosen because the user asked for the solvemy.codes approach, and the host's SSH support is unknown.

**4. Certificate verification stays on.**
- Remove solvemy.codes' `ssl:verify-certificate no`.
- Shared hosts often present a certificate for the server's own hostname (e.g. `serverNN.example-host.com`), not the customer domain. In that case `FTP_HOST` must be that hostname. The first-deploy task checks this with `openssl s_client -starttls ftp`.
- Disabling verification needs explicit user approval, recorded in this design.

**5. Credentials reach `lftp` through the environment, not the command line.**
- Set `LFTP_PASSWORD` from the secret and use `open --env-password -u "$FTP_USER" -p "$PORT" "$FTP_HOST"`.
- Commands go in a here-doc script, not `-e "…"` with shell interpolation, so quoting is unambiguous.
- GitHub masks the secret in logs. `--env-password` keeps it out of `ps` output and lftp's debug output.

**6. Upload order and deletion scope.**
Three mirror passes, in this order:
1. `mirror --reverse build/assets/ <dir>/assets/` uploads the new hashed bundles first, so the live `index.html` never points at missing files.
2. `mirror --reverse build/ <dir>/` uploads the root files (`index.html`, icons, manifest), and `index.html` switches to the new bundles. This pass never deletes, so the CRA leftovers (`static/`) and any host files (`.htaccess`, `.well-known/`) survive.
3. `mirror --reverse --delete build/assets/ <dir>/assets/` prunes stale bundles from `assets/` only.

`set mirror:use-pget-n 5` keeps parallel transfers, as in solvemy.codes.

**7. Rehearsal: a `dry_run` input on `workflow_dispatch`.**
When true, every `mirror` gets `--dry-run`, which connects, logs in, verifies TLS, and lists what would change without writing. Pushes always deploy for real. The first deploy is run this way to confirm the host, path, and certificate.

`mirror --dry-run` swallows connection and TLS errors and still exits 0, as testing against a local FTPS server showed. So the script runs `cd` into the web root right after `open`. That forces the handshake and login, fails on a bad certificate or a missing directory, and works the same in both modes.

**8. Safety settings.**
- `permissions: contents: read` at the workflow level of both files. Artifact upload and download use the runner's own runtime token, so they need no extra `GITHUB_TOKEN` scope.
- `concurrency: { group: deploy-production, cancel-in-progress: false }` on the deploy job, so deploys queue rather than overlap or abort halfway through an upload.
- CI uses `concurrency: ci-${{ github.ref }}` with cancel-in-progress for PRs.
- `actions/checkout`, `actions/setup-node`, `actions/upload-artifact`, and `actions/download-artifact` are pinned to their current major tags, checked at implementation time.
- `setup-node` uses `node-version-file: .nvmrc` with `cache: npm`.
- `timeout-minutes` is set on every job.

**9. e2e in CI.**
- `npx playwright install --with-deps chromium` (version from the lockfile), then `npm run test:e2e`.
- Playwright's `webServer` starts the Vite dev server. `reuseExistingServer` is harmless on a clean runner.
- If the visual specs fail on the runner with diffs from font or OS rendering alone (behavior specs pass), CI excludes `visual.spec.js`, and the visual suite stays a local pre-merge gate. This is documented in `CLAUDE.md`. Baselines are not regenerated on the runner: they would then differ from what local runs produce.
- *Alternative:* run e2e in the official Playwright Docker image and regenerate baselines there. Rejected for now: every local baseline update would then need Docker.

## Risks / Trade-offs

- **[Wrong `FTP_REMOTE_DIR` uploads into the wrong directory]** → Rehearse with a `dry_run` dispatch first and check the listed paths. Deletion is confined to `<dir>/assets/`.
- **[Host certificate doesn't verify]** → Use the certificate's hostname as `FTP_HOST` (Decision 4). If no hostname verifies, stop and ask; don't disable verification silently.
- **[Host blocks GitHub runner IPs, or needs passive-mode tweaks]** → lftp defaults to passive mode. The rehearsal surfaces connection failures before any real deploy.
- **[Visual suite is flaky or environment-sensitive on the runner]** → The fallback in Decision 9 keeps behavior coverage in CI.
- **[A push to `main` with no environment configured fails the deploy job]** → Expected until the environment is set up. CI still reports, and the failure is visible.
- **[The mirror is not atomic: a visitor mid-deploy can get a mixed state]** → Upload order (Decision 6) keeps every `index.html` pointing at bundles that exist. Pruning runs last.

## Migration Plan

1. Merge the workflows. The first push to `main` runs CI. The deploy job fails or waits until the environment exists.
2. The owner creates the `production` environment and enters the host, user, password, port, and remote path.
3. Run `deploy.yml` by hand with `dry_run: true`. Check the TLS handshake and the paths the mirror would write.
4. Run it for real, then check soduko.me serves v0.3.0 (the Help dialog title).
5. From then on, every merge to `main` deploys.

**Rollback:** revert the offending commit on `main`, and the push redeploys the previous build. Stale bundles are cleaned on the next deploy. Manual FTP upload stays possible as a last resort.

## Open Questions

- The FTP host, port, and remote web-root path. The user is looking these up; they are environment values and don't affect the design.
- Whether the host's FTPS certificate matches the hostname the user connects with. The rehearsal answers this; Decision 4 covers both outcomes. The user expects verification will have to be turned off for this host. The rehearsal will confirm it before anything changes.
