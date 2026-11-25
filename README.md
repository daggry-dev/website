<p align="center">
  <img src="public/logo.svg" alt="Daggry" width="96">
</p>

<h1 align="center">Daggry website</h1>

<p align="center">
  <em>Start the work, go to sleep, and at first light it is done and checked.</em>
</p>

<p align="center">
  <a href="https://daggry-website.thinkability.workers.dev"><strong>daggry-website.thinkability.workers.dev</strong></a>
</p>

---

The website and documentation for Daggry, a factory kit for unattended agent work: agents do the work, code checks every step, and each result is sealed in a signed evidence trail you can verify yourself.

Built with [VitePress](https://vitepress.dev).

## Run it locally

```sh
npm ci
npm run dev      # http://localhost:5173
npm run build    # .vitepress/dist
```

## What is here

| Path | Contents |
| --- | --- |
| `guide/` | Start here, how-to pages and concepts |
| `reference/` | Commands, API, bindings and schemas |
| `roadmap.md` | What is built and what is next |
| `public/schemas/` | The published JSON Schemas |
| `.vitepress/` | Site config and theme (the light "airy" look and the diagram components) |

## Deploy

`.github/workflows/pages.yml` builds and deploys on every push to `main`, in parallel:

- **Cloudflare Workers**, built with base `/` and deployed with `wrangler deploy` (see `wrangler.jsonc`). Needs the `CLOUDFLARE_API_TOKEN` and `CLOUDFLARE_ACCOUNT_ID` repository secrets.
- **GitHub Pages**, built with `SITE_BASE=/daggry-website/`.

Pull requests build both and run `wrangler deploy --dry-run`.

## License

Apache 2.0. See [LICENSE](LICENSE).
