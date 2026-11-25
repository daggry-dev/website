# Why you can trust a run

An agent says "all tests pass". That sentence is a claim: the agent can be wrong, can misread a result, or can pass a test it rewrote. Daggry replaces the claim with records you can check yourself. Read this page if you decide whether to rely on a run, or if someone asks you why they should.

<Compare />

The comparison shows two accounts of the same work. Without Daggry, the agent's own words are the only account. With Daggry, code checked the work again and sealed the result into a trail you can verify.

You get three things:

- **Validators.** Code checks every step, so the same work always gets the same result.
- **An evidence trail.** Every record is signed and linked to the records before it.
- **Open formats.** Every record format is published, so you can read the trail with your own tools.

## Validators: nobody can talk code into a pass

An agent that grades an agent can be persuaded, and can answer differently on different days. Validators measure. Judges judge. A gate decides when to stop. A validator is a command that measures the work. A judge turns the evidence trail into a verdict of pass or fail. A validator and a judge that is a command give the same result for the same work.

<CheckFlow />

The diagram shows the evidence trail going into a judge, the judge returning a verdict of pass or fail, and that verdict opening or closing a gate.

For example, a criterion of the plan counts as covered only when a passing finding carries its id. The agent can say "C2 is covered", but the `coverage` judge agrees only when the result shows it.

::: details Where does a validator run?
No validator runs where an agent can write, and none starts an agent.

- **Your validator** is a command that `.daggry/project.yaml` declares. It runs on a clean copy of the workspace, after the agent process has ended. It reports a measurement, and a judge decides the verdict. It counts as evidence because Daggry reads it from the version the run started from, and an agent cannot change that version.
- **A judge** is given the evidence trail and decides the verdict. Every `verify` step has a default judge, and you add more with `judges`, such as `coverage`. See [Judges](/reference/judges).

To add your own, see [Add a validator](/guide/how-to/add-a-validator).
:::

## Sealing: a change to the trail shows

A record you can edit later proves nothing. To seal a record, Daggry takes its digest, combines the digest with a link to the trail so far, and signs the result. A digest is a short code computed from every byte of the record. Each record therefore vouches for all the records before it.

<SealFlow />

The diagram shows a record becoming a digest, the digest combined with the trail so far, and the combination signed.

Suppose someone changes the `exit_code` of an old record from 1 to 0. Its digest changes, so its signature fails, and so does every later record. One command finds the change.

```sh
daggry verify
```

```text
daggry: entry 2: digest does not match the content
```

The output calls one record in the trail an entry, and the code that identifies it a digest. Every record format is a published JSON Schema under `/schemas/` on this site, so your own tools can read the trail too. See [Verify a run](/guide/how-to/verify-a-run).

## What a seal does not prove

A seal is not a quality stamp: a result is only as good as the validator that produced it.

<SealedRecord />

The trail is tamper-evident, not tamper-proof. `daggry verify` takes the public key from the same control plane that serves the trail. So it proves this: nobody without the signing key changed, reordered or removed a record in the middle of the trail. Two cases need a signed copy of the newest link, kept outside the cluster: someone drops the newest records, or someone with the signing key rewrites everything. For every field of a record, see the [Evidence envelope](/reference/envelope).

Related:

- [Verify a run](/guide/how-to/verify-a-run)
- [What an agent cannot change](/guide/concepts/protection)
- [Add a validator](/guide/how-to/add-a-validator)
