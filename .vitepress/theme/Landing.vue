<script setup lang="ts">
import { withBase } from 'vitepress'
const points = [
  { n: '01', t: 'Work is a graph', d: 'Steps, artifacts and gates. A pull request is one projection of a run, not the definition of one.' },
  { n: '02', t: 'Evidence is sealed', d: 'An agent’s output is a claim. Only code seals evidence, and a sealed artifact is immutable.' },
  { n: '03', t: 'Jobs run in pods', d: 'One sandboxed Kubernetes pod per job. Connections go outward; nothing dials in.' },
]
const proof = [
  { t: 'An evidence trail', d: 'Every handover is sealed into a hash-chained log, signed, and linked to what it built on. A Merkle chain you can recheck yourself.', l: '/guide/concepts/trust#pillar-1-the-evidence-trail', k: 'daggry verify' },
  { t: 'Validators are code', d: 'Deterministic code checks every claim an agent makes. Code judges the work, and gates open only on facts code derived.', l: '/guide/concepts/trust#pillar-2-code-validators-judge-never-an-llm', k: 'criterion-coverage' },
  { t: 'Public schemas', d: 'The envelope, every artifact kind and the workflow file have published JSON Schemas. Validate anything with any JSON Schema tool.', l: '/guide/concepts/trust#pillar-3-public-schemas-for-artifacts-and-evidence', k: '/schemas/*.json' },
]
const kinds = ['Ship a change from an issue', 'Research and commit a sourced report', 'Process a batch of items', 'Migrate files in bounded batches', 'Update documentation with review', 'Run a gated release check', 'Audit and report']
</script>

<template>
  <div class="dg">
    <section class="hero">
      <div class="glow" aria-hidden="true" />
      <img class="mark" :src="withBase('/logo.svg')" alt="" />
      <p class="eyebrow">Daggry · Danish for dawn</p>
      <h1>Agents do the work.<br /><em>Code checks it.</em></h1>
      <p class="lede">
        A platform for agentic work. Work graphs, sealed evidence verified by code,
        and sandboxed jobs in Kubernetes pods. A coding-agent CLI is the engine of a step.
      </p>
      <div class="cta">
        <a class="btn primary" :href="withBase('/guide/')">Read the guide</a>
        <a class="btn" :href="withBase('/guide/concepts/trust')">Why you can trust a run</a>
      </div>
      <p class="status"><a :href="withBase('/roadmap')">Status and roadmap →</a></p>
    </section>

    <section class="points">
      <article v-for="p in points" :key="p.n">
        <span class="num">{{ p.n }}</span>
        <h2>{{ p.t }}</h2>
        <p>{{ p.d }}</p>
      </article>
    </section>

    <section class="wide">
      <p class="eyebrow">The idea</p>
      <h2>Go to bed. Wake at <em>daggry</em>.</h2>
      <p class="sub">Daggry is Danish for dawn. Hand it an approved plan in the evening and let it work through the night. In the morning the pull request is open and every claim behind it is checked and sealed.</p>
      <Overnight />
    </section>

    <section class="wide">
      <p class="eyebrow">Work graphs</p>
      <h2>Any kind of work, <em>described as a graph</em>.</h2>
      <p class="sub">A workflow is a file in your repo: steps, the artifacts they hand on, gates that read facts code derived, bounded loops, and the moments a person decides. The same few building blocks describe delivering a change, writing a report, or migrating a thousand files.</p>
      <ul class="chips">
        <li v-for="k in kinds" :key="k"><a :href="withBase('/guide/how-to/workflow-patterns')">{{ k }}</a></li>
      </ul>
      <p class="more"><a :href="withBase('/guide/how-to/workflow-patterns')">See the patterns →</a> <a :href="withBase('/guide/how-to/design-a-workflow')">Design your own →</a></p>
    </section>

    <section class="wide">
      <p class="eyebrow">Proof, not promises</p>
      <h2>Trust the <em>trail</em>, not the agent.</h2>
      <p class="sub">An agent’s output is a claim. Daggry turns claims into evidence only through code, and keeps the evidence where anyone can check it.</p>
      <div class="proof">
        <a v-for="p in proof" :key="p.t" class="card" :href="withBase(p.l)">
          <code>{{ p.k }}</code>
          <h3>{{ p.t }}</h3>
          <p>{{ p.d }}</p>
        </a>
      </div>
    </section>

    <section class="wide">
      <p class="eyebrow">How it fits together</p>
      <h2>One pod per job. <em>One place</em> that seals.</h2>
      <Architecture />
    </section>

    <section class="quote">
      <p>One run takes an issue to a pull request, then to a retro on it — unattended, with a human in the loop on the issue and on the pull request.</p>
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
.lede { max-width: 560px; margin: 36px auto 0; font-size: clamp(1.02rem, .95rem + .4vw, 1.15rem); line-height: 1.75; color: var(--dg-muted); }
.cta { display: flex; flex-wrap: wrap; gap: 12px; justify-content: center; margin-top: 44px; }
.dg .btn {
  display: inline-flex; align-items: center; justify-content: center; min-height: 44px;
  padding: 11px 24px; border-radius: 999px; font-size: .95rem; font-weight: 500; line-height: 1.4;
  border: 1px solid var(--dg-btn-border); color: var(--dg-ink); background: var(--dg-btn-bg);
  text-decoration: none; transition: transform .2s, box-shadow .2s;
}
.dg .btn:hover { color: var(--dg-ink); transform: translateY(-1px); box-shadow: 0 8px 24px -10px var(--dg-btn-shadow); }
.dg .btn:focus-visible { outline: 2px solid var(--vp-c-brand-1); outline-offset: 3px; }
.dg .btn.primary, .dg .btn.primary:hover { background: var(--dg-btn-primary-bg); color: var(--dg-btn-primary-fg); border-color: var(--dg-btn-primary-bg); }
.status { margin-top: 36px; font-family: var(--vp-font-family-mono); font-size: .75rem; color: var(--dg-muted); }

.points { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 56px; padding: 80px 0; border-top: 1px solid var(--vp-c-divider); }
.num { font-family: var(--vp-font-family-mono); font-size: .75rem; color: var(--vp-c-brand-1); }
.points h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(1.75rem, 1.4rem + 1vw, 2.1rem); line-height: 1.1; margin: 14px 0 12px; border: 0; padding: 0; letter-spacing: -0.01em; }
.points p { margin: 0; color: var(--dg-muted); line-height: 1.75; }

.wide { padding: 90px 0 0; border-top: 1px solid var(--vp-c-divider); }
.wide .eyebrow { margin-bottom: 18px; }
.wide h2 { font-family: var(--font-display); font-weight: 400; font-size: clamp(2rem, 4.6vw, 3.4rem); line-height: 1.05; letter-spacing: -0.02em; margin: 0 0 20px; border: 0; padding: 0; }
.wide h2 em { padding-right: .06em; }
.sub { max-width: 640px; color: var(--dg-muted); line-height: 1.75; font-size: 1.05rem; margin: 0 0 8px; }

.quote { margin-top: 90px; padding: 80px 0 0; border-top: 1px solid var(--vp-c-divider); }
.quote p { font-family: var(--font-display); font-size: clamp(1.6rem, 1rem + 2.6vw, 2.8rem); line-height: 1.2; max-width: 820px; margin: 0; letter-spacing: -0.01em; }

@media (max-width: 959px) { .dg { padding-inline: 0; } }
@media (max-width: 800px) {
  .points { grid-template-columns: minmax(0, 1fr); gap: 40px; padding: 64px 0; }
  .hero { padding: 72px 0 90px; }
  .wide { padding-top: 64px; }
  .quote { margin-top: 64px; padding-top: 64px; }
  .dg { padding-bottom: 80px; }
}
@media (max-width: 480px) {
  .hero { padding: 48px 0 72px; }
  .mark { margin-bottom: 28px; }
  .eyebrow { letter-spacing: .14em; margin-bottom: 22px; }
  .lede { margin-top: 28px; }
  .cta { margin-top: 36px; }
  .cta .btn { flex: 1 1 140px; }
}
@media (prefers-reduced-motion: reduce) { .dg .btn { transition: none; } .dg .btn:hover { transform: none; } }
/* Gradient text disappears in forced-colours mode; fall back to system text. */
@media (forced-colors: active) { .hero h1 em, .wide h2 em { background: none; color: CanvasText; } }

.chips { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; padding: 0; margin: 28px 0 8px; }
.chips li a { display: block; padding: 9px 16px; border-radius: 999px; font-size: .9rem; border: 1px solid var(--dg-btn-border); background: var(--dg-btn-bg); color: var(--dg-ink); text-decoration: none; transition: transform .2s; }
.chips li a:hover { transform: translateY(-1px); }
.more { display: flex; flex-wrap: wrap; gap: 8px 24px; margin: 20px 0 0; }
.more a, .status a { color: var(--vp-c-brand-1); text-decoration: none; font-weight: 500; }
.more a:hover, .status a:hover { text-decoration: underline; text-underline-offset: 3px; }
.proof { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 20px; margin-top: 32px; }
.card { display: block; padding: 26px; border-radius: 22px; border: 1px solid var(--vp-c-divider); background: var(--dg-btn-bg); text-decoration: none; color: inherit; transition: transform .2s, box-shadow .2s; }
.card:hover { transform: translateY(-2px); box-shadow: 0 14px 34px -18px var(--dg-btn-shadow); }
.card code { font: 500 .72rem var(--vp-font-family-mono); color: var(--vp-c-brand-1); background: transparent; padding: 0; }
.card h3 { font-family: var(--font-display); font-weight: 400; font-size: 1.6rem; line-height: 1.1; margin: 12px 0 10px; letter-spacing: -0.01em; }
.card p { margin: 0; color: var(--dg-muted); line-height: 1.7; font-size: .95rem; }
@media (max-width: 800px) { .proof { grid-template-columns: minmax(0, 1fr); } }
@media (prefers-reduced-motion: reduce) { .card, .card:hover, .chips li a, .chips li a:hover { transition: none; transform: none; } }
</style>
