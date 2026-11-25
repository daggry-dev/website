<template>
  <figure class="cmpf">
  <div class="cmp">
    <div class="side bad">
      <span class="tag">Without Daggry</span>
      <div class="bub">“Done, all tests pass.”</div>
      <p>The agent’s own words are the only record. A reviewer must trust them or redo the work.</p>
    </div>
    <div class="side good">
      <span class="tag">With Daggry</span>
      <div class="bub mono">validators run by code: 0 failed, sealed</div>
      <p>Code ran the validators on a clean copy, wrote down the result and sealed it. <dfn>Sealed</dfn> means checked by code, then signed so that a later change shows.</p>
    </div>
  </div>
  <figcaption class="cap">
    The same work, reported twice. Without Daggry, the agent's own report is all you have. With Daggry, code runs
    the validators and seals the result into a trail you can verify.
  </figcaption>
  </figure>
</template>
<style scoped>
.cmpf { margin: 40px 0; }
.cmpf .cap { margin: 14px 0 0; font-size: .85rem; color: var(--dg-muted); line-height: 1.6; }
.cmp { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin: 0; }
.side { min-width: 0; border-radius: 22px; padding: 26px; border: 1px solid var(--vp-c-divider); background: var(--dg-surface); }
.side.good { background: linear-gradient(135deg, var(--dg-warm-fill), var(--dg-rose-fill)); border-color: var(--dg-warm-stroke); }
.tag { font: 500 11px var(--vp-font-family-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--dg-muted); }
.bub { margin: 18px 0; padding: 14px 18px; border-radius: 16px; background: var(--dg-bubble); color: var(--dg-ink); font-size: 15px; overflow-wrap: anywhere; }
.good .bub { background: var(--dg-surface); border: 1px solid var(--dg-warm-stroke); font-size: 13px; }
.side p { margin: 0; color: var(--dg-muted); line-height: 1.7; font-size: .95rem; }
@media (max-width: 720px) { .cmp { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 480px) { .side { padding: 20px; border-radius: 18px; } }
.side p dfn { font-style: normal; font-weight: 600; color: var(--dg-ink); }
</style>
