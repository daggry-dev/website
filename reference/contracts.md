# Module contracts

*Reference*

A contract is the published interface between two modules, and a replacement for a module must keep it. This page lists the seven modules and their limits, every contract, what can replace each module and how a replacement is tested. Read it if you extend Daggry or replace a module. If you only run workflows, you can skip it.

For a shorter account of the modules, read [The modules and where they run](/guide/concepts/modules).

## The modules and their limits

Each module has one job and a list of things it never does. The table lists both. The runner has two rows, one for each of the two ways it runs a step.

| Module | Its one job | What it never does |
|---|---|---|
| Conductor | Orders the steps of a run and schedules job attempts across runners. | Holds a key, seals a record or runs a step's work. |
| Control plane | The one backend: holds the keys, seals, judges, serves the API and keeps tenant state. It runs the judges and seals every verdict. | Runs a command or an agent, or seals a claim that code has not checked. |
| Runner, as the deterministic runner | Runs commands and validators you define. | Starts a model. |
| Runner, as the agent runner | Runs the work of an `agent` step through an engine adapter. | Judges its own work, or changes what instructs, constrains or judges it. |
| Engine | The coding-agent program that does the work of an `agent` step. | Seals a record or reaches the signing key. |
| Forge | Keeps the workspace and its work items, and takes the result. | Seals a record or judges a result. |
| Store | Keeps the trail and each tenant's state. | Changes or removes a sealed entry. |
| Validators | Measure the work in code. | Read anything but their inputs, produce a verdict or start a model. |
| Judges | Take the evidence trail of the run so far as input and decide a verdict. | Read the workspace, produce a measurement or seal their own verdict. A rubric judge starts one bounded model and nothing else. |

<Modules />

The diagram shows the four open formats and the modules. Three modules run a job: the conductor, the runner, drawn as the two ways it runs a step, and the control plane. The conductor reads the tenant config and the workflow and hands each job attempt to a runner. The runner reads the project config and sends claims to the control plane. The control plane writes evidence. Validators run in the deterministic runner, and the control plane runs the judges over their measurements and seals the verdicts. The forge and the store are drawn as modules of their own.

## Replace a module

A replacement is a module that passes the tests of every contract it implements. It changes no other contract. The table lists what you can replace and the contract that makes it possible.

| You bring | It replaces | Contract |
|---|---|---|
| An engine for another coding-agent program | The engine | [Engine interface](#engine-interface). The agent runner knows an engine adapter, not an engine. |
| A forge for another source of work | The forge | [Forge and effect interface](#forge-and-effect-interface) |
| A store for another database | The store | [Store interfaces](#store-interfaces) |
| A runner for another execution environment | The runner | [Runner protocol](#runner-protocol). A runner that accepts a job attempt and keeps its lease can be scheduled, whether it runs in a pod, a virtual machine or a process. |
| A scheduler of your own | The conductor | [Conductor interface](#conductor-interface) |
| A validator of your own | No module: you add it | [Validators](/reference/validators#write-a-validator) |
| A judge of your own | No module: you add it | [Judges](/reference/judges#custom-judge) |

Daggry as shipped is one implementation of these contracts. Nothing in a contract depends on its language, its database or its cluster. Another implementation can write the same four formats and produce evidence that the same tools verify. See [Conformance](/reference/conformance).

## The contracts

The table lists each contract once. A module is replaceable when it passes the tests of every contract it implements. See [Conformance](/reference/conformance#contracts-as-conformance-surfaces).

| Contract | Between | Direction and transport | Defined in | What you can add or replace | Conformance test |
|---|---|---|---|---|---|
| Workflow document | The tenant and the conductor. | A file, read once when a run starts. | [Workflow file](/reference/workflow-schema) | Your own workflows, step kinds and extension keys. Another conductor that reads the same file. | The published schema and the refusal cases. |
| Evidence envelope and kinds | The control plane and any verifier. | A file or a JSON response: sealed artifacts in a signed chain. | [Evidence envelope](/reference/envelope), [Artifact kinds](/reference/kinds) | Your own kinds in your own namespace. Another signer or verifier. | The canonical JSON vectors and the two-entry chain vector. |
| Result document and output formats | A validator you define or a format reader, and the deterministic runner. | A file or standard output, written once when the process ends. | [Project config](/reference/project-config#result-document), [Bindings](/reference/bindings) | Any tool that writes the document. A reader for any other format. | The published schema and the refusal cases. |
| Project config | A project and a factory. | A file in the workspace, read from the baseline. | [Project config](/reference/project-config) | Your own validators, areas and extension keys. Another factory that reads the same file. | The published schema and the refusal cases. |
| Tenant config | A tenant and the control plane. | A document the control plane holds. | [Tenant config](/reference/tenant-config) | Your own catalogue, limits, bindings and validators. | The published schema and the refusal cases. |
| Conductor interface | The conductor and the control plane. | Request and response over HTTP with JSON. | [Conductor interface](#conductor-interface) | Another conductor, with another way to order and place work. | The same sealed chain for the same workflow and the same step results. |
| Runner protocol | A runner and the conductor. | Request and response over HTTP with JSON. The runner calls. | [Runner protocol](#runner-protocol) | Another runner, on another kind of machine or isolation. | A claimed attempt is reported, kept alive and released by the rules. |
| Engine interface | The agent runner and an engine. | A process protocol: the runner starts the engine and offers it tools. | [Engine interface](#engine-interface) | Another engine for each tenant, through an engine adapter. | The same prompt, tools and hand-in for every engine. |
| Forge and effect interface | The control plane and the place work comes from and goes to. | Request and response over HTTP with JSON. The control plane calls. | [Forge and effect interface](#forge-and-effect-interface), [Bindings](/reference/bindings) | Another source of work items and another way to deliver a change. | An effect is idempotent, and a change is rechecked from the store's own view. |
| Store interfaces | The control plane and its storage. | A storage interface for the log and one for blobs. | [Store interfaces](#store-interfaces) | Another log store and another blob store. | An appended chain reads back unchanged and verifies. |
| Identity and credential references | A tenant, the control plane and a secret store. | A token on each request, and a name in a document. | [Identity and credential references](#identity-and-credential-references) | Another identity provider and another secret store. | No document and no pod holds a secret value or the signing key. |

## Conductor interface

The conductor orders the steps of a run and leases job attempts to runners. It holds no key and seals nothing. The table lists its rules.

| The conductor | Rule |
|---|---|
| Reads | The workflow, the tenant's orchestration limits and the sealed state of the run. |
| Decides | The next step, which job it belongs to and when a new attempt starts. |
| Leases | One attempt to one runner for a limited time. The lease is the one authority on liveness. |
| Hands over | Each step to what its kind names: the deterministic runner, the agent runner or the control plane. |
| Never | Seals an artifact, judges a result or holds a signing key. |

## Runner protocol

A runner claims an attempt, runs its steps and reports. The deterministic runner and the agent runner speak the same protocol and implement different step kinds. The table lists the operations.

| Operation | Rule |
|---|---|
| Claim | A runner asks for an attempt and receives a lease, the steps to run and the version of the workspace to start from. |
| Heartbeat | The runner renews the lease while it works. A lease that lapses ends the attempt, and a new attempt starts from the last sealed version. |
| Report | The runner hands in each step's records as drafts. The control plane checks and seals them. |
| Release | The runner gives the attempt back when its steps end or when a step waits for a person. |

The table lists what each runner implements.

| Runner | Implements | Never |
|---|---|---|
| Deterministic runner | `command` and `verify` steps, validators you define and format readers. | Starts a model or holds a model credential. |
| Agent runner | `agent` steps, through an engine adapter. | Judges its own work. |

## Engine interface

An engine does the work of an `agent` step. The agent runner drives every engine the same way, through an engine adapter, so an engine is replaceable for each tenant. The table lists what the adapter gives the engine.

| The adapter gives the engine | Rule |
|---|---|
| A prompt | The step's instructions, in a file the engine cannot change. |
| Tools | `submit`, to hand in a record, and `validate`, to preview a validator. A preview answers with the findings and the tail of the command's output. |
| A working copy | The workspace, inside the step's scope. |
| A credential | By reference, from the tenant config. |

Whatever the engine hands in is a claim. An engine never seals, and never reaches the signing key.

## Forge and effect interface

The forge is the module that reads work items and delivers a change. An effect is one operation it offers. In the software binding the forge is a git host. The table lists the operations.

| Operation | Rule |
|---|---|
| Read a work item | The control plane fetches the request a run is for and seals it as a `work-item`. |
| Store a version | A runner hands a change to the workspace store with a credential scoped to one workspace. |
| Recheck | The control plane reads the change back from the store's own view before it accepts a step. |
| Effect | An idempotent side effect that an `effect` step names. The idempotency key is the run id plus the step id. |

## Store interfaces

The control plane keeps two stores, and the table gives the rule for each.

| Store | Holds | Rule |
|---|---|---|
| Log | The chain of sealed entries, one chain for each tenant. | Append only. An entry is never changed or removed. |
| Blobs | Bytes named by the SHA-256 of their content, such as a workflow file. | A blob read back hashes to its name. |

## Identity and credential references

The table lists the rules for identity, credentials and the signing key.

| Item | Rule |
|---|---|
| Tenant identity | Each request carries a tenant token. A token reaches one tenant. |
| Author of an approval | The identity of the token that approved. |
| Credential | A document names a stored secret by reference. No document holds a secret value. |
| Signing key | The control plane holds it. It never enters a pod. A verifier needs the public key only. |

## Next steps

The list names the pages to read next.

- For what an implementation does to conform, see [Conformance](/reference/conformance).
- For the kinds of validator, see [Validators](/reference/validators).
- For the four formats the modules read and write, see [Open formats](/reference/open-formats).
- For what one kind of work adds, see [Bindings](/reference/bindings).
