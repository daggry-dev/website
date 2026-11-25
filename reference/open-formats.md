# Open formats

*Reference*

Daggry has four published formats: the workflow, the project config, the tenant config and evidence. This page says what each holds, how a format is versioned and how you add to one. Read it if you write a tool that reads these files, or if you want to know what stays the same when you replace a module.

To write the files, start with [Configure Daggry](/guide/configure).

## The four formats

The table names each format, what it says, who writes it and who reads it. You write the first three. Daggry writes the fourth.

| Format | What it says | Who writes it | Who reads it | Defined in |
|---|---|---|---|---|
| Workflow | How one kind of work goes: the steps, what each hands to the next, the gates, the loops and the approvals. | A person, as a file. The tenant config lists it. | The conductor, and every person who wants to know what a run can do. | [Workflow file](/reference/workflow-schema) |
| Project config | What is true of one project: what it is, which areas it has, which validators it has, which one is its main validator and which paths it protects. | The project owner, as a file in the workspace. | The runner and the control plane. | [Project config](/reference/project-config) |
| Tenant config | How a tenant's factory works: which workflows it offers, which of them run on which project, how work is scheduled, which agents work and where a person must approve. | The tenant admin. | The conductor and the control plane. | [Tenant config](/reference/tenant-config) |
| Evidence | What happened: one sealed record for each result, signed and linked to the record before it. | Code only. The control plane seals each record. | Gates, validators, the CLI and any tool of your own. | [Evidence envelope](/reference/envelope), [Artifact kinds](/reference/kinds) |

## What every format has

Each of the four formats has a published schema, a version and a way to add to it.

**A published schema.** Each format is described by a JSON Schema under `/schemas/` on this site. Any tool that supports draft 2020-12 can check a file against it.

**A version.** Each file names its format and major version, in the form `<namespace>/<name>@<major>`. The table lists the headers.

| File | Header |
|---|---|
| Workflow | `format: daggry/workflow@1` |
| Project config | `format: daggry/project@1` |
| Tenant config | `format: daggry/tenant@1` |

A record names its kind the same way. The header is required. A reader refuses a file without one, a malformed one and a major version it does not know, and never guesses.

A breaking change to a kind is a new major. A sealed record never changes, so a record of an old major stays valid under the schema it was sealed with.

**A way to add to it.** A format that cannot grow gets forked. Each of the four grows in the same two ways.

| Way | Written as | Rule |
|---|---|---|
| Extension key | `<namespace>/<key>`, for example `acme/cost-centre` | A reader that does not know the key ignores its value and preserves it. An extension narrows or adds, and never widens a rule. A key without a namespace that the format does not define is refused, so a typing error is never read as an extension. |
| Kind | `<namespace>/<name>@<major>`, for example `evidence/plan@1` | The `evidence` namespace holds the kinds of the standard. Daggry's own kinds are in `daggry`. A new kind of record or a new kind of step is a new name in a namespace, and changes no format. A tenant registers each added kind in its tenant config. |

## One kit, many kinds of work

The four formats name no tool and no kind of work, so the same files describe software, documents or data. The table lists the words the formats use.

| Word | Meaning |
|---|---|
| project | The body of work a factory works on. |
| workspace | The versioned collection of files and data the work lives in. |
| work item | The request the work answers. |
| change | A set of differences made to the workspace. |
| validator | Code that inspects the workspace or sealed records and reports a result. It can inspect a program, a document, a dataset, a configuration or a design file. |

A binding is a ready-made setup for one kind of work. It names the output formats, validators, kinds, effects and conventions for that work. In the `software` binding the workspace is a repository, the work item is an issue and the result is delivered as a pull request. The formats of one toolset are output formats in a binding, and never part of the four formats. See [Bindings](/reference/bindings).

## The validator interface

The formats fix how a validator is called, so the source of a validator does not change what a workflow says. A validator takes a clean copy of the workspace and yields a result. A `verify` step derives the verdict from it. A validator you define also gets a clean copy of the workspace.

The table lists the three forms of a result. A validator's `output` names the form.

| `output` | The result is |
|---|---|
| `exit-code` | The exit code alone. |
| `document` | A result document in the standard's own format. |
| A tool format, such as `junit` | A format that a binding or the tenant registers a reader for. |

A `verify` step lists validators by name. The table lists the forms of a name.

| Name | Validator |
|---|---|
| `<name>` | A validator you define, from the project config or the tenant config. |
| `project` | The project's main validator, with the supporting validators and thresholds the project config lists. |

See [Validators](/reference/validators).

## Why the project config names no workflow

The same project can be worked on by two factories that do different work on it. The project config therefore holds only what is true of the project: its areas (named groups of paths), its validators, its main validator and the paths it protects. It says what the project has and what is protected, and never what a run can change.

The tenant config decides what work is done on the project. It assigns workflows, agents, approvals and areas to each project. A `verify` step names `project`, and the project supplies the validator, whatever tool that validator runs. See [projects](/reference/tenant-config#projects).

## What the formats fix and what a factory decides

The formats say how to write things down. They do not say what a factory must decide. The table separates the two.

| The formats fix | One factory decides |
|---|---|
| The shape of a workflow file and the meaning of each key. | Which workflows a tenant offers and who can start one. |
| The envelope, the kinds in the `evidence` namespace, and how a record is signed and linked. | Its own kinds in its own namespace, where the keys are kept and who holds them. |
| The shape of a project config and a tenant config. | The values: the limits, the agents, the engines and the approval rules. |
| How a kind, a version and an extension key are named. | Which extensions it reads. |
| The validator interface: the inputs and the result. | Which validators it ships and whether a project's own count as evidence. |
| What a conforming reader accepts and refuses. | Where it runs: the cluster, the store and the forge. |

Daggry's own choices are one such set. For example, Daggry runs each job in a throwaway container, and never lets an agent change what instructs, constrains or judges it. Another factory can decide otherwise and still write the same four formats. For Daggry's choices, see [What is not standard](/reference/conformance#what-is-not-standard).

## Signing, modules and other implementations

Three more pages complete the specification. The table says what each one fixes.

| Topic | What it fixes | Page |
|---|---|---|
| Signing and linking | Five rules: the envelope, the canonical bytes, the digest, the chain link and the signature. A verifier that follows them can check any trail, whoever produced it. | [Evidence envelope](/reference/envelope) |
| Modules | What each module does and what can replace it. A module is defined by its contract, and nothing in a contract depends on a language, a database or a cluster. | [Module contracts](/reference/contracts) |
| Other implementations | What another factory must accept, refuse and produce so that its files and its trail work with Daggry's. | [Conformance](/reference/conformance) |
