# Conformance

*Reference*

Proposed standard; see the [Roadmap](/roadmap) for status.

For the idea, read [Open standards](/guide/concepts/standards).

Daggry is defined by open documents, so another factory can implement them. This page says what an implementation must do to conform, at three levels, with a checklist for each. It also says what is one platform's policy and no part of the standard. It is for people who build a verifier, a signer or a factory of their own.

A factory is a system that takes in work, puts agents on it and hands back checked results. An implementation conforms when it accepts, refuses and produces what the rules below say, and passes the published test vectors.

## The rules an implementation follows

Every level rests on the same five rules of the evidence standard. Each is defined in full in [Envelope](/reference/envelope).

| Rule | What it fixes | Defined in |
|---|---|---|
| Envelope | The fields of a sealed artifact, which of them a draft holds, and the refusal of unknown fields and unknown `format` majors. | [Fields](/reference/envelope#fields) |
| Canonical JSON | The exact bytes of an artifact: no whitespace, keys sorted by UTF-8 bytes, integers only. | [Canonical JSON](/reference/envelope#canonical-json) |
| Digest | SHA-256 of the canonical bytes of every field except `digest` and `signature`, as 64 lowercase hex digits. | [Digest](/reference/envelope#digest) |
| Chain link | SHA-256 of the 32 bytes of `prev` followed by the 32 bytes of the digest. The first `prev` is the genesis digest. | [Chain link](/reference/envelope#chain-link) |
| Signature | An Ed25519 signature over the 32 bytes of the link, checked strictly, with a key id derived from the public key. | [Signature and key id](/reference/envelope#signature-and-key-id) |

Kinds follow one naming rule: `<namespace>/<name>@<major>`. See [Kinds](#kinds).

## Test vectors

An implementation proves the five rules against the published vectors. They are on the [Envelope](/reference/envelope) page.

| Vector | Proves | Where |
|---|---|---|
| Canonical JSON vectors | An input gives the exact canonical bytes and their SHA-256. A non-integer number is refused. | [Canonical JSON](/reference/envelope#canonical-json) |
| Two-entry chain | Two digests, two links, the chain head, the key id and two signatures, from a published test-only key. | [Worked example](/reference/envelope#worked-example-recompute-a-digest-and-a-link) |

The signing key in the chain vector is for tests only. It signs nothing real.

## Kinds

| Rule | Detail |
|---|---|
| Form | `<namespace>/<name>@<major>`. A breaking change to a kind is a new major. |
| The `evidence` namespace | Holds the kinds of the standard: `plan`, `measurement`, `verdict` and `approval`. An implementation uses them unchanged and adds none. |
| A factory's own kinds | Live in the factory's own namespace, as Daggry's live in `daggry`. |
| Schemas | Every kind an implementation seals has a published JSON Schema (draft 2020-12) for its `body`, with the kind as its `$id`. |
| Unknown kinds | A reader that has no schema for a kind still verifies the envelope, the digest, the link and the signature. It does not judge the body. |

The schemas of the standard's kinds and of Daggry's own are in [Kinds and schemas](/reference/kinds).

## Conformance levels

There are three levels. Each level includes the one before it.

| Level | Name | What the implementation does |
|---|---|---|
| 1 | Verifier | Reads a chain and says whether it holds. |
| 2 | Signer | Produces a chain that any verifier accepts. |
| 3 | Factory | Runs work from the same workflow, project config and tenant config, and produces such a chain. |

### Level 1: verifier

A verifier reads a log and checks it. It needs the public key and no secret.

- Reads the envelope and refuses an unknown top-level field.
- Refuses a missing `format`, a malformed one and a major it does not know.
- Refuses hex that is uppercase or of the wrong length.
- Writes canonical JSON by the rules, and refuses a number that is not an integer.
- Recomputes each artifact digest from the covered fields, with `meta` included only when it is present.
- Recomputes each link from `prev` and the digest, starting from the genesis digest.
- Derives the key id from the public key, and checks each Ed25519 signature strictly over the 32 bytes of the link.
- Checks each entry in the order link, digest, signature, and stops at the first failure.
- Re-hashes every referenced blob and compares it with its digest.
- Passes the canonical JSON vectors and the two-entry chain vector.

### Level 2: signer

A signer seals artifacts and appends them to a chain.

- Meets every item of level 1.
- Accepts a draft that holds `kind`, `id` and `body` only, and adds every other field in code.
- Validates `body` against the kind's schema before it seals.
- Stamps `meta` by the rules: namespaced keys, scalar values, at most 4096 canonical bytes, absent when empty.
- Keeps one chain for each tenant and only appends to it.
- Signs the link of each entry with an Ed25519 key, and names the key by its key id.
- Keeps the signing key away from whatever produced the draft.
- Gives a verifier the public key for a key id.
- Uses the `evidence` kinds unchanged and puts its own kinds in its own namespace.
- Publishes a JSON Schema for every kind it seals.
- Reproduces the digests, links, head and signatures of the two-entry chain vector from the vector's test key.

### Level 3: factory

A factory runs work and seals what the work produced.

- Meets every item of level 2.
- Reads a workflow by the [Workflow schema](/reference/workflow-schema): the same keys, the same refusals, the same strict YAML subset.
- Reads a gate by the grammar in [Gate expressions](/reference/gates), and lets a gate read derived fields only.
- Reads a [Project config](/reference/project-config) from the base commit, and refuses an unknown major.
- Reads a [Tenant config](/reference/tenant-config), and refuses an unknown major.
- Applies the precedence tenant, then project, then workflow, and lets only a person widen a rule.
- Follows the extension rule in all three documents: ignores and preserves a namespaced key it does not know, and refuses an unknown key without a namespace.
- Runs each step in the module its kind names, and refuses a kind that is not registered.
- Takes a credential by reference only.
- Seals a record only after code has checked it.

## What is not standard

The standard says how to write things down. It does not say what a factory must decide. Each row below is one platform's policy, and a factory conforms whatever it chooses.

| Policy | Daggry's choice | Read more |
|---|---|---|
| The default protected paths | The always-protected set, such as `.daggry/**` and agent instruction files. | [Protected paths](/reference/protected-paths) |
| The validators a platform runs and admits | The built-in validators. | [Kinds and schemas](/reference/kinds#validators) |
| A platform's own kinds | The four kinds in the `daggry` namespace. | [Kinds and schemas](/reference/kinds) |
| The values in a tenant config | The limits, the roster, the engines and the approval points. | [Tenant config](/reference/tenant-config) |
| Where keys are kept and who holds them | The control plane holds the signing key. It never enters a pod. | [Where it runs](/guide/concepts/architecture) |
| How a verifier gets the public key | A route of the HTTP API. | [HTTP API](/reference/api) |
| Where it runs | Kubernetes pods, with a SQLite log and filesystem blobs. | [Deploy Daggry](/guide/how-to/deploy) |
| The interfaces | The `daggry` commands and the HTTP routes. | [CLI](/reference/cli) |
| The text of an error message | The messages on the reference pages. The cases that are refused are standard. The wording is not. | [Envelope](/reference/envelope#verification-errors) |

## Next steps

- For every field and rule of the envelope, see [Envelope](/reference/envelope).
- For the kinds and their schemas, see [Kinds and schemas](/reference/kinds).
- For the two configuration documents, see [Project config](/reference/project-config) and [Tenant config](/reference/tenant-config).
