# Design

## Context

See proposal.md for why. Current state:

- **Build:** `npm run build` writes `build/`: `index.html`, hashed bundles in `assets/`, and the `public/` files (icons, `manifest.json`, `robots.txt`). There's no client-side router and no service worker. Vite builds for base `/`.
- **Deploy:** `deploy.yml` calls `ci.yml`, then a `deploy` job downloads the `build` artifact and mirrors it over FTPS with `lftp`. The job targets the `production` environment (only `main`, URL `https://soduko.me`) and queues in `concurrency: deploy-production`. It has a `dry_run` dispatch input. The job doesn't check out the repo.
- **DNS:** `soduko.me` uses the VPS's nameservers (`dns1/dns2.dotcanada.com`). The A record points at `38.111.114.25`, `www` is a CNAME to the root, and there's an MX pointing at the root. The domain has no email. The owner has a Cloudflare account, and the registrar can change nameservers.
- **Saved games** live in `localStorage`, which is scoped to the origin `https://soduko.me`. Any other origin (`www`, `workers.dev`) starts with no saved game.

## Goals / Non-Goals

**Goals:**
- Players keep using `https://soduko.me` with their saved games intact.
- What goes live is still exactly the `build` artifact that passed CI.
- The new host can be tested before the domain moves.
- Hosting config lives in the repo. Only the account setup and DNS records outside the Worker are done by hand.

**Non-Goals:**
- Preview deploys for pull requests. Easy to add later with `wrangler versions upload`.
- Custom cache headers (`_headers`). Hashed bundles and Cloudflare's default ETag revalidation are enough.
- Managing the whole zone as code (Terraform and the like).
- Moving the other domains on the VPS.

## Decisions

**1. DNS moves to Cloudflare, not the registrar.**
- The site's hosting and its DNS sit in one account, next to the owner's other projects.
- A Worker custom domain creates and manages its own DNS record. On the root domain this needs Cloudflare to run the zone.
- Changes go live in seconds. Cloudflare signs the zone for DNSSEC with one toggle.
- *Alternative:* registrar DNS plus any host. Rejected: the root domain would need fixed IPs (GitHub Pages) or a separate DNS provider anyway (Cloudflare hosting).

**2. Host on Cloudflare Workers with static assets.**
- This is an assets-only Worker: `wrangler.jsonc` points `assets.directory` at `./build`, with no `main` script. Requests for static assets are free and unmetered.
- Each deploy swaps the whole site at once, so the careful `assets/`-first upload order is no longer needed.
- *Alternative:* Cloudflare Pages. Rejected: Cloudflare now steers new projects to Workers static assets, and Pages gets few new features.
- *Alternative:* GitHub Pages with Cloudflare DNS. Rejected: it works, but splits the site across two vendors for no gain, and it can't be tested on a temporary origin as cleanly.

**3. `wrangler.jsonc` at the repo root.**
- `name: "soduko"`, a current `compatibility_date`, and `assets: { directory: "./build" }`.
- `not_found_handling` stays at its default: unknown paths return 404. The app has no routes.
- `preview_urls: false`, since PR previews are a non-goal.
- **Before cutover:** `workers_dev: true` and no `routes`, so deploys go only to `soduko.<account-subdomain>.workers.dev`.
- **At cutover:** add `routes: [{ pattern: "soduko.me", custom_domain: true }]` and set `workers_dev: false`. Turning off `workers.dev` leaves one origin, so nobody saves a game on a second address, and nothing else gets indexed.
- *Alternative:* attach the custom domain in the dashboard. Rejected: it keeps hosting config out of the repo, and it hits the same DNS-record conflict at cutover (see Risks).

**4. The deploy job runs `cloudflare/wrangler-action`.**
- **Steps:**
  1. A sparse checkout of `wrangler.jsonc`, because the job didn't check out the repo before.
  2. Download the `build` artifact into `build/`.
  3. `cloudflare/wrangler-action` at its current major tag, with `command: deploy`, a pinned `wranglerVersion`, `apiToken: secrets.CLOUDFLARE_API_TOKEN`, and `accountId: vars.CLOUDFLARE_ACCOUNT_ID`.
- **Kept as is:** triggers, `paths-ignore`, `needs: ci`, `environment: production` with its URL, `concurrency: deploy-production` without cancel, `permissions: contents: read`, and `timeout-minutes`.
- **Removed:** the `dry_run` input, the `lftp` install, and the FTPS script.
- Wrangler is not added to `package.json`. The deploy is the only thing that uses it, and pinning it in the workflow keeps `npm ci` in CI unchanged. A deploy by hand would use `npx wrangler@<pinned> deploy`.
- *Alternative:* `wrangler` as a devDependency, run with `npx`. Rejected: it adds a large dependency to every CI install, for a step that runs once per deploy.

**5. Credentials.**
- `CLOUDFLARE_API_TOKEN` is an environment secret on `production`. It's a custom token limited to the owner's account and the `soduko.me` zone, with Workers Scripts Edit (account) and Workers Routes Edit (zone) permissions. Those let it deploy and attach the custom domain. Starting from the "Edit Cloudflare Workers" template and narrowing it is fine.
- `CLOUDFLARE_ACCOUNT_ID` is an environment variable, because it isn't secret.
- The owner enters both values. The FTP secrets and variables are deleted once the cutover is confirmed.

**6. Records outside the Worker are set by hand in the Cloudflare dashboard.**
- **Root:** the Worker custom domain manages the `soduko.me` record. Before cutover, the imported A record to the VPS stays in place.
- **`www`:** a proxied placeholder record (`AAAA 100::`) and a Redirect Rule that sends `www.soduko.me/*` to `https://soduko.me/${path}` with a 301, keeping the query string. Cloudflare's "Redirect from WWW to root" template does this.
  - *Alternative:* a second custom domain on the Worker. Rejected: it would serve the app on a second origin, and saved games would split between the two.
- **Mail:** a null MX (`MX 0 .`), a TXT `v=spf1 -all` on the root, and a TXT `v=DMARC1; p=reject` on `_dmarc`.
- **Removed:** every other imported record (the old MX, mail and other hosts copied from the VPS zone).
- **SSL/TLS:** turn on "Always Use HTTPS".

**7. Rehearsal and rollback.**
- **Rehearsal:** the first deploy goes to the `workers.dev` URL while the VPS still serves `soduko.me`. This replaces `dry_run`.
- **Rollback:**
  - Revert the commit on `main`, and the push redeploys the previous build, as before.
  - For speed, roll back to the previous version in the Cloudflare dashboard or with `wrangler rollback`. That doesn't touch `main`, so revert there too.

## Risks / Trade-offs

- **[A custom domain can't be attached while a DNS record exists for that hostname]** → At cutover, delete the root A record to the VPS, then run the deploy at once. The site is down for the gap, about a minute.
- **[Nameserver change with DNSSEC on at the registrar breaks resolution]** → Check the registrar first. If a DS record is set, remove it and wait for its TTL before switching nameservers. Turn DNSSEC on in Cloudflare afterwards, and add its DS record at the registrar.
- **[Records dropped during import that something still uses]** → The owner confirmed the domain is only the web app. Review the imported list before deleting anyway.
- **[Nameserver change takes time to spread]** → The imported A record keeps pointing at the VPS until cutover. Resolvers on either nameserver set get the same answer, so the switch itself causes no outage.
- **[Merging the workflow change stops deploys to the VPS]** → The VPS keeps serving the last FTPS build until cutover. Avoid merging app changes in between, or accept that they appear only on `workers.dev` until cutover.
- **[A token scoped too narrowly fails the custom-domain attach]** → The deploy fails loudly with a permissions error. Widen the token on the zone and re-run. The site keeps serving whatever was there.

## Migration Plan

1. **Workflow PR:** add `wrangler.jsonc` (`workers.dev` only) and the new deploy job. Update the docs.
2. **Owner setup:** create the API token, and put the secret and variable on `production`.
3. **Merge:** check the deploy succeeds and that the `workers.dev` URL serves the current version.
4. **Move DNS:** add the zone in Cloudflare, prune the imported records, add the mail records, deal with DNSSEC, and switch nameservers at the registrar. Wait for the zone to show as active.
5. **Cutover PR:** add the custom domain route and set `workers_dev: false`.
6. **Cutover:** delete the root A record, merge the cutover PR (or dispatch the deploy), then check `https://soduko.me`. Add the `www` redirect.
7. **Cleanup:** remove the FTP secrets and variables, remove `soduko.me` from the VPS, and turn on DNSSEC.

## Open Questions

- The Worker's `workers.dev` subdomain depends on the account. The workflow and docs don't need it.
- Whether DNSSEC is on at the registrar today. Step 4 handles both cases.
