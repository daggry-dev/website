# Why you can trust a run

An agent says "all tests pass". That sentence is a claim: the agent can be wrong, can misread a result, or can pass a test it rewrote. Daggry replaces the claim with records you can check yourself. Read this page if you decide whether to rely on a run, or if someone asks you why they should.

<Compare />

The comparison shows two accounts of the same work. Without Daggry, the agent's own words are the only account. With Daggry, code checked the work again and sealed the result into a trail you can verify.

You get three things:

- **Validators.** Code checks every step, so the same work always gets the same result.
- **An evidence trail.** Every record is signed and linked to the records before it.
- **Open formats.** Every record format is published, so you can read the trail with your own tools.

## Validators: nobody can talk code into a pass

An agent that grades an agent can be persuaded, and can answer differently on different days. A validator is named code that checks the work and returns pass or fail. It reads records that are already sealed, and the same records always give the same result.

<CheckFlow />

The diagram shows sealed records going into a validator, the validator returning pass or fail, and that result opening or closing a gate.

For example, a validator reads a sealed plan and a sealed result. A plan item counts as covered only when a passing finding carries its id. The agent can say "C2 is covered", but the validator says so only when the result shows it.

::: details Where does a validator run?
No validator runs where an agent can write, and none starts an agent.

- **A built-in validator** ships with Daggry and runs in the control plane. It reads only sealed records.
- **A native validator** is installed by the cluster admin. It reads only sealed records.
- **A script validator** is a script of yours. It runs on a clean copy of the workspace, after the agent process has ended. The script reports a result, and Daggry, not the script, decides pass or fail.

To add your own, see [Add a validator](/guide/how-to/add-a-validator).
:::

## Sealing: a change to the trail shows

A record you can edit later proves nothing. To seal a record, Daggry takes its fingerprint, combines the fingerprint with a link to the trail so far, and signs the result. A fingerprint is a short code computed from every byte of the record. Each record therefore vouches for all the records before it.

<SealFlow />

The diagram shows a record becoming a fingerprint, the fingerprint combined with the trail so far, and the combination signed.

Suppose someone changes the `exit_code` of an old record from 1 to 0. Its fingerprint changes, so its signature fails, and so does every later record. One command finds the change.

```sh
daggry verify
```

```text
daggry: entry 2: digest does not match the content
```

The output says entry for a record and digest for a fingerprint. Every record format is a published JSON Schema under `/schemas/` on this site, so your own tools can read the trail too. See [Verify a run](/guide/how-to/verify-a-run).

## What a seal does not prove

A seal is not a quality stamp. It proves that a validator ran and that the record is unchanged. It does not prove that your validators are the right ones: a result is only as good as the validator that produced it.

The trail is tamper-evident, not tamper-proof. `daggry verify` takes the public key from the same control plane that serves the trail. So it proves this: nobody without the signing key changed, reordered or removed a record in the middle of the trail. Two cases need a signed copy of the newest link, kept outside the cluster: someone drops the newest records, or someone with the signing key rewrites everything. For every field of a record, see the [Evidence record format](/reference/envelope).

Related:

- [Verify a run](/guide/how-to/verify-a-run)
- [What an agent cannot change](/guide/concepts/protection)
- [Add a validator](/guide/how-to/add-a-validator)
