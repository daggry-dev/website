<script setup lang="ts">
import DgGrid from './DgGrid.vue'
const cols = [
  {
    "who": "moving",
    "t": "The run is working",
    "tone": "cool",
    "items": [
      "queued: accepted, no job has started",
      "running: a job is running"
    ]
  },
  {
    "who": "paused",
    "t": "The run waits",
    "tone": "warm",
    "items": [
      "waiting: a person is needed, for an approval or an answer",
      "parked: a limit is reached and the work waits for it to reset"
    ]
  },
  {
    "who": "ended",
    "t": "The run is over",
    "tone": "rose",
    "items": [
      "succeeded",
      "failed",
      "stopped: a person stopped it, or nobody answered for 14 days"
    ]
  }
]
</script>

<template>
  <DgGrid :cols="cols">
    The seven states of a run, in three groups. A run is queued, then running. It pauses as waiting when a person is needed, or as parked when a limit is reached, and continues from there. It ends as succeeded, failed or stopped.
  </DgGrid>
</template>
