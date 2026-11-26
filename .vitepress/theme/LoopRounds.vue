<script setup lang="ts">
import DgRows from './DgRows.vue'
const rows = [
  {
    "t": "Iteration 1",
    "d": "The persona works on the whole plan.",
    "tone": "cool",
    "chips": [
      {
        "t": "AC-1 pass",
        "tone": "ok"
      },
      {
        "t": "AC-2 pass",
        "tone": "ok"
      },
      {
        "t": "AC-3 fail",
        "tone": "no"
      },
      {
        "t": "AC-4 fail",
        "tone": "no"
      },
      {
        "t": "AC-5 pass",
        "tone": "ok"
      }
    ],
    "note": "Gate: all_covered is false. Two findings go back to the persona."
  },
  {
    "t": "Iteration 2",
    "d": "The persona works on the two that fail.",
    "tone": "cool",
    "chips": [
      {
        "t": "AC-1 pass",
        "tone": "ok"
      },
      {
        "t": "AC-2 pass",
        "tone": "ok"
      },
      {
        "t": "AC-3 pass",
        "tone": "ok"
      },
      {
        "t": "AC-4 fail",
        "tone": "no"
      },
      {
        "t": "AC-5 pass",
        "tone": "ok"
      }
    ],
    "note": "Gate: all_covered is false. One finding goes back."
  },
  {
    "t": "Iteration 3",
    "d": "The persona works on the last one.",
    "tone": "cool",
    "chips": [
      {
        "t": "AC-1 pass",
        "tone": "ok"
      },
      {
        "t": "AC-2 pass",
        "tone": "ok"
      },
      {
        "t": "AC-3 pass",
        "tone": "ok"
      },
      {
        "t": "AC-4 pass",
        "tone": "ok"
      },
      {
        "t": "AC-5 pass",
        "tone": "ok"
      }
    ],
    "note": "Gate: all_covered is true. The loop ends, inside its limit of 5."
  }
]
</script>

<template>
  <DgRows :rows="rows" left="the persona works" right="the sealed verdict after verify">
    One loop over three iterations. In the first, the persona works on the whole plan, and the sealed verdict shows three criteria passing and two failing. The gate does not hold, so the loop repeats on the two that fail. After the second iteration one still fails. After the third all five pass, the gate holds and the loop ends. Had it reached its limit first, the run would fail or wait for you.
  </DgRows>
</template>
