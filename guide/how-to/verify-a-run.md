# Verify a run

An agent's report is only a claim, and a record someone can edit later proves nothing.
One command recomputes the evidence trail on your own machine and tells you whether anybody changed it.
Read this page after any run you want to rely on.

## Verify the trail

You do not have to trust the run. Check it.

1. Set `DAGGRY_URL` and `DAGGRY_TOKEN`. See [Run your first workflow](/guide/getting-started).

2. Run the command. It takes no argument.

   ```sh
   daggry verify
   ```

3. Read the result. On success, the command prints one line and exits with 0. The numbers are illustrative.

   ```text
   verified 12 entries, 2 blobs
   ```

   An entry is one record in the trail. A blob is a stored file a record points at, such as the workflow file of a run. The line means that all 12 records and both files matched.

The command verifies the whole trail of your tenant, not one run. A run is verified as part of it.

<VerifyFlow />

The diagram shows the four checks the command makes on your machine and the line it prints.

::: details What does the command check?
The CLI fetches raw data and recomputes the result on your machine.

1. It fetches the whole trail of your tenant, and the public half of each signing key the trail names.
2. It recomputes each record's digest from its bytes, and checks that each record points at the one before it.
3. It checks each record's signature against the public key.
4. It fetches every stored file the trail points at and compares its digest with the recorded one.

For how sealing works, see [Why you can trust a run](/guide/concepts/trust).
:::

## Read a failure

A failure tells you which record to stop trusting. On a mismatch, the command prints one line that starts with `daggry:` and exits with 1.

```text
daggry: entry 2: prev does not match the link of the entry before it
```

- **A mismatch** means a record was changed or damaged. Treat that record and every later one as untrusted.
- **A line with `refused:` or `transport failure:`** means the command could not finish, for example because the CLI could not reach Daggry. That is not a mismatch. Fix the connection and run the command again.

In a script, treat any exit code other than 0 as "not verified". For each message and code, see the [CLI reference](/reference/cli).

## Read who did what

A verified trail is worth reading. `daggry logs <run-id>` lists the records of one run in order, one line for each, with its kind, its ID and the start of its digest. See the [CLI reference](/reference/cli).

The table says what each kind of record tells you.

| Record | Tells you |
|---|---|
| Run lock | What the run started under: the workflow, the validators, the judges and each persona with the digest of its instructions. |
| Change | The version of the workspace a step produced and the paths it changed. |
| Measurement | What a validator reported on that version. |
| Verdict | What a judge decided from the trail. |
| Plan | What a persona proposed, version by version. |
| Input | What someone said on the issue or the pull request: who, whether they are an approver, and for a review comment the file and line. |
| Approval | Who approved, the digest of the plan or the change they approved and, for a comment, the phrase that was read as the yes. |
| Observation | What was delivered and, when an effect ran with no person, the facts that allowed it. |

The conversation is in the trail too. A comment someone later edits or deletes on GitHub changes nothing: the sealed input and approval records are what count. See [Comments and approvals](/reference/conversation).

Every record that an `agent` step sealed also carries the name of the persona that did the work and the digest of its instructions. Compare that digest with the one in the run lock to confirm which instructions the agent worked under. For where a record carries these, see [Stamped keys](/reference/envelope#stamped-keys).

## What this does not prove

A verified trail does not say the work was good. It proves that nobody without the signing key changed, reordered or removed a record in the middle of the trail. A result is only as good as the validator that produced it.

The command takes the public key from the same Daggry that serves the trail. Removing the newest records, or a rewrite by someone who holds the signing key, shows only against a signed copy of the trail's head kept outside the cluster.

The `verify` command is also not the `verify` step of a workflow. The step validates the work during a run. The command verifies the trail afterwards.

::: details Can I check one record without Daggry?
Yes. Every record format has a published JSON Schema, and any tool that supports draft 2020-12 can check a record's shape. These commands use `check-jsonschema`.

1. Install the checker.

   ```sh
   pip install check-jsonschema
   ```

2. Download the schema for the kind of record, here a plan.

   ```sh
   curl -sO https://daggry.dev/schemas/evidence-plan-v1.json
   ```

3. Save a plan to check as `plan.json`. This one is illustrative.

   ```json
   {
     "criteria": [
       { "id": "C1", "text": "Every section cites a source." },
       { "id": "C2", "text": "Every link resolves." }
     ]
   }
   ```

4. Check the plan against the schema.

   ```sh
   check-jsonschema --schemafile evidence-plan-v1.json plan.json
   ```

   ```text
   ok -- validation done
   ```

A schema checks shape only, not the digest or the signature, so finish with `daggry verify`. For the formats, see [Artifact kinds](/reference/kinds).
:::

Related:

- [Why you can trust a run](/guide/concepts/trust)
- [CLI reference](/reference/cli)
