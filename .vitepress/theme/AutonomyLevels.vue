<script setup lang="ts">
import DgGrid from './DgGrid.vue'
const cols = [
  {
    "who": "level 1",
    "t": "You approve the plan and the merge",
    "tone": "warm",
    "items": [
      "a checkpoint on the plan",
      "a checkpoint on the pull request",
      "merge-pr after your yes"
    ],
    "chip": "two decisions are yours"
  },
  {
    "who": "level 2",
    "t": "You approve the plan only",
    "tone": "cool",
    "items": [
      "a checkpoint on the plan",
      "merge-pr with auto_when",
      "waits for you when the gate does not hold"
    ],
    "chip": "code decides the merge"
  },
  {
    "who": "level 3",
    "t": "No person below a threshold",
    "tone": "rose",
    "items": [
      "a schedule starts the run",
      "open-pr, then merge-pr with auto_when",
      "a small, safe change merges itself"
    ],
    "chip": "code decides, the trail says why"
  }
]
</script>

<template>
  <DgGrid :cols="cols">
    Three levels of autonomy. At level 1 you approve the plan and the merge. At level 2 you approve the plan, and a gate over sealed facts decides the merge, with a person as the fallback. At level 3 a scheduled run needs no person as long as the change stays under a threshold that code checks. At every level the tenant can still require a person, and every decision made without one is sealed with the facts that allowed it.
  </DgGrid>
</template>
