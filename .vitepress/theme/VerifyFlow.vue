<script setup lang="ts">
import DgSteps from './DgSteps.vue'
const steps = [
  {
    "who": "1",
    "t": "Fetch the trail",
    "d": "Every record of your tenant, and the public keys it names.",
    "tone": "cool"
  },
  {
    "who": "2",
    "t": "Recompute each digest",
    "d": "From the bytes of the record.",
    "tone": "warm"
  },
  {
    "who": "3",
    "t": "Check each link",
    "d": "Every record points at the one before it.",
    "tone": "warm"
  },
  {
    "who": "4",
    "t": "Check each signature",
    "d": "Against the public key.",
    "tone": "rose"
  },
  {
    "who": "result",
    "t": "Verified, or the first mismatch",
    "code": "verified 12 entries, 2 blobs",
    "tone": "ok"
  }
]
</script>

<template>
  <DgSteps :steps="steps">
    What <code>daggry verify</code> does on your machine: it fetches the trail and the public keys, recomputes each record's digest, checks that each record links to the one before it, checks each signature, and prints either a count of verified entries or the first mismatch.
  </DgSteps>
</template>
