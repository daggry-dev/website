import { defineConfig } from 'vitepress'

// GitHub Pages serves the site under /daggry-website/; the cluster image serves it at /.
const base = process.env.SITE_BASE ?? '/'

export default defineConfig({
  base,
  title: 'Daggry',
  description: 'A factory kit: modules you set up as your own factory, where agents do the work, code checks every step, and each result is signed in an evidence trail you can verify yourself.',
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
        { text: 'Start here', items: [
          { text: '1. What is Daggry?', link: '/guide/' },
          { text: '2. What you can use it for', link: '/guide/use-cases' },
          { text: '3. Why use it', link: '/guide/why' },
          { text: '4. What it does', link: '/guide/features' },
          { text: '5. Run your first workflow', link: '/guide/getting-started' },
          { text: '6. Configure Daggry', link: '/guide/configure' },
          { text: '7. How it works', link: '/guide/how-it-works' },
        ] },
        { text: 'How-to', items: [
          { text: 'Install Daggry', link: '/guide/how-to/deploy' },
          { text: 'Set up a project', link: '/guide/how-to/set-up-a-project' },
          { text: 'Set up a tenant', link: '/guide/how-to/set-up-a-tenant' },
          { text: 'Write a workflow', link: '/guide/how-to/write-a-workflow' },
          { text: 'Add a loop', link: '/guide/how-to/add-a-loop' },
          { text: 'Add a validator', link: '/guide/how-to/add-a-validator' },
          { text: 'Design a workflow', link: '/guide/how-to/design-a-workflow' },
          { text: 'Verify a run', link: '/guide/how-to/verify-a-run' },
          { text: 'Workflow examples', link: '/guide/how-to/workflow-patterns' },
        ] },
        { text: 'Go deeper', items: [
          { text: 'Workflows', link: '/guide/concepts/workflows' },
          { text: 'Why you can trust a run', link: '/guide/concepts/trust' },
          { text: 'What an agent cannot change', link: '/guide/concepts/protection' },
          { text: 'The modules and where they run', link: '/guide/concepts/modules' },
        ] },
      ],
      '/reference/': [
        { text: 'Overview', items: [
          { text: 'Reference', link: '/reference/' },
        ] },
        { text: 'Commands and API', items: [
          { text: 'CLI', link: '/reference/cli' },
          { text: 'HTTP API', link: '/reference/api' },
        ] },
        { text: 'Files you write', items: [
          { text: 'Workflow file', link: '/reference/workflow-schema' },
          { text: 'Gate expressions', link: '/reference/gates' },
          { text: 'Project config', link: '/reference/project-config' },
          { text: 'Tenant config', link: '/reference/tenant-config' },
        ] },
        { text: 'Rules', items: [
          { text: 'Validators', link: '/reference/validators' },
          { text: 'Protected paths', link: '/reference/protected-paths' },
          { text: 'Bindings', link: '/reference/bindings' },
          { text: 'Helm chart values', link: '/reference/helm-chart' },
        ] },
        { text: 'Specification', items: [
          { text: 'Open formats', link: '/reference/open-formats' },
          { text: 'Evidence record format', link: '/reference/envelope' },
          { text: 'Record kinds', link: '/reference/kinds' },
          { text: 'Module contracts', link: '/reference/contracts' },
          { text: 'Conformance', link: '/reference/conformance' },
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
