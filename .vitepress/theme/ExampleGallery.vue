<script setup lang="ts">
import { withBase } from 'vitepress'
import DgIcon from './DgIcon.vue'

// The nine examples, in the order of the examples page. `a` is the heading slug there.
const examples = [
  { a: 'review-a-document', i: 'doc', k: 'any work', t: 'Review a document', w: 'A contract, a policy or a specification must meet a list of review rules.', v: 'Every required section is present and no banned phrase appears.' },
  { a: 'refresh-and-publish-data', i: 'data', k: 'any work', t: 'Refresh and publish data', w: 'A dataset is rebuilt from its sources again and again. No agent is needed.', v: 'Every required column is filled and the row count is in range.' },
  { a: 'ship-a-change-from-an-issue', i: 'branch', k: 'software', t: 'Ship a change from an issue', w: 'You want an issue turned into a pull request, with tests written first.', v: 'Each new test fails first, then passes.' },
  { a: 'write-a-sourced-report', i: 'link', k: 'software', t: 'Write a sourced report', w: 'The result is a document and every statement needs a source.', v: 'Every paragraph cites a source and every link resolves.' },
  { a: 'process-a-list-of-items', i: 'list', k: 'software', t: 'Process a list of items', w: 'You work through a list one item at a time, such as a backlog.', v: 'Each note has a label, a priority and a reason.' },
  { a: 'migrate-files-in-batches', i: 'stack', k: 'software', t: 'Migrate files in batches', w: 'A large mechanical change must land in small pieces.', v: 'The build and the tests pass on each batch.' },
  { a: 'update-documentation', i: 'pen', k: 'software', t: 'Update documentation', w: 'Wording matters more than structure, and you read the draft before it is delivered.', v: 'The links work and the required headings are present.' },
  { a: 'run-a-release-check', i: 'tag', k: 'software', t: 'Run a release check', w: 'You prepare a release and approve it before it goes out.', v: 'The build output and the changelog format are right.' },
  { a: 'audit-and-report', i: 'search', k: 'software', t: 'Audit and report', w: 'You scan dependencies or configuration and want the findings written up.', v: 'The summary has the fixed format.' },
] as const
</script>

<template>
  <figure class="dgm gal" aria-labelledby="gal-cap">
    <div class="dg-body">
      <ul class="grid">
        <li v-for="e in examples" :key="e.a" class="dg-node ex">
          <span class="top">
            <span class="ico" aria-hidden="true"><DgIcon :name="e.i" /></span>
            <span class="dg-who">{{ e.k }}</span>
          </span>
          <a :href="withBase(`/guide/how-to/workflow-patterns#${e.a}`)">{{ e.t }}</a>
          <span class="work">{{ e.w }}</span>
          <span class="chk"><DgIcon name="tick" /><span><span class="sr">A validator checks: </span>{{ e.v }}</span></span>
        </li>
      </ul>
    </div>
    <figcaption id="gal-cap" class="cap">
      Nine examples. Each card names a piece of work, says when to use it and, next to the tick, gives an example
      of what a validator checks. The first two fit any work that lives in files. The other seven are set up for
      software. Each name links to the complete workflow file.
    </figcaption>
  </figure>
</template>

<style scoped>
.dgm .grid { list-style: none; margin: 0; padding: 0; display: grid; grid-template-columns: repeat(auto-fill, minmax(196px, 1fr)); gap: 10px; }
.dgm .grid > li.ex { margin: 0; gap: 8px; position: relative; }
.top { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
.dg-node .ico {
  flex: none; width: 34px; height: 34px; border-radius: 10px; display: grid; place-items: center;
  font-size: 18px; color: var(--dg-on-amber);
  background: linear-gradient(135deg, var(--dg-amber-soft), var(--dg-amber));
}
.dgm .ex a { font-size: 15px; line-height: 1.35; font-weight: 600; color: var(--dg-ink); text-decoration: none; }
/* The whole card is the link's target; the link keeps its own short name. */
.dgm .ex a::after { content: ''; position: absolute; inset: 0; border-radius: 14px; }
.dgm .ex a:hover { text-decoration: underline; text-underline-offset: 3px; }
.dgm .ex a:focus-visible { outline: none; }
.dgm .ex a:focus-visible::after { outline: 2px solid var(--vp-c-brand-1); outline-offset: 2px; }
.dg-node .work { flex: 1 1 auto; }
.dg-node .chk {
  display: flex; align-items: flex-start; gap: 6px; padding-top: 8px;
  border-top: 1px dashed var(--dg-surface-stroke); color: var(--dg-ink);
}
.dg-node .chk span { color: inherit; }
.chk svg { width: 13px; height: 13px; margin-top: 3px; color: var(--dg-ok); }
.sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip-path: inset(50%); white-space: nowrap; }
@media (forced-colors: active) { .dg-node .ico { background: none; color: CanvasText; border: 1px solid CanvasText; } }
</style>
