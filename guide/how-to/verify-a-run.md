# Verify a run

An agent's report is only a claim, and a record someone can edit later proves nothing. One command recomputes the evidence trail on your own machine and tells you whether anybody changed it. Read this page after any run you want to rely on.

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

::: details What does the command check?
The CLI fetches raw data and recomputes the result on your machine.

1. It fetches the whole trail of your tenant, and the public half of each signing key the trail names.
2. It recomputes each record's fingerprint from its bytes, and checks that each record points at the one before it.
3. It checks each record's signature against the public key.
4. It fetches every stored file the trail points at and compares its fingerprint with the recorded one.

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

## What this does not prove

A verified trail does not say the work was good. It proves that nobody without the signing key changed, reordered or removed a record in the middle of the trail. To see whether the work was good, read what the validators reported with `daggry logs <run-id>`.

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
   curl -sO https://thinkability.github.io/daggry-website/schemas/evidence-plan-v1.json
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

A schema checks shape only, not the fingerprint or the signature, so finish with `daggry verify`. For the formats, see [Open formats](/reference/open-formats).
:::

Related:

- [Why you can trust a run](/guide/concepts/trust)
- [CLI reference](/reference/cli)
