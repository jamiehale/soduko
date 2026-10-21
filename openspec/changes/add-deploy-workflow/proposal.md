# Proposal

## Why

soduko.me is deployed by hand from a local `build/`. Nothing stops a broken build or a failing test from going live, and nothing records which commit is live. The sibling project solvemy.codes already deploys from GitHub Actions over FTPS to the same host. This change does the same here, with the gaps closed:
- deploy credentials scoped to a GitHub environment, not repository-wide secrets
- the certificate verified
- deploys gated on the test suite

## What Changes

- **CI workflow** on pull requests and pushes to `main`. It runs `npm ci`, unit tests, lint, build, and the Playwright e2e suite, using the Node version from `.nvmrc`.
- **Deploy workflow** on push to `main` (after CI passes) and on manual dispatch. It builds once and uploads `build/` to the host over FTPS (explicit TLS) with `lftp`, as solvemy.codes does.
- **GitHub environment `production`**:
  - holds the FTP host, user, password, port, and remote path
  - only `main` may deploy to it
  - the deploy job reports the site URL `https://soduko.me`
- **Hardening over the solvemy.codes workflow:**
  - TLS certificate verification stays on
  - the password is passed to `lftp` without exposing it on the command line or in logs
  - deploys never run concurrently, and a newer push queues behind a running one
  - the workflow token gets minimal permissions
  - actions are pinned to current major versions
- **Upload semantics:**
  - root files are mirrored without deleting, so files on the host that aren't part of the build survive
  - `assets/` is mirrored with `--delete`, so stale hashed bundles are pruned
- **Docs:** `CLAUDE.md` and the README stop saying the site is deployed manually. They document both workflows and the environment's secrets and variables.

## Capabilities

### New Capabilities
_None._ The change touches build and deploy tooling only, so the app's behavior does not change. The change sets `skip_specs: true`.

### Modified Capabilities
_None._

## Impact

- New: `.github/workflows/ci.yml`, `.github/workflows/deploy.yml`.
- GitHub repository settings: a new `production` environment with its secrets and variables, and a deployment branch rule. These are set by the repo owner; the host and path are still to be found.
- `CLAUDE.md`, `README.md`: deployment notes.
- The live site at soduko.me is replaced by the build from `main` on the first deploy. The old CRA `static/` directory is left on the host, where it is unused and harmless.
