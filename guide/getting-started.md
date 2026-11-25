# Run your first workflow

Reading about a signed trail is not the same as checking one yourself.
On this page you run a small workflow, approve it and verify its evidence trail, in about ten minutes.
Read it if you have a running Daggry. If you do not, the cluster admin installs it first.

The workflow has no agent step, so you need no model credential. You write one file and run four commands. The example is software: the workspace is a Git repository and the work item is an issue. The commands and outputs on this page are illustrative. Placeholders in angle brackets, such as `<owner>`, stand for values you choose.

## Before you start

You need a running Daggry and the CLI before any command works, with the two environment variables that point the CLI at Daggry. The cluster admin sets these up by following [Install Daggry](/guide/how-to/deploy).

You also need a scratch repository on GitHub with one open issue. A run pushes a branch named `daggry/<run-id>` to it, so do not use a repository you care about. The GitHub App from the install page must be installed on it.

Check that the CLI is ready.

```sh
daggry --help
```

## Start a run

A run needs three things: a workflow, a workspace and a work item.

1. Save this workflow as `first.yaml`. It runs a command, waits for your approval, and runs a second command.

   ```yaml
   format: daggry/workflow@1
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

   `scope` is the paths a step can write. `anywhere` allows every path except a [protected path](/guide/concepts/protection).

2. Start the run. Name the repository as `<owner>/<name>` and the issue by its URL.

   ```sh
   daggry run --workflow first.yaml --workspace <owner>/<name> --item https://github.com/<owner>/<name>/issues/<n>
   ```

   The command prints the run ID.

   ```text
   run-0123456789abcdef
   ```

3. Read the state of the run.

   ```sh
   daggry status run-0123456789abcdef --json
   ```

   ```json
   {"state":"waiting","attempts":[{"job":"main","n":1,"state":"waiting"}],"waiting_for":"input-needed"}
   ```

If `daggry run` fails with `refused: ...`, the text after the colon names the cause. See the [CLI reference](/reference/cli).

## Approve it

The run has stopped because the workflow asks for your approval at the `review` step.

4. List what Daggry sealed so far.

   ```sh
   daggry logs run-0123456789abcdef
   ```

   ```text
   daggry/run-lock@1 run-lock control 7d3b0c91a4e2
   daggry/work-item@1 work-item control c94c24f1751a
   daggry/change@1 change-1 control 2019b48c668e
   ```

   Each line is one record, and the last column starts its fingerprint. The first two records open every run. The `build` step sealed `change-1`: the commit it made and the paths it changed.

5. Approve the run.

   ```sh
   daggry approve run-0123456789abcdef
   ```

   The command prints nothing and exits with 0. Daggry seals your approval, and the job continues in a new runner. Run `daggry status` again, and `state` becomes `succeeded`. The run also pushed its commits to the branch `daggry/run-0123456789abcdef`.

## Verify the trail

You do not have to trust the run: check it.

6. Verify everything Daggry sealed for your tenant.

   ```sh
   daggry verify
   ```

   ```text
   verified 9 entries, 1 blobs
   ```

   An entry is a record. The command computes every fingerprint and signature again on your machine. If anything does not match, it exits with 1 and prints a reason. To read a failure, see [Verify a run](/guide/how-to/verify-a-run).

You have started a run, approved it and verified its trail. To put an agent to work, add an `agent` step: see [Write a workflow](/guide/how-to/write-a-workflow).

Next: [Configure Daggry](/guide/configure)
