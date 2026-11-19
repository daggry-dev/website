<script setup lang="ts">
import { withBase } from 'vitepress'
import { SIGNUP_OPEN } from './features'

const proof = [
  { t: 'Nobody edits it quietly', d: 'Every result is linked to the one before and signed. Change one byte later and daggry verify shows where.', l: '/guide/concepts/trust' },
  { t: 'Checks are code', d: 'The same work always gets the same verdict. An agent cannot talk its way to a pass.', l: '/guide/concepts/trust' },
  { t: 'Formats are public', d: 'Every record format is a published JSON Schema. Read and check the trail with your own tools.', l: '/reference/kinds' },
]
// Each chip links to its pattern's heading on the patterns page (VitePress heading slugs).
const kinds = [
  { t: 'Ship a change from an issue', a: 'ship-a-change-from-an-issue' },
  { t: 'Write a sourced report', a: 'research-a-question-and-commit-a-sourced-report' },
  { t: 'Migrate files in batches', a: 'migrate-files-in-bounded-batches' },
  { t: 'Process a list of items', a: 'process-a-batch-of-items' },
  { t: 'Update docs with review', a: 'update-documentation-with-a-human-review' },
  { t: 'Run a release check', a: 'run-a-gated-release-check' },
]

// An eight-line workflow with no agent step: run a script, re-check, wait for you, open a pull request.
// Valid against public/schemas/workflow.json. Split into key/value pieces for colouring.
const snippet: { k?: string; v?: string; p?: string }[][] = [
  [{ k: 'steps' }, { p: ':' }],
  [{ p: '  - ' }, { k: 'id' }, { p: ': ' }, { v: 'migrate' }],
  [{ p: '    ' }, { k: 'kind' }, { p: ': ' }, { v: 'command' }],
  [{ p: '    ' }, { k: 'run' }, { p: ': ' }, { v: './scripts/migrate-config.sh' }],
  [{ p: '    ' }, { k: 'scope' }, { p: ': [' }, { v: '"config/**"' }, { p: ']' }],
  [{ p: '  - { ' }, { k: 'id' }, { p: ': ' }, { v: 'check' }, { p: ', ' }, { k: 'kind' }, { p: ': ' }, { v: 'verify' }, { p: ' }' }],
  [{ p: '  - { ' }, { k: 'id' }, { p: ': ' }, { v: 'review' }, { p: ', ' }, { k: 'kind' }, { p: ': ' }, { v: 'human' }, { p: ', ' }, { k: 'waiting_for' }, { p: ': ' }, { v: 'input-needed' }, { p: ' }' }],
  [{ p: '  - { ' }, { k: 'id' }, { p: ': ' }, { v: 'pr' }, { p: ', ' }, { k: 'kind' }, { p: ': ' }, { v: 'effect' }, { p: ', ' }, { k: 'do' }, { p: ': ' }, { v: 'open-pr' }, { p: ' }' }],
]

const doors = [
  { t: 'Understand it', time: '10 minutes', d: 'Read the story of one night, and why each part is there.', l: '/guide/' },
  { t: 'Try it', time: 'Hands on', d: 'Run a first workflow on a scratch repository and verify its trail.', l: '/guide/getting-started' },
  { t: 'See the status', time: '2 minutes', d: 'What works today and what comes next.', l: '/roadmap' },
]
</script>

<template>
  <div class="dg">
    <section class="hero">
      <div class="glow" aria-hidden="true" />
      <img class="mark" :src="withBase('/logo.svg')" alt="" />
      <p class="eyebrow">Daggry · Danish for dawn</p>
      <h1>Agents do the work.<br /><em>Code checks it.</em></h1>
      <p class="lede">
        Coding agents can work all night. Daggry makes that safe to sleep through: every step an agent finishes is
        re-checked by code and recorded in a trail nobody can quietly edit.
      </p>
      <div class="cta">
        <a class="btn primary" :href="withBase('/guide/')">See one night</a>
        <a class="btn" :href="withBase('/guide/getting-started')">Try it</a>
      </div>
    </section>

    <Signup v-if="SIGNUP_OPEN" />

    <section class="wide">
      <p class="eyebrow">The problem</p>
      <h2>A night of work, and <em>only its word</em> for it.</h2>
      <p class="sub">
        By morning, all you have is the agent's own report.
      </p>
      <Compare />
    </section>

    <section class="wide">
      <p class="eyebrow">Overnight</p>
      <h2>Go to bed. Wake at <em>daggry</em>.</h2>
      <p class="sub">
        For each item in your plan, the agent writes a test, Daggry shows the test fails, the agent makes it pass,
        and Daggry re-runs it on a clean copy of the code. If a machine dies at 3 a.m., a new pod (a throwaway
        container) starts from the last sealed commit and repeats the interrupted step.
      </p>
      <Overnight />
    </section>

    <section class="wide">
      <p class="eyebrow">How it works</p>
      <h2>Describe it once. <em>Check every step.</em></h2>
      <p class="sub">
        A workflow is a file in your repository: the steps, what each must hand to the next, the checks, and the
        moments you decide. Daggry runs on your own Kubernetes cluster and works on GitHub repositories.
      </p>
      <HowItWorks />
    </section>

    <section class="wide">
      <p class="eyebrow">Proof, not promises</p>
      <h2>Trust the <em>trail</em>, not the agent.</h2>
      <p class="sub">
        This is what you read over coffee: every step, the check behind it, and a link to the record before.
      </p>
      <MorningTrail />
      <div class="proof">
        <a v-for="p in proof" :key="p.t" class="card" :href="withBase(p.l)">
          <h3>{{ p.t }}</h3>
          <p>{{ p.d }}</p>
        </a>
      </div>
      <p class="honest">
        A seal proves the check ran and the record is unchanged. It does not prove your tests are the right ones.
      </p>
    </section>

    <section class="wide">
      <p class="eyebrow">Any work with a check</p>
      <h2>If a script can check it, <em>Daggry can run it</em>.</h2>
      <p class="sub">
        Any work that lives in a repository and has a check a script can run. This workflow needs no agent:
        it runs a script, re-checks the result, waits for you, and opens a pull request.
      </p>
      <div class="work">
        <ul class="chips">
          <li v-for="k in kinds" :key="k.a"><a :href="withBase(`/guide/how-to/workflow-patterns#${k.a}`)">{{ k.t }}</a></li>
        </ul>
        <figure class="code">
          <pre tabindex="0" aria-label="Example workflow file, eight lines"><code><template v-for="(line, i) in snippet" :key="i"><span v-for="(s, j) in line" :key="j" :class="s.k ? 'k' : s.v ? 'v' : 'p'">{{ s.k ?? s.v ?? s.p }}</span>{{ '\n' }}</template></code></pre>
          <figcaption>A complete workflow. The check itself is set in the repository, where the run cannot change it.</figcaption>
        </figure>
      </div>
      <p class="more"><a :href="withBase('/guide/how-to/workflow-patterns')">See the patterns</a></p>
    </section>

    <section class="wide">
      <p class="eyebrow">Where to start</p>
      <h2>Three ways <em>in</em>.</h2>
      <div class="doors">
        <a v-for="d in doors" :key="d.t" class="door" :href="withBase(d.l)">
          <span class="time">{{ d.time }}</span>
          <h3>{{ d.t }}</h3>
          <p>{{ d.d }}</p>
        </a>
      </div>
    </section>
  </div>
</template>

<style scoped>
/* VPHomeContent already pads 24 / 48 / 64px, so .dg adds no gutter of its own below 960px. */
.dg { max-width: 1080px; margin: 0 auto; padding: 0 24px 120px; text-align: left; }
.hero { position: relative; text-align: center; padding: 120px 0 140px; }
/* Never wider than the viewport, so it cannot cause sideways scrolling
   (.VPContent.is-home clips as a backstop). */
.glow {
  position: absolute; left: 50%; top: 20px; transform: translateX(-50%);
  width: min(900px, 100vw); height: min(620px, 130vw);
  z-index: -1; filter: blur(30px); pointer-events: none;
  background:
    radial-gradient(closest-side at 50% 60%, var(--dg-glow-amber), transparent 70%),
    radial-gradient(closest-side at 22% 40%, var(--dg-glow-sky), transparent 70%),
    radial-gradient(closest-side at 80% 35%, var(--dg-glow-rose), transparent 70%);
}
.mark { width: clamp(64px, 14vw, 84px); margin: 0 auto 36px; display: block; }
.eyebrow { font-size: .78rem; letter-spacing: .18em; text-transform: uppercase; color: var(--dg-muted); margin: 0 0 28px; }
.hero h1 {
  font-family: var(--font-display); font-weight: 400; font-size: clamp(2.6rem, 1.2rem + 7vw, 6.2rem);
  line-height: .98; letter-spacing: -0.025em; margin: 0; border: 0; padding: 0;
}
.hero h1 em, .wide h2 em {
  font-style: italic; background: var(--dg-grad-text);
  -webkit-background-clip: text; background-clip: text; color: transparent;
  -webkit-box-decoration-break: clone; box-decoration-break: clone;
}
.hero h1 em { padding-right: .08em; }
.lede { max-width: 580px; margin: 36px auto 0; font-size: clamp(1.02rem, .95rem + .4vw, 1.15rem); line-height: 1.75; color: var(--dg-muted); }
.cta { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 44px; }
.dg .btn {
  display: inline-flex; align-items: center; justify-content: center; min-height: 44px;
  padding: 11px 24px; border-radius: 999px; font-size: .95rem; font-weight: 500; line-height: 1.4;
  border: 1px solid var(--dg-btn-border); color: var(--dg-ink); background: var(--dg-btn-bg);
  text-decoration: none; transition: transform .2s, box-shadow .2s;
}
.dg .btn:hover { color: var(--dg-ink); transform: translateY(-1px); box-shadow: 0 8px 24px -10px var(--dg-btn-shadow); }
.dg .btn:focus-visible, .card:focus-visible, .door:focus-visible, .chips a:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.dg .btn.primary, .dg .btn.primary:hover { background: var(--dg-btn-primary-bg); color: var(--dg-btn-primary-fg); border-color: var(--dg-btn-primary-bg); }

.wide { padding: 90px 0 0; border-top: 1px solid var(--vp-c-divider); }
.wide .eyebrow { margin-bottom: 18px; }
.wide h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(2rem, 4.6vw, 3.4rem); line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 20px; border: 0; padding: 0; }
.wide h2 em { padding-right: .06em; }
.sub { max-width: 640px; color: var(--dg-muted); line-height: 1.75; font-size: 1.05rem; margin: 0 0 8px; }
.wide + .wide { margin-top: 64px; }

.proof { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 8px; }
.card, .door { display: block; min-width: 0; padding: 26px; border-radius: 22px; border: 1px solid var(--vp-c-divider); background: var(--dg-btn-bg); text-decoration: none; color: inherit; transition: transform .2s, box-shadow .2s; }
.card:hover, .door:hover { transform: translateY(-2px); box-shadow: 0 14px 34px -18px var(--dg-btn-shadow); }
.card h3, .door h3 { font-family: var(--font-display); font-weight: 400; font-size: 1.6rem; line-height: 1.1; margin: 0 0 10px; letter-spacing: -0.01em; color: var(--dg-ink); }
.card p, .door p { margin: 0; color: var(--dg-muted); line-height: 1.7; font-size: .95rem; }
.honest { max-width: 640px; margin: 28px 0 0; padding-left: 16px; border-left: 2px solid var(--dg-warm-stroke); color: var(--dg-ink); line-height: 1.7; font-size: 1rem; }

.work { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 6fr); gap: 32px; align-items: start; margin-top: 32px; }
.chips { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; padding: 0; margin: 0; }
.chips li { min-width: 0; max-width: 100%; }
.chips li a { display: block; padding: 9px 16px; border-radius: 999px; font-size: .9rem; border: 1px solid var(--dg-btn-border); background: var(--dg-btn-bg); color: var(--dg-ink); text-decoration: none; transition: transform .2s; }
.chips li a:hover { transform: translateY(-1px); }
.code { margin: 0; min-width: 0; }
.code pre {
  margin: 0; padding: 20px 22px; border-radius: 18px; overflow-x: auto;
  background: var(--dg-code-bg); border: 1px solid var(--dg-surface-stroke);
  font: 13px/1.7 var(--vp-font-family-mono); color: var(--dg-ink);
}
.code pre:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.code code { font: inherit; background: transparent; padding: 0; color: inherit; }
.code .k { color: var(--vp-c-brand-1); }
.code .v { color: var(--dg-ink); }
.code .p { color: var(--dg-muted); }
.code figcaption { margin-top: 10px; font-size: .85rem; line-height: 1.6; color: var(--dg-muted); }
.more { display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 24px 0 0; }
.more a { color: var(--vp-c-brand-1); text-decoration: none; font-weight: 500; }
.more a:hover { text-decoration: underline; text-underline-offset: 3px; }

.doors { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 32px; }
.door { display: flex; flex-direction: column; gap: 10px; }
.door h3 { margin: 0; }
.time { font-size: .82rem; font-weight: 500; color: var(--vp-c-brand-1); }
.door:first-child { background: linear-gradient(135deg, var(--dg-warm-fill), var(--dg-rose-fill)); border-color: var(--dg-warm-stroke); }

@media (max-width: 959px) { .dg { padding-inline: 0; } }
@media (max-width: 880px) { .work { grid-template-columns: minmax(0, 1fr); gap: 24px; } }
@media (max-width: 800px) {
  .proof, .doors { grid-template-columns: minmax(0, 1fr); gap: 14px; }
  .hero { padding: 72px 0 90px; }
  .wide { padding-top: 64px; }
  .wide + .wide { margin-top: 48px; }
  .dg { padding-bottom: 80px; }
}
@media (max-width: 480px) {
  .hero { padding: 48px 0 72px; }
  .mark { margin-bottom: 28px; }
  .eyebrow { letter-spacing: .14em; margin-bottom: 22px; }
  .lede { margin-top: 28px; }
  .cta { margin-top: 36px; }
  .cta .btn { flex: 1 1 140px; }
  .card, .door { padding: 22px; border-radius: 18px; }
  .code pre { padding: 16px; font-size: 12px; }
}
@media (prefers-reduced-motion: reduce) {
  .dg .btn, .card, .door, .chips li a { transition: none; }
  .dg .btn:hover, .card:hover, .door:hover, .chips li a:hover { transform: none; }
}
/* Gradient text disappears in forced-colours mode; fall back to system text. */
@media (forced-colors: active) { .hero h1 em, .wide h2 em { background: none; color: CanvasText; } }
</style>
