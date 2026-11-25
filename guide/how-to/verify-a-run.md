# Verify a run

An agent's report is only a claim, so you should be able to check the record yourself. This page shows you how to recompute, on your own machine, that the sealed record of your runs has not changed. It takes one command.

## Run the check

1. Set `DAGGRY_URL` and `DAGGRY_TOKEN`. See [Getting started](/guide/getting-started).

2. Run the command. It takes no argument.

   ```sh
   daggry verify
   ```

3. Read the result. On success, the command prints one line and exits with 0. The numbers are illustrative.

   ```text
   verified 12 entries, 2 blobs
   ```

   The line means that the CLI checked 12 log entries and 2 stored blobs, and every one matched.

The command checks the whole trail of your tenant, not one run. A run is verified as part of it. Run the command after any run you want to rely on.

## Read a failure

On a mismatch, the command prints one line to stderr that starts with `daggry:`, and exits with 1.

```text
daggry: entry 2: prev does not match the link of the entry before it
```

For each mismatch reason and what it means, see [Verification errors](/reference/envelope#verification-errors). For a line that starts with `refused:` or `transport failure:`, see [Error output](/reference/cli#error-output).

A `prev`, digest, key or signature failure means the record was altered or damaged. Treat the affected entry and every later one as untrusted. A `refused` or `transport failure` message means the check could not finish, for example because a blob is missing or the CLI could not reach the control plane. That is different from a mismatch. Fix the connection and run the command again.

## Check a record against its schema

To check the shape of one record without Daggry, you need a JSON Schema tool. The commands use `check-jsonschema`. Any tool that supports draft 2020-12 works.

1. Install the checker.

   ```sh
   pip install check-jsonschema
   ```

2. Download the schema for the kind you want to check.

   ```sh
   curl -sO https://thinkability.github.io/daggry-website/schemas/evidence-plan-v1.json
   ```

3. Save a body to check as `plan.json`. This plan is illustrative.

   ```json
   {
     "criteria": [
       { "id": "C1", "text": "Every section cites a source." },
       { "id": "C2", "text": "Every link resolves." }
     ]
   }
   ```

4. Validate the body against the schema.

   ```sh
   check-jsonschema --schemafile evidence-plan-v1.json plan.json
   ```

   ```text
   ok -- validation done
   ```

   An empty `criteria` list fails with `$.criteria: [] should be non-empty`.

5. To check a whole sealed artifact, download `evidence-envelope-v1.json` the same way and validate the artifact's JSON against it. The schema checks shape only. It does not check the digest or the signature, so finish with `daggry verify`.

## Exit codes

The command exits with 0 when the chain, the signatures and the blobs all match, and with a non-zero code otherwise. For each code, see [Exit codes](/reference/cli#exit-codes). In a script, treat any non-zero code as "not verified".

## What the command checks

The CLI fetches raw data and recomputes the result on your machine.

1. It fetches the whole trail of your tenant.
2. It fetches the seal public key for every key ID that appears in the chain.
3. It recomputes each entry's digest from its bytes and checks that each entry points at the one before it.
4. It checks each entry's signature against the public key.
5. It fetches every blob the log references, hashes it and compares the hash with the recorded digest. The blobs include the workflow file of each run.

`daggry verify` takes the public key from the same control plane that serves the trail. So it proves this: nobody without the seal key changed, reordered or removed a record in the middle of the trail. Dropping the newest records, or someone with the seal key rewriting everything, is caught only against a signed head kept outside the cluster.

For how sealing works, see [Why you can trust a run](/guide/concepts/trust).

## Know what the command is not

The `verify` command is not the `verify` step of a workflow. The step runs the validators it names on the sealed work while a run is in progress. The command checks the sealed record after the fact. For the step, see [Write a workflow](/guide/how-to/write-a-workflow).

The check proves that the record is intact and was signed by the key. It does not prove that the work in a run was good. For that, read the gates, the verdicts and the measurements in the log with `daggry logs <run-id>`.

## Next steps

- To read the CLI details, see the [CLI reference](/reference/cli).
- To learn how sealing works, read [Why you can trust a run](/guide/concepts/trust).
