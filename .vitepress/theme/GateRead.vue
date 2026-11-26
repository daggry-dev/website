<script setup lang="ts">
import DgGrid from './DgGrid.vue'
const cols = [
  {
    "who": "claimed",
    "t": "An agent wrote it",
    "tone": "rose",
    "items": [
      "inputs.plan.criteria",
      "steps.work.change.paths"
    ],
    "chip": "a gate cannot read it"
  },
  {
    "who": "derived",
    "t": "Code computed it from sealed records",
    "tone": "ok",
    "items": [
      "verdict.all_covered",
      "verdict.outcome",
      "inputs.measurement.exit_code"
    ],
    "chip": "a gate can read it"
  },
  {
    "who": "judged",
    "t": "A rubric judge answered",
    "tone": "warm",
    "items": [
      "verdict.rubric_pass"
    ],
    "chip": "only once a person approves the rubric"
  }
]
</script>

<template>
  <DgGrid :cols="cols">
    What a gate can read. A claimed field is something an agent wrote, and a gate cannot read it. A derived field is something code computed from sealed records, and a gate can read it. A judged field is a rubric judge's answer, and a gate can read it only once a person approves the rubric.
  </DgGrid>
</template>
