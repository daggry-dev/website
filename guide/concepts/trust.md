# Why you can trust a run

An agent says "all tests pass". That sentence is a claim: the agent can be wrong, can misread a result, or can pass a test it rewrote.
Daggry replaces the claim with an evidence trail: one sealed record for each result, which you can verify yourself.
Read this page if you decide whether to rely on a run, or if someone asks you why they should.

<Compare />

The comparison shows two accounts of the same work. Without Daggry, the agent's own words are the only account. With Daggry, code checked the work again and sealed the result into a trail you can verify.

## The evidence trail

You rely on a run by reading its trail, so you need five words.

- A **claim** is what an agent says it did, before code has checked it. A claim is never evidence.
- To **seal** a result is to check it with code, then sign it so that a later change shows.
- A **record** is one sealed result. **Evidence** is sealed records, and nothing else.
- A **digest** is a short code computed from every byte of a record. It names the record by its content.
- The **signing key** signs records. It stays in the control plane and never enters a runner, so no agent can sign a record.

The evidence trail is the signed, linked list of every record of your tenant, in order. Every step of a run adds to it.

<StepTrail />

The diagram shows what each kind of step seals. The start of a run seals what the run is pinned to and the work item. An `agent` step seals a change and its outputs, such as a plan, with the name of its persona and the digest of its instructions. A proof step also seals the frozen paths, the measurement that shows the proof failing and the verdict on it. A `command` step seals a change. A `verify` step seals one measurement for each validator and one verdict for each judge. A `human` step seals a person's answer bound to a digest: an approval, or their input in free text. An `effect` step seals the delivery.

So the trail answers four questions for every result: what was asked and who asked it, who did the work and under which instructions, what code measured, and what a person approved. The first is the objective of the run. Daggry seals it before any agent works, with its origin: an issue, a trigger or a command.

## Code decides, not a model

An agent that grades an agent can be persuaded, and can answer differently on different days. So a model never judges a model's work. Validators measure. Judges judge. A gate decides when to stop.

<CheckFlow />

The diagram shows the evidence trail going into a judge, the judge returning a verdict of pass or fail, and that verdict opening or closing a gate.

A validator is a command you declare. It runs on a clean copy of the workspace, after the agent process has ended, and Daggry seals what it reports as a measurement. A judge is given the trail and decides a verdict, which Daggry seals too. A gate reads the verdict and never the agent's words.

For example, a criterion of the plan counts as covered only when a passing finding carries its id. The agent can say "C2 is covered", but the `coverage` judge agrees only when the result shows it.

Two limits keep this rule whole. A reviewer's finding stops work only when code can confirm what it cites. Anything else is advice. And the one model that can judge is a rubric judge: a bounded model that answers for one criterion, under a rubric a person approved. See [Validators](/reference/validators) and [Judges](/reference/judges).

## Sealing: a change to the trail shows

A record you can edit later proves nothing. To seal a record, Daggry takes its digest, combines the digest with a link to the trail so far, and signs the result. Each record therefore vouches for all the records before it.

<SealFlow />

The diagram shows a record becoming a digest, the digest combined with the trail so far, and the combination signed.

Suppose someone changes the `exit_code` of an old record from 1 to 0. Its digest changes, so its signature fails, and so does every later record. One command finds the change.

```sh
daggry verify
```

```text
daggry: entry 2: digest does not match the content
```

The output calls one record in the trail an entry. Every record format is a published JSON Schema under `/schemas/` on this site, so your own tools can read the trail too. See [Verify a run](/guide/how-to/verify-a-run).

## What a seal does not prove

Know the limits before you rely on the trail.

<SealedRecord />

The diagram shows what a sealed record contains: the result, what code added at sealing, the digest and the signature. It also shows what a seal proves and what it does not.

- **A seal is not a quality stamp.** It proves that code checked the result and that the record is unchanged. It does not prove that the result is true or that you chose the right validators. A result is only as good as the validator behind it.
- **The trail is tamper-evident, not tamper-proof.** `daggry verify` takes the public key from the same control plane that serves the trail. It proves that nobody without the signing key changed, reordered or removed a record in the middle of the trail. Two cases need a signed copy of the newest link, kept outside the cluster: someone drops the newest records, or someone with the signing key rewrites everything.
- **Daggry guards against an agent that makes mistakes, not one that attacks.** Text in a work item can mislead an agent. Daggry marks a step's inputs as data and not as instructions, which lowers the risk and does not remove it.
- **A comment is a claim until it is sealed.** Anyone can write on an issue. Daggry counts a reply only from a person on the project's approver list who can write to the repository, never from a bot, and seals it bound to the digest of what it answers. Text on an issue can still mislead an agent, and Daggry does not solve that. What limits the damage is that only a verified person's reply counts as an answer, and only code decides whether work passes or merges. See [Comments and approvals](/reference/conversation).
- **Unattended is not unsupervised.** A run waits at the approvals you placed, and you still review the result. For software, you decide on the issue and on the pull request.

For every field of a record, see the [Evidence envelope](/reference/envelope).

Related:

- [Verify a run](/guide/how-to/verify-a-run)
- [What an agent cannot change](/guide/concepts/protection)
- [Add a validator](/guide/how-to/add-a-validator)
