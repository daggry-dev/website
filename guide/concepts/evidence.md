# Sealed evidence

An agent's output is a claim. Only code turns a claim into evidence, and evidence, once sealed, is never edited. This page explains how Daggry seals an artifact and why you can check the record without trusting the server. It is for anyone who reviews or audits a run.

A later step never edits a sealed artifact. It writes a new one that points back at what it built on.

## The envelope in brief

Every artifact has the same envelope, whatever its kind. The agent drafts only `kind`, `id` and `body`. Code adds the rest when it seals.

```json
{
  "format": "evidence/envelope@1",
  "kind": "evidence/measurement@1",
  "id": "m-4f2a",
  "body": { "label": "head", "revision": "9c1e7d04b2a85f3e6d1c0b7a49e2f8530a6c1d7e", "exit_code": 0, "tests": [] },
  "parents": ["8f1ffe80a26e8b0c55bb806e3c6c5dbb555196b1ea5367b555247310d4c1d238"],
  "producer": "control",
  "time": 1731612000000,
  "key_id": "ed25519-fe812c12f3ab4ce6",
  "meta": {
    "daggry/run": "run-0042",
    "daggry/job": "main",
    "daggry/attempt": 1,
    "daggry/step": "verify",
    "daggry/tenant": "<tenant-id>"
  },
  "digest": "<sha-256 of the canonical JSON of every field above>",
  "signature": "<ed25519 signature over the chain link>"
}
```

Illustrative values. The `meta` values come from the control plane's own state, never from a request. For every field and its rules, see the [envelope reference](/reference/envelope).

## How an artifact is sealed

1. **Draft.** A step submits `kind`, `id` and `body`. The control plane checks the body against the kind's JSON Schema and runs the validators.
2. **Stamp.** It adds `format`, `parents`, `producer`, `time`, `key_id` and `meta`.
3. **Canonicalise.** The fields become canonical JSON: no whitespace, keys sorted by UTF-8 bytes, integers only. A float has several spellings, so Daggry refuses it.
4. **Digest.** `digest` is the SHA-256 of the canonical bytes. The same content always gives the same digest.
5. **Link.** `link` is the SHA-256 of `prev` followed by `digest`, where `prev` is the link of the entry before.
6. **Sign.** The control plane's Ed25519 key signs the link, not only the artifact. A signature therefore binds an artifact to its place in the chain.
7. **Append.** The entry `{ prev, artifact }` joins the tenant's log.

A seal says that code validated the artifact. It does not say the artifact is true.

## Two chains, two questions

Daggry uses a Merkle structure twice.

| Chain | Field | Answers |
|---|---|---|
| lineage | `parents` | What did this artifact build on? |
| log | `prev` | Has anything been changed, reordered or removed? |

Lineage lets you walk a proof backwards: a verdict names the measurement it judged, the measurement names the change it measured, and the change names the plan. The log orders every artifact of a tenant in the sequence it was appended.

<ChainDiagram />

The diagram shows two log entries. Each holds an artifact digest, a link made from the previous link and that digest, and a signature over the link. A signed head sits at the end of the chain. Changing any byte in the first entry breaks every later link and signature.

### Why it is tamper-evident

- Edit an artifact and its digest changes, so its link changes, so its signature stops verifying.
- Edit an old entry and every later link changes, so every later signature fails.
- Drop an entry from the middle and the next entry's `prev` no longer matches.
- Drop entries from the tail and nothing inside the chain notices. The control plane therefore publishes a **signed head** off-host periodically. A log shorter than the published head proves truncation.

The log is chained per tenant, so one tenant never has to read another tenant's entries.

## Fact classes

Every field that a gate can read has one of three classes.

| Class | Meaning | Can a gate read it? |
|---|---|---|
| `claimed` | an agent wrote it | no; the loader refuses it |
| `derived` | code computed it from sealed inputs | yes |
| `judged` | a language-model verdict under a rubric that a person approved for one named criterion | only once approved |

Code judges. The one exception is a `judged` fact: a language model gives a verdict on a single named criterion, under a rubric a person approved, and the fact is marked so that nobody mistakes it for a computed one. Every other fact a gate opens on is one that code produced.

## What the verify step reads

The verify step runs the project's test command, with lints and coverage planned (see the [Roadmap](/roadmap)). It reads the command from the base commit or the run lock, never from the head, so the agent cannot lower the bar it is measured against. For the measure, preview and judge parts and where each runs, see [Why you can trust a run](/guide/concepts/trust).

## Verify a run yourself

To check the record, run `daggry verify`. It fetches your tenant's chain and recomputes every link, digest and signature on the client from the entries' bytes. It also re-hashes each referenced blob. It exits non-zero if anything fails, and it does not rely on the server's word.

```sh
daggry verify
```

```text
verified 42 entries, 3 blobs
```

For the full procedure, follow [Verify a run](/guide/how-to/verify-a-run).

## Kinds

Four neutral kinds ship with the evidence language, and four more are Daggry's own.

| Kind | Holds |
|---|---|
| `evidence/plan@1` | acceptance criteria, each with a unique id |
| `evidence/measurement@1` | the result of the project's test command, reduced to a small record |
| `evidence/verdict@1` | a validator's status, findings and derived facts |
| `evidence/approval@1` | a person's grant, bound to a digest |
| `daggry/change@1` | a commit SHA, the changed paths and digests of frozen tests |
| `daggry/observation@1`, `daggry/run-lock@1`, `daggry/work-item@1` | step failures, pinned versions, the issue |

::: details A plan and a verdict from code
Illustrative bodies. A plan lists criteria:

```json
{
  "kind": "evidence/plan@1",
  "id": "plan-1",
  "body": {
    "criteria": [
      { "id": "C1", "text": "An expired token is rejected with 401." },
      { "id": "C2", "text": "A valid token still passes." }
    ]
  }
}
```

A verdict from the `criterion-coverage` validator reports derived facts:

```json
{
  "kind": "evidence/verdict@1",
  "id": "v-1",
  "body": {
    "validator": "criterion-coverage",
    "version": "0.1.0",
    "status": "pass",
    "findings": [],
    "facts": [
      { "name": "all_covered", "class": "derived", "value": true }
    ]
  }
}
```
:::

For every kind and field, see [Kinds and schemas](/reference/kinds).

## Next steps

- To see how gates read facts, read [Work graphs](/guide/concepts/workflows) and the [gate reference](/reference/gates).
- To see what keeps an agent from editing its own judge, read [Protected paths](/guide/concepts/protection).
