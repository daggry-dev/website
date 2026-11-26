<script setup lang="ts">
import DgRows from './DgRows.vue'
const rows = [
  {
    "t": "Build what an issue asks",
    "d": "Started by a label. The objective is the issue.",
    "tone": "warm",
    "chips": [
      {
        "t": "planner"
      },
      {
        "t": "developer"
      },
      {
        "t": "reviewer"
      }
    ],
    "note": "You approve the plan and the pull request."
  },
  {
    "t": "Hunt for a bug every night",
    "d": "Started by a schedule, with a standing objective.",
    "tone": "cool",
    "chips": [
      {
        "t": "planner"
      },
      {
        "t": "developer"
      },
      {
        "t": "reviewer"
      }
    ],
    "note": "You approve the plan and the pull request, on the issue Daggry opens."
  },
  {
    "t": "Keep the documentation current",
    "d": "Started by a schedule.",
    "tone": "cool",
    "chips": [
      {
        "t": "planner"
      },
      {
        "t": "developer"
      }
    ],
    "note": "Merges itself while the change is small and inside docs."
  },
  {
    "t": "Check a release",
    "d": "Started by a command, with the objective as text.",
    "chips": [
      {
        "t": "planner"
      },
      {
        "t": "developer"
      }
    ],
    "note": "You read the result."
  }
]
</script>

<template>
  <DgRows :rows="rows" left="the mission" right="the same team">
    One team on four missions. A label on an issue starts a build of what the issue asks, and you approve the plan and the pull request. A schedule starts a nightly bug hunt with a standing objective, and you approve its plan and its pull request on the issue Daggry opens. Another schedule keeps the documentation current and merges small changes itself. A command starts a release check with the objective as text. The personas and the checks are the same each time, and each run seals its objective, its work and its checks in the same kind of evidence trail.
  </DgRows>
</template>
