# Roadmap

Daggry is built in three waves, and this page is the one place on the site that states build status. Daggry is not yet publicly released; installation is from source for early users. Steps that run commands, checks and approvals work today. The live coding-agent adapter is not built yet, so steps that run a live coding agent do not run yet. A replay engine plays back a recorded transcript in place of the agent.

## What exists today

Status as of 2026-11-15. No wave exit test has passed yet, and the shapes of the schemas can still change. The table lists, for each area, what exists and what does not.

| Area | Exists | Not yet |
|---|---|---|
| Evidence | The envelope, digests, the signed chain, one log per team, fact classes, the validator contract and all eight kinds with schemas. | Signed head, revocation, tombstoning and older-major decoding. Lineage by `parents` is filled for `verdict` and `approval` only. |
| Verification | `daggry verify`. The `verify` step measures a clean copy of the code with one test command and reads libtest-style result lines. `criterion-coverage` and `red-proof` run in a run. | Lints and coverage in a measurement, the witness rule, external validators and `judged` facts. |
| Gates and workflows | The gate grammar, strict YAML, five step kinds, bounded loops, `approve` and `approve --unfreeze`, and the `open-pr` effect. | Reads of `meta` in a gate, delegation to other agents, a review of the finished run and parallel steps. |
| Protection | Always-protected paths, scope, frozen tests, restore in the pod and a recheck in the control plane. | A human grant for protected paths other than `.daggry/**`. |
| Engine | The replay engine and the tool server that offers `submit` and `validate`. | The live coding-agent adapter, `ask_human` and `delegate`. |
| Interfaces and deployment | CLI `run`, `status`, `logs`, `verify` and `approve`. Helm charts with a SQLite log and filesystem blobs. | `stop`, `retry`, `doctor` and `update`. Postgres and S3 storage. |

To try the parts that exist, follow [Getting started](/guide/getting-started). To see the formats, read [Envelope](/reference/envelope) and [Kinds and schemas](/reference/kinds). To see the commands, read the [CLI reference](/reference/cli).

## The three waves

A wave is a milestone, accepted when its exit test passes. The table lists what each wave adds, in terms of what you can do.

| Wave | What you can do |
|---|---|
| 1. Spine | Install Daggry on Kubernetes with Helm charts. Describe work as a YAML workflow and run it with `run`, `status`, `logs`, `verify` and `approve`. Turn a bug into a pull request with the red-then-green loop: an agent step writes the plan and its criteria, you approve the plan, each test is shown to fail first, and code re-checks the result. The agent runs through the coding-agent adapter or the replay engine. Test facts are measured against the base commit, for Rust projects only. |
| 2. Team and conversation | Name specialist agents on a roster and let a lead hand parts of the work to a delegate. Apply a project's own agent instructions on top of a run. Approve a plan or answer a question by a verified comment on the issue or pull request. Hold a dialogue with the agent on an issue or pull request, and let an agent ask a person a question with `ask_human`. Settle a disagreement about a test in a dispute step. |
| 3. Judge and review | Let a model judge one criterion you name, under rules you approve, labelled `judged`. Set a check mode for each plan criterion. Keep transcripts with secrets scrubbed. Run a review of a finished run that opens an issue whose citations code confirms. |

## Exit tests

Each wave is accepted when its exit test passes. The exit test is written first. The design gives no dates.

- **Wave 1.** A real issue becomes a pull request with no human input beyond approving the plan, a step cannot tamper with the log, the stored files or a protected path, the check measures exactly the commit that lands on the branch, and a runner that is killed mid-run is taken over by a second attempt.
- **Wave 2.** A real issue runs with a lead and one delegate, a project specialist is admitted as a delegate only, and a plan dialogue of several turns ends in an approval bound to the plan's digest.
- **Wave 3.** An approved plan with a `judged` criterion gates a pull request, and a review of a finished run opens an issue whose citations code confirms.

## Beyond the waves

The design describes more than the three waves hold. None of it belongs to a wave yet.

| Area | Design |
|---|---|
| Signed head | A signed chain head kept outside the cluster, so that dropping entries from the end of a chain is visible. It is not built yet. |
| Witness rule | A reviewer's finding gates work only when code confirms what it cites. |
| Gate reads of `meta` | A gate reads the values that code stamps in an artifact's `meta`. |
| Revocation and tombstoning | Revoking an approval as its own artifact. Removing a transcript blob without breaking the chain. |
| Older-major decoding | A reader decodes an older major of a kind for audit only. |
| External validators | A validator from outside the platform, admitted when the cluster admin allow-lists it by name and version. |
| `stop` and `retry` | CLI commands to stop a run and to retry one. |
| `doctor` and `update` | Commands to repair an installation and to update it with a health-gated rollback. |
| `harness-change` workflow | The one path for changing agent instruction and tool-setting files. |
| More approval reasons | `answer-to-question` and `review-of-handover`, the second being a review of what one step passes to the next. |
| Parallel steps and join | Deferred until a workflow needs them. |

The design lists these as non-goals for now: a web interface, a policy language, a code index, agent memory, evaluations and a plugin marketplace.
