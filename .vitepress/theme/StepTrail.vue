<script setup lang="ts">
import DgRows from './DgRows.vue'
const rows = [
  {
    "t": "The run starts",
    "chips": [
      {
        "t": "run-lock"
      },
      {
        "t": "work-item"
      }
    ],
    "note": "What the run pinned, and the objective: what was asked, and who asked."
  },
  {
    "t": "agent step",
    "d": "A persona does the work.",
    "tone": "cool",
    "chips": [
      {
        "t": "change"
      },
      {
        "t": "plan"
      }
    ],
    "note": "Each carries the persona and the digest of its instructions."
  },
  {
    "t": "Proof step",
    "d": "An agent step with freeze, in a loop.",
    "tone": "cool",
    "chips": [
      {
        "t": "change"
      },
      {
        "t": "measurement"
      },
      {
        "t": "verdict"
      }
    ],
    "note": "The proof is frozen and shown to fail on the baseline, before the work starts."
  },
  {
    "t": "command step",
    "d": "Your program runs.",
    "chips": [
      {
        "t": "change"
      }
    ]
  },
  {
    "t": "verify step",
    "d": "Validators measure, judges decide.",
    "tone": "rose",
    "chips": [
      {
        "t": "measurement"
      },
      {
        "t": "verdict"
      }
    ],
    "note": "One measurement for each validator, one verdict for each judge."
  },
  {
    "t": "human step",
    "d": "A checkpoint: you decide.",
    "tone": "warm",
    "chips": [
      {
        "t": "approval"
      },
      {
        "t": "input"
      }
    ],
    "note": "Your yes, or your reply. Anything you say in the thread at other times is sealed as input too."
  },
  {
    "t": "effect step",
    "d": "Daggry delivers.",
    "tone": "ok",
    "chips": [
      {
        "t": "observation"
      }
    ],
    "note": "What was delivered, such as the pull request."
  }
]
</script>

<template>
  <DgRows :rows="rows" left="in a run" right="records sealed">
    What each step adds to the evidence trail. The start of a run seals a run lock and the work item, which holds the objective. An agent step seals a change and its outputs, such as a plan, each with the persona and the digest of its instructions. A proof step also seals a measurement and a verdict that show the proof fails on the baseline. A command step seals a change. A verify step seals one measurement for each validator and one verdict for each judge. A human step seals your answer bound to a digest: an approval, or an input in free text. An effect step seals an observation of what it delivered.
  </DgRows>
</template>
