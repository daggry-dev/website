# Glossary

*Reference*

A site that uses two names for one thing makes you learn it twice. This page gives every term one definition and a link to the page that explains it. Read the first table if you are new: its terms cover the whole guide. Use the second table when a reference page uses a term you do not know.

A term that belongs to one kind of work is marked with its binding.

## Words every page uses

The table defines the terms the guide uses, grouped as you meet them: Daggry and its modules, validators, workflows, evidence, and projects and people.

| Term | Definition | Read more |
|---|---|---|
| Daggry | A factory kit: modules you set up as your own factory, where agents do the work and code checks it. | [What is Daggry?](/guide/) |
| factory | What you run with Daggry: it takes in work, puts agents on it and hands back checked results. | [What is Daggry?](/guide/) |
| module | One of Daggry's seven building blocks, each with one job. | [The modules and where they run](/guide/concepts/modules) |
| conductor | The module that decides which step runs next and starts runners. It holds no key and seals nothing. | [The modules and where they run](/guide/concepts/modules) |
| control plane | The module that holds the keys, checks results and writes the trail. | [The modules and where they run](/guide/concepts/modules) |
| runner | The throwaway environment that runs one job. It never holds the signing key. | [The modules and where they run](/guide/concepts/modules) |
| engine | The coding-agent program an agent runs on. A tenant can replace it. | [Module contracts](/reference/contracts#engine-interface) |
| forge | Where work comes from and where results go. In the software binding it is a Git host. | [Module contracts](/reference/contracts#forge-and-effect-interface) |
| store | Where the trail is kept. | [Module contracts](/reference/contracts#store-interfaces) |
| validator | Named code that checks the work and returns pass or fail. A `verify` step names one or more. | [Validators](/reference/validators) |
| main validator | The one validator a project names as its proof that the work is good. The reference `project` resolves to it. The key is `verification.canonical`. | [Project config](/reference/project-config#verification) |
| script validator | A validator you write as a script. The project config declares it as `project/<name>`, or the tenant config as `tenant/<name>`. | [Validators](/reference/validators#the-three-sources) |
| built-in validator | A validator that ships with Daggry, in the `daggry` namespace. | [Validators](/reference/validators#built-in-validators) |
| native validator | A validator installed by the cluster admin that reads only sealed records. The tenant admin approves the exact version. | [Validators](/reference/validators#write-a-native-validator) |
| workflow | A file that lists the steps of a piece of work, in order. | [Workflow file](/reference/workflow-schema) |
| step | One unit of work in a workflow. It has a kind: `agent`, `command`, `verify`, `human` or `effect`. | [Workflow file](/reference/workflow-schema#steps) |
| output | What a step hands to the next step. | [Workflow file](/reference/workflow-schema#steps) |
| loop | Steps that repeat once for each plan item, up to a limit. It is an entry in a workflow, not a step kind. | [Workflow file](/reference/workflow-schema#loop) |
| loop limit | The most iterations a loop can run. The key is `max`. | [Workflow file](/reference/workflow-schema#loop) |
| iteration | One pass of a loop. | [Workflow file](/reference/workflow-schema#loop-rules) |
| gate | The rule that decides whether a loop can stop. It is written in a loop's `until`. | [Gate expressions](/reference/gates) |
| plan | The list of items an agent proposes and you approve. | [Record kinds](/reference/kinds#evidence-plan-1) |
| plan item | One entry in a plan. The files call it a criterion. | [Record kinds](/reference/kinds#evidence-plan-1) |
| proof | A test the run writes that fails before the work and passes after it. | [Validators](/reference/validators#baseline-proof) |
| approval | A point where the run stops until you approve, and the record of your yes. | [Record kinds](/reference/kinds#evidence-approval-1) |
| effect | The step that delivers the result, for example by opening a pull request. | [Workflow file](/reference/workflow-schema#effect) |
| scope | The paths a step can write. | [Protected paths](/reference/protected-paths#scope) |
| protected path | A path no agent can change, whatever a step's scope and whatever a workflow says. | [Protected paths](/reference/protected-paths) |
| frozen path | A proof file the agent can no longer change once it is sealed. | [Protected paths](/reference/protected-paths#frozen-paths) |
| claim | What an agent says it did, before code has checked it. A claim is never evidence. | [Why you can trust a run](/guide/concepts/trust) |
| seal | To check a result with code, then sign it so that a later change shows. | [Why you can trust a run](/guide/concepts/trust) |
| record | One sealed result. | [Evidence record format](/reference/envelope) |
| evidence | Sealed records, as opposed to claims. | [Why you can trust a run](/guide/concepts/trust) |
| evidence trail (trail) | The signed, linked list of every record, in order. The specification pages call it the log or the chain. | [Why you can trust a run](/guide/concepts/trust) |
| fingerprint | A short code computed from every byte of a record. The reference pages call it a digest. | [Evidence record format](/reference/envelope#digest) |
| signing key | The key that signs records. It stays in the control plane. | [The modules and where they run](/guide/concepts/modules) |
| run | One execution of a workflow for one work item. | [CLI](/reference/cli) |
| work item | The request a run answers. In the software binding it is an issue. | [Record kinds](/reference/kinds#daggry-work-item-1) |
| project | A body of work with its own project config. | [Project config](/reference/project-config) |
| workspace | A project's versioned files, where a run works. In the software binding it is a Git repository. | [Bindings](/reference/bindings) |
| project config | The file `.daggry/project.yaml`. It says how to check one project and which paths to protect in it. | [Project config](/reference/project-config) |
| tenant | A team with its own factory: its own settings, agents and trail. | [Tenant config](/reference/tenant-config) |
| tenant config | The file that says how a tenant's factory works: workflows, agents, limits and approvals. Its rules win over the project config's and the workflow's. | [Tenant config](/reference/tenant-config) |
| binding | A ready-made setup for one kind of work. Software is the first. | [Bindings](/reference/bindings) |
| open formats | The four published formats: workflow, project config, tenant config and evidence. | [Open formats](/reference/open-formats) |
| cluster admin | The person who installs Daggry. | [Install Daggry](/guide/how-to/deploy) |
| tenant admin | The person who writes the tenant config. | [Tenant config](/reference/tenant-config) |
| project owner | The person who writes the project config. | [Project config](/reference/project-config) |

## Specification terms

The table lists, in alphabetical order, the terms that only the reference pages use.

| Term | Definition | Read more |
|---|---|---|
| adapter | A deterministic program that turns one tool's own output into a result document. A tenant registers it as `<namespace>/<adapter>`, and a result contract names it. | [Bindings](/reference/bindings) |
| admission | The tenant's decision that a validator counts as evidence: a project's script validator in `projects[].validators.admit`, and a native validator by name, version and digest. | [Project config](/reference/project-config#admission) |
| agent runner | One of the two ways the runner runs a step: it starts an engine through an engine adapter to do the work of an `agent` step. Whatever the agent hands in is a claim. | [Module contracts](/reference/contracts#runner-protocol) |
| area | A named group of paths in a workspace, defined in the `areas` section of the project config, with an optional role and description. A step, a tenant or a run request names an area to set a scope, and the project names one to protect it. | [Project config](/reference/project-config#areas) |
| artifact | A sealed value in the one envelope, with a kind and parents. The guide calls it a record. | [Evidence record format](/reference/envelope) |
| attempt | One try of a job. A takeover after a lapsed lease, or an `approve` at a `human` step, starts a new attempt. | [Module contracts](/reference/contracts#runner-protocol) |
| base | The label of a measurement of the baseline. | [Record kinds](/reference/kinds) |
| baseline | The version of the workspace a run starts from. The project config is read from it. | [Project config](/reference/project-config) |
| baseline proof | The proof that a criterion's test says something about the work: the test fails on the baseline and passes after the work. The built-in `daggry/baseline-proof` judges it. In the software binding it is the red proof: a new test that fails on the base commit. | [Validators](/reference/validators#baseline-proof) |
| blob | Bytes stored beside the log and named by the SHA-256 of their content, such as a workflow file. | [Evidence record format](/reference/envelope) |
| boundary check | The check of a step's change against the protected paths, the frozen paths and the scope. It runs in the pod and again in the control plane, and the second check is the authority. | [Protected paths](/reference/protected-paths#enforcement) |
| canonical JSON | The exact bytes an artifact is hashed in: no whitespace, keys sorted by UTF-8 bytes, integers only. | [Evidence record format](/reference/envelope#canonical-json) |
| canonical validator | The key name of the main validator: the one script validator in a project config that the reference `project` resolves to. | [Project config](/reference/project-config#verification) |
| catalogue | The workflows a tenant offers, listed in the `workflows` section of the tenant config. A run uses only a workflow from the catalogue. | [Tenant config](/reference/tenant-config#workflows) |
| chain | One sequence of linked log entries, verifiable from its first entry. Each tenant has exactly one. The guide calls it the evidence trail. | [Evidence record format](/reference/envelope) |
| change | A set of differences made to the workspace. Also the sealed record of one: the version it ends at, the paths it changed and the frozen set. | [Record kinds](/reference/kinds) |
| claimed | A fact class: an agent wrote the value. Gates cannot read it. | [Gate expressions](/reference/gates) |
| clean copy | A fresh copy of the workspace at one sealed version, where no agent can write. A script validator runs on one. | [Validators](/reference/validators#the-three-sources) |
| command step | A step that runs a shell line in the pod. | [Workflow file](/reference/workflow-schema) |
| conformance | What an implementation does to follow the open formats: it accepts, refuses and produces what the rules say and passes the published test vectors. It has three levels: verifier, signer and factory. | [Conformance](/reference/conformance) |
| contract | A published interface between two modules: a file, a protocol or a document. A module is replaceable when it passes the contract's tests. | [Module contracts](/reference/contracts) |
| criterion | An acceptance criterion with an id in the approved plan. The guide calls it a plan item. | [Record kinds](/reference/kinds) |
| derived | A fact class: code computed the value from sealed inputs. Gates can read it. | [Gate expressions](/reference/gates) |
| deterministic runner | One of the two ways the runner runs a step: it runs commands, script validators and adapters, which give the same result for the same input. It never starts a model. | [Module contracts](/reference/contracts#runner-protocol) |
| digest | The SHA-256 hash that names a sealed artifact by its content. Parents and blobs are referenced by digest. The guide calls it a fingerprint. | [Evidence record format](/reference/envelope) |
| draft | An artifact before it is sealed. It holds `kind`, `id` and `body` only, and code adds every other field. | [Evidence record format](/reference/envelope#fields) |
| effect step | A step that the control plane runs: an idempotent side effect that the tenant registers, such as delivering a change. | [Workflow file](/reference/workflow-schema#effect) |
| engine adapter | The program in the agent runner that drives one engine: it gives the engine a prompt, tools, a working copy and a credential by reference. | [Module contracts](/reference/contracts#engine-interface) |
| entry | One appended record of the log: the previous link and one sealed artifact. | [Evidence record format](/reference/envelope) |
| envelope | The one JSON shape every artifact has: the draft's `kind`, `id` and `body`, plus the seal fields that only code adds. | [Evidence record format](/reference/envelope) |
| extension key | A key the standard does not define, written `<namespace>/<key>`. A reader that does not know it ignores and preserves it. An unknown key without a namespace is refused. | [Project config](/reference/project-config) |
| fact | A named value in a verdict, a boolean, an integer or a string, that a gate can read. | [Gate expressions](/reference/gates) |
| fact class | Whether a field is `claimed`, `derived` or `judged`. | [Gate expressions](/reference/gates) |
| finding | One thing a validator reports: an id, an outcome of `pass`, `fail`, `error` or `skip`, an optional locator and a message. | [Project config](/reference/project-config#result-document) |
| genesis digest | The digest of no history: 64 zero characters. It is the `prev` of a chain's first entry. | [Evidence record format](/reference/envelope) |
| green | A loop iteration in which every step passed. The loop advances to the next item. | [Workflow file](/reference/workflow-schema#loop-rules) |
| head | In a chain, the link of the last entry. As a measurement label, a measurement of the last sealed version of the workspace. | [Evidence record format](/reference/envelope) |
| human step | The step kind (`kind: human`) that holds an approval: it waits for a person. `daggry approve` completes it. | [Workflow file](/reference/workflow-schema) |
| job | A group of steps that share one pod and workspace. A run is one job by default. | [Workflow file](/reference/workflow-schema) |
| judge | The control plane's part of verification: it runs built-in and native validators over sealed records and seals the verdicts that open gates. | [Validators](/reference/validators#measure-preview-and-judge) |
| judged | A fact class: a model's verdict under a rubric a person approved for one named criterion. It is the one verdict a model gives. | [Gate expressions](/reference/gates) |
| key id | The name of the public key that checks a seal: `ed25519-` and 16 hex digits. | [Evidence record format](/reference/envelope) |
| kind | The name and major version of an artifact's schema: `<namespace>/<name>@<major>`. | [Record kinds](/reference/kinds) |
| label | A short name from an open vocabulary, such as a validator's `kind` or an area's `role`. In a measurement, the field that says which version was measured: `base`, `head` or `red`. | [Project config](/reference/project-config#project) |
| launcher | The program that turns a job attempt into a pod and watches it. | [Helm chart values](/reference/helm-chart#run-the-launcher-in-its-own-pod) |
| lease | A time-limited claim on a job attempt, kept alive by the runner's heartbeat. It is the one authority on liveness. | [Module contracts](/reference/contracts#runner-protocol) |
| link | SHA-256 of the previous link and the entry's digest. The signature covers it. | [Evidence record format](/reference/envelope) |
| log | The append-only, hash-chained list of everything the control plane sealed. It is the source of truth for state. The guide calls it the evidence trail. | [Evidence record format](/reference/envelope) |
| measure | The part of verification that runs script validators on a clean copy of the workspace and records one measurement for each. | [Validators](/reference/validators#measure-preview-and-judge) |
| measurement | The sealed result of one script validator on one version of the workspace: the validator, its result contract, the exit code, an outcome, the findings and the metrics. | [Record kinds](/reference/kinds#evidence-measurement-1) |
| meta | The envelope's optional map from namespaced keys to scalar values, stamped by code at seal time. | [Evidence record format](/reference/envelope) |
| metric | A named number a validator measured, such as a count or a share. | [Project config](/reference/project-config#result-document) |
| namespace | The part before the `/` in a kind, a validator reference, an adapter name or an extension key. It names the party that defines the name. | [Project config](/reference/project-config#extension-keys) |
| observation | A sealed record that is not a verdict: `protected-restored` or `step-failed`. It is kept for the record. | [Record kinds](/reference/kinds) |
| outcome | What a result says: `pass`, `fail` or `error`. A finding can also have the outcome `skip`. | [Project config](/reference/project-config#result-document) |
| parents | The digests of the artifacts an artifact builds on. | [Evidence record format](/reference/envelope) |
| pod | The Kubernetes form of a runner: the throwaway, isolated environment a job runs in. | [Install Daggry](/guide/how-to/deploy) |
| prev | The link of the entry before this one in the chain. | [Evidence record format](/reference/envelope) |
| preview | A validator run in the pod for fast feedback, on the working copy. A preview is never evidence. | [Validators](/reference/validators#measure-preview-and-judge) |
| proof step | An `agent` step with `freeze` in a loop. It writes the proof for a criterion, and its matching paths are frozen when it is sealed. | [Workflow file](/reference/workflow-schema#red-then-green) |
| red | The label of the measurement in a baseline proof, and the fact that proof gives. Also a loop iteration whose `verify` step did not pass, so the same item repeats. | [Validators](/reference/validators#baseline-proof) |
| result | What a script validator found, in the one standard form: an outcome, findings and metrics. It is sealed as a measurement. | [Validators](/reference/validators#result-and-verdict) |
| result contract | How Daggry reads what a script validator reports: `exit-code`, `document` or an adapter, `<namespace>/<adapter>`. The guide calls it the result format. | [Project config](/reference/project-config#result-contracts) |
| result document | The one standard form of a result, `daggry/result@1`: an outcome, findings and metrics. | [Project config](/reference/project-config#result-document) |
| revision | The name of one version of a workspace, in the form its binding gives. In the software binding it is a commit. | [Bindings](/reference/bindings) |
| roster | The named agents of a tenant, listed in `agents.roster` of the tenant config. Each has an engine. | [Tenant config](/reference/tenant-config#agents) |
| run lock | The sealed record of what a run pinned at start: validators, boundary rules, image and workflow. | [Record kinds](/reference/kinds) |
| run request | What a client sends to start a run: the workflow, the workspace and the work item. | [HTTP API](/reference/api#routes) |
| runner class | A named isolation class in `runners.classes` of the tenant config. It says whether a pod reaches the network and whether it holds a model credential. | [Tenant config](/reference/tenant-config#runners) |
| signer | An implementation that seals artifacts and appends them to a chain. It is the second conformance level. | [Conformance](/reference/conformance#level-2-signer) |
| standard | The specification of the four open formats, which any factory can implement. | [Open formats](/reference/open-formats) |
| status | What a verdict decided: `pass`, `fail` or `inconclusive`. | [Record kinds](/reference/kinds#evidence-verdict-1) |
| tenant token | The credential a tenant's client sends with every call. A token reaches one tenant only. | [HTTP API](/reference/api#conventions) |
| threshold | A limit on a number that a validator gives, set in `verification.thresholds` of the project config. A missed threshold fails the verification. | [Project config](/reference/project-config#verification) |
| unfreeze | The human grant that frees one frozen path for one iteration: `daggry approve <run-id> --unfreeze <path>`. | [Protected paths](/reference/protected-paths) |
| validator contract | What defines a validator: the inputs it is given, the result and the verdict it yields, determinism and its identity. | [Validators](/reference/validators#the-validator-contract) |
| verdict | The artifact a validator produces, with a status, findings and derived facts. | [Record kinds](/reference/kinds) |
| verifier | An implementation that reads a chain and says whether it holds. It needs the public key and no secret. It is the first conformance level. | [Conformance](/reference/conformance#level-1-verifier) |
| verify step | The step that runs the validators it names on the last sealed version of the workspace. It is not the `daggry verify` command, which checks the log. | [Workflow file](/reference/workflow-schema#verify) |
| witness | Evidence for a finding that code can confirm, such as a quoted passage inside the change. A finding without a witness is advice. | [Validators](/reference/validators#measure-preview-and-judge) |
| working copy | The copy of the workspace in an agent's pod, which the agent can write. Nothing that runs on it is evidence. | [Validators](/reference/validators#measure-preview-and-judge) |
