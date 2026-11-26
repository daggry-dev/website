<script setup lang="ts">
import DgRows from './DgRows.vue'
const rows = [
  {
    "code": "areas:\n  handbook:\n    paths: [\"handbook/**\"]",
    "tone": "cool",
    "chips": [],
    "note": "A name a workflow can use as a scope: area:handbook."
  },
  {
    "code": "validators:\n  review:\n    run: [sh, scripts/review.sh]",
    "tone": "rose",
    "chips": [
      {
        "t": "measurement"
      }
    ],
    "note": "Runs on a clean copy. Daggry seals what it reports."
  },
  {
    "code": "verification:\n  canonical: review",
    "chips": [],
    "note": "What the name project stands for in a verify step."
  },
  {
    "code": "personas:\n  writer:\n    engine: <engine>",
    "tone": "cool",
    "chips": [],
    "note": "The project's own version of a persona. It wins over the tenant's."
  },
  {
    "code": "protect:\n  paths: [\"area:style\"]",
    "tone": "warm",
    "chips": [],
    "note": "Paths no step can change."
  }
]
</script>

<template>
  <DgRows :rows="rows" left=".daggry/project.yaml" right="what it gives a run">
    The sections of a project config and what each gives a run. Areas give a workflow names for parts of the project. Validators run on a clean copy, and Daggry seals what they report as measurements. Verification says what the name <code>project</code> stands for. Personas are the project's own versions. Protect lists paths no step can change.
  </DgRows>
</template>
