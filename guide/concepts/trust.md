# Why you can trust a run

You can trust a Daggry run because three things hold together: every artifact is sealed into a signed chain, code judges agent work, and every artifact format has a public schema. This page explains each one and shows how to check them yourself. It is for people who decide whether to rely on a run and for anyone who audits one.

## The problem: an agent's word is not evidence

A coding agent says "all tests pass". That sentence is a claim. The agent can be wrong, can misread a result, or can pass a test it rewrote. If the only record is the agent's own account, you have to trust the agent.

<Compare />

On the left, the agent's own words are the only record. On the right, code reran the tests, reduced the output to a record and sealed it into a chain you can check.

Daggry removes the need for that trust with three guarantees.

| Guarantee | In one sentence |
|---|---|
| Evidence trail | Every artifact is sealed into a hash-chained, signed log that anyone can recheck. |
| Code validators | Deterministic code judges agent work. A language model can judge only one named criterion, under a rubric a person approved, and its verdict is marked `judged`. |
| Public schemas | Every artifact and the envelope around it has a published JSON Schema. |

## Pillar 1: the evidence trail

Daggry seals every artifact. A seal fixes the artifact's content as a digest, links it to the entry before it, and signs the link with an Ed25519 key that the control plane holds. The result is a Merkle chain in two directions.

- **Lineage.** `parents` names the artifacts this one builds on. A verdict names the measurement it judged, the measurement names the change it measured, and the change names the plan.
- **Log.** Each tenant has a hash-chained log. Each entry holds `prev`, the link of the entry before it. Changing, reordering or removing an entry breaks every later link and signature.

<ChainDiagram />

The diagram shows two log entries. Each holds an artifact digest, a link made from the previous link and that digest, and a signature over the link. Changing any byte in the first entry breaks every later link and signature.

For example, suppose someone edits the `exit_code` of an old measurement from 1 to 0. The measurement's digest changes, so its link changes, so its signature fails, and so does the `prev` check of every entry after it. Anyone can find this with one command:

```sh
daggry verify
```

```text
daggry: entry 2: digest does not match the content
```

The command recomputes every link, digest and signature on your machine from the entries' bytes. It does not rely on the server's word. It stops at the first failure and prints one of these reasons. `<i>` is the position of the entry in your chain.

| Reason | What it means |
|---|---|
| `entry <i>: prev does not match the link of the entry before it` | The chain is broken or reordered. |
| `entry <i>: digest does not match the content` | A covered field changed. |
| `entry <i>: no public key for key id <id>` | The key id is unknown. |
| `entry <i>: signature does not verify` | The signature is wrong for this link and key. |
| `entry <i>: <canonicalisation failure>` | A field cannot be written as canonical JSON. |
| `blob <digest> does not hash to its digest` | A referenced blob changed. |

Each entry's `prev` is the link of the entry before it. The sealing steps are in [Sealed evidence](/guide/concepts/evidence), and every field is in the [envelope reference](/reference/envelope).

## Pillar 2: code validators judge

A validator is a deterministic function from sealed inputs to a verdict. It reads artifacts that are already sealed and returns a status (`pass`, `fail` or `inconclusive`), findings and derived facts. The same inputs always give the same verdict. No model is in the loop, with one marked exception described below.

Verification has three parts:

| Run | Where | Counts as evidence |
|---|---|---|
| Measure | In the job's pod, on a fresh worktree of the sealed commit, as a different unix user after the agent has ended | Once the control plane accepts it |
| Preview | In the pod, so the agent gets quick feedback | No |
| Judge | In the control plane, with the same validator code, pinned in the run lock | Yes |

Only the judge's verdict is sealed, and only sealed verdicts open gates. A gate, the expression that decides whether a loop ends, reads only `derived` facts, which code computed from sealed inputs. A fact an agent wrote (`claimed`) is refused when the workflow loads.

The one exception is the `judged` fact class. A language model can give a verdict on one named criterion, and only under a rubric that a person approved for that criterion. The fact is marked `judged`, never `derived`, and a gate can read it only once the rubric is approved. Code judges everything else.

For example, the `criterion-coverage` validator takes a sealed plan and a sealed measurement. A criterion counts as covered only when a test that passed carries its id. The agent can say "C2 is covered", but the fact `all_covered` is true only when the measurement shows it.

For the gate grammar and the fact classes, see the [gate reference](/reference/gates). For each validator, see [Kinds and schemas](/reference/kinds).

## Pillar 3: public schemas for artifacts and evidence

Every envelope and every kind has a published JSON Schema (draft 2020-12). You can download them from this site at stable URLs under `/schemas/`. The files cover the envelope, the eight kinds and the workflow file. Every schema refuses unknown fields, so a record that does not match is refused instead of read in part.

This lets you write your own reader or auditor without asking the platform. A tool you build checks a body against the schema for its kind, and a log entry against the envelope schema. For example, a sealed artifact must have a 64-digit digest and a 128-digit signature, or it is not an envelope. For the list of files, see [Kinds and schemas](/reference/kinds) and [Envelope](/reference/envelope).

## How the three fit together

1. **Claim.** An agent step submits a draft of `kind`, `id` and `body`. This is a claim.
2. **Verdict.** The control plane checks the body against the kind's schema. A validator turns sealed inputs into a verdict.
3. **Seal.** The control plane adds the envelope fields, links the entry into the tenant's chain and signs the link.
4. **Verify.** Anyone fetches the chain, recomputes it with `daggry verify`, and checks each artifact against the public schemas.

The schemas say what a record is allowed to be. The validators say what the record found. The chain says that neither changed afterwards.

## Check it yourself

To check a record without trusting Daggry, you need a JSON Schema tool and the CLI. The commands below use `check-jsonschema`. Any tool that supports draft 2020-12 works.

1. Install the checker.

   ```sh
   pip install check-jsonschema
   ```

2. Download the schema for the kind you want to check. Replace `<site-url>` with the address of this site.

   ```sh
   curl -sO <site-url>/schemas/evidence-plan-v1.json
   ```

3. Save a body to check. This plan is illustrative.

   ```json
   {
     "criteria": [
       { "id": "C1", "text": "An expired token is rejected with 401." },
       { "id": "C2", "text": "A valid token still passes." }
     ]
   }
   ```

   Save it as `plan.json`.

4. Validate the body against the schema.

   ```sh
   check-jsonschema --schemafile evidence-plan-v1.json plan.json
   ```

   ```text
   ok -- validation done
   ```

   An empty `criteria` list fails with `$.criteria: [] should be non-empty`.

5. To check a whole sealed artifact, download `evidence-envelope-v1.json` the same way and validate the artifact's JSON against it. The schema checks shape only. It does not check the digest or the signature.

6. To check the digests, links and signatures, run the CLI against your tenant. Set `DAGGRY_URL` and `DAGGRY_TOKEN` first.

   ```sh
   daggry verify
   ```

   ```text
   verified 42 entries, 3 blobs
   ```

The step-by-step task, with every failure message, is in [Verify a run](/guide/how-to/verify-a-run).

## What a seal does not prove

A seal attests that code validated the artifact and that the record has not changed since. It does not attest that the artifact is true or that the work is good.

- A passing verdict means the validator's rule held for its inputs. If the rule is weak, the verdict is weak. Read the validators a workflow uses.
- A measurement is only as good as the test command it ran. The seal proves the command ran and what it printed, not that the tests are the right ones.
- The chain proves the entries are intact. Dropping entries from the end of a log is visible only against the signed head that the control plane publishes off-host. See the [Roadmap](/roadmap) for status.

## Next steps

- To check your own record, follow [Verify a run](/guide/how-to/verify-a-run).
- To read every envelope field, see the [envelope reference](/reference/envelope).
- To read every kind, see [Kinds and schemas](/reference/kinds).
- To write a gate that reads derived facts, see the [gate reference](/reference/gates).
