<script setup lang="ts">
import DgRows from './DgRows.vue'
const rows = [
  {
    "code": "- id: plan\n  kind: agent\n  persona: planner\n  outputs: [plan]",
    "tone": "cool",
    "chips": [
      {
        "t": "plan"
      },
      {
        "t": "change"
      }
    ],
    "note": "Each record carries the persona and the digest of its instructions."
  },
  {
    "code": "- id: approve-plan\n  kind: human\n  of: plan",
    "tone": "warm",
    "chips": [
      {
        "t": "approval"
      }
    ],
    "note": "A yes is bound to the digest of the plan. Any other reply goes back to plan."
  },
  {
    "code": "- id: build\n  loop:\n    until: verdict.all_covered\n    max: 5",
    "chips": [],
    "note": "The loop repeats until the gate holds. The gate reads sealed verdicts, and the limit ends the loop."
  },
  {
    "code": "    - kind: agent\n      persona: writer\n      scope: [\"docs/**\"]",
    "tone": "cool",
    "chips": [
      {
        "t": "change"
      }
    ],
    "note": "One in every iteration. A write outside the scope is put back and recorded."
  },
  {
    "code": "    - kind: verify\n      validators: [project]\n      judges: [coverage]",
    "tone": "rose",
    "chips": [
      {
        "t": "measurement"
      },
      {
        "t": "verdict"
      }
    ],
    "note": "One measurement for each validator, one verdict for each judge."
  },
  {
    "code": "- id: deliver\n  kind: effect\n  do: open-pr",
    "tone": "ok",
    "chips": [
      {
        "t": "observation"
      }
    ],
    "note": "What was delivered, such as the pull request."
  }
]
</script>

<template>
  <DgRows :rows="rows" left="in the workflow" right="sealed in the trail">
    The parts of a workflow and what each seals. An agent step names a persona and seals a change and its outputs, here a plan. A human step seals an approval bound to the digest of the plan. A loop seals nothing itself: in every iteration its agent step seals a change and its verify step seals measurements and verdicts, and the gate reads those verdicts. An effect step seals an observation of what it delivered.
  </DgRows>
</template>
