# Verify a run

This page shows you how to check, on your own machine, that the sealed record of your runs has not changed. It is for anyone who starts runs and wants to trust the result without trusting the control plane's say-so. It takes one command.

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

The command checks the whole chain of your tenant, not one run. A run is verified as part of it. Run the command after any run you want to rely on.

## Read a failure

On a mismatch, the command prints one line to stderr that starts with `daggry:`, and exits with 1.

```text
daggry: entry 2: prev does not match the link of the entry before it
```

The reasons you can see are in this table.

| Reason | What it means |
|---|---|
| `entry <i>: prev does not match the link of the entry before it` | The chain is broken or reordered. An entry was removed, reordered or replaced. |
| `entry <i>: digest does not match the content` | A covered field changed after the entry was sealed. |
| `entry <i>: no public key for key id <id>` | The key id is unknown, so the signature cannot be checked. |
| `entry <i>: signature does not verify` | The signature is wrong for this link and key. The entry was not sealed by the control plane's key. |
| `entry <i>: <canonicalisation failure>` | A field cannot be written as canonical JSON. |
| `blob <digest> does not hash to its digest` | A stored file that the log references changed. |
| `refused: ...` | The control plane refused a request the check needs, for example a blob that does not exist. |
| `transport failure: ...` | The CLI could not reach the control plane. The check did not complete. |

The CLI recomputes the link, the digest and the signature of each entry, in that order, and stops at the first failure. `<i>` is the position of the entry in your chain, counted from 0.

A `prev`, digest, key or signature failure means the record was altered or damaged. Treat the affected entry and every later one as untrusted. A `refused` or `transport failure` message means the check could not finish, which is different from a mismatch. Fix the connection and run the command again.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | The chain, the signatures and the blobs all match. |
| 1 | A mismatch, an API refusal or a transport failure. |
| 2 | A usage error, or `DAGGRY_URL` or `DAGGRY_TOKEN` is missing or empty. |

In a script, treat any non-zero code as "not verified".

## What the command checks

The CLI does not trust what the control plane says about itself. It fetches raw data and recomputes the result.

1. It fetches the whole chain of your tenant.
2. It fetches the seal public key for every key ID that appears in the chain.
3. It recomputes each entry's digest from its bytes and checks that each entry points at the one before it.
4. It checks each entry's signature against the public key.
5. It fetches every blob the log references, hashes it and compares the hash with the recorded digest. The blobs include the workflow file of each run.

For how sealing works, see [Sealed evidence](/guide/concepts/evidence).

## Know what the command is not

The `verify` command is not the `verify` step of a workflow. The step measures a fresh worktree with the project's test command while a run is in progress. The command checks the sealed record after the fact. For the step, see [Write a workflow](/guide/how-to/write-a-workflow).

The check proves that the record is intact and was signed by the key. It does not prove that the work in a run was good. For that, read the gates and the measurements in the log with `daggry logs <run-id>`.

## Next steps

- To read the CLI details, see the [CLI reference](/reference/cli).
- To learn what is in the chain, read [Sealed evidence](/guide/concepts/evidence).
