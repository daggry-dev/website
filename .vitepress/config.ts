import { defineConfig } from 'vitepress'

// GitHub Pages serves the site under /daggry-website/; the cluster image serves it at /.
const base = process.env.SITE_BASE ?? '/'

export default defineConfig({
  base,
  title: 'Daggry',
  description: 'Work graphs, sealed evidence and sandboxed jobs for any agentic work, finished by dawn.',
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
          { text: 'What is Daggry', link: '/guide/' },
          { text: 'Overnight', link: '/guide/overnight' },
        ] },
        { text: 'Get started', items: [
          { text: 'Getting started', link: '/guide/getting-started' },
        ] },
        { text: 'Concepts', items: [
          { text: 'Why you can trust a run', link: '/guide/concepts/trust' },
          { text: 'Architecture', link: '/guide/concepts/architecture' },
          { text: 'Sealed evidence', link: '/guide/concepts/evidence' },
          { text: 'Work graphs', link: '/guide/concepts/workflows' },
          { text: 'Protected paths', link: '/guide/concepts/protection' },
        ] },
        { text: 'How-to', items: [
          { text: 'Design a workflow', link: '/guide/how-to/design-a-workflow' },
          { text: 'Write a workflow', link: '/guide/how-to/write-a-workflow' },
          { text: 'Workflow patterns', link: '/guide/how-to/workflow-patterns' },
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
        ] },
        { text: 'Terms', items: [
          { text: 'Glossary', link: '/reference/glossary' },
        ] },
      ],
    },
    footer: { message: 'Daggry is Danish for dawn.', copyright: 'Thinkability' },
    outline: [2, 3],
    search: { provider: 'local' },
  },
})
