<script setup lang="ts">
import DgRows from './DgRows.vue'
const rows = [
  {
    "code": ".daggry/project.yaml",
    "chips": [
      {
        "t": "never",
        "tone": "no"
      }
    ],
    "note": "Always protected."
  },
  {
    "code": "scripts/review.sh",
    "chips": [
      {
        "t": "never",
        "tone": "no"
      }
    ],
    "note": "A validator's run names it."
  },
  {
    "code": "style/guide.md",
    "chips": [
      {
        "t": "never",
        "tone": "no"
      }
    ],
    "note": "The project lists it in protect.paths."
  },
  {
    "code": "checks/leave-policy.sh",
    "chips": [
      {
        "t": "frozen",
        "tone": "no"
      }
    ],
    "note": "A proof step sealed it. Only a person's unfreeze grant opens it, once."
  },
  {
    "code": "README.md",
    "chips": [
      {
        "t": "put back",
        "tone": "no"
      }
    ],
    "note": "Outside the scope of the step. The change is put back and recorded."
  },
  {
    "code": "handbook/leave.md",
    "tone": "ok",
    "chips": [
      {
        "t": "yes",
        "tone": "ok"
      }
    ],
    "note": "Inside the scope of the step and of the run."
  }
]
</script>

<template>
  <DgRows :rows="rows" left="a path in the workspace" right="can the step write it?">
    Six paths in a workspace and whether a step with the scope <code>["handbook/**", "checks/**"]</code> can write each. The project config, a validator's script and a path in <code>protect.paths</code> are protected and never writable. A frozen proof is writable only after a person's unfreeze grant. A path outside the scope is put back and recorded. A path inside the scope is writable.
  </DgRows>
</template>
