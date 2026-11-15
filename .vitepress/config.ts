import { defineConfig } from 'vitepress'

// GitHub Pages serves the site under /daggry-website/; the cluster image serves it at /.
const base = process.env.SITE_BASE ?? '/'

export default defineConfig({
  base,
  title: 'Daggry',
  description: 'Coding agents can work all night. Daggry makes that safe to sleep through: every step an agent finishes is re-checked by code and recorded in a trail nobody can quietly edit.',
  cleanUrls: true,
  srcExclude: ['research/**', 'README.md'],
  // Light and dark, following the OS preference until the reader picks one.
  appearance: true,
  head: [
    ['link', { rel: 'icon', type: 'image/svg+xml', href: `${base}favicon.svg` }],
    ['meta', { name: 'theme-color', content: '#fdfcfb', media: '(prefers-color-scheme: light)' }],
    ['meta', { name: 'theme-color', content: '#16131a', media: '(prefers-color-scheme: dark)' }],
  ],
  themeConfig: {
    logo: '/logo.svg',
    siteTitle: 'Daggry',
    nav: [
      { text: 'Guide', link: '/guide/' },
      { text: 'Reference', link: '/reference/' },
      { text: 'Roadmap', link: '/roadmap' },
    ],
    sidebar: {
      '/guide/': [
        { text: 'Overview', items: [
          { text: 'How Daggry works', link: '/guide/' },
        ] },
        { text: 'Concepts', items: [
          { text: 'Why you can trust a run', link: '/guide/concepts/trust' },
          { text: 'Work graphs', link: '/guide/concepts/workflows' },
          { text: 'What an agent cannot change', link: '/guide/concepts/protection' },
          { text: 'Where it runs', link: '/guide/concepts/architecture' },
        ] },
        { text: 'Try it', items: [
          { text: 'Getting started', link: '/guide/getting-started' },
        ] },
        { text: 'How-to', items: [
          { text: 'Workflow patterns', link: '/guide/how-to/workflow-patterns' },
          { text: 'Design a workflow', link: '/guide/how-to/design-a-workflow' },
          { text: 'Write a workflow', link: '/guide/how-to/write-a-workflow' },
          { text: 'Verify a run', link: '/guide/how-to/verify-a-run' },
          { text: 'Deploy Daggry', link: '/guide/how-to/deploy' },
        ] },
      ],
      '/reference/': [
        { text: 'Overview', items: [
          { text: 'Reference', link: '/reference/' },
        ] },
        { text: 'Interfaces', items: [
          { text: 'CLI', link: '/reference/cli' },
          { text: 'HTTP API', link: '/reference/api' },
        ] },
        { text: 'Formats', items: [
          { text: 'Envelope', link: '/reference/envelope' },
          { text: 'Kinds and schemas', link: '/reference/kinds' },
          { text: 'Workflow schema', link: '/reference/workflow-schema' },
          { text: 'Gate expressions', link: '/reference/gates' },
          { text: 'Project profile', link: '/reference/profile' },
          { text: 'Protected paths', link: '/reference/protected-paths' },
        ] },
        { text: 'Terms', items: [
          { text: 'Glossary', link: '/reference/glossary' },
        ] },
      ],
    },
    footer: {
      message: `Sponsored by <a class="sponsor" href="https://thinkability.dk" target="_blank" rel="noopener"><img class="sponsor-logo sponsor-light" src="${base}thinkability-logo-light-theme.svg" alt="thinkability" height="28"><img class="sponsor-logo sponsor-dark" src="${base}thinkability-logo-dark-theme.svg" alt="thinkability" height="28"></a>`,
      copyright: 'Copyright © 2026 <a href="https://github.com/larsbaunwall" target="_blank" rel="noopener">Lars Baunwall</a>. Released under the Apache 2.0 License.',
    },
    outline: [2, 3],
    search: { provider: 'local' },
  },
})
