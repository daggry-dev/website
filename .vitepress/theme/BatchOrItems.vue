<script setup lang="ts">
import DgGrid from './DgGrid.vue'
const cols = [
  {
    "who": "the default",
    "t": "The whole plan in each iteration",
    "tone": "ok",
    "items": [
      "One persona start for each iteration",
      "One verify run for each iteration",
      "Proofs written and frozen once",
      "A repeat sees only what still fails"
    ],
    "chip": "few handovers, few records"
  },
  {
    "who": "with over and as",
    "t": "One criterion in each iteration",
    "tone": "warm",
    "items": [
      "A persona start for each criterion, and for each repeat",
      "A verify run for each of them",
      "A proof written and frozen for each criterion",
      "Each criterion sealed and judged on its own"
    ],
    "chip": "more handovers, finer trail"
  }
]
</script>

<template>
  <DgGrid :cols="cols" :min="240">
    Two ways to run a loop. By default each iteration works on the whole plan: one persona start and one verify run for each iteration, the proofs written once, and a repeat that sees only what still fails. With over and as, each iteration takes one criterion: more persona starts, more verify runs and more records, in return for work that is isolated and judged one criterion at a time.
  </DgGrid>
</template>
