# Getting started

This page takes you from an empty cluster to a first run: you install the control plane, connect a GitHub App, install the `daggry` CLI, start a run, approve a human wait and verify the sealed record. It is for an operator who also uses Daggry, which is the usual first setup. Allow about an hour.

Until release builds are published, you install from source: you build the images and the CLI from a checkout of the Daggry source. For the status of each feature, see the [Roadmap](/roadmap).

The commands and outputs on this page are illustrative. Placeholders in angle brackets, such as `<namespace>`, stand for values you choose.

## What you need

Before you start, have the following ready.

- A Linux host with systemd that runs a single-node Kubernetes cluster (k3s with its defaults works).
- `kubectl`, `helm` 4, `podman`, `git`, `curl` and `openssl` on the machine you work from.
- A GitHub account or organization where you can create a GitHub App.
- A scratch repository with one open issue. A run pushes a branch named `daggry/<run-id>` to its repository, so do not use a repository you care about.
- A checkout of the Daggry source, to build the images and the CLI.
- A Rust toolchain on the machine you work from, to build the CLI.
- A container registry that the cluster can pull from. The build script in step 1 builds the control-plane, runner and job images, pushes them to your registry and writes their pinned digests to a values file. On a single host, the `registry` chart in the source checkout installs a registry for you. See [Deploy Daggry](/guide/how-to/deploy).

## 1. Install the control plane

The control plane is the one backend that decides the next step, holds the keys and seals evidence. You install it with a Helm chart. This section shows the short path. For every option, see [Deploy Daggry](/guide/how-to/deploy).

1. Create the namespace for the release. Job pods run in the same namespace.

   ```sh
   kubectl create namespace <namespace>
   ```

2. Build the three images and push them to your registry. The script writes the pinned digests to a values file.

   ```sh
   scripts/build-images
   ```

   The script ends by writing `deploy/images/values.generated.yaml`.

3. Install the chart.

   ```sh
   scripts/deploy <namespace> deploy/daggry/values.yaml deploy/images/values.generated.yaml
   ```

4. Wait for the control plane to become available.

   ```sh
   kubectl --namespace <namespace> rollout status deployment/<fullname>
   ```

   Expected output:

   ```text
   deployment "<fullname>" successfully rolled out
   ```

   `<fullname>` is the name Helm gives the release objects. Run `kubectl --namespace <namespace> get deployments` to read it.

## 2. Connect a GitHub App

A GitHub App gives each run a short-lived token that is limited to one repository. The App key stays on the control plane and never reaches a job pod.

1. In your GitHub account, create a GitHub App with the webhook turned off.
2. Grant these repository permissions: Contents (read and write), Pull requests (read and write), Issues (read) and Metadata (read). Leave Workflows ungranted.
3. Generate a private key and install the App on the scratch repository only.
4. Store the App ID and the key in a Kubernetes Secret in the release namespace. The Secret must have the keys `app-id` and `private-key.pem`, and its name must match the chart value `github.secret`.

   ```sh
   kubectl --namespace <namespace> create secret generic <github-secret> \
     --from-literal=app-id=<app-id> \
     --from-file=private-key.pem=<path-to-private-key>
   ```

5. Restart the control plane so it reads the Secret.

   ```sh
   kubectl --namespace <namespace> rollout restart deployment/<fullname>
   ```

Without this Secret the control plane still starts, but it cannot fetch an issue or mint a token, so `daggry run` fails.

## 3. Install the CLI

The `daggry` CLI is a thin client for the control plane's API. Build it from the source checkout.

1. Build the CLI.

   ```sh
   cargo build --locked --release -p daggry-cli
   ```

2. Put the binary on your path.

   ```sh
   install target/release/daggry <directory-on-path>
   ```

3. Check that the binary runs. Help works before you configure anything.

   ```sh
   daggry --help
   ```

## 4. Point the CLI at the API

The API is not exposed outside the cluster by default. You reach it with a port-forward and authenticate with the tenant token that the chart generated on first install.

1. In a second terminal, open the port-forward. Leave it running.

   ```sh
   kubectl --namespace <namespace> port-forward service/<fullname> :8080
   ```

   Expected output:

   ```text
   Forwarding from 127.0.0.1:<port> -> 8080
   ```

2. In your first terminal, set the two variables the CLI reads.

   ```sh
   export DAGGRY_URL=http://127.0.0.1:<port>
   export DAGGRY_TOKEN=$(kubectl --namespace <namespace> get secret <fullname>-tenant-token \
     --output jsonpath='{.data.token}' | base64 --decode)
   ```

To reach the API over a private tailnet instead, see [Deploy Daggry](/guide/how-to/deploy).

## 5. Write a workflow

A workflow is a YAML file of steps. This one runs a command, waits for you, and runs a second command. Save it as `first.yaml`.

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

The `scope` key says what the step may write. `anywhere` allows every path except [protected paths](/guide/concepts/protection) and forge folders such as `.github/**`. To write more steps, see [Write a workflow](/guide/how-to/write-a-workflow).

## 6. Start a run

To start a run, pass the workflow, the repository and the issue.

```sh
daggry run --workflow first.yaml --repo <owner>/<name> --item https://github.com/<owner>/<name>/issues/<n>
```

The command prints the run ID and nothing else.

```text
run-0123456789abcdef
```

The item must be an issue in the same repository. If the command fails with `refused: ...`, the text after the colon names the cause. See [CLI reference](/reference/cli).

## 7. Check the status

To read the state of the run, use `daggry status` with `--json`.

```sh
daggry status run-0123456789abcdef --json
```

When the run reaches the `review` step, it prints one line of JSON:

```json
{"state":"waiting","attempts":[{"job":"main","n":1,"state":"waiting"}],"waiting_for":"input-needed"}
```

The `state` field is one of `queued`, `running`, `waiting`, `parked`, `succeeded`, `failed` and `stopped`. The `waiting_for` field names the reason a person is needed, and is `null` otherwise.

## 8. Read the logs

To list the sealed artifacts of the run, use `daggry logs`.

```sh
daggry logs run-0123456789abcdef
```

Each line shows the artifact kind, its ID, its producer and the first 12 digits of its digest:

```text
daggry/run-lock@1 run-lock control 7d3b0c91a4e2
daggry/work-item@1 work-item control c94c24f1751a
daggry/change@1 change-1 control 2019b48c668e
```

The run lock and the work item open every run. The `build` step sealed `change-1`, which records the commit and the paths the step changed. A step that fails or that edits a protected path adds an observation, such as `observation-2` or `build-restored-2`.

## 9. Approve the wait

To let the run continue past the `review` step, approve it.

```sh
daggry approve run-0123456789abcdef
```

The command prints nothing and exits with 0. The control plane seals your approval and the job continues in a new attempt. Run `daggry status run-0123456789abcdef --json` again. The `state` becomes `succeeded`, and the `attempts` list now has two entries.

You can also find the work on the repository. The run pushed its commits to the branch `daggry/run-0123456789abcdef`.

## 10. Verify the record

To check everything the control plane sealed for your tenant, run `daggry verify`.

```sh
daggry verify
```

Expected output:

```text
verified 9 entries, 1 blobs
```

The command recomputes every digest and signature on your machine. It exits with 1 and prints a reason if anything does not match. To read the output in detail, see [Verify a run](/guide/how-to/verify-a-run).

## Next steps

- To understand what you just ran, read [Architecture](/guide/concepts/architecture) and [Sealed evidence](/guide/concepts/evidence).
- To add an agent step, a verification and a bounded loop, read [Write a workflow](/guide/how-to/write-a-workflow).
- To look up a flag or an exit code, read the [CLI reference](/reference/cli).
