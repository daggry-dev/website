# Open standards

A factory is mainly a control plane, a conductor and a stack that delivers verified evidence. It pairs the non-deterministic work of agents with the deterministic judgement of code: code runs every check, and an agent never grades its own work. Standards and contracts are what let each part be replaced.

A record only one vendor's tool can read is not a proof, and a workflow only one platform can run is a lock-in. Daggry is defined by four documents instead of by its code. Each document has a published schema, a version and an extension mechanism, so another factory can read and write the same files.

A factory is a system that takes in work, puts agents on it and hands back checked results.

## Four documents

The table names each document, what it says, who writes it and who reads it.

| Document | What it says | Who writes it | Who reads it |
|---|---|---|---|
| Workflow | How one kind of work goes: the steps, what each hands to the next, the gates, the loops and the human waits. | A person, as a file. The tenant lists it in its catalogue. | The conductor, and every person who wants to know what a run can do. |
| Evidence | What happened: one sealed record for each result, signed and linked to the record before it. | Code only. The control plane seals each record. | Gates, validators, the CLI and any tool of your own. |
| Project config | What is true of one project: what it is, which areas it has, which validators it has, which one validator is the verification evidence and which paths it protects. | The project's owner, as a file in the workspace. | The runner and the control plane. |
| Tenant config | How the factory works: which workflows it offers, which of them run on which project, how work is orchestrated, which agents work and with what autonomy. | A person who runs the tenant. | The conductor and the control plane. |

For each document in detail, see the [Workflow schema](/reference/workflow-schema), the [Envelope](/reference/envelope) and [Kinds and schemas](/reference/kinds), [Project config](/reference/project-config) and [Tenant config](/reference/tenant-config).

## A neutral core and its bindings

The four documents name no tool and no kind of work. Their vocabulary is neutral: a project is the body of work the factory works on, a workspace is the versioned collection of files and data the work lives in, a work item is the request the work answers, and a change is a set of differences made to the workspace. A check is any deterministic procedure that inspects the workspace and reports a result. It can check a program, a document, a dataset, a configuration or a design file.

A binding maps the core onto one kind of work and its tools. It is a named set of adapters, kinds, effects and conventions. In the software binding the workspace is a repository, the work item is an issue and the result is handed over as a pull request. The formats of one toolset are adapters in a binding, never part of the core. See [Bindings](/reference/bindings).

## The validator interface is part of the standard

A validator is a check written as code, with a name. The standard fixes its interface: a validator takes sealed inputs and yields a result and a verdict. A script validator also gets a clean copy of the workspace. A result has one of three forms: an exit code, a result document in the standard's own format, or a format that an adapter registered by the tenant reads.

Because the interface is standard, the source of a validator does not change what a workflow says. A `verify` step lists validators by name: `daggry/<name>` for one that ships with the platform, `tenant/<name>` or `project/<name>` for a script validator, `project` alone for the project's verification, and `<namespace>/<name>` for a native validator. A native validator is loaded in-process or run as a service that speaks the validator protocol, in any language. See [Validators: the extension point](/guide/concepts/validators) and the [Validators reference](/reference/validators).

## Contracts, not code

The four documents say what is written down. Contracts say what each part of a factory does: the conductor, the control plane, the runner, the engine, the forge, the store and the validator. A part is defined by its contract, and anything that meets the contract can replace it: an engine for another agent, a runner for a different execution environment, a forge for another kind of work source, a store for another database, a validator in any language.

The reference implementation is one implementation. Nothing in a contract depends on its language, its database or its cluster. See [Contracts](/reference/contracts).

## Why the project does not choose workflows

A project describes itself and how to check it. It does not know that it runs in a factory, and the same project can be worked on by two factories that do different work on it. The project config therefore holds only what is true of the project: its areas (named groups of paths), its validators, the one canonical validator that is the verification evidence and the paths it protects. It says what the project has and what is protected, and never what a run may change. What work is done on the project is the tenant's decision: the tenant config assigns workflows, agents, approval points and areas to each project. The split gives a workflow a fixed interface. Its `verify` step names `project` and the project supplies the validator, whatever tool that validator runs. See [Project config](/reference/project-config) and [Tenant config](/reference/tenant-config#projects).

## What every standard has

**A published schema.** Each document is described by a JSON Schema under `/schemas/` on this site. Any tool that supports draft 2020-12 can check a file against it.

**A version.** Each document names the standard it follows and its major version, in the form `<namespace>/<name>@<major>`. A project config opens with `format: daggry/project@1`, a tenant config with `format: daggry/tenant@1` and a workflow with `format: daggry/workflow@1`. A record names its kind the same way. The header is required: a reader refuses a file without one, a malformed one and a major version it does not know, and never guesses.

**An extension mechanism.** A standard that cannot grow gets forked. Each of the four grows in the same two ways.

- **Namespaced extension keys.** A key that the standard does not define is written as `<namespace>/<key>`, for example `acme/cost-centre`. A reader that does not know the key ignores its value and preserves it. An extension narrows or adds, and never widens a rule. A key without a namespace that the standard does not define is refused, so a typing error is never read as an extension.
- **Namespaced kinds.** A kind is the name and major version of a schema, written `<namespace>/<name>@<major>`, for example `evidence/plan@1`. The `evidence` namespace holds the kinds of the standard. A platform's own kinds live in its own namespace, as Daggry's do in `daggry`. A new kind of record or a new kind of step is a new name in a namespace, not a change to the standard. A tenant admits each added kind by name in its tenant config.

A breaking change to a kind is a new major. A sealed record never changes, so a record of an old major stays valid under the schema it was sealed with.

## Signing and chaining are part of the standard

Evidence is only portable if everyone seals it the same way. The evidence standard therefore fixes more than the shape of a record. It fixes five rules: the envelope, the canonical bytes, the digest, the chain link and the signature. For what each rule fixes, see [The rules an implementation follows](/reference/conformance#the-rules-an-implementation-follows).

A verifier that follows the five rules can check any trail, whoever produced it. For the exact rules, see the [envelope reference](/reference/envelope).

## Any factory can implement it

The claim is this: a factory that writes these four documents by the same specification, and seals evidence by the same signing and chaining, is interoperable with Daggry. Its trail verifies with any tool that follows the five rules, and so does a Daggry trail. A workflow file written for one is a valid workflow file for the other, and a project config written for one tells the other how to check the same project.

The claim is tested, not asserted. A conformance suite states what an implementation must accept, refuse and produce. See [Conformance](/reference/conformance).

## What is standard and what is one platform's policy

The standards say how to write things down. They do not say what a factory must decide. The table separates the two.

| The standard fixes | One platform decides |
|---|---|
| The shape of a workflow file and the meaning of each key. | Which workflows a tenant offers and who may start one. |
| The envelope, the kinds in the `evidence` namespace, and how a record is signed and linked. | Its own kinds in its own namespace, where the keys are kept and who may hold them. |
| The shape of a project config and a tenant config. | The values: the limits, the roster, the engines and the approval rules. |
| How a kind, a version and an extension key are named. | Which extensions it reads. |
| The validator interface: the inputs, the result and the verdict. | Which validators it ships, which it admits and whether a project's own count as evidence. |
| What a conforming reader accepts and refuses. | Where it runs: the cluster, the store and the forge. |

Daggry's own policy is one such set of decisions. For example, the reference implementation runs each job in a throwaway container, and never lets an agent change what instructs, constrains or judges it. Another factory can decide otherwise and still write the same four documents. See [What an agent cannot change](/guide/concepts/protection).

## Next steps

- To see the modules that read and write these documents, read [The modules](/guide/concepts/modules).
- To plug in a check of your own, read [Validators](/guide/concepts/validators).
- To see what a tenant config captures, read [The tenant defines the factory](/guide/concepts/tenant).
- To check an implementation, see [Conformance](/reference/conformance).
