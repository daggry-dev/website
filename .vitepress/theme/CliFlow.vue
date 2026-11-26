<script setup lang="ts">
import DgRows from './DgRows.vue'
const rows = [
  {
    "code": "daggry run",
    "tone": "cool",
    "chips": [
      {
        "t": "run-lock"
      },
      {
        "t": "work-item"
      }
    ],
    "note": "A run starts. The work item holds the objective. Each step then seals its own records."
  },
  {
    "code": "daggry status",
    "chips": [],
    "note": "Reads the state of the run. Seals nothing."
  },
  {
    "code": "daggry logs",
    "chips": [],
    "note": "Lists the sealed records of the run."
  },
  {
    "code": "daggry approve",
    "tone": "warm",
    "chips": [
      {
        "t": "approval"
      }
    ],
    "note": "Bound to the digest of the plan or the change you approve."
  },
  {
    "code": "daggry verify",
    "tone": "ok",
    "chips": [],
    "note": "Recomputes every digest, link and signature on your machine. Seals nothing."
  }
]
</script>

<template>
  <DgRows :rows="rows" left="you run" right="in the trail">
    The five commands and what each does to the evidence trail. <code>daggry run</code> starts a run, which seals a run lock and the work item. <code>daggry status</code> and <code>daggry logs</code> read. <code>daggry approve</code> seals an approval bound to a digest. <code>daggry verify</code> recomputes the trail on your machine.
  </DgRows>
</template>
