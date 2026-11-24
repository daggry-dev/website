# Envelope

*Reference*

For the idea, read [Why you can trust a run](/guide/concepts/trust).

The envelope is the one JSON shape every sealed artifact has. It is an open standard: any factory that follows the field, canonical JSON, digest, chain link and signature rules on this page produces evidence that any verifier can check, whoever built either one. For what an implementation must do, see [Conformance](/reference/conformance).

This page lists every field, the rules for `meta`, the canonical JSON rules, and how the digest, the chain link and the signature are computed. It is for people who write a reader, a verifier or a tool that checks a log.

The hand-written values on this page are illustrative. The test vector in [Worked example](#worked-example-recompute-a-digest-and-a-link) is copied from the published test vector.

## Download

The envelope has a published JSON Schema (draft 2020-12). To download it, use the file below. It is the same schema as in [Envelope JSON Schema](#envelope-json-schema).

| Schema | File |
|---|---|
| `evidence/envelope@1` | [evidence-envelope-v1.json](/schemas/evidence-envelope-v1.json) |

## Fields

An agent writes a draft that holds only `kind`, `id` and `body`. Code adds every other field when it seals the artifact.

| Field | Type | Required | Set by | In the digest | Constraints |
|---|---|---|---|---|---|
| `format` | string | yes | seal | yes | Always `evidence/envelope@1`. |
| `kind` | string | yes | draft | yes | `<namespace>/<name>@<major>`. Pattern `^[^/@]+/[^/@]+@[0-9]+$`. |
| `id` | string | yes | draft | yes | Any string. |
| `body` | any JSON value | yes | draft | yes | Validated against the kind's schema before sealing. See [Kinds and schemas](/reference/kinds). |
| `parents` | array of digests | yes | seal | yes | Each a 64-digit lowercase hex digest. Can be empty. |
| `producer` | string | yes | seal | yes | Any string. |
| `time` | integer | yes | seal | yes | 0 or more. Unix milliseconds. |
| `key_id` | string | yes | seal | yes | Names the public key that checks the signature. |
| `meta` | object | no | seal | yes, when present | See [Meta](#meta). Absent when empty. |
| `digest` | string | yes | seal | no | 64 lowercase hex digits. |
| `signature` | string | yes | seal | no | 128 lowercase hex digits (64 Ed25519 bytes). |

The envelope refuses unknown top-level fields. A draft with any field besides `kind`, `id` and `body` is an error, including any seal field and `meta`.

All hex in the format is lowercase and of exact length. Uppercase hex and wrong lengths are refused.

### Format

`format` names the envelope version. A reader refuses a missing `format`, a malformed one and a major version it does not know. A newer major (for example `evidence/envelope@2`) is refused as unknown. A reader decodes an older major for audit only.

### Kind

A kind has three parts.

| Part | Rule |
|---|---|
| namespace | Non-empty. No `@` and no `/`. `evidence` holds the language's kinds. `daggry` holds the platform's own. |
| name | Non-empty. No `/` and no `@`. |
| major | One or more ASCII digits. A breaking change to a kind is a new major. |

### Parents and prev

`parents` names artifacts by digest: the artifacts this one builds on. It is the artifact lineage. It is not the same as `prev`, which is the position of an entry in the tenant's chain. See [Chain link](#chain-link).

## Meta

`meta` is an optional map that code stamps at seal time. The digest and the signature cover it. An agent never writes it.

| Rule | Value |
|---|---|
| Key | `<namespace>/<key>`. Exactly one `/`. Each part is one or more ASCII letters, digits, `-` or `_`. |
| Value | A string, an integer or a boolean. |
| Refused values | `null`, an object, an array, a float. |
| Size | The canonical JSON of the whole map is at most 4096 bytes. 4096 is accepted. 4097 is refused. |
| Empty map | The same as no `meta`. It is absent from the canonical JSON and from the stored envelope. |

Scalar values keep every `meta` value comparable in a gate. Do not put secrets, personal data, free text, or nested or large data in `meta`: the log is append-only and the digest covers `meta`, so nothing can be redacted.

### Stamped keys

The control plane stamps the `daggry/*` keys from its own state. It never takes them from a request or a draft. A key that does not apply is absent, never null or empty.

| Key | Value | Stamped on |
|---|---|---|
| `daggry/tenant` | string, the tenant id | every artifact |
| `daggry/run` | string, the run id | every artifact |
| `daggry/job` | string, the job id | an artifact sealed for a job |
| `daggry/attempt` | integer, 1 or more | an artifact sealed for an attempt |
| `daggry/step` | string, the step id | an artifact sealed in a step |

Which kinds carry which keys:

| Kinds | Keys |
|---|---|
| `run-lock`, `work-item` | tenant, run |
| `plan`, `measurement`, `change`, `observation`, `verdict` | tenant, run, job, attempt, step |
| `approval` | tenant, run, job, step. No `daggry/attempt`, because a human step holds no attempt. |

Trace ids and a retention class are not stamped.

## Canonical JSON

The digest is taken over canonical JSON. The rules are:

| Rule | Detail |
|---|---|
| Whitespace | None. |
| Object keys | Sorted by their UTF-8 bytes. |
| Arrays | Order is data and is kept. |
| Strings | Standard JSON strings. Non-ASCII characters stay as raw UTF-8. Control characters are escaped (`\n`, `\u0001`). |
| Numbers | Integers only, written in plain decimal, from -9223372036854775808 to 18446744073709551615. A float or any other number is refused. |

This is not RFC 8785 (JSON Canonicalization Scheme). It sorts keys by UTF-8 bytes where RFC 8785 sorts by UTF-16 code units, and it refuses non-integer numbers where RFC 8785 defines their output.

The stored log bytes are plain JSON and are not canonical. A reader recomputes the digest from the fields, so key order in the stored bytes does not matter.

::: details Canonical JSON test vectors
Each row gives the input text, the exact canonical bytes and the SHA-256 digest of those bytes. The published vector holds eight rows. These are rows 1, 3 and 5.

| Input | Canonical | SHA-256 |
|---|---|---|
| `{"a":1,"b":[true,null],"s":"x\"y"}` | `{"a":1,"b":[true,null],"s":"x\"y"}` | `33097a9c185ca15271b546a9ad468b0569567ddbb6da79fc87d8fe1e3f68d4e1` |
| `{"z":{"b":2,"a":[]},"y":"åß😀\n\u0001","x":-9223372036854775808}` | `{"x":-9223372036854775808,"y":"åß😀\n\u0001","z":{"a":[],"b":2}}` | `edce694621c2c45a170fd3d1bfe720536a2fc188ae13a203c005b2089e77b874` |
| `{}` | `{}` | `44136fa355b3678a1146ad16f7e8649e94fb4fc21fe77e8310c060f61caaff8a` |

A number such as `1.5` has no canonical form and is refused.
:::

## Digest

The digest names an artifact by its content. It is SHA-256, written as 64 lowercase hex digits.

To compute the artifact digest:

1. Build an object with `format`, `kind`, `id`, `body`, `parents`, `producer`, `time` and `key_id`. Add `meta` only when it is not empty.
2. Write the object as canonical JSON.
3. Take the SHA-256 of those bytes.

The digest does not cover `digest` or `signature`. A change to any covered field makes the stored digest fail recomputation.

A blob is referenced by the SHA-256 of its raw bytes.

The digest that stands for "no history" is the genesis digest: 32 zero bytes, written as 64 `0` characters.

## Chain link

Each tenant has one chain of log entries. An entry's link ties it to the entry before it.

| Term | Meaning |
|---|---|
| `prev` | The link of the previous entry. The genesis digest for the first entry. |
| link | SHA-256 of the 32 raw bytes of `prev` followed by the 32 raw bytes of the artifact digest. 64 bytes go in. |
| head | The link of the last entry. |

A signed head kept outside the cluster would let a reader see that entries were dropped from the end of a chain. See the [Roadmap](/roadmap) for its status.

### Lineage and log

Two chains run side by side. The lineage chain answers "what did this record build on?": a verdict names the measurement it judged, the measurement names the change, and the change names the plan. The log chain answers "has anything been changed, reordered or removed?"

<ChainDiagram />

The diagram shows two entries. Each holds a fingerprint, a link made from the previous link and that fingerprint, and a signature over the link. Changing one byte in the first breaks every later link.

## Signature and key id

One Ed25519 key, held by the control plane, signs every artifact. The signature covers the 32 raw bytes of the entry's link. A signature therefore binds an artifact to its position in the chain. The key never enters a job's pod.

| Item | Rule |
|---|---|
| Signature | 64 Ed25519 bytes, as 128 lowercase hex digits. Checked with strict verification. |
| Key id | The text `ed25519-` followed by the first 16 hex digits of the SHA-256 of the 32-byte public key. |
| Public key | Served by key id. A request `{ "key_id" }` answers `{ "key_id", "public_key" }`, the key as 64 lowercase hex digits. See [HTTP API](/reference/api). |

## Log entry

A log entry holds the previous link and one sealed artifact. The next block is the shape with placeholders: `<...>` marks a value you replace.

```json
{
  "prev": "<link of the entry before, or the genesis digest>",
  "artifact": {
    "format": "evidence/envelope@1",
    "kind": "evidence/measurement@1",
    "id": "<artifact id>",
    "body": { "label": "head", "revision": "<commit SHA>", "exit_code": 0, "tests": [] },
    "parents": ["<digest of each artifact this one builds on>"],
    "producer": "<who produced it>",
    "time": "<unix milliseconds, a number>",
    "key_id": "<id of the signing key>",
    "meta": {
      "daggry/tenant": "<tenant id>",
      "daggry/run": "<run id>",
      "daggry/job": "<job id>",
      "daggry/attempt": 1,
      "daggry/step": "<step id>"
    },
    "digest": "<digest>",
    "signature": "<signature>"
  }
}
```

| Placeholder | Meaning |
|---|---|
| `<link of the entry before, or the genesis digest>` | 64 lowercase hex digits. |
| `<commit SHA>` | The 40-digit commit the measurement is of. |
| `<unix milliseconds, a number>` | An integer, not a string. |
| `<tenant id>`, `<run id>`, `<job id>`, `<step id>` | Ids the control plane stamps. |

## Verification errors

`daggry verify` recomputes, for each entry and in this order, the link, the digest and the signature. It stops at the first failure. It then fetches every referenced blob and re-hashes it. For the command, see [CLI](/reference/cli). For the task, see [Verify a run](/guide/how-to/verify-a-run).

| Error | Meaning |
|---|---|
| `entry <i>: prev does not match the link of the entry before it` | The chain is broken or reordered. |
| `entry <i>: digest does not match the content` | A covered field changed. |
| `entry <i>: no public key for key id <id>` | The key id is unknown. |
| `entry <i>: signature does not verify` | The signature is wrong for this link and key. |
| `entry <i>: <canonicalisation failure>` | A field cannot be written as canonical JSON. |
| `blob <digest> does not hash to its digest` | A referenced blob changed. |

Error text for the `meta`, number and format rules:

| Message | Cause |
|---|---|
| `meta key "<key>" is not <namespace>/<key>` | A key without the one-slash form. |
| `meta takes <n> canonical bytes, over the cap of 4096` | The map is too large. |
| `meta value under "<key>" is not a scalar (a string, a number or a boolean)` | A null, object or array value. |
| `number 1.5 is not an integer, so it has no canonical form` | A non-integer number. |
| `format "evidence/envelope@2" is a newer major than evidence/envelope@1 and unknown` | An unknown format major. |

## Worked example: recompute a digest and a link

This example uses the published test vector: a two-entry chain. The signing key is a deterministic test key (32 bytes, each `07`). It is published for implementers and is for tests only. It is not a platform key and signs nothing real.

The bodies are not valid `measurement` bodies. They show the envelope only, where `body` accepts any JSON value. `acme/source` is a test `meta` key, not a platform key.

Key id: `ed25519-fe812c12f3ab4ce6`.

To recompute the digest and the link of the first entry, and then the second:

1. Remove `digest` and `signature` from the artifact.
2. Write the rest as canonical JSON.
3. Hash the bytes with SHA-256. The result is the digest.
4. Hash the 32 bytes of `prev` followed by the 32 bytes of the digest. The result is the link.
5. Use that link as `prev` of the next entry.

The next script does steps 1 to 5 for both entries. Save it as `recompute.py` and run `python3 recompute.py`.

```python
import hashlib

# Entry 1: canonical bytes of every field except digest and signature.
c1 = (b'{"body":{"label":"head","n":0,"revision":"abc"},"format":"evidence/envelope@1",'
      b'"id":"m0","key_id":"ed25519-fe812c12f3ab4ce6","kind":"evidence/measurement@1",'
      b'"parents":[],"producer":"control","time":1000}')
genesis = bytes(32)
d1 = hashlib.sha256(c1).digest()
l1 = hashlib.sha256(genesis + d1).digest()
print("digest 1", d1.hex())
print("link 1  ", l1.hex())

# Entry 2: prev is link 1, and parents names digest 1.
c2 = (b'{"body":{"label":"head","n":1,"revision":"abc"},"format":"evidence/envelope@1",'
      b'"id":"m1","key_id":"ed25519-fe812c12f3ab4ce6","kind":"evidence/measurement@1",'
      b'"meta":{"acme/source":"s1"},"parents":["' + d1.hex().encode() + b'"],'
      b'"producer":"control","time":1001}')
d2 = hashlib.sha256(c2).digest()
l2 = hashlib.sha256(l1 + d2).digest()
print("digest 2", d2.hex())
print("link 2  ", l2.hex())
```

The expected output:

```text
digest 1 8f1ffe80a26e8b0c55bb806e3c6c5dbb555196b1ea5367b555247310d4c1d238
link 1   7fc34ebfe846fffe9398540b0ec1115447d71071be65e56639d5f59ef67a7d2b
digest 2 f8b0387d375d474ddc2f0fc5b838c7495655b1255832a628c56018eed79333ec
link 2   3a77b48ce8bbf8438cb83e1ec3ec53072b7f16a17ac1f17aa9dd649bfc04bd3e
```

`link 1` is the `prev` of entry 2. `link 2` is the chain head recorded in the vector. The signature of each entry is an Ed25519 signature over the 32 bytes of that entry's link. The Python standard library has no Ed25519, so the script does not check signatures.

::: details The two-entry test vector
```json
{
  "entries": [
    {
      "artifact": {
        "body": { "label": "head", "n": 0, "revision": "abc" },
        "digest": "8f1ffe80a26e8b0c55bb806e3c6c5dbb555196b1ea5367b555247310d4c1d238",
        "format": "evidence/envelope@1",
        "id": "m0",
        "key_id": "ed25519-fe812c12f3ab4ce6",
        "kind": "evidence/measurement@1",
        "parents": [],
        "producer": "control",
        "signature": "5ca1c8f7976c9176ce70294380dd5e10f2204991f690eaceb9d6d4f8a3381b9c0d7e912e00af6c8af233242c2d9c300740a861b78d52b61e56004695a382e60e",
        "time": 1000
      },
      "prev": "0000000000000000000000000000000000000000000000000000000000000000"
    },
    {
      "artifact": {
        "body": { "label": "head", "n": 1, "revision": "abc" },
        "digest": "f8b0387d375d474ddc2f0fc5b838c7495655b1255832a628c56018eed79333ec",
        "format": "evidence/envelope@1",
        "id": "m1",
        "key_id": "ed25519-fe812c12f3ab4ce6",
        "kind": "evidence/measurement@1",
        "meta": { "acme/source": "s1" },
        "parents": ["8f1ffe80a26e8b0c55bb806e3c6c5dbb555196b1ea5367b555247310d4c1d238"],
        "producer": "control",
        "signature": "047f80667100c3b884f772b2c419b4dcf7b5a479be96c93eff2192f5f9b09446107350a364a5af4090a105d900f0950762a8e18e9469441d3cc85c1edf7c6c07",
        "time": 1001
      },
      "prev": "7fc34ebfe846fffe9398540b0ec1115447d71071be65e56639d5f59ef67a7d2b"
    }
  ],
  "head": "3a77b48ce8bbf8438cb83e1ec3ec53072b7f16a17ac1f17aa9dd649bfc04bd3e",
  "key_id": "ed25519-fe812c12f3ab4ce6",
  "secret_hex": "0707070707070707070707070707070707070707070707070707070707070707"
}
```

`secret_hex` is the test-only signing key described above. Do not reuse it.
:::

## Envelope JSON Schema

::: details evidence/envelope@1
```json
{
  "$schema": "https://json-schema.org/draft/2020-12/schema",
  "$id": "evidence/envelope@1",
  "title": "evidence/envelope@1: the sealed artifact envelope",
  "type": "object",
  "additionalProperties": false,
  "required": [
    "format",
    "kind",
    "id",
    "body",
    "parents",
    "producer",
    "time",
    "key_id",
    "digest",
    "signature"
  ],
  "properties": {
    "format": {
      "const": "evidence/envelope@1"
    },
    "kind": {
      "type": "string",
      "pattern": "^[^/@]+/[^/@]+@[0-9]+$"
    },
    "id": {
      "type": "string"
    },
    "body": {},
    "parents": {
      "type": "array",
      "items": {
        "$ref": "#/$defs/digest"
      }
    },
    "producer": {
      "type": "string"
    },
    "time": {
      "type": "integer",
      "minimum": 0
    },
    "key_id": {
      "type": "string"
    },
    "meta": {
      "description": "Stamped by code at seal time; part of the digest. Absent when empty. Its canonical JSON is at most 4096 bytes. A value is a string, a number or a boolean.",
      "type": "object",
      "minProperties": 1,
      "additionalProperties": {
        "type": [
          "string",
          "integer",
          "boolean"
        ]
      },
      "propertyNames": {
        "pattern": "^[A-Za-z0-9_-]+/[A-Za-z0-9_-]+$"
      }
    },
    "digest": {
      "$ref": "#/$defs/digest"
    },
    "signature": {
      "type": "string",
      "pattern": "^[0-9a-f]{128}$"
    }
  },
  "$defs": {
    "digest": {
      "type": "string",
      "pattern": "^[0-9a-f]{64}$"
    }
  }
}
```
:::
