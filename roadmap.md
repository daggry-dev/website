# Roadmap

Every other page of this site describes the complete platform. This page is the one place that states build status: what is built, what is not built, the order of the three waves and the points the design leaves open.

Daggry is not publicly released. Installation is from source, for early users.

## Build status

Status as of 2026-11-24. No wave exit test has passed, and the shapes of the schemas can still change.

| Area | Built | Not built |
|---|---|---|
| Evidence | The envelope, digests, the signed chain, one log per tenant, fact classes, the validator contract, all eight kinds with schemas and `daggry verify`. | The signed head, revocation, tombstoning and older-major decoding. Lineage by `parents` is filled for `verdict` and `approval` only. Kinds from a namespace other than `evidence` and `daggry` are refused as unknown. |
| Measurement | A measurement with a label, a revision, an exit code and per-test records. | The `check`, `contract`, `outcome` and `findings` fields, one measurement for each supporting check, and threshold findings. |
| Verification | The `verify` step measures a clean copy of the code with one test command, as a different unix user, and reads libtest-style result lines. `criterion-coverage` and `red-proof` run in a run. | The result contracts `exit-code`, `junit-xml`, `tap`, `sarif` and `json`. Lints and coverage in a measurement, the witness rule, external validators and `judged` facts. |
| Workflow | Strict YAML, the five step kinds, bounded loops, a published schema, `approve` and `approve --unfreeze`, and the `open-pr` effect. The loader reads a file that holds `steps` only. | The `format` header, extension keys, extension step kinds, `check` on a `verify` step and area references in a scope. Delegation to other agents, a review of the finished run and parallel steps. |
| Gates | The gate grammar and the reads of derived fields. | Reads of `meta` in a gate. |
| Project config | A repository file that holds one test command. | `.daggry/project.yaml`: the `format` header, `project`, `areas`, named checks, the canonical check, supporting checks, thresholds, `protect.paths`, checks exposed to the agent and extension keys. |
| Tenant config | The cluster admin sets the lease length, the concurrency cap, the job image and the model credential once for the whole installation. A workflow reaches the control plane as a file given to `daggry run --workflow <file>`. | The tenant config document: the workflow catalogue, orchestration limits for each tenant, the roster, runner images and classes, project entries and the extension registry. |
| Protection | The always-protected paths, the scope of a step, frozen tests, restore in the pod and a recheck in the control plane. The platform's own instructions are read-only in the pod. A project's own agent config is read from the working tree and protected by the boundary check. | The paths a project adds, the default protection of the scripts a check runs, the scope of a run, and a human grant for protected paths other than `.daggry/**`. |
| Modules | The control plane holds the keys, seals, judges and serves the API. It also decides the next step and manages leases, and a launcher turns each job attempt into a pod. A lapsed lease starts a new attempt from the last sealed commit. One runner in one pod runs commands, checks and the engine. | The conductor as its own module. Separate runner classes for the deterministic runner and the agent runner. Runners other than Kubernetes pods. |
| Engine | The engine adapter, the replay engine, the live coding-agent adapter and the tool server that offers `submit` and `validate`. Two live smoke runs passed on 2026-11-16. | `ask_human` and `delegate`. |
| Conformance | The published test vectors. | A conformance suite. |
| Interfaces and deployment | The CLI commands `run`, `status`, `logs`, `verify` and `approve`. Helm charts with a SQLite log and filesystem blobs. | `stop`, `retry`, `doctor` and `update`. Postgres and S3 storage. |

To try the parts that are built, follow [Getting started](/guide/getting-started).

## The three waves

A wave is a milestone, accepted when its exit test passes. The exit test is written first. The design gives no dates. The table lists what each wave adds, in terms of what you can do.

| Wave | What you can do |
|---|---|
| 1. Spine | Install Daggry on Kubernetes with Helm charts. Describe work as a YAML workflow and run it with `run`, `status`, `logs`, `verify` and `approve`. Turn a bug into a pull request with the red-then-green loop: an agent step writes the plan and its criteria, you approve the plan, each test is shown to fail first, and code re-checks the result. The agent runs through the coding-agent adapter or the replay engine. Test facts are measured against the base commit, for Rust projects only. |
| 2. Team and conversation | Name specialist agents on a roster and let a lead hand parts of the work to a delegate. Apply a project's own agent instructions on top of a run. Approve a plan or answer a question by a verified comment on the issue or pull request. Hold a dialogue with the agent on an issue or pull request, and let an agent ask a person a question with `ask_human`. Settle a disagreement about a test in a dispute step. |
| 3. Judge and review | Let a model judge one criterion you name, under rules you approve, labelled `judged`. Set a check mode for each plan criterion. Keep transcripts with secrets scrubbed. Run a review of a finished run that opens an issue whose citations code confirms. |

### Exit tests

- **Wave 1.** A real issue becomes a pull request with no human input beyond approving the plan, a step cannot tamper with the log, the stored files or a protected path, the check measures exactly the commit that lands on the branch, and a runner that is killed mid-run is taken over by a second attempt.
- **Wave 2.** A real issue runs with a lead and one delegate, a project specialist is admitted as a delegate only, and a plan dialogue of several turns ends in an approval bound to the plan's digest.
- **Wave 3.** An approved plan with a `judged` criterion gates a pull request, and a review of a finished run opens an issue whose citations code confirms.

### Beyond the waves

The platform holds more than the three waves build. None of the items below belongs to a wave.

| Area | Design |
|---|---|
| Modules and open standards | The project config, the tenant config, the workflow `format` header and its extensions, the result contracts, the conductor as its own module and the separate runner classes. See [The modules](/guide/concepts/modules), [Open standards](/guide/concepts/standards) and [The tenant defines the factory](/guide/concepts/tenant). |
| Signed head | A signed chain head kept outside the cluster, so that dropping entries from the end of a chain is visible. |
| Witness rule | A reviewer's finding gates work only when code confirms what it cites. |
| Gate reads of `meta` | A gate reads the values that code stamps in an artifact's `meta`. |
| Revocation and tombstoning | Revoking an approval as its own artifact. Removing a transcript blob without breaking the chain. |
| Older-major decoding | A reader decodes an older major of a kind for audit only. |
| External validators | A validator from outside the platform, admitted when the tenant lists it by name and version. |
| `stop` and `retry` | CLI commands to stop a run and to retry one. |
| `doctor` and `update` | Commands to repair an installation and to update it with a health-gated rollback. |
| `harness-change` workflow | The one path for changing agent instruction and tool-setting files. |
| More approval reasons | `answer-to-question` and `review-of-handover`, the second being a review of what one step passes to the next. |
| Parallel steps and join | Deferred until a workflow needs them. |

The design lists these as non-goals: a web interface, a policy language, a code index, agent memory, evaluations and a plugin marketplace.

## Open points

The owner has not decided these points. The other pages state none of them.

- **Engine of a step.** An `agent` step names an engine in its `engine` key, and each agent on the tenant's roster has an engine. Which of the two chooses the engine a step runs on is open. See [agent](/reference/workflow-schema#agent) and [agents](/reference/tenant-config#agents).
- **Tenant config in the run lock.** The fields of a run lock are the validators, the boundary rules, the image digest and the workflow digest. Whether a run also pins the tenant config it started under is open. See [run lock](/reference/kinds#daggry-run-lock-1) and [Where it lives](/reference/tenant-config#where-it-lives).
- **Areas in a run request.** A run request can name areas to narrow the scope of a run. The key by which it names them is open. See [The scope of a run](/reference/protected-paths#the-scope-of-a-run) and [HTTP API](/reference/api#routes).

Three more points are not defined on the reference pages:

- **Areas in the run lock.** How an area reference and the scope of a run are written into the boundary rules of a [run lock](/reference/kinds#daggry-run-lock-1).
- **A catalogue workflow in a run request.** The tenant config says a run uses a workflow from the catalogue, by name or by the repository's default. `daggry run` and the run request take the workflow as a file. How a run request names a catalogue workflow is not defined.
- **Gate reads of supporting checks.** A `verify` step seals one measurement for each check it measures. Which of them a `steps.<id>.measurement` read in a gate takes is not defined.
