<script setup lang="ts">
import DgGrid from './DgGrid.vue'
const cols = [
  {
    "who": "at the start",
    "t": "run-lock",
    "d": "What the run pinned: workflow, personas, validators, judges."
  },
  {
    "who": "at the start",
    "t": "work-item",
    "d": "The objective: what was asked, and who asked."
  },
  {
    "who": "an agent step",
    "t": "plan",
    "tone": "cool",
    "d": "The criteria an agent proposes."
  },
  {
    "who": "an agent or command step",
    "t": "change",
    "tone": "cool",
    "d": "A version of the workspace and the paths it changed."
  },
  {
    "who": "a verify step",
    "t": "measurement",
    "tone": "rose",
    "d": "What a validator reported."
  },
  {
    "who": "a verify step",
    "t": "verdict",
    "tone": "rose",
    "d": "What a judge decided."
  },
  {
    "who": "a human step",
    "t": "approval",
    "tone": "warm",
    "d": "A person's yes, bound to one digest."
  },
  {
    "who": "the thread",
    "t": "input",
    "tone": "warm",
    "d": "Something said in the thread, by a person or a reviewer persona."
  },
  {
    "who": "an effect, or a refusal",
    "t": "observation",
    "tone": "ok",
    "d": "A delivery, a path put back or a failed step."
  }
]
</script>

<template>
  <DgGrid :cols="cols" :min="150">
    The nine kinds of record and what seals each. The start of a run seals a run lock and a work item. An agent step seals a plan and a change, and a command step a change. A verify step seals measurements and verdicts. A human step seals an approval, and anything said in the thread is sealed as an input. An effect, a path that was put back and a failed step each seal an observation.
  </DgGrid>
</template>
