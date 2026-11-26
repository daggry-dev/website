<script setup lang="ts">
import DgSteps from './DgSteps.vue'
const steps = [
  {
    "who": "a workflow names",
    "t": "A persona, a validator or a judge",
    "code": "persona: planner",
    "tone": "cool"
  },
  {
    "who": "Daggry looks first in",
    "t": "The project config",
    "d": "Read from the baseline. A match here wins.",
    "tone": "warm"
  },
  {
    "who": "then in",
    "t": "The tenant config",
    "d": "What every project shares.",
    "tone": "warm"
  },
  {
    "who": "then in",
    "t": "What Daggry ships",
    "d": "The default team and its workflow.",
    "tone": "warm"
  },
  {
    "who": "found",
    "t": "Pinned in the run lock",
    "d": "By digest, so the trail shows which version the run used.",
    "tone": "ok"
  }
]
</script>

<template>
  <DgSteps :steps="steps">
    How a name in a workflow is resolved. For a persona, a validator or a judge, Daggry looks in the project config of the baseline first, then in the tenant config, then in what Daggry ships, and pins what it finds in the run lock. A name that none of them has refuses the run when it starts.
  </DgSteps>
</template>
