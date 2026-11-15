# daggry-website

The website for Daggry, built with [VitePress](https://vitepress.dev).

Live: https://thinkability.github.io/daggry-website/

```sh
npm ci
npm run dev      # http://localhost:5173
npm run build    # .vitepress/dist
```

Pages deploy from `main` through `.github/workflows/pages.yml`. The build sets `SITE_BASE=/daggry-website/`.

The published JSON Schemas are in `public/schemas/`.
