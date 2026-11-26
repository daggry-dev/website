<script setup lang="ts">
import DgGrid from './DgGrid.vue'
const cols = [
  {
    "who": "the tenant admin writes",
    "t": "Tenant config",
    "tone": "cool",
    "items": [
      "Personas",
      "Shared validators and judges",
      "Workflows on offer",
      "Engines and approval rules",
      "Triggers and approvers for each project",
      "Limits and runners"
    ],
    "chip": "held outside every run"
  },
  {
    "who": "the project owner writes",
    "t": "Project config",
    "tone": "cool",
    "items": [
      "Areas",
      "Validators and judges",
      "The main validator",
      "Personas of its own",
      "Protected paths"
    ],
    "chip": "read from the baseline"
  },
  {
    "who": "whoever designs the work writes",
    "t": "Workflow",
    "tone": "cool",
    "items": [
      "Steps, in order",
      "Which persona works",
      "Which validators and judges check",
      "Scope, loop and gate",
      "Approvals and the effect"
    ],
    "chip": "names things, defines none"
  },
  {
    "who": "Daggry writes",
    "t": "Run",
    "tone": "rose",
    "items": [
      "The objective",
      "What the run pinned",
      "A sealed record for every step"
    ],
    "chip": "the evidence trail"
  }
]
</script>

<template>
  <DgGrid :cols="cols">
    Where each thing lives. The tenant config holds what every project shares: personas, shared validators and judges, the workflows on offer, engines, approval rules, limits, and the triggers and approvers of each project. The project config holds what is true of one project: areas, validators and judges, the main validator, personas of its own and protected paths. The workflow names which persona works and which validators and judges check, and defines none of them. The run adds the objective, what it pinned at the start and a sealed record for every step.
  </DgGrid>
</template>
