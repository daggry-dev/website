# Getting started

By the end of this page you will have run a small workflow on a scratch repository, approved a wait, and checked the sealed record on your own machine. You will see how Daggry stops for a person, seals a result and lets you verify it.

Daggry is built from modules and four open standards. On this page you touch two of the standards: you write a workflow, and you verify evidence. The file you write follows the published [Workflow schema](/reference/workflow-schema), and the records you verify follow the published [envelope](/reference/envelope). See [Open standards](/guide/concepts/standards).

The first workflow has no agent step. Its two `command` steps are deterministic work, which runs with no model. That lets you see sealing, approval and verification without model cost or a model credential. When you are ready, [Write a workflow](/guide/how-to/write-a-workflow) shows how to add an agent step.

The commands and outputs on this page are illustrative. Placeholders in angle brackets, such as `<owner>`, stand for values you choose.

## Before you start

You need a running Daggry on a Kubernetes cluster, the `daggry` CLI, and two environment variables that point the CLI at it. The person who runs the cluster can follow [Deploy Daggry](/guide/how-to/deploy) to set these up. If that is you, do that page first, including its CLI section.

You also need a scratch repository with one open issue. A run pushes a branch named `daggry/<run-id>` to its repository, so do not use a repository you care about. The GitHub App from the deploy page must be installed on it.

Check that the CLI is ready.

```sh
daggry --help
```

## 1. Write a workflow

A workflow is a file of steps in a standard layout. This one runs a command, waits for you, and runs a second command. Save it as `first.yaml`.

```yaml
steps:
  - id: build
    kind: command
    scope: anywhere
    run: echo hello > hello.txt
  - id: review
    kind: human
    waiting_for: input-needed
  - id: finish
    kind: command
    scope: anywhere
    run: echo done > done.txt
```

The `scope` key says what a step may write. `anywhere` allows every path except [protected paths](/guide/concepts/protection).

## 2. Start a run

To start a run, pass the workflow, the repository and the issue.

```sh
daggry run --workflow first.yaml --repo <owner>/<name> --item https://github.com/<owner>/<name>/issues/<n>
```

The command prints the run ID and nothing else.

```text
run-0123456789abcdef
```

If the command fails with `refused: ...`, the text after the colon names the cause. See the [CLI reference](/reference/cli).

## 3. Check the status

To read the state of the run, use `daggry status` with `--json`.

```sh
daggry status run-0123456789abcdef --json
```

When the run reaches the `review` step, it prints one line of JSON.

```json
{"state":"waiting","attempts":[{"job":"main","n":1,"state":"waiting"}],"waiting_for":"input-needed"}
```

The run is waiting for you, and `waiting_for` says why. The `state` field is one of `queued`, `running`, `waiting`, `parked`, `succeeded`, `failed` and `stopped`.

## 4. Read the logs

To list what Daggry sealed for the run, use `daggry logs`.

```sh
daggry logs run-0123456789abcdef
```

Each line shows the kind of record, its ID, who produced it and the first 12 digits of its fingerprint.

```text
daggry/run-lock@1 run-lock control 7d3b0c91a4e2
daggry/work-item@1 work-item control c94c24f1751a
daggry/change@1 change-1 control 2019b48c668e
```

The first two lines open every run. The `build` step sealed `change-1`, which records the commit and the paths the step changed.

## 5. Approve the wait

To let the run continue past the `review` step, approve it.

```sh
daggry approve run-0123456789abcdef
```

The command prints nothing and exits with 0. Daggry seals your approval and the job continues in a new pod. Run `daggry status run-0123456789abcdef --json` again. The `state` becomes `succeeded`.

The run also pushed its commits to the branch `daggry/run-0123456789abcdef` on your repository.

## 6. Verify the record

To check everything Daggry sealed for your team, run `daggry verify`.

```sh
daggry verify
```

Expected output:

```text
verified 9 entries, 1 blobs
```

The command recomputes every fingerprint and signature on your machine. If anything does not match, it exits with 1 and prints a reason. To read the output in detail, see [Verify a run](/guide/how-to/verify-a-run).

## Next steps

- To add an agent step, a check and a bounded loop, read [Write a workflow](/guide/how-to/write-a-workflow).
- To understand what you just ran, read [Why you can trust a run](/guide/concepts/trust) and [Where it runs](/guide/concepts/architecture).
- To see the parts Daggry is built from, read [The modules](/guide/concepts/modules) and [Open standards](/guide/concepts/standards).
- To look up a flag or an exit code, read the [CLI reference](/reference/cli).
- For what exists today, see the [Roadmap](/roadmap).
