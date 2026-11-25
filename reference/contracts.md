# Contracts

*Reference*

For the idea, read [The modules](/guide/concepts/modules) and [Open standards](/guide/concepts/standards).

A factory is a control plane, an orchestrator and the code that delivers verified evidence. Every part of it meets the others through a contract: a document, a protocol or a file with a published form. This page lists every contract, the parts it stands between, what can replace each part and how a replacement is tested. It is for people who extend a factory or replace a part of one.

## The contracts

The table lists each contract once. A part is replaceable when it passes the tests of every contract it implements. See [Conformance](/reference/conformance#contracts-as-conformance-surfaces).

| Contract | Between | Direction and transport | Defined in | What you can plug in | Conformance test |
|---|---|---|---|---|---|
| Workflow document | The tenant and the conductor. | A file, read once when a run starts. | [Workflow schema](/reference/workflow-schema) | Your own workflows, step kinds and extension keys. Another conductor that reads the same file. | The published schema and the refusal cases. |
| Evidence envelope and kinds | The control plane and any verifier. | A file or a JSON response: sealed artifacts in a signed chain. | [Envelope](/reference/envelope), [Kinds and schemas](/reference/kinds) | Your own kinds in your own namespace. Another signer or verifier. | The canonical JSON vectors and the two-entry chain vector. |
| Validator contract | The control plane and a validator. | A function call in-process, or a request and a response with JSON bodies. | [Validators](/reference/validators#the-validator-contract) | Script validators and native validators, in any language. | Equal verdicts for equal inputs, over the published input sets. |
| Result document and adapters | A script validator or an adapter, and the deterministic runner. | A file or standard output, written once when the process ends. | [Project config](/reference/project-config#result-document), [Bindings](/reference/bindings) | Any tool that writes the document. An adapter for any other format. | The published schema and the refusal cases. |
| Project config | A project and a factory. | A file in the workspace, read from the baseline. | [Project config](/reference/project-config) | Your own validators, areas and extension keys. Another factory that reads the same file. | The published schema and the refusal cases. |
| Tenant config | A tenant and the control plane. | A document the control plane holds. | [Tenant config](/reference/tenant-config) | Your own catalogue, limits, bindings and admitted validators. | The published schema and the refusal cases. |
| Conductor interface | The conductor and the control plane. | Request and response over HTTP with JSON. | [Conductor interface](#conductor-interface) | Another conductor, with another way to order and place work. | The same sealed chain for the same workflow and the same step results. |
| Runner protocol | A runner and the conductor. | Request and response over HTTP with JSON. The runner calls. | [Runner protocol](#runner-protocol) | Another runner, on another kind of machine or isolation. | A claimed attempt is reported, kept alive and released by the rules. |
| Engine interface | The agent runner and an agent engine. | A process protocol: the runner starts the engine and offers it tools. | [Engine interface](#engine-interface) | Another engine for each tenant, through an engine adapter. | The same prompt, tools and hand-in for every engine. |
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
| Deterministic runner | `command` and `verify` steps, script validators and adapters. | Starts a model or holds a model credential. |
| Agent runner | `agent` steps, through an engine adapter. | Judges its own work. |

## Engine interface

An agent engine does the work of an `agent` step. The agent runner drives every engine the same way, through an engine adapter, so an engine is replaceable for each tenant. The table lists what the adapter gives the engine.

| The adapter gives the engine | Rule |
|---|---|
| A prompt | The step's instructions, in a file the engine cannot change. |
| Tools | `submit`, to hand in a record, and `validate`, to preview a validator. |
| A working copy | The workspace, inside the step's scope. |
| A credential | By reference, from the tenant config. |

Whatever the engine hands in is a claim. An engine never seals, and never reaches the signing key.

## Forge and effect interface

The forge is the part that reads work items and delivers a change. An effect is one operation it offers. In the software binding the forge is a git host. The table lists the operations.

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
- For the validator contract in full, see [Validators](/reference/validators).
- For what one kind of work adds, see [Bindings](/reference/bindings).
