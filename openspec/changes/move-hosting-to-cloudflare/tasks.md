# Tasks

Pushing branches, opening and merging PRs, and running workflows all reach GitHub. Each needs the user's go-ahead at the time. Cloudflare, registrar, and VPS changes are made by the user. Secret values never pass through the agent.

## 1. Deploy to workers.dev

- [x] 1.1 Add `wrangler.jsonc` as in design Decision 3, before-cutover form: `name`, `compatibility_date`, `assets.directory: "./build"`, `workers_dev: true`, `preview_urls: false`, no `routes`. Verify with `npm run build` and then `npx wrangler@<pinned> deploy --dry-run`, which reads the config and lists the assets without uploading.
- [x] 1.2 Replace the deploy job in `.github/workflows/deploy.yml` as in design Decision 4:
  - sparse checkout of `wrangler.jsonc`
  - download the `build` artifact
  - run `cloudflare/wrangler-action` (current major tag, pinned `wranglerVersion`)
  - drop the `dry_run` input, `lftp`, and the FTP env
  - keep triggers, `paths-ignore`, `needs: ci`, environment, concurrency, permissions, and timeout

  Verify that `actionlint` (run via `go run` or Docker, not installed into the repo) reports no errors, and that `ftp`/`lftp` appear nowhere in the workflow.
- [x] 1.3 Update `CLAUDE.md` (CI and deployment section) and the README's "CI and deployment" section:
  - the site deploys to a Cloudflare Worker with `wrangler deploy`
  - the `production` environment holds `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID`
  - rehearsal is the `workers.dev` deploy, and the `dry_run` input is gone
  - rollback is a revert, or a Cloudflare rollback followed by a revert
  - drop the FTPS upload-order notes

  Verify that the names in the docs match `deploy.yml` and `wrangler.jsonc`.
- [x] 1.4 The user creates the API token (design Decision 5) and sets `CLOUDFLARE_API_TOKEN` (secret) and `CLOUDFLARE_ACCOUNT_ID` (variable) on `production`. Verify that `gh secret list --env production` and `gh variable list --env production` show both names.
- [ ] 1.5 With approval, push a branch and open a PR. Verify CI passes, then merge with approval. Verify the push runs CI and then the deploy job, and that the `workers.dev` URL loads the app, the Help dialog shows the current version (`package.json`), and the board accepts input.

## 2. Move DNS to Cloudflare

- [ ] 2.1 The user checks the registrar for DNSSEC. If a DS record exists, they remove it and wait out its TTL. Verify that `dig +short DS soduko.me` returns nothing.
- [ ] 2.2 The user adds `soduko.me` to Cloudflare and reviews the imported records:
  - keep the root A record to `38.111.114.25`, DNS-only (grey cloud)
  - delete everything else
  - add the mail records and `www` placeholder from design Decision 6
  - turn on "Always Use HTTPS"
- [ ] 2.3 The user switches nameservers at the registrar to the two Cloudflare gives. Verify that `dig +short NS soduko.me` returns Cloudflare's nameservers, the dashboard shows the zone as active, and `https://soduko.me` still loads from the VPS.

## 3. Cut over

- [ ] 3.1 Change `wrangler.jsonc` to the cutover form (design Decision 3): add `routes: [{ "pattern": "soduko.me", "custom_domain": true }]`, set `workers_dev: false`. Update the `CLAUDE.md` and README hosting notes if they mention `workers.dev`. With approval, open a PR and verify CI passes.
- [ ] 3.2 Cutover, with the user:
  1. The user deletes the root A record in Cloudflare.
  2. Merge the cutover PR at once (with approval).
  3. Verify the deploy job succeeds and the Worker's settings list `soduko.me` as a custom domain.
  4. Verify `https://soduko.me` serves the app with a valid certificate, and `curl -sI http://soduko.me` redirects to HTTPS.
  5. Verify a saved game in a browser that played before the cutover is still there.
  6. Verify the `workers.dev` URL no longer serves the app.
- [ ] 3.3 The user adds the `www` Redirect Rule (design Decision 6). Verify that `curl -sI https://www.soduko.me/x?y=1` returns 301 with `location: https://soduko.me/x?y=1`.

## 4. Clean up

- [ ] 4.1 The user deletes `FTP_USER` and `FTP_PASSWORD` (secrets) and `FTP_HOST`, `FTP_PORT`, and `FTP_REMOTE_DIR` (variables) from `production`. Verify that the lists show only the Cloudflare names.
- [ ] 4.2 The user turns on DNSSEC in Cloudflare and adds the DS record at the registrar. Verify that `dig +short DS soduko.me` returns the record and `dig +dnssec soduko.me` shows the `ad` flag from a validating resolver (e.g. `@1.1.1.1`).
- [ ] 4.3 The user removes `soduko.me` from the VPS's DNS and web server config. Verify that `https://soduko.me` still loads and `dig +short soduko.me` returns Cloudflare addresses, not `38.111.114.25`.

## Workflow follow-up

- Archive this change once the cutover and cleanup are done.
