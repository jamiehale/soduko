# Proposal

## Why

soduko.me is served from a VPS that also runs DNS for the domain. That VPS is going away, so the site needs a new host and the domain needs new DNS. The site is fully static, and the owner's other projects already run on Cloudflare. Moving both DNS and hosting there keeps everything in one account.

## What Changes

- **DNS:** the `soduko.me` zone moves from the VPS (`dns1/dns2.dotcanada.com`) to the owner's Cloudflare account. Only the records the site needs are kept. The leftover records (MX and others) are dropped, since the domain has no email.
- **Anti-spoofing records:** since the domain sends no mail, add records that say so: a null MX, SPF `-all`, and DMARC `p=reject`.
- **Hosting:** the `build/` output is served by a Cloudflare Worker with static assets, on the custom domain `soduko.me`. A small `wrangler.jsonc` at the repo root describes it.
- **`www`:** `www.soduko.me` redirects to `https://soduko.me`, so the site has one origin and saved games (in `localStorage`, scoped per origin) stay in one place.
- **Deploy workflow:** the deploy job in `deploy.yml` uploads the same `build` artifact with `wrangler deploy` instead of FTPS. It keeps its trigger, `paths-ignore`, CI gate, `production` environment, and queuing.
  - **BREAKING (for the workflow):** the `dry_run` input goes away. Rehearsal becomes a deploy to the Worker's `workers.dev` URL before the domain is attached.
  - The environment's FTP secrets and variables are replaced by `CLOUDFLARE_API_TOKEN` (secret) and `CLOUDFLARE_ACCOUNT_ID` (variable).
- **Docs:** `CLAUDE.md` and the README describe the new hosting, deploy, and rollback.

## Capabilities

### New Capabilities
_None._ Players see the same app at the same address. Only hosting and deploy tooling change, so the change sets `skip_specs: true`.

### Modified Capabilities
_None._

## Impact

- **New:** `wrangler.jsonc`.
- **Changed:** `.github/workflows/deploy.yml`, `CLAUDE.md`, `README.md`.
- **Outside the repo (done by the owner):**
  - the Cloudflare zone and its records
  - the nameserver change at the registrar
  - the API token
  - the `production` environment's secrets and variables
  - removing `soduko.me` from the VPS
- **Players:** the address stays `https://soduko.me`, so saved games survive. The cutover may cause a short gap of seconds to minutes while the domain moves from the VPS to the Worker.
- **Not affected:** app code, tests, `ci.yml`, and the visual baselines.
