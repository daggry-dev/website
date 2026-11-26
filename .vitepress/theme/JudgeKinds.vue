<script setup lang="ts">
import DgGrid from './DgGrid.vue'
const cols = [
  {
    "who": "every verify step has it",
    "t": "Default judge",
    "tone": "cool",
    "d": "Every measurement passes and the thresholds hold.",
    "chip": "vouched for by Daggry"
  },
  {
    "who": "you name it",
    "t": "Named judge",
    "tone": "cool",
    "d": "One fixed condition: coverage or no_regression.",
    "chip": "vouched for by Daggry"
  },
  {
    "who": "you write it",
    "t": "Custom judge",
    "tone": "warm",
    "d": "Your command decides, from the same trail.",
    "chip": "read from the baseline"
  },
  {
    "who": "a person approves it",
    "t": "Rubric judge",
    "tone": "rose",
    "d": "A bounded model judges one criterion under a rubric.",
    "chip": "counts once the rubric is approved"
  }
]
</script>

<template>
  <DgGrid :cols="cols">
    The four kinds of judge. The default judge runs in every verify step and decides that every measurement passes. A named judge adds one fixed condition, coverage or no_regression. A custom judge is your command. A rubric judge is a bounded model that judges one criterion under a rubric a person approved. All four are given the same evidence trail, and Daggry seals a verdict for each.
  </DgGrid>
</template>
