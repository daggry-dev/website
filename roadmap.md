# Roadmap

Daggry is built in three waves, and this page is the one place on the site that states build status. Daggry is not yet publicly released; installation is from source for early users. Steps that run commands, checks and approvals work today. The live coding-agent adapter exists, and two live smoke runs passed on 2026-11-16. A replay engine plays back a recorded transcript in place of the agent.

The rest of the site describes the design: a factory kit built from modules and open standards. Part of that design is direction and is not built. [Direction: modules and open standards](#direction-modules-and-open-standards) says which part.

## What exists today

Status as of 2026-11-24. No wave exit test has passed yet, and the shapes of the schemas can still change. The table lists, for each area, what exists and what does not.

| Area | Exists | Not yet |
|---|---|---|
| Evidence | The envelope, digests, the signed chain, one log per team, fact classes, the validator contract and all eight kinds with schemas. | Signed head, revocation, tombstoning and older-major decoding. Lineage by `parents` is filled for `verdict` and `approval` only. |
| Verification | `daggry verify`. The `verify` step measures a clean copy of the code with one test command and reads libtest-style result lines. `criterion-coverage` and `red-proof` run in a run. | Lints and coverage in a measurement, the witness rule, external validators and `judged` facts. |
| Gates and workflows | The gate grammar, strict YAML, five step kinds, bounded loops, `approve` and `approve --unfreeze`, and the `open-pr` effect. | Reads of `meta` in a gate, delegation to other agents, a review of the finished run and parallel steps. |
| Protection | Always-protected paths, scope, frozen tests, restore in the pod and a recheck in the control plane. The platform's own instructions are read-only in the pod. A project's own agent config is read from the working tree and protected by the boundary check. | A human grant for protected paths other than `.daggry/**`. |
| Engine | The replay engine, the live coding-agent adapter and the tool server that offers `submit` and `validate`. Two live smoke runs passed on 2026-11-16. | `ask_human` and `delegate`. |
| Interfaces and deployment | CLI `run`, `status`, `logs`, `verify` and `approve`. Helm charts with a SQLite log and filesystem blobs. | `stop`, `retry`, `doctor` and `update`. Postgres and S3 storage. |

To try the parts that exist, follow [Getting started](/guide/getting-started). To see the formats, read [Envelope](/reference/envelope) and [Kinds and schemas](/reference/kinds). To see the commands, read the [CLI reference](/reference/cli).

## Direction: modules and open standards

The design is a factory kit: modules with one job each, connected by four open standards. See [The modules](/guide/concepts/modules), [Open standards](/guide/concepts/standards) and [The tenant defines the factory](/guide/concepts/tenant). Those pages describe the design. This section says what of it exists.

In the table, **exists** means it is in [What exists today](#what-exists-today). **Direction** means it is designed and not built. No direction item belongs to a wave yet.

| Item | Status | Detail |
|---|---|---|
| Evidence standard: envelope, kinds, signing and chaining | Exists | The envelope, the eight kinds with published schemas, the signed chain and `daggry verify`. |
| Evidence kinds from another namespace | Direction | Today a kind outside the `evidence` and `daggry` namespaces is refused as unknown. |
| Workflow standard: the file of steps | Exists | Strict YAML, five step kinds, bounded loops and a published schema. |
| Workflow `format` header, extension keys and extension step kinds | Direction | Today a workflow file holds `steps` only, and every unknown key and kind is refused. |
| Project config standard | Direction | Today a repository has the profile, `.daggry/profile.yaml`, which holds the test command only. See [Project config](/reference/project-config#today). |
| Project config areas | Direction | Named groups of paths in the `areas` section of `.daggry/project.yaml`, each with an optional role and description. A step's scope and a `protect.paths` entry name one as `area:<name>`, and the tenant's `projects[].areas` or a run request names areas as the scope of a run. Today a step's scope is `nothing`, `anywhere` or a list of globs, and a run has no scope of its own. |
| Paths a project protects | Direction | `protect.paths` in the project config, and the default protection of the scripts a check runs. Today the protected set is the always-protected paths and the frozen tests. See [Protected paths](/reference/protected-paths). |
| Project config checks and canonical verification | Direction | Named checks in `.daggry/project.yaml` and one canonical check, `verification.canonical`, that a `verify` step measures. Today the profile holds one test command. See [Project config](/reference/project-config). |
| Result contracts beyond libtest lines | Direction | `exit-code`, `junit-xml`, `tap`, `sarif` and `json` as named contracts for a check's output. Today the runner reads libtest-style lines only, and a measurement holds per-test records only. |
| Agent-exposed preview checks | Direction | A check with `expose: agent` that the agent calls in the pod as a preview, never as evidence. Today the agent's preview is the `validate` tool. |
| Tenant assigns workflows to projects | Direction | `projects[]` in the tenant config lists the workflows, agents, approval points and areas for each repository. Today a workflow is a file given to `daggry run --workflow <file>` with the repository named beside it. |
| Tenant config standard | Direction | Today the cluster admin sets the lease length, the concurrency cap, the job image and the model credential once for the whole installation. See [Deploy Daggry](/guide/how-to/deploy). |
| Conformance suite | Direction | No suite exists. [Conformance](/reference/conformance) states what it is to test. |
| Control plane | Exists | One backend that holds the keys, seals, judges and serves the API. |
| Conductor as its own module | Direction | Today the control plane also decides the next step and manages leases, and a launcher turns each job attempt into a pod. |
| Leases as the authority on liveness | Exists | A lapsed lease starts a new attempt from the last sealed commit. |
| Deterministic runner and agent runner as two modules | Direction | Today one runner in the pod runs commands, checks and the engine. The `verify` step already measures as a different unix user, after the agent process has ended. |
| Engine adapter | Exists | Two engines run behind it: the replay engine and the live coding-agent adapter. |
| Runners other than Kubernetes pods | Direction | Today every job runs in a pod. |

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
