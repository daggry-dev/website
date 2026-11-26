<script setup lang="ts">
import DgSteps from './DgSteps.vue'
const steps = [
  {
    "who": "you write",
    "t": "Three files",
    "d": "Personas, validators and the steps of the work, each defined once.",
    "tone": "cool",
    "chips": [
      "tenant config",
      "project config",
      "workflow"
    ]
  },
  {
    "who": "Daggry runs",
    "t": "A run",
    "d": "One workflow on one workspace, for one objective, such as an issue. Agents work in throwaway runners.",
    "tone": "warm"
  },
  {
    "who": "after every step",
    "t": "Sealed records",
    "d": "Code checks the result and signs it. What the agent says is only a claim.",
    "tone": "rose"
  },
  {
    "who": "linked, in order",
    "t": "The evidence trail",
    "d": "Who did what, what code measured and what you approved.",
    "tone": "rose"
  },
  {
    "who": "you check",
    "t": "daggry verify",
    "d": "Recomputes every digest and signature on your own machine.",
    "tone": "ok"
  }
]
</script>

<template>
  <DgSteps :steps="steps">
    The whole model, in order. You write three files: the tenant config, the project config and the workflow. Daggry runs one workflow on one workspace for one objective, such as an issue. After every step, code checks the result and seals it as a record. The records, linked in order, are the evidence trail, and <code>daggry verify</code> checks the trail on your own machine.
  </DgSteps>
</template>
