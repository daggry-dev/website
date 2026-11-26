<script setup lang="ts">
import DgRows from './DgRows.vue'
const rows = [
  {
    "code": "personas:\n  planner:\n    engine: <engine>",
    "tone": "cool",
    "chips": [],
    "note": "Who works. A step names one: persona: planner."
  },
  {
    "code": "workflows:\n  review:\n    source: ...",
    "tone": "cool",
    "chips": [],
    "note": "The work on offer, pinned to one revision."
  },
  {
    "code": "agents:\n  approval:\n    require: [plan]",
    "tone": "warm",
    "chips": [
      {
        "t": "approval"
      }
    ],
    "note": "Where every run waits for a person."
  },
  {
    "code": "validators:\n  scripts:\n    licence-terms: ...",
    "tone": "rose",
    "chips": [
      {
        "t": "measurement"
      }
    ],
    "note": "Checks that every project shares."
  },
  {
    "code": "projects:\n  handbook:\n    workflows: ...",
    "chips": [],
    "note": "Which workflows and personas each project gets."
  }
]
</script>

<template>
  <DgRows :rows="rows" left="the tenant config" right="what it gives a run">
    The main sections of a tenant config and what each gives a run. Personas say who works, and a step names one. Workflows are the work on offer, pinned to one revision. Approval rules say where every run waits for a person, and each approval is sealed. Shared validators check every project, and their measurements are sealed. Projects say which workflows and personas each project gets.
  </DgRows>
</template>
