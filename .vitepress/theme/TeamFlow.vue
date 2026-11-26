<script setup lang="ts">
// A swimlane: who acts at each stage of the issue-to-merge flow, and what is sealed.
const lanes = ['You', 'A persona', 'Code']
const stages = [
  { lane: 0, t: 'Label the issue', d: 'The issue is the objective.', rec: 'run-lock, work-item' },
  { lane: 1, t: 'planner writes the plan', d: 'Asks on the issue when unclear.', rec: 'plan, input' },
  { lane: 0, t: 'Approve the plan', d: 'Or reply, and the planner revises.', rec: 'approval' },
  { lane: 1, t: 'developer writes the proofs, then the work', d: 'Repeats on what still fails.', rec: 'change' },
  { lane: 2, t: 'Validators measure, judges decide', d: 'On a clean copy.', rec: 'measurement, verdict' },
  { lane: 2, t: 'Open the pull request', d: 'open-pr', rec: 'observation' },
  { lane: 1, t: 'reviewer posts its findings', d: 'Advice, as review comments.', rec: 'input' },
  { lane: 0, t: 'Review the pull request', d: 'A yes continues. Anything else goes back to the team.', rec: 'input, approval' },
  { lane: 2, t: 'Update, re-check, merge', d: 'A failed merge goes back to the team too.', rec: 'observation' },
]
</script>

<template>
  <figure class="dgm">
    <div class="dg-body">
      <div class="lanes head"><span v-for="l in lanes" :key="l" class="dg-who">{{ l }}</span><span class="dg-who">sealed</span></div>
      <div v-for="(s, i) in stages" :key="i" class="lanes">
        <template v-for="(l, j) in lanes" :key="l">
          <div v-if="s.lane === j" class="dg-node" :class="['warm', 'cool', 'rose'][j]">
            <span class="dg-who lane">{{ l }}</span>
            <b>{{ s.t }}</b>
            <span>{{ s.d }}</span>
          </div>
          <span v-else class="gap" />
        </template>
        <span class="rec"><span v-for="r in s.rec.split(', ')" :key="r" class="dg-chip">{{ r }}</span></span>
      </div>
    </div>
    <figcaption class="cap">
      The whole flow, from a labelled issue to a merged pull request, in three lanes. You label the issue, approve the
      plan and review the pull request. Three personas work in turn: the planner writes the plan and asks when
      something is unclear, the developer writes the proofs and the work, and the reviewer posts its findings. Code
      measures and judges on a clean copy, opens the pull request and merges it once the branch is up to date and the
      checks pass. Every stage seals records, named in the last column.
    </figcaption>
  </figure>
</template>

<style scoped>
.lanes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)) minmax(0, .8fr); gap: 8px; align-items: center; }
.lanes + .lanes { margin-top: 6px; }
.head { margin-bottom: 8px; }
.gap { border-top: 1px dashed var(--dg-surface-stroke); height: 0; align-self: center; }
.lane { display: none; }
.rec { display: flex; flex-wrap: wrap; gap: 4px; min-width: 0; }
@container dgm (max-width: 620px) {
  .head, .gap { display: none; }
  .lanes { grid-template-columns: minmax(0, 1fr); gap: 4px; }
  .lane { display: inline; }
}
</style>
