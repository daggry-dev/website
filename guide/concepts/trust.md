# Why you can trust a run

An agent says "all checks pass". That sentence is a claim. The agent can be wrong, can misread a result, or can pass a check it rewrote. Daggry replaces that claim with three things you can check.

<Compare />

The comparison shows two records of the same work. Without Daggry, the agent's own words are the only record. With Daggry, code ran the checks again, reduced the output to a record and sealed it into a trail you can check.

Daggry gives three guarantees:

- **An evidence trail.** Every record is linked to the ones before it and signed.
- **Checks written as code.** The same work always gets the same verdict.
- **Public schemas.** Every record format is published, so you can read the trail with your own tools.

## Sealing: a tamper-evident trail

A record you can edit later proves nothing. Sealing takes a fingerprint of the record, combines it with a link to the trail so far, and signs the result. Each record therefore vouches for all the records before it.

<SealFlow />

The diagram shows a record becoming a fingerprint, the fingerprint combined with the trail so far, and the combination signed.

Suppose someone changes the `exit_code` of an old measurement from 1 to 0. Its fingerprint changes, so its signature fails, and so does every later record. One command finds the change.

```sh
daggry verify
```

```text
daggry: entry 2: digest does not match the content
```

The trail is tamper-evident, not tamper-proof. `daggry verify` takes the public key from the same control plane that serves the trail. So it proves this: nobody without the seal key changed, reordered or removed a record in the middle of the trail. Dropping the newest records, or someone with the seal key rewriting everything, is caught only against a signed head kept outside the cluster. For every field, see the [envelope reference](/reference/envelope).

## Checks: a model cannot be talked into a pass

A model grading a model can be persuaded, and can answer differently on different days. A validator is a check written as code. It takes inputs that are already sealed, and the same inputs always give the same verdict.

<CheckFlow />

The diagram shows sealed records going into a check written as code, the check producing a verdict, and the verdict opening or closing a gate.

For example, a validator takes a sealed plan and a sealed result. A criterion counts as covered only when a passing finding carries its id. The agent can say "C2 is covered", but the validator says so only when the result shows it.

### Where each validator runs

A verdict is derived by code, whichever source the validator comes from.

- **A built-in validator** ships with the platform and runs in the control plane, over sealed inputs.
- **A native validator** runs in-process with the control plane, or as a service that speaks the validator protocol. It is a pure function over sealed inputs, so it has nothing to read but the records.
- **A script validator** runs in the deterministic runner, on a clean copy of the workspace, after the agent process has ended. The script reports a result, as an exit code or a result document, and never its own verdict: a built-in validator derives the verdict from the sealed result. Code judges, never a script's own claim.

No validator runs where an agent can write, and none starts a model. See [Validators: the extension point](/guide/concepts/validators).

## Schemas: a proof you can read yourself

A proof only the vendor's tool can read is not a proof. Every record format is a published JSON Schema under `/schemas/` on this site. Any tool that supports draft 2020-12 can check a record against it. The schemas say what a record is allowed to be. The validators say what the record found. The trail says that neither changed afterwards.

## What a seal does not prove

A seal proves the check ran and the record is unchanged. It does not prove your checks are the right ones. A passing verdict means the rule held for its inputs, and a result is only as good as the validator that produced it.

## Next steps

- To check your own record, follow [Verify a run](/guide/how-to/verify-a-run).
- To read every kind, see [Kinds and schemas](/reference/kinds).
- To write a gate that reads checked facts, see the [gate reference](/reference/gates).
