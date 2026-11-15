# CLI reference

*Reference*

For the idea, read [How Daggry works](/guide/).

The `daggry` command is the tenant CLI: a client for the control plane's [HTTP API](/reference/api). This page lists every command, flag, output format, exit code and environment variable. For a guided first use, see [Getting started](/guide/getting-started).

## Synopsis

```text
daggry run --workflow <file> --repo <owner>/<name> --item <issue-url>
daggry status <run-id> --json
daggry logs <run-id>
daggry approve <run-id> [--unfreeze <path>]
daggry verify
daggry --help
```

## Environment variables

Every command except help reads these two variables. Neither has a flag, a config file or a login command.

| Variable | Meaning |
|---|---|
| `DAGGRY_URL` | Base URL of the control plane, for example `http://127.0.0.1:<port>`. A trailing `/` is trimmed. |
| `DAGGRY_TOKEN` | The tenant token. Sent as an `Authorization: Bearer` header. Never printed. |

If a variable is missing or empty, the command prints `daggry: <NAME> is not set` to stderr and exits with 2.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success, or `--help`. |
| 1 | A `verify` mismatch, an API refusal, a transport failure, a file the CLI cannot read, a workflow file that is not UTF-8, or a failed write to stdout. |
| 2 | A usage error (unknown command, missing or extra argument, `status` without `--json`), or a missing or empty environment variable. |

## Error output

An error goes to stderr as one line that starts with `daggry:`.

| Form | Meaning |
|---|---|
| `daggry: refused: <status>: <text>` | The control plane refused the request. The text is cut to 200 characters. |
| `daggry: transport failure: <reason>` | The CLI could not complete the call. |
| `daggry: <NAME> is not set` | A required environment variable is missing or empty. |

The HTTP client uses a 10-second connect timeout and a 60-second timeout for each call.

## daggry run

Starts a run of a workflow for a work item.

```text
daggry run --workflow <file> --repo <owner>/<name> --item <issue-url>
```

| Flag | Required | Meaning |
|---|---|---|
| `--workflow <file>` | yes | Path to the workflow file. |
| `--repo <owner>/<name>` | yes | The repository the run works on. |
| `--item <issue-url>` | yes | The issue, as `https://github.com/<owner>/<name>/issues/<n>`, in the same repository. |

On success the command prints the run ID and a newline, and nothing else. A run ID has the form `run-` followed by 16 hexadecimal digits.

```sh
daggry run --workflow flow.yaml --repo <owner>/<name> --item https://github.com/<owner>/<name>/issues/<n>
```

```text
run-0123456789abcdef
```

The CLI reads the workflow file as UTF-8. If the file cannot be read, the command exits with 1 and no run starts.

The control plane refuses the run with a 400 and a reason when:

- the repository is not of the form `<owner>/<name>`;
- the item is not an issue URL of that same repository;
- the workflow does not load (the reason starts with `workflow:`);
- the repository or the issue is not found on GitHub.

## daggry status

Prints the state of a run as one line of JSON.

```text
daggry status <run-id> --json
```

| Argument or flag | Required | Meaning |
|---|---|---|
| `<run-id>` | yes | The run to read. |
| `--json` | yes | The only output form. Without it, the command is a usage error. |

```sh
daggry status run-0123456789abcdef --json
```

```json
{"state":"waiting","attempts":[{"job":"main","n":1,"state":"waiting"}],"waiting_for":"approval"}
```

| Field | Type | Meaning |
|---|---|---|
| `state` | string | The run state. See [states](/reference/api#states-and-reasons). |
| `attempts` | array | Every attempt of every job, oldest first, as `{job, n, state}`. |
| `waiting_for` | string or null | The reason a person is needed. Always present, and `null` unless `state` is `waiting`. |

A run that belongs to another tenant reads as `unknown run`.

## daggry logs

Lists the sealed artifacts of a run, in order.

```text
daggry logs <run-id>
```

Each line has this form:

```text
<kind> <id> <producer> <digest-prefix> [<summary> [<summary>]]
```

| Part | Meaning |
|---|---|
| `<kind>` | The artifact kind, such as `daggry/observation@1`. |
| `<id>` | The artifact ID. |
| `<producer>` | The identity that produced the artifact. |
| `<digest-prefix>` | The first 12 hexadecimal digits of the artifact's digest. |
| `<summary>` | Up to two words. For `daggry/observation@1`, the `record`, then the `path` or `step`. For `evidence/measurement@1`, the `label` and the `revision`. Other kinds print none. |

```sh
daggry logs run-0123456789abcdef
```

```text
daggry/run-lock@1 run-lock control 7d3b0c91a4e2
daggry/work-item@1 work-item control c94c24f1751a
daggry/change@1 change-1 control 2019b48c668e
daggry/observation@1 build-restored-2 control 5be08f3a17c4 protected-restored .daggry/profile.yaml
```

The values are illustrative. The summary is a hint and can gain words. Only the kind and the ID are stable. For the ID of each kind, see [Kinds and schemas](/reference/kinds#who-seals-what).

## daggry approve

Completes the `human` step a run waits at.

```text
daggry approve <run-id>
daggry approve <run-id> --unfreeze <path>
```

| Argument or flag | Required | Meaning |
|---|---|---|
| `<run-id>` | yes | The run that waits. |
| `--unfreeze <path>` | no | Opens one sealed test path for change. Valid only at the `human` step of an exhausted loop. |

Both forms print nothing and exit with 0 on success. The control plane seals your approval, with your tenant token's identity as its author, and the job continues in a new attempt.

Without `--unfreeze`, the command approves the wait. At an exhausted loop it gives up the unfinished item. With `--unfreeze <path>`, the loop re-enters the same item with a fresh `max`, and the path can change for that one iteration.

The control plane refuses the request, and seals nothing, when:

| Refusal | Cause |
|---|---|
| `nothing waits for an approval` | The run is not waiting at a `human` step. |
| `not this run` | The run is not yours. |
| `` `<path>` is not a frozen path `` | The path is not in the latest sealed set of frozen test paths. |
| `nothing to approve: no sealed plan` | An `approval` wait with no sealed plan. |
| `nothing to approve: no sealed change` | An `input-needed` wait with no sealed change. |
| `--unfreeze applies only at an exhausted loop's human step` | `--unfreeze` at any other wait. |

## daggry verify

Verifies your tenant's whole chain on your machine.

```text
daggry verify
```

The command takes no argument. It fetches the chain, the seal public keys and every referenced blob, and recomputes digests, links and signatures. On success it prints this line and exits with 0:

```text
verified <n> entries, <m> blobs
```

On a mismatch it prints a one-line reason to stderr and exits with 1. For the reasons and what each means, see [Verify a run](/guide/how-to/verify-a-run).

This command is not the `verify` step of a workflow.

## daggry --help

`daggry --help` and `daggry <command> --help` print help to stdout and exit with 0. Help works with no environment variables set.

The CLI has no `--version` flag.
