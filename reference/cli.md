# CLI

*Reference*

This page lists every `daggry` command, flag, output format, exit code and environment variable. Read it when you need the exact form of a command. For a guided first use, follow [Run your first workflow](/guide/getting-started).

Three commands touch the evidence trail. `run` starts a run, and Daggry seals a run lock and the work item as its first two records. `approve` seals your approval, bound to the digest of what you approved. `verify` recomputes the whole trail on your machine. `status` and `logs` only read.

<CliFlow />

The diagram lists the five commands and what each does to the evidence trail.

## Synopsis

```text
daggry run --workflow <file> --workspace <workspace> [--item <item>] [--objective <text>]
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

The table lists the exit codes.

| Code | Meaning |
|---|---|
| 0 | Success, or `--help`. |
| 1 | A `verify` mismatch, an API refusal, a transport failure, a file the CLI cannot read, a workflow file that is not UTF-8, or a failed write to stdout. |
| 2 | A usage error (unknown command, missing or extra argument, `status` without `--json`), or a missing or empty environment variable. |

## Error output

An error goes to stderr as one line that starts with `daggry:`. The table lists the forms.

| Form | Meaning |
|---|---|
| `daggry: refused: <status>: <text>` | The control plane refused the request. The text is cut to 200 characters. |
| `daggry: transport failure: <reason>` | The CLI could not complete the call. |
| `daggry: <NAME> is not set` | A required environment variable is missing or empty. |

The HTTP client uses a 10-second connect timeout and a 60-second timeout for each call.

## daggry run

Starts a run of a workflow. Every run has an objective: what it is asked to do. You give it as a work item, as text, or as both.

```text
daggry run --workflow <file> --workspace <workspace> [--item <item>] [--objective <text>]
```

The table lists the flags.

| Flag | Required | Meaning |
|---|---|---|
| `--workflow <file>` | yes | Path to the workflow file. |
| `--workspace <workspace>` | yes | The workspace the run works on, named as the tenant config names it. |
| `--item <item>` | one of the two | The work item: what names the request where it comes from. For a software project it is the URL of an issue, and the objective is the issue's title and body. See [Workspaces and work items](/reference/project-config#workspaces-and-work-items). |
| `--objective <text>` | one of the two | The objective, as text. With `--item` too, this text comes before the issue's. |

On success the command prints the run ID and a newline, and nothing else. A run ID has the form `run-` followed by 16 hexadecimal digits.

```sh
daggry run --workflow flow.yaml --workspace handbook --item review-118
```

```text
run-0123456789abcdef
```

A run with no issue takes its objective from the command line.

```sh
daggry run --workflow release-check.yaml --workspace example/shop-web --objective "Check that release 2.4 is ready to ship."
```

Daggry seals the objective as the work item, the second record of the run, before any step starts. The CLI reads the workflow file as UTF-8. If the file cannot be read, the command exits with 1 and no run starts.

The control plane refuses the run with a 400 and a reason when:

- the workspace is not one the tenant config lists;
- the request has neither an item nor an objective;
- the item is not in the form of a work item, or is not a work item of that workspace;
- the workflow does not load (the reason starts with `workflow:`), or it names a persona, a validator, a judge or an area that matches nothing;
- the workspace or the work item is not found where it is kept, such as the git host.

## daggry status

Prints the state of a run as one line of JSON.

```text
daggry status <run-id> --json
```

The table lists the argument and the flag.

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

The table lists the fields of the output.

| Field | Type | Meaning |
|---|---|---|
| `state` | string | The run state. See [states](/reference/api#states-and-reasons). |
| `attempts` | array | Every attempt of every job, oldest first, as `{job, n, state}`. |
| `waiting_for` | string or null | The reason a person is needed: `approval` at a checkpoint, `answer` when a persona asked. Always present, and `null` unless `state` is `waiting`. |
| `trigger` | string | The name of the trigger that started the run. Absent for a run that `daggry run` started. |

A run that belongs to another tenant reads as `unknown run`.

## daggry logs

Lists the sealed records of a run, in the order of the evidence trail.

```text
daggry logs <run-id>
```

Each line has this form:

```text
<kind> <id> <producer> <digest-prefix> [<summary> [<summary>]]
```

The table explains each part of a line.

| Part | Meaning |
|---|---|
| `<kind>` | The artifact kind, such as `daggry/observation@1`. |
| `<id>` | The artifact ID. |
| `<producer>` | The identity that produced the artifact. |
| `<digest-prefix>` | The first 12 hexadecimal digits of the artifact's digest. |
| `<summary>` | Up to two words. For `daggry/observation@1`, the `event`, then the `path` or `step`. For `evidence/measurement@1`, the `label` and the `revision`. Other kinds print none. |

```sh
daggry logs run-0123456789abcdef
```

```text
daggry/run-lock@1 run-lock control 7d3b0c91a4e2
daggry/work-item@1 work-item control c94c24f1751a
daggry/change@1 change-1 control 2019b48c668e
daggry/observation@1 build-restored-2 control 5be08f3a17c4 protected-restored .daggry/project.yaml
```

The values are illustrative. The summary is a hint and can gain words. Only the kind and the ID are stable. For the ID of each kind, see [Artifact kinds](/reference/kinds#who-seals-what).

## daggry approve

Completes the `human` step a run waits at.

```text
daggry approve <run-id>
daggry approve <run-id> --unfreeze <path>
```

The table lists the argument and the flag.

| Argument or flag | Required | Meaning |
|---|---|---|
| `<run-id>` | yes | The run that waits. |
| `--unfreeze <path>` | no | Opens one frozen path for change. Valid when the run waits at a checkpoint. |

Both forms print nothing and exit with 0 on success. The control plane seals an [approval](/reference/kinds#evidence-approval-1) with your tenant token's identity as its author, and the job continues in a new attempt. The approval is bound to the digest of what the checkpoint asked about: the plan, or the latest change.

Without `--unfreeze`, the command says yes at the checkpoint. With `--unfreeze <path>`, the path can change for one iteration. You can do both from the issue instead. See [Comments and approvals](/reference/conversation).

The control plane refuses the request, and seals nothing, in the cases the table lists.

| Refusal | Cause |
|---|---|
| `nothing waits for an approval` | The run is not waiting at a `human` step. |
| `not this run` | The run is not yours. |
| `` `<path>` is not a frozen path `` | The path is not in the latest sealed set of frozen paths. |
| `nothing to approve: no sealed plan` | An `approval` wait with no sealed plan. |
| `nothing to approve: no sealed change` | A checkpoint with nothing sealed to approve. |
| `--unfreeze applies only at an exhausted loop's human step` | `--unfreeze` at any other wait. |

## daggry verify

Verifies your tenant's whole evidence trail on your machine.

```text
daggry verify
```

The command takes no argument. It fetches the trail, the public half of each signing key and every referenced blob, and recomputes digests, links and signatures. On success it prints this line and exits with 0:

```text
verified <n> entries, <m> blobs
```

On a mismatch it prints a one-line reason to stderr and exits with 1. For the reasons and what each means, see [Verification errors](/reference/envelope#verification-errors). For the task, see [Verify a run](/guide/how-to/verify-a-run).

This command is not the `verify` step of a workflow.

## daggry --help

`daggry --help` and `daggry <command> --help` print help to stdout and exit with 0. Help works with no environment variables set.

The CLI has no `--version` flag.
