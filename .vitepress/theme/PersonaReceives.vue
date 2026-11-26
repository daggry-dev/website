<script setup lang="ts">
import DgGrid from './DgGrid.vue'
const cols = [
  {
    "who": "who and how",
    "t": "The persona's instructions",
    "tone": "cool",
    "d": "Standing. Defined once in the tenant config or the project config.",
    "chip": "pinned by digest"
  },
  {
    "who": "what and why, now",
    "t": "The objective",
    "tone": "warm",
    "d": "The issue, a trigger's text or the text given to daggry run.",
    "chip": "sealed at the start"
  },
  {
    "who": "what came before",
    "t": "Sealed outputs of earlier steps",
    "tone": "rose",
    "d": "A spec, a plan, a person's input, the findings that still fail.",
    "chip": "records, not chat history"
  },
  {
    "who": "what to hand in",
    "t": "Outputs",
    "d": "Such as a plan or a change.",
    "chip": "from the workflow"
  },
  {
    "who": "what it can write",
    "t": "Scope",
    "d": "The paths the step can change.",
    "chip": "from the workflow"
  }
]
</script>

<template>
  <DgGrid :cols="cols" :min="170">
    What a persona step receives, and nothing else. The persona's instructions say who works and how, and they are
    pinned by digest. The objective says what is wanted now, and it is sealed when the run starts. The sealed outputs of
    earlier steps carry what came before: a spec, a plan, a person's input or the findings that still fail. The workflow
    adds the outputs the step must hand in and the scope it can write. The workflow holds no instructions of its own.
  </DgGrid>
</template>
