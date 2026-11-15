<template>
  <div class="cmp">
    <div class="side bad">
      <span class="tag">Without evidence</span>
      <div class="bub">“Done, all tests pass.”</div>
      <p>The agent’s own words are the only record. A reviewer must trust them or redo the work.</p>
    </div>
    <div class="side good">
      <span class="tag">With Daggry</span>
      <div class="bub mono">measurement · exit_code 0 · sealed ✓</div>
      <p>Code reran the tests in a clean worktree, reduced the output to a record, and signed it into the chain.</p>
    </div>
  </div>
</template>
<style scoped>
.cmp { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 20px; margin: 40px 0; }
.side { min-width: 0; border-radius: 22px; padding: 26px; border: 1px solid var(--vp-c-divider); background: var(--dg-surface); }
.side.good { background: linear-gradient(135deg, var(--dg-warm-fill), var(--dg-rose-fill)); border-color: var(--dg-warm-stroke); }
.tag { font: 500 11px var(--vp-font-family-mono); letter-spacing: .12em; text-transform: uppercase; color: var(--dg-muted); }
.bub { margin: 18px 0; padding: 14px 18px; border-radius: 16px; background: var(--dg-bubble); color: var(--dg-ink); font-size: 15px; overflow-wrap: anywhere; }
.good .bub { background: var(--dg-surface); border: 1px solid var(--dg-warm-stroke); font-size: 13px; }
p { margin: 0; color: var(--dg-muted); line-height: 1.7; font-size: .95rem; }
@media (max-width: 720px) { .cmp { grid-template-columns: minmax(0, 1fr); } }
@media (max-width: 480px) { .side { padding: 20px; border-radius: 18px; } }
</style>
