# Glossary

*Reference*

For the idea, read [How Daggry works](/guide/).

This page defines the terms Daggry uses, in alphabetical order. It is for every reader of the site. Each entry has one definition and a link to the page that explains the term.

The terms name no tool and no kind of work. A term that belongs to one kind of work is marked with its binding.

## Twelve words to know first

These twelve words cover most of what you read on this site: approval, check, claim, evidence, evidence trail, pod, run, seal, step, validator, workflow and workspace. The table defines each of them once.

## Terms

The table lists every term, with one definition for each.

| Term | Definition | Read more |
|---|---|---|
| adapter | A deterministic program that turns one tool's own output into a result document. A tenant registers it as `<namespace>/<adapter>`, and a result contract names it. | [Bindings](/reference/bindings) |
| admission | The tenant's decision that a validator counts as evidence: a project's script validator in `projects[].validators.admit`, and a native validator by name, version and digest. | [Project config](/reference/project-config#admission) |
| agent runner | One of the two kinds of step execution the runner provides: it runs agentic or model-generated work by starting an agent engine through an engine adapter. Whatever the agent hands in is a claim. | [The modules](/guide/concepts/modules) |
| approval | The moment a person decides, and the sealed artifact that records it. The artifact binds a person's decision to one digest: the pending plan or change, or the frozen file digest for an unfreeze. | [Kinds and schemas](/reference/kinds) |
| area | A named group of paths in a workspace, defined in the `areas` section of the project config, with an optional role and description. A step, a tenant or a run request names an area to set a scope, and the project names one to protect it. | [Project config](/reference/project-config#areas) |
| artifact | A sealed value in the one envelope, with a kind and parents. | [Envelope](/reference/envelope) |
| attempt | One try of a job. A takeover after a lapsed lease, or an `approve` at a `human` step, starts a new attempt. | [Work graphs](/guide/concepts/workflows) |
| base | The label of a measurement of the baseline. | [Kinds and schemas](/reference/kinds) |
| baseline | The version of the workspace a run starts from. The project config is read from it. | [Project config](/reference/project-config) |
| baseline proof | The proof that a criterion's check says something about the work: the check fails on the baseline and passes after the work. The built-in `daggry/baseline-proof` judges it. In the software binding it is the red proof: a new test that fails on the base commit. | [Validators](/reference/validators#baseline-proof) |
| binding | A named set of adapters, validators, kinds, effects and conventions that maps the neutral standards onto one kind of work and one set of tools, such as the software binding. | [Bindings](/reference/bindings) |
| blob | Bytes stored beside the log and named by the SHA-256 of their content, such as a workflow file. | [Envelope](/reference/envelope) |
| boundary check | The check of a step's change against the protected paths, the frozen paths and the scope. It runs in the pod and again in the control plane, and the second check is the authority. | [Protected paths](/reference/protected-paths#enforcement) |
| built-in validator | A validator the platform ships, in the `daggry` namespace. It runs with the control plane over sealed records. | [Validators](/reference/validators#built-in-validators) |
| canonical JSON | The exact bytes an artifact is hashed in: no whitespace, keys sorted by UTF-8 bytes, integers only. | [Envelope](/reference/envelope#canonical-json) |
| canonical validator | The one script validator in a project config that the reference `project` resolves to. Its result is the project's verification evidence. | [Project config](/reference/project-config#verification) |
| catalogue | The workflows a tenant offers, listed in the `workflows` section of the tenant config. A run uses only a workflow from the catalogue. | [Tenant config](/reference/tenant-config#workflows) |
| chain | One sequence of linked log entries, verifiable from its first entry. Each tenant has exactly one. Prose elsewhere calls it the evidence trail. | [Envelope](/reference/envelope) |
| change | A set of differences made to the workspace. Also the sealed record of one: the version it ends at, the paths it changed and the frozen set. | [Kinds and schemas](/reference/kinds) |
| check | Any deterministic procedure that inspects the workspace and reports a result. It can inspect a program, a document, a dataset, a configuration or a design file. A script validator runs one. | [Validators](/reference/validators) |
| claim | What an agent produced before code checked and sealed it. A claim is never evidence. | [Why you can trust a run](/guide/concepts/trust) |
| claimed | A fact class: an agent wrote the value. Gates cannot read it. | [Gate expressions](/reference/gates) |
| clean copy | A fresh copy of the workspace at one sealed version, where no agent can write. A script validator runs on one. | [Validators](/reference/validators#the-three-sources) |
| cluster admin | The person who installs and runs a Daggry factory. | [Deploy Daggry](/guide/how-to/deploy) |
| command step | A step that runs a shell line in the pod. | [Workflow schema](/reference/workflow-schema) |
| conductor | The module that orders the steps of a run and schedules job attempts across runners. It holds no key and seals nothing. | [The modules](/guide/concepts/modules) |
| conformance | What an implementation does to follow the standards: it accepts, refuses and produces what the rules say and passes the published test vectors. It has three levels: verifier, signer and factory. | [Conformance](/reference/conformance) |
| contract | A published interface between two parts of a factory: a document, a protocol or a file. A part is replaceable when it passes the contract's tests. | [Contracts](/reference/contracts) |
| control plane | The one backend. It holds the keys, seals, judges and serves the API. In a default install it also hosts the conductor, which decides the next step. | [Where it runs](/guide/concepts/architecture) |
| criterion | An acceptance criterion with an id in the approved plan. | [Kinds and schemas](/reference/kinds) |
| derived | A fact class: code computed the value from sealed inputs. Gates can read it. | [Gate expressions](/reference/gates) |
| deterministic runner | One of the two kinds of step execution the runner provides: it runs commands, script validators and adapters, which give the same result for the same input. It never starts a model. | [The modules](/guide/concepts/modules) |
| digest | The SHA-256 hash that names a sealed artifact by its content. Parents and blobs are referenced by digest. | [Envelope](/reference/envelope) |
| draft | An artifact before it is sealed. It holds `kind`, `id` and `body` only, and code adds every other field. | [Envelope](/reference/envelope#fields) |
| effect step | A step that the control plane runs: an idempotent side effect that the tenant registers, such as handing a change over. | [Workflow schema](/reference/workflow-schema) |
| engine | The agent program that does an agent step's work. It is replaceable for each tenant. | [Contracts](/reference/contracts#engine-interface) |
| engine adapter | The part of the agent runner that drives one engine: it gives the engine a prompt, tools, a working copy and a credential by reference. | [Contracts](/reference/contracts#engine-interface) |
| entry | One appended record of the log: the previous link and one sealed artifact. | [Envelope](/reference/envelope) |
| envelope | The one JSON shape every artifact has: the draft's `kind`, `id` and `body`, plus the seal fields that only code adds. | [Envelope](/reference/envelope) |
| evidence | A sealed artifact whose acceptance a validator or a human gate decided. | [Why you can trust a run](/guide/concepts/trust) |
| evidence trail | The signed, linked record of everything the control plane sealed, in order. Reference pages call it the log or the chain. | [Why you can trust a run](/guide/concepts/trust) |
| extension key | A key the standard does not define, written `<namespace>/<key>`. A reader that does not know it ignores and preserves it. An unknown key without a namespace is refused. | [Project config](/reference/project-config) |
| fact | A named value in a verdict, a boolean, an integer or a string, that a gate can read. | [Gate expressions](/reference/gates) |
| fact class | Whether a field is `claimed`, `derived` or `judged`. | [Gate expressions](/reference/gates) |
| factory | A system that takes in work, puts agents on it and hands back checked results. A tenant config says how one factory works. | [The tenant defines the factory](/guide/concepts/tenant) |
| finding | One thing a check reports: an id, an outcome of `pass`, `fail`, `error` or `skip`, an optional locator and a message. | [Project config](/reference/project-config#result-document) |
| forge | The part that reads work items and delivers a change. In the software binding it is a git host. | [Contracts](/reference/contracts#forge-and-effect-interface) |
| frozen path | A path that a proof step sealed in a previous loop iteration, recorded with its file digest. A step cannot change it. In the software binding the frozen paths are tests. | [Protected paths](/reference/protected-paths#frozen-paths) |
| gate | A rule over derived facts that a run must pass. It is written as an expression in a loop's `until`. | [Gate expressions](/reference/gates) |
| genesis digest | The digest of no history: 64 zero characters. It is the `prev` of a chain's first entry. | [Envelope](/reference/envelope) |
| green | A loop iteration in which every step passed. The loop advances to the next item. | [Workflow schema](/reference/workflow-schema#loop-rules) |
| head | In a chain, the link of the last entry. As a measurement label, a measurement of the last sealed version of the workspace. | [Envelope](/reference/envelope) |
| human step | The step kind (`kind: human`) that holds an approval: it waits for a person. `daggry approve` completes it. | [Workflow schema](/reference/workflow-schema) |
| job | A group of steps that share one pod and workspace. A run is one job by default. | [Workflow schema](/reference/workflow-schema) |
| judge | The control plane's part of verification: it runs built-in and native validators over sealed records and seals the verdicts that open gates. | [Validators](/reference/validators#measure-preview-and-judge) |
| judged | A fact class: a model's verdict under a rubric a person approved for one named criterion. It is the one verdict a model gives. | [Gate expressions](/reference/gates) |
| key id | The name of the public key that checks a seal: `ed25519-` and 16 hex digits. | [Envelope](/reference/envelope) |
| kind | The name and major version of an artifact's schema: `<namespace>/<name>@<major>`. | [Kinds and schemas](/reference/kinds) |
| label | A short name from an open vocabulary, such as a validator's `kind` or an area's `role`. In a measurement, the field that says which version was measured: `base`, `head` or `red`. | [Project config](/reference/project-config#project) |
| launcher | The component that turns a job attempt into a pod and watches it. | [Deploy Daggry](/guide/how-to/deploy) |
| lease | A time-limited claim on a job attempt, kept alive by the runner's heartbeat. It is the one authority on liveness. | [Where it runs](/guide/concepts/architecture) |
| link | SHA-256 of the previous link and the entry's digest. The signature covers it. | [Envelope](/reference/envelope) |
| log | The append-only, hash-chained record of everything the control plane sealed. It is the source of truth for state. Prose elsewhere calls it the evidence trail. | [Envelope](/reference/envelope) |
| loop | A bounded sequential repeat of steps over a list, ended by a gate. It is an entry in a workflow, not a step kind. | [Workflow schema](/reference/workflow-schema) |
| measure | The part of verification that runs script validators on a clean copy of the workspace and records one measurement for each. | [Validators](/reference/validators#measure-preview-and-judge) |
| measurement | The sealed result of one check on one version of the workspace: the validator, its result contract, the exit code, an outcome, the findings and the metrics. | [Kinds and schemas](/reference/kinds#evidence-measurement-1) |
| meta | The envelope's optional map from namespaced keys to scalar values, stamped by code at seal time. | [Envelope](/reference/envelope) |
| metric | A named number a check measured, such as a count or a share. | [Project config](/reference/project-config#result-document) |
| namespace | The part before the `/` in a kind, a validator reference, an adapter name or an extension key. It names the party that defines the name. | [Project config](/reference/project-config#extension-keys) |
| native validator | A validator that implements the validator contract as a pure function over sealed records, in any language. The cluster admin installs it, and the tenant admits it by name, version and digest. | [Validators](/reference/validators#write-a-native-validator) |
| observation | A sealed record that is not a verdict: `protected-restored` or `step-failed`. It is kept for the record. | [Kinds and schemas](/reference/kinds) |
| outcome | What a check decided: `pass`, `fail` or `error`. A finding can also have the outcome `skip`. | [Project config](/reference/project-config#result-document) |
| parents | The digests of the artifacts an artifact builds on. | [Envelope](/reference/envelope) |
| pod | The throwaway, isolated environment a job runs in. | [Where it runs](/guide/concepts/architecture) |
| prev | The link of the entry before this one in the chain. | [Envelope](/reference/envelope) |
| preview | A validator run in the pod for fast feedback, on the working copy. A preview is never evidence. | [Validators](/reference/validators#measure-preview-and-judge) |
| project | The body of work a factory works on. | [Project config](/reference/project-config) |
| project config | The standard document for what is true of one workspace: what it is, its areas, its script validators, its one canonical validator and the paths it protects. It is the deterministic interface between a project and a factory, and names no workflow. It lives in the workspace and is read from the baseline. | [Project config](/reference/project-config) |
| proof step | An `agent` step with `freeze` in a loop. It writes what proves a criterion, and its matching paths are frozen when it is sealed. | [Workflow schema](/reference/workflow-schema#red-then-green) |
| protected path | A path that no step can change, whatever its scope and whatever a workflow says: the always-protected set, plus the paths a project config adds. | [Protected paths](/reference/protected-paths) |
| red | The label of the measurement in a baseline proof, and the fact that proof gives. Also a loop iteration whose `verify` step did not pass, so the same item repeats. | [Validators](/reference/validators#baseline-proof) |
| result | What a check found, in the one standard form: an outcome, findings and metrics. It is sealed as a measurement. | [Validators](/reference/validators#result-and-verdict) |
| result contract | How a factory reads what a script validator decided: `exit-code`, `document` or an adapter, `<namespace>/<adapter>`. | [Project config](/reference/project-config#result-contracts) |
| result document | The one standard form of a check's result, `daggry/result@1`: an outcome, findings and metrics. | [Project config](/reference/project-config#result-document) |
| revision | The name of one version of a workspace, in the form its binding gives. In the software binding it is a commit. | [Bindings](/reference/bindings) |
| roster | The named agents of a tenant, listed in `agents.roster` of the tenant config. Each has an engine. | [Tenant config](/reference/tenant-config#agents) |
| run | One execution of a workflow for a work item. | [Work graphs](/guide/concepts/workflows) |
| run lock | The sealed record of what a run pinned at start: validators, boundary rules, image and workflow. | [Kinds and schemas](/reference/kinds) |
| run request | What a client sends to start a run: the workflow, the workspace and the work item. | [HTTP API](/reference/api#routes) |
| runner | The program in the pod that runs a job's steps and the engine, and checks the work locally. It is also the module of that name, which provides two kinds of step execution: the deterministic runner and the agent runner. | [The modules](/guide/concepts/modules) |
| runner class | A named isolation class in `runners.classes` of the tenant config. It says whether a pod reaches the network and whether it holds a model credential. | [Tenant config](/reference/tenant-config#runners) |
| scope | The set of paths one step or one run can change. A step's scope is `nothing`, a list of globs and area references, or `anywhere` except protected paths and the automation folders a binding names. A run's scope is the areas the tenant or the run request names. | [Protected paths](/reference/protected-paths#scope) |
| script validator | A validator that is an executable or a script, declared in the project config (`project/<name>`) or the tenant config (`tenant/<name>`). It runs in the deterministic runner on a clean copy of the workspace, and code derives its verdict from its result. | [Validators](/reference/validators#the-three-sources) |
| seal | The control plane's signature on an artifact. It says code validated the artifact, not that the artifact is true. | [Why you can trust a run](/guide/concepts/trust) |
| signer | An implementation that seals artifacts and appends them to a chain. It is the second conformance level. | [Conformance](/reference/conformance#level-2-signer) |
| standard | One of the four open formats that any factory can implement: evidence, the workflow, the project config and the tenant config. | [Conformance](/reference/conformance) |
| status | What a verdict decided: `pass`, `fail` or `inconclusive`. | [Kinds and schemas](/reference/kinds#evidence-verdict-1) |
| step | A node of a workflow. Its kind is `command`, `agent`, `verify`, `human` or `effect`. | [Workflow schema](/reference/workflow-schema) |
| tenant | A party whose runs an installation hosts. Each tenant has one chain. | [Envelope](/reference/envelope) |
| tenant config | The standard document for how a tenant's factory works: its workflow catalogue, orchestration limits, agents, runners, validators, workspaces and bindings, and which workflows run on which workspace. Its rules win over the project config's and the workflow's. | [Tenant config](/reference/tenant-config) |
| tenant token | The credential a tenant's client sends with every call. A token reaches one tenant only. | [HTTP API](/reference/api#conventions) |
| threshold | A limit on a number that a validator gives, set in `verification.thresholds` of the project config. A missed threshold fails the verification. | [Project config](/reference/project-config#verification) |
| unfreeze | The human grant that frees one frozen path for one iteration: `daggry approve <run-id> --unfreeze <path>`. | [Protected paths](/reference/protected-paths) |
| validator | The part of a factory that checks work, and the extension point of verification. It takes sealed records, and for a script validator a clean copy of the workspace, and yields a result and a verdict. A `verify` step names one or more. The three sources are built-in, script and native. | [Validators](/reference/validators) |
| validator contract | What defines a validator: the inputs it is given, the result and the verdict it yields, determinism and its identity. | [Validators](/reference/validators#the-validator-contract) |
| verdict | The artifact a validator produces, with a status, findings and derived facts. | [Kinds and schemas](/reference/kinds) |
| verifier | An implementation that reads a chain and says whether it holds. It needs the public key and no secret. It is the first conformance level. | [Conformance](/reference/conformance#level-1-verifier) |
| verify step | The step that runs the validators it names on the last sealed version of the workspace. It is not the `daggry verify` command, which checks the log. | [Workflow schema](/reference/workflow-schema#verify) |
| witness | Evidence for a finding that code can confirm, such as a quoted passage inside the change. A finding without a witness is advice. | [Validators](/reference/validators#measure-preview-and-judge) |
| work item | The request the work answers, and the sealed record of it that starts a run. | [Kinds and schemas](/reference/kinds) |
| workflow | The document that lists the steps of the work, written as data. It is an entry in the tenant's catalogue, and its file is kept in a workspace the tenant chooses. `daggry run --workflow <file>` supplies one as a file. | [Workflow schema](/reference/workflow-schema) |
| working copy | The copy of the workspace in an agent's pod, which the agent can write. Nothing that runs on it is evidence. | [Validators](/reference/validators#measure-preview-and-judge) |
| workspace | The versioned collection of files and data the work lives in. A binding says what it is made of: in the software binding, a git repository. | [Bindings](/reference/bindings) |
