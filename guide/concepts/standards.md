# Open standards

A record only one vendor's tool can read is not a proof, and a workflow only one platform can run is a lock-in. Daggry is defined by four documents instead of by its code. Each document has a published schema, a version and an extension mechanism, so another factory can read and write the same files.

A factory is a system that takes in work, puts agents on it and hands back checked results.

## Four documents

The table names each document, what it says, who writes it and who reads it.

| Document | What it says | Who writes it | Who reads it |
|---|---|---|---|
| Workflow | How one kind of work goes: the steps, what each hands to the next, the gates, the loops and the human waits. | A person, as a file. The tenant lists it in its catalogue. | The conductor, and every person who wants to know what a run can do. |
| Evidence | What happened: one sealed record for each result, signed and linked to the record before it. | Code only. The control plane seals each record. | Gates, checks, the CLI and any tool of your own. |
| Project config | What is true of one repository: what it is, which areas it has, which checks it has, which one check is the verification evidence and which paths it protects. | The repository's owner, as a file in the repository. | The runners and the control plane. |
| Tenant config | How the factory works: which workflows it offers, which of them run on which repository, how work is orchestrated, which agents work and with what autonomy. | A person who runs the tenant. | The conductor and the control plane. |

For each document in detail, see the [Workflow schema](/reference/workflow-schema), the [Envelope](/reference/envelope) and [Kinds and schemas](/reference/kinds), [Project config](/reference/project-config) and [Tenant config](/reference/tenant-config).

## Why the project does not choose workflows

A project describes itself and how to check it. It does not know that it runs in a factory, and the same repository can be worked on by two factories that do different work on it. The project config therefore holds only what is true of the repository: its areas (named groups of paths), its checks, the one canonical check that is the verification evidence and the paths it protects. It says what exists and what is protected, and never what a run may change. What work is done on the repository is the tenant's decision: the tenant config assigns workflows, agents, approval points and areas to each repository. The split gives a workflow a fixed interface. It says `verify` and the project supplies the check, whether that is `cargo test`, vitest, `dotnet test` or a script. See [Project config](/reference/project-config) and [Tenant config](/reference/tenant-config#projects).

## What every standard has

**A published schema.** Each document is described by a JSON Schema under `/schemas/` on this site. Any tool that supports draft 2020-12 can check a file against it.

**A version.** Each document names the standard it follows and its major version, in the form `<namespace>/<name>@<major>`. A project config opens with `format: daggry/project@1`, and a record names its kind the same way. A reader refuses a major version it does not know and never guesses.

**An extension mechanism.** A standard that cannot grow gets forked. Each of the four grows in the same two ways.

- **Namespaced extension keys.** A key that the standard does not define is written as `<namespace>/<key>`, for example `acme/cost-centre`. A reader that does not know the key ignores its value and preserves it. An extension narrows or adds, and never widens a rule. A key without a namespace that the standard does not define is refused, so a typing error is never read as an extension.
- **Namespaced kinds.** A kind is the name and major version of a schema, written `<namespace>/<name>@<major>`, for example `evidence/plan@1`. The `evidence` namespace holds the kinds of the standard. A platform's own kinds live in its own namespace, as Daggry's do in `daggry`. A new kind of record or a new kind of step is a new name in a namespace, not a change to the standard. A tenant admits each added kind by name in its tenant config.

A breaking change to a kind is a new major. A sealed record never changes, so a record of an old major stays valid under the schema it was sealed with.

## Signing and chaining are part of the standard

Evidence is only portable if everyone seals it the same way. The evidence standard therefore fixes more than the shape of a record. It fixes these five things.

1. **The envelope.** Every record has the same fields, and a reader refuses a field it does not know.
2. **The bytes.** A record is written as canonical JSON, so the same record always gives the same bytes.
3. **The fingerprint.** The digest of a record is the SHA-256 of those bytes.
4. **The chain.** Each entry's link is the SHA-256 of the previous link and the entry's digest. Each record therefore vouches for all the records before it.
5. **The signature.** The link is signed with an Ed25519 key, and the record names the key by its key id.

A verifier that follows these five rules can check any trail, whoever produced it. For the exact rules, see the [envelope reference](/reference/envelope).

## Any factory can implement it

The claim is this: a factory that writes these four documents by the same specification, and seals evidence by the same signing and chaining, is interoperable with Daggry. Its trail verifies with any tool that follows the five rules above, and so does a Daggry trail. A workflow file written for one is a valid workflow file for the other, and a project config written for one tells the other how to check the same repository.

The claim is tested, not asserted. A conformance suite states what an implementation must accept, refuse and produce. See [Conformance](/reference/conformance).

## What is standard and what is one platform's policy

The standards say how to write things down. They do not say what a factory must decide. The table separates the two.

| The standard fixes | One platform decides |
|---|---|
| The shape of a workflow file and the meaning of each key. | Which workflows a tenant offers and who may start one. |
| The envelope, the kinds in the `evidence` namespace, and how a record is signed and linked. | Its own kinds in its own namespace, where the keys are kept and who may hold them. |
| The shape of a project config and a tenant config. | The values: the limits, the roster, the engines and the approval rules. |
| How a kind, a version and an extension key are named. | Which extensions it reads and which validators it admits. |
| What a conforming reader accepts and refuses. | Where it runs: the cluster, the storage and the repository host. |

Daggry's own policy is one such set of decisions. For example, Daggry runs each job in a throwaway pod on Kubernetes, and never lets an agent change what instructs, constrains or judges it. Another factory can decide otherwise and still write the same four documents. See [What an agent cannot change](/guide/concepts/protection).

## Next steps

- To see the modules that read and write these documents, read [The modules](/guide/concepts/modules).
- To see what a tenant config captures, read [The tenant defines the factory](/guide/concepts/tenant).
- To check an implementation, see [Conformance](/reference/conformance).
- For which standards exist today, see the [Roadmap](/roadmap).
