<script setup lang="ts">
// An example of what the evidence trail of one night reads like.
// Every record carries its own fingerprint and a link to the trail before it.
import DgIcon from './DgIcon.vue'

const records = [
  { t: '22:04', h: 'Plan approved by you', d: 'Five items to build. Your approval is tied to this exact plan.', by: 'recorded by code', fp: '9c1e', prev: 'start' },
  { t: '23:17', h: 'Test written and shown to fail', d: 'Item 1 of 5. The new test fails on the code as it was, so it really tests something.', by: 'checked by code', fp: '4b7a', prev: '9c1e' },
  { t: '23:52', h: 'Test passes on a clean copy', d: 'Code re-ran every test on a fresh copy of the code: 0 failures.', by: 'checked by code', fp: 'e0d3', prev: '4b7a' },
  { gap: 'Items 2 to 5: the same two records each, 01:10 to 05:30' },
  { t: '06:03', h: 'Pull request opened', d: 'All five items covered. Ready for your review, with this trail beside it.', by: 'recorded by code', fp: 'a41f', prev: 'c58e' },
] as const
</script>

<template>
  <figure class="dgm mt">
    <div class="dg-body">
      <p class="head">
        <span class="ex">Example</span>
        <span>The evidence trail of one night of software work</span>
      </p>
      <ol class="trail">
        <template v-for="(r, i) in records" :key="i">
          <li v-if="'gap' in r" class="gap"><span>{{ r.gap }}</span></li>
          <li v-else class="rec">
            <time class="time">{{ r.t }}</time>
            <div class="card">
              <b>{{ r.h }}</b>
              <p>{{ r.d }}</p>
              <div class="meta">
                <span class="dg-chip ok"><DgIcon name="tick" />{{ r.by }}</span>
                <span class="dg-chip" :title="`This record's fingerprint is ${r.fp}. It is linked to the trail before it, which ends at ${r.prev}.`">
                  <DgIcon name="link" />
                  <span class="vh">fingerprint</span> {{ r.fp }}
                  <span class="after">follows {{ r.prev }}</span>
                </span>
              </div>
            </div>
          </li>
        </template>
      </ol>
      <div class="verify">
        <code><span class="pr" aria-hidden="true">$</span> daggry verify</code>
        <span class="dg-chip ok"><DgIcon name="tick" />verified 12 entries, 2 blobs</span>
      </div>
    </div>
    <figcaption class="cap">
      An example trail, shortened to four of its twelve records. Each record says what happened and that code checked
      it, and is linked to the trail before it. One command verifies the whole trail on your own machine.
    </figcaption>
  </figure>
</template>

<style scoped>
.head { display: flex; flex-wrap: wrap; align-items: baseline; gap: 8px 12px; margin: 0 0 22px; font-size: .95rem; font-weight: 600; color: var(--dg-ink); }
.ex { font: 500 11px/1.6 var(--vp-font-family-mono); padding: 1px 9px; border-radius: 999px; border: 1px dashed var(--dg-edge); color: var(--dg-muted); }

.trail { list-style: none; margin: 0; padding: 0; position: relative; }
/* The rail: one line through every record. */
.trail::before {
  content: ''; position: absolute; left: calc(3.4rem + 21px); top: 8px; bottom: 8px; width: 2px; border-radius: 2px;
  background: linear-gradient(to bottom, var(--dg-lilac), var(--dg-edge-hot));
}
.rec, .gap { position: relative; display: grid; grid-template-columns: 3.4rem 16px minmax(0, 1fr); column-gap: 14px; margin: 0 0 12px; }
.rec::after {
  content: ''; position: absolute; left: calc(3.4rem + 16px); top: 16px; width: 12px; height: 12px; border-radius: 50%;
  background: var(--dg-surface); border: 2px solid var(--dg-edge-hot); box-sizing: border-box;
}
.time { grid-column: 1; padding-top: 12px; font: 500 12px var(--vp-font-family-mono); color: var(--dg-muted); text-align: right; }
.card {
  grid-column: 3; min-width: 0; padding: 14px 16px; border-radius: 16px; overflow-wrap: anywhere;
  border: 1px solid var(--dg-surface-stroke); background: var(--dg-surface);
}
.rec:last-of-type .card { background: var(--dg-warm-fill); border-color: var(--dg-warm-stroke); }
.card b { display: block; font-size: 14.5px; line-height: 1.4; color: var(--dg-ink); }
.card p { margin: 4px 0 10px; font-size: 13px; line-height: 1.55; color: var(--dg-muted); }
.meta { display: flex; flex-wrap: wrap; gap: 6px; }
.after { opacity: .8; }
.after::before { content: ''; display: inline-block; width: 1px; height: .8em; margin: 0 6px 0 2px; background: currentColor; opacity: .5; vertical-align: -1px; }
.gap span {
  grid-column: 3; display: block; padding: 6px 14px; border-radius: 12px; border: 1px dashed var(--dg-surface-stroke);
  font-size: 12.5px; color: var(--dg-muted); overflow-wrap: anywhere;
}
.vh { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }

.verify {
  display: flex; flex-wrap: wrap; align-items: center; gap: 10px 14px; margin-top: 20px; padding: 12px 16px;
  border-radius: 14px; background: var(--dg-code-bg); border: 1px solid var(--dg-surface-stroke);
}
.verify code { font: 500 13px var(--vp-font-family-mono); color: var(--dg-ink); background: transparent; padding: 0; }
.pr { color: var(--dg-muted); margin-right: 4px; }

@container dgm (max-width: 480px) {
  .trail::before { left: 7px; }
  .rec, .gap { grid-template-columns: 16px minmax(0, 1fr); column-gap: 12px; }
  .rec::after { left: 2px; }
  .time { grid-column: 2; text-align: left; padding: 0 0 4px; }
  .card, .gap span { grid-column: 2; }
}
</style>
