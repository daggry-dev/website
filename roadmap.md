# Roadmap

Daggry is built in three waves. A wave is a milestone, accepted when its exit test passes. This page lists what each wave contains, how each is tested, where the design goes after the third wave, and what exists today. It is the one place on this site that states build status. Every other page describes Daggry as designed.

## The three waves

The table lists what each wave contains.

| Wave | Contents |
|---|---|
| 1. Spine | Helm charts for Kubernetes. Control plane with a SQLite log, filesystem blobs, seals and validators. Launcher and runner. Coding-agent adapter and replay engine. YAML workflows. Minimal run lock. Bug to pull request with the red-then-green loop: the plan and its criteria come from an agent step and are approved through the CLI. Base-relative facts and the red proof, for Rust projects only. CLI commands `run`, `status`, `logs`, `verify` and `approve`. |
| 2. Team and conversation | Specialists and a roster. Harness overlay. The full run lock. Declared delegation. Approval and input by verified comments. The intent step. Dialogues on issue and pull request. `ask_human`. The test dispute. |
| 3. Judge and retro | `judged` facts and the judge step. Plan criteria with check modes. Scrubbed transcripts. The retro workflow. |

## Exit tests

Each wave is accepted when its exit test passes. The exit test is written first. The design gives no dates.

- **Wave 1.** A real issue becomes a pull request with no human input beyond approving the plan, a step cannot tamper with the log, the stored files or a protected path, the check measures exactly the commit that lands on the branch, and a runner that is killed mid-run is taken over by a second attempt.
- **Wave 2.** A real issue runs with a lead and one delegate, a project specialist is admitted as a delegate only, and a plan dialogue of several turns ends in an approval bound to the plan's digest.
- **Wave 3.** An approved plan with a `judged` criterion gates a pull request, and a retro on a finished run opens an issue whose citations code confirms.

## Beyond the waves

The design describes more than the three waves hold. None of it belongs to a wave yet.

| Area | Design |
|---|---|
| Signed head | A signed chain head published off-host at intervals, so that dropping entries from the end of a chain is visible. |
| Witness rule | A reviewer's finding gates work only when code confirms what it cites. |
| Gate reads of `meta` | A gate reads the values that code stamps in an artifact's `meta`. |
| Revocation and tombstoning | Revoking an approval as its own artifact. Removing a transcript blob without breaking the chain. |
| Older-major decoding | A reader decodes an older major of a kind for audit only. |
| External validators | A validator from outside the platform, admitted when the operator allow-lists it by name and version. |
| `stop` and `retry` | CLI commands to stop a run and to retry one. |
| `doctor` and `update` | Commands to repair an installation and to update it with a health-gated rollback. |
| `harness-change` workflow | The one path for changing harness and instruction files. |
| More human wait reasons | `answer-to-question` and `review-of-handover`. |
| Parallel steps and join | Deferred until a workflow needs them. |

The design lists these as non-goals for now: a web interface, a policy language, a code index, agent memory, evaluations and a plugin marketplace.

## What exists today

Status as of 2026-11-15. No wave exit test has passed yet. The shapes of the schemas can still change.

| Area | Exists | Not yet |
|---|---|---|
| Evidence | The envelope, digests, the signed chain, one log per tenant, fact classes, the validator contract and all eight kinds with schemas. | Signed head, revocation, tombstoning and older-major decoding. Lineage by `parents` is filled for `verdict` and `approval` only. |
| Verification | `daggry verify`. The `verify` step measures a fresh worktree with one test command and reads libtest-style result lines. `criterion-coverage` and `red-proof` run in a run. | Lints and coverage in a measurement, the witness rule, external validators and `judged` facts. |
| Gates and workflows | The gate grammar, strict YAML, five step kinds, bounded loops, `approve` and `approve --unfreeze`, and the `open-pr` effect. | Reads of `meta` in a gate, delegation, retro and parallel steps. |
| Protection | Always-protected paths, scope, frozen tests, restore in the pod and a recheck in the control plane. | A human grant for protected paths other than `.daggry/**`. |
| Engine | The replay engine and the tool server that offers `submit` and `validate`. | The live coding-agent adapter, `ask_human` and `delegate`. |
| Interfaces and deployment | CLI `run`, `status`, `logs`, `verify` and `approve`. Helm charts with a SQLite log and filesystem blobs. | `stop`, `retry`, `doctor` and `update`. Postgres and S3 storage. |

### Where to look next

| To | Read |
|---|---|
| Try the parts that exist | [Getting started](/guide/getting-started) |
| See the formats | [Envelope](/reference/envelope), [Kinds and schemas](/reference/kinds) |
| See the commands | [CLI](/reference/cli) |
