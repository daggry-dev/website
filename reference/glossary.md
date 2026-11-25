# Glossary

*Reference*

This page gives every term one definition and a link to the page that explains it. Read the first table if you are new: its terms cover the whole guide. Use the second table when a reference page uses a term you do not know.

## Words every page uses

The table lists the terms the guide uses, grouped as you meet them: Daggry and its modules, validators, workflows, evidence, and projects and people.

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
| validator | A command you declare. It measures the work, and Daggry seals the result as a measurement. | [Validators](/reference/validators) |
| main validator | The guides' name for the canonical validator. The reserved name `project` resolves to it. | [Project config](/reference/project-config#verification) |
| validator you define | A validator you write as a command and declare in the project config or the tenant config. A `verify` step names it by its bare name. | [Validators](/reference/validators#a-validator-is-a-command) |
| workflow | A file that lists the steps of a piece of work, in order. | [Workflow file](/reference/workflow-schema) |
| step | One unit of work in a workflow. It has a kind: `agent`, `command`, `verify`, `human` or `effect`. | [Workflow file](/reference/workflow-schema#steps) |
| output | What a step hands to the next step. | [Workflow file](/reference/workflow-schema#steps) |
| loop | Steps that repeat once for each criterion, up to a limit. It is an entry in a workflow, not a step kind. | [Workflow file](/reference/workflow-schema#loop) |
| loop limit | The most iterations a loop can run. The key is `max`. | [Workflow file](/reference/workflow-schema#loop) |
| iteration | One pass of a loop. | [Workflow file](/reference/workflow-schema#loop-rules) |
| gate | An expression in a loop's `until`. It reads verdict facts and decides whether the loop ends. It runs nothing and judges nothing. | [Gate expressions](/reference/gates) |
| plan | The list of items an agent proposes and you approve. | [Artifact kinds](/reference/kinds#evidence-plan-1) |
| proof | A test the run writes that fails before the work and passes after it. | [Conformance](/reference/conformance#baseline-proof) |
| approval | A point where the run stops until you approve, and the record of your yes. | [Artifact kinds](/reference/kinds#evidence-approval-1) |
| effect | The step that delivers the result, for example by opening a pull request. | [Workflow file](/reference/workflow-schema#effect) |
| scope | The paths a step can write. | [Protected paths](/reference/protected-paths#scope) |
| protected path | A path no agent can change, whatever a step's scope and whatever a workflow says. | [Protected paths](/reference/protected-paths) |
| frozen path | A proof file the agent can no longer change once it is sealed. | [Protected paths](/reference/protected-paths#frozen-paths) |
| claim | What an agent says it did, before code has checked it. A claim is never evidence. | [Why you can trust a run](/guide/concepts/trust) |
| seal | To check a result with code, then sign it so that a later change shows. | [Why you can trust a run](/guide/concepts/trust) |
| record | One sealed result. | [Evidence envelope](/reference/envelope) |
| evidence | Sealed records, as opposed to claims. | [Why you can trust a run](/guide/concepts/trust) |
| evidence trail (trail) | The signed, linked list of every record, in order. The specification pages call it the log or the chain. | [Why you can trust a run](/guide/concepts/trust) |
| signing key | The key that signs records. It stays in the control plane. | [The modules and where they run](/guide/concepts/modules) |
| run | One execution of a workflow for one work item. | [CLI](/reference/cli) |
| work item | The request a run answers. In the software binding it is an issue. | [Artifact kinds](/reference/kinds#daggry-work-item-1) |
| project | A body of work with its own project config. | [Project config](/reference/project-config) |
| workspace | A project's versioned files, where a run works. In the software binding it is a Git repository. | [Bindings](/reference/bindings) |
| project config | The file `.daggry/project.yaml`, the one manifest of what a project exposes to Daggry. Daggry only uses what it names. It says how to check one project and which paths to protect in it. | [Project config](/reference/project-config) |
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
| adapter | A program that turns one tool's output into a result document. It is registered in `extensions.adapters` under a format name such as `junit`, and a validator's `output` names that format. | [Bindings](/reference/bindings#output-formats) |
| agent runner | The way a runner runs an `agent` step: it starts an engine through an engine adapter. What the agent hands in is a claim. | [Module contracts](/reference/contracts#runner-protocol) |
| area | A named group of paths in a workspace, defined in the `areas` section of the project config. | [Project config](/reference/project-config#areas) |
| artifact | A sealed value in the envelope, with a kind and parents. The guide calls it a record. | [Evidence envelope](/reference/envelope) |
| attempt | One try of a job. A takeover after a lapsed lease starts a new one. | [Module contracts](/reference/contracts#runner-protocol) |
| base | The label of a measurement of the baseline. | [Artifact kinds](/reference/kinds) |
| baseline | The version of the workspace a run starts from. The project config is read from it. | [Project config](/reference/project-config) |
| baseline proof | The check that a criterion's test fails on the baseline and passes after the work. | [Conformance](/reference/conformance#baseline-proof) |
| blob | Bytes stored beside the log and named by the SHA-256 of their content, such as a workflow file. | [Evidence envelope](/reference/envelope) |
| boundary check | The check of a step's change against the protected paths, the frozen paths and the scope. It runs in the pod and again in the control plane, which has the last word. | [Protected paths](/reference/protected-paths#enforcement) |
| canonical JSON | The exact bytes an artifact is hashed in: no whitespace, keys sorted by UTF-8 bytes, integers only. | [Evidence envelope](/reference/envelope#canonical-json) |
| canonical validator | The validator a project names in `verification.canonical`. The `coverage` and `no_regression` judges decide from its measurement. | [Project config](/reference/project-config#verification) |
| catalogue | The workflows a tenant offers, listed in the `workflows` section of the tenant config. | [Tenant config](/reference/tenant-config#workflows) |
| chain | One sequence of linked log entries, verifiable from its first entry. Each tenant has exactly one. The guide calls it the evidence trail. | [Evidence envelope](/reference/envelope) |
| change | A set of differences made to the workspace, and the sealed record of one. | [Artifact kinds](/reference/kinds) |
| claimed | A fact class: an agent wrote the value. Gates cannot read it. | [Gate expressions](/reference/gates) |
| clean copy | A fresh copy of the workspace at one sealed version, where no agent can write. A validator you define runs on one. | [Validators](/reference/validators#a-validator-is-a-command) |
| command step | A step that runs a program with its arguments in the pod. | [Workflow file](/reference/workflow-schema) |
| conformance | Following the open formats and passing the published test vectors, at one of three levels: verifier, signer or factory. | [Conformance](/reference/conformance) |
| contract | A published interface between two modules: a file, a protocol or a document. | [Module contracts](/reference/contracts) |
| criterion | One acceptance criterion, with an id, in a plan. A loop repeats once for each criterion in the approved plan. | [Artifact kinds](/reference/kinds) |
| derived | A fact class: code computed the value from sealed inputs. Gates can read it. | [Gate expressions](/reference/gates) |
| deterministic runner | The way a runner runs commands, validators you define and format readers. It never starts a model. | [Module contracts](/reference/contracts#runner-protocol) |
| digest | The SHA-256 hash that names a sealed artifact by its content. | [Evidence envelope](/reference/envelope) |
| draft | An artifact before it is sealed. It holds `kind`, `id` and `body` only, and code adds every other field. | [Evidence envelope](/reference/envelope#fields) |
| effect step | A step that the control plane runs: an idempotent side effect that the tenant registers, such as delivering a change. | [Workflow file](/reference/workflow-schema#effect) |
| engine adapter | The program in the agent runner that drives one engine: it gives the engine a prompt, tools, a working copy and a credential by reference. | [Module contracts](/reference/contracts#engine-interface) |
| entry | One appended record of the log: the previous link and one sealed artifact. | [Evidence envelope](/reference/envelope) |
| envelope | The one JSON shape every artifact has: the draft's `kind`, `id` and `body`, plus the seal fields that only code adds. | [Evidence envelope](/reference/envelope) |
| extension key | A key the formats do not define, written `<namespace>/<key>`. A reader that does not know it keeps it. | [Project config](/reference/project-config) |
| fact | A named value in a verdict, a boolean, an integer or a string, that a gate can read. | [Gate expressions](/reference/gates) |
| fact class | Whether a field is `claimed`, `derived` or `judged`. | [Gate expressions](/reference/gates) |
| finding | One thing a validator reports: an id, an outcome of `pass`, `fail`, `error` or `skip`, an optional locator and a message. | [Project config](/reference/project-config#result-document) |
| genesis digest | 64 zero characters. It is the `prev` of a chain's first entry. | [Evidence envelope](/reference/envelope) |
| green | A loop iteration in which every step passed. The loop advances to the next item. | [Workflow file](/reference/workflow-schema#loop-rules) |
| head | In a chain, the link of the last entry. As a measurement label, a measurement of the last sealed version of the workspace. | [Evidence envelope](/reference/envelope) |
| human step | The step kind `human`: it waits for a person, and `daggry approve` completes it. | [Workflow file](/reference/workflow-schema) |
| job | A group of steps that share one pod and workspace. A run is one job by default. | [Workflow file](/reference/workflow-schema) |
| judge | Decides from the evidence trail and returns an outcome, findings and facts. Daggry seals the verdict. | [Judges](/reference/judges) |
| default judge | The judge every `verify` step has. It decides that every measurement passes and the thresholds hold. | [Judges](/reference/judges#default-judge) |
| named judge | A judge that ships with Daggry and that you name in `judges`: `coverage` or `no_regression`. | [Judges](/reference/judges#named-judges) |
| custom judge | A judge that is your command, declared in `judges`. It takes the evidence trail on standard input and writes a verdict body. | [Judges](/reference/judges#custom-judge) |
| rubric judge | A bounded model that judges one criterion under a rubric a person approved. Its facts are `judged`. | [Judges](/reference/judges#rubric-judge) |
| judged | A fact class: the answer of a rubric judge, a bounded model's pass or fail under a rubric a person approved. A gate reads it only after that approval. | [Gate expressions](/reference/gates#fact-classes) |
| key id | The name of the public key that checks a seal: `ed25519-` and 16 hex digits. | [Evidence envelope](/reference/envelope) |
| kind | The name and major version of an artifact's schema: `<namespace>/<name>@<major>`. | [Artifact kinds](/reference/kinds) |
| label | A short name from an open list, such as a `role`. In a measurement, it says which version was measured: `base`, `head` or `red`. | [Project config](/reference/project-config#project) |
| launcher | The program that turns a job attempt into a pod and watches it. | [Helm chart values](/reference/helm-chart#run-the-launcher-in-its-own-pod) |
| lease | A time-limited claim on a job attempt, kept alive by the runner's heartbeat. It is the one authority on liveness. | [Module contracts](/reference/contracts#runner-protocol) |
| link | SHA-256 of the previous link and the entry's digest. The signature covers it. | [Evidence envelope](/reference/envelope) |
| log | The append-only, hash-chained list of everything the control plane sealed. It is the source of truth for state. The guide calls it the evidence trail. | [Evidence envelope](/reference/envelope) |
| measurement | What a validator reported on one version of the workspace, sealed. | [Artifact kinds](/reference/kinds#evidence-measurement-1) |
| meta | The envelope's optional map from namespaced keys to scalar values, stamped by code at seal time. | [Evidence envelope](/reference/envelope) |
| metric | A named number a validator measured, such as a count or a share. | [Project config](/reference/project-config#result-document) |
| namespace | The part before the `/` in a kind or an extension key. It names the party that defines the name. | [Project config](/reference/project-config#extension-keys) |
| observation | A sealed record that is not a verdict: `protected-restored` or `step-failed`. It is kept for the record. | [Artifact kinds](/reference/kinds) |
| outcome | What a validator reported in a result or a measurement, or what Daggry decided in a verdict: `pass`, `fail` or `error`. A finding can also have the outcome `skip`. | [Project config](/reference/project-config#result-document) |
| output format | How Daggry reads what a validator you define reports, set by the `output` key: `exit-code` (the default), `document` or the plain name of a tool format such as `junit`. | [Project config](/reference/project-config#output-formats) |
| parents | The digests of the artifacts an artifact builds on. | [Evidence envelope](/reference/envelope) |
| pod | The Kubernetes form of a runner: the throwaway, isolated environment a job runs in. | [Install Daggry](/guide/how-to/deploy) |
| prev | The link of the entry before this one in the chain. | [Evidence envelope](/reference/envelope) |
| preview | A validator run on the working copy for fast feedback. It is never evidence. | [Validators](/reference/validators#when-a-validator-counts-as-evidence) |
| proof step | An `agent` step with `freeze` in a loop. It writes the proof for a criterion, and its matching paths are frozen when it is sealed. | [Workflow file](/reference/workflow-schema#red-then-green) |
| red | The label of the measurement in a baseline proof, and a loop iteration whose `verify` step did not pass. | [Conformance](/reference/conformance#baseline-proof) |
| result document | The form `daggry/result@1` that a validator writes with `output: document`: an outcome, findings and metrics. | [Project config](/reference/project-config#result-document) |
| revision | The name of one version of a workspace, in the form its binding gives. In the software binding it is a commit. | [Bindings](/reference/bindings) |
| roster | The named agents of a tenant, listed in `agents.roster` of the tenant config. Each has an engine. | [Tenant config](/reference/tenant-config#agents) |
| run lock | The sealed record of what a run pinned at start: validators, judges, boundary rules, image and workflow. | [Artifact kinds](/reference/kinds) |
| run request | What a client sends to start a run: the workflow, the workspace and the work item. | [HTTP API](/reference/api#routes) |
| runner class | A named isolation class in `runners.classes` of the tenant config. It says whether a pod reaches the network and whether it holds a model credential. | [Tenant config](/reference/tenant-config#runners) |
| signer | An implementation that seals artifacts and appends them to a chain. It is the second conformance level. | [Conformance](/reference/conformance#level-2-signer) |
| standard | The published rules of the four open formats. | [Open formats](/reference/open-formats) |
| tenant token | The credential a tenant's client sends with every call. A token reaches one tenant only. | [HTTP API](/reference/api#conventions) |
| threshold | A limit on a number that a validator gives, set in `verification.thresholds` of the project config. A missed threshold fails the verdict. | [Project config](/reference/project-config#verification) |
| unfreeze | The human grant that frees one frozen path for one iteration: `daggry approve <run-id> --unfreeze <path>`. | [Protected paths](/reference/protected-paths) |
| verdict | What a judge decided, sealed with an outcome, findings and facts. | [Artifact kinds](/reference/kinds#evidence-verdict-1) |
| verifier | An implementation that reads a chain and says whether it holds. It needs the public key and no secret. It is the first conformance level. | [Conformance](/reference/conformance#level-1-verifier) |
| verify step | Where Daggry runs validators and judges and seals their measurements and verdicts. It is not the `daggry verify` command, which checks the log. | [Workflow file](/reference/workflow-schema#verify) |
| witness | Proof for a finding that code can confirm, such as a quoted passage inside the change. A finding without one is advice. | [Validators](/reference/validators#when-a-validator-counts-as-evidence) |
| working copy | The copy of the workspace in an agent's pod, which the agent can write. | [Validators](/reference/validators#when-a-validator-counts-as-evidence) |
