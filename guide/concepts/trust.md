# Why you can trust a run

A coding agent says "all tests pass". That sentence is a claim. The agent can be wrong, can misread a result, or can pass a test it rewrote. Daggry replaces that claim with three things you can check.

<Compare />

On the left, the agent's own words are the only record. On the right, code re-ran the tests, reduced the output to a record and sealed it into a trail you can check.

The three guarantees:

- **An evidence trail.** Every record is linked to the ones before it and signed.
- **Checks written as code.** The same work always gets the same verdict.
- **Public schemas.** Every record format is published, so you can read the trail with your own tools.

## Sealing: a tamper-evident trail

A record you can edit later proves nothing. Sealing takes a fingerprint of the record, combines it with a link to the trail so far, and signs the result. Each record therefore vouches for all the records before it.

<SealFlow />

The diagram shows a record becoming a fingerprint, the fingerprint combined with the trail so far, and the combination signed.

Suppose someone changes the `exit_code` of an old measurement from 1 to 0. Its fingerprint changes, so its signature fails, and so does every later record. One command finds it:

```sh
daggry verify
```

```text
daggry: entry 2: digest does not match the content
```

The trail is tamper-evident, not tamper-proof. `daggry verify` takes the public key from the same control plane that serves the trail. So it proves this: nobody without the seal key changed, reordered or removed a record in the middle of the trail. Dropping the newest records, or someone with the seal key rewriting everything, is caught only against a signed head kept outside the cluster. For every field, see the [envelope reference](/reference/envelope).

## Checks: a model cannot be talked into a pass

A model grading a model can be persuaded, and can answer differently on different days. A validator is a check written as code. It reads only records that are already sealed, and the same records always give the same verdict.

<CheckFlow />

The diagram shows sealed records going into a check written as code, the check producing a verdict, and the verdict opening or closing a gate.

For example, a check takes a sealed plan and a sealed test result. A criterion counts as covered only when a passing test carries its id. The agent can say "C2 is covered", but the check says so only when the result shows it.

## Schemas: a proof you can read yourself

A proof only the vendor's tool can read is not a proof. Every record format is a published JSON Schema under `/schemas/` on this site. Any tool that supports draft 2020-12 can check a record against it. The schemas say what a record is allowed to be. The checks say what the record found. The trail says that neither changed afterwards.

## What a seal does not prove

A seal proves the check ran and the record is unchanged. It does not prove your tests are the right ones. A passing verdict means the rule held for its inputs, and a test result is only as good as the test command it ran.

## Next steps

- To check your own record, follow [Verify a run](/guide/how-to/verify-a-run).
- To read every kind, see [Kinds and schemas](/reference/kinds).
- To write a gate that reads checked facts, see the [gate reference](/reference/gates).
