<script setup lang="ts">
import DgRows from './DgRows.vue'
const rows = [
  {
    "code": "on: issue-labeled\nlabel: factory",
    "tone": "warm",
    "chips": [
      {
        "t": "idea-to-pr"
      }
    ],
    "note": "An idea becomes a spec, a plan and a pull request."
  },
  {
    "code": "on: issue-labeled\nlabel: bug",
    "tone": "warm",
    "chips": [
      {
        "t": "fix-bug"
      }
    ],
    "note": "Two triggers can start one workflow."
  },
  {
    "code": "on: issue-typed\nissue_type: Bug",
    "tone": "warm",
    "chips": [
      {
        "t": "fix-bug"
      }
    ],
    "note": "The issue is the work item, and the conversation happens there."
  },
  {
    "code": "on: schedule\ncron: \"0 2 * * *\"",
    "tone": "cool",
    "chips": [
      {
        "t": "bug-hunter"
      }
    ],
    "note": "No issue to start from, so Daggry opens one for the run."
  }
]
</script>

<template>
  <DgRows :rows="rows" left="on GitHub" right="starts the workflow">
    How triggers route work. The label factory on an issue starts the workflow idea-to-pr. The label bug and the issue type Bug both start fix-bug. A schedule starts bug-hunter every night, and Daggry opens an issue for that run. Triggers live in the tenant config, never in the repository.
  </DgRows>
</template>
