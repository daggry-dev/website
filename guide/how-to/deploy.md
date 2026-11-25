# Deploy Daggry

For the person who runs the cluster. This page lists what Daggry needs, what runs on your cluster, how the pieces connect, and the steps to install it. Everyone else can skip to [Getting started](/guide/getting-started).

This page installs the reference implementation, which is one implementation of the contracts ([Contracts](/reference/contracts)), with the software binding, where the workspace host is GitHub. The GitHub App, the repository and the issue on this page belong to that binding. See [Bindings](/reference/bindings).

Daggry runs on Kubernetes as ordinary pods. Job pods run in the same namespace as the release. Every connection is outbound from the pod or the launcher, and nothing dials into a pod. For how the parts fit, see [Where it runs](/guide/concepts/architecture).

The commands and outputs on this page are illustrative. Placeholders in angle brackets, such as `<namespace>`, stand for values you choose.

## Requirements

- A Kubernetes cluster with a default storage class.
- `kubectl` and `helm` on the machine you work from.
- A container registry your cluster can pull from.
- A GitHub account or organization where you can create a GitHub App.
- A credential for the agent engine, if your workflows have agent steps.
- A scratch repository with one open issue, to try a first run.

## What runs on your cluster

Five pieces run on your cluster. Each has one job and a narrow set of rights.

- **Control plane.** Takes in work, seals results and serves the API. It holds the signing key, the GitHub App key and the record. It runs the built-in validators and the native validators loaded in-process.
- **Conductor.** Orders the steps of a run and schedules job attempts. It holds no key and seals nothing. In a default install it runs inside the control plane process.
- **Launcher.** Turns each job attempt into a pod, watches it and deletes it when it ends. It runs in the control plane process by default. It can manage pods and their Secrets in the release namespace only. It cannot read Secrets and never reads the workflow.
- **Runner.** Runs inside the pod. It runs the steps, the engine, the script validators and git, with a token for one job attempt, a GitHub token for one repository and your model credential.
- **Engine.** The agent program that does an agent step's work. Each agent step names it with `engine: <engine>`. It reaches Daggry only through a small tool server inside the pod, which offers the step's inputs and takes the agent's claims.

A pod holds a lease that its runner keeps alive. If the lease lapses, for example because the pod was killed, the launcher deletes the pod and the conductor starts a new attempt from the last sealed commit.

## How the pieces connect

The CLI on your machine talks to the control plane's API. The control plane talks to GitHub as your GitHub App. The conductor asks for a job pod, the launcher creates it, and the runner in that pod connects out to the control plane with a token for that one attempt. The control plane holds the data volume, which stores the log and the blobs it references.

## Install Daggry

The steps are the same whichever way you obtain the images.

1. Build or obtain the images: the control plane, the runner and each job image the tenant config offers. Push them to your registry. Reference each one by digest.
2. Create a namespace for the release.

   ```sh
   kubectl create namespace <namespace>
   ```

3. Create the GitHub App and give the chart its credentials. See [Connect the GitHub App](#connect-the-github-app).
4. Create the model credential Secret. See [Provide the model credential](#provide-the-model-credential).
5. Write the tenant config. See [Write the tenant config](#write-the-tenant-config).
6. Install the Daggry chart with your values.
7. Wait for the control plane.

   ```sh
   kubectl --namespace <namespace> rollout status deployment/<fullname>
   ```

   Expected output:

   ```text
   deployment "<fullname>" successfully rolled out
   ```

8. Reach the API. See [Reach the API](#reach-the-api).
9. Install the CLI and set `DAGGRY_URL` and `DAGGRY_TOKEN`. See [Install the CLI](#install-the-cli).

The chart creates one control-plane Deployment with a single replica, a Service, a data volume and two token Secrets.

### Set chart values

The Daggry chart takes these values. Set only the ones you need to change. The chart holds what is true of the installation. How the factory works, such as the lease length, the concurrency cap, the job images and each engine's credential, is in the [tenant config](#write-the-tenant-config).

| Key | Default | Meaning |
|---|---|---|
| `images.controlPlane` | placeholder | Control-plane and launcher image, by digest |
| `images.runnerInstall` | placeholder | Runner image, by digest |
| `controlPlane.port` | `8080` | API port of the Service and probes |
| `controlPlane.url` | `""` | In-cluster URL the runners use. Empty means the Service's cluster address |
| `storage.className` | `local-path` | Storage class of the data volume |
| `storage.size` | `1Gi` | Size of the data volume |
| `launcher.separatePod` | `false` | `true` runs the launcher as its own pod |
| `tokens.tenantToken` | `""` | The tenant token. Empty means generate one on first install |
| `tokens.launcherToken` | `""` | Launcher token. Empty means generate one on first install |
| `github.secret` | a Secret name | Secret that holds the GitHub App ID and key |
| `github.installation` | `""` | App installation ID. Empty means look it up per repository |
| `github.api` | `""` | GitHub API root. Empty means the public GitHub API |
| `resources` | `{}` | Resource requests and limits for the control plane |

Give the tokens with `--set-string`, not `--set`. If you leave them empty, the chart generates 40-character tokens on first install and keeps them on upgrade.

::: details Run the launcher in its own pod
With `launcher.separatePod=true`, the launcher is a separate Deployment and holds the rights to create pods. The control-plane pod then has no service-account token and receives only the hash of the launcher token. The launcher can create, get, list, watch and delete pods, and create and delete Secrets, in the release namespace only. It cannot read Secrets.
:::

## Connect the GitHub App

The control plane is the GitHub App. It mints a short-lived, repository-scoped token for each run. The App key is mounted in the control-plane pod only, never in the launcher pod or a job pod.

1. Create a GitHub App with the webhook turned off. Daggry does not need a public address.
2. Grant these repository permissions: Contents (read and write), Pull requests (read and write), Issues (read) and Metadata (read). Leave Workflows ungranted.
3. Generate a private key.
4. Install the App on the repositories Daggry may work on, and no others.
5. Create the Secret in the release namespace. Its keys are `app-id` and `private-key.pem`, and its name must match `github.secret`. The chart never creates it.

   ```sh
   kubectl --namespace <namespace> create secret generic <github-secret> \
     --from-literal=app-id=<app-id> \
     --from-file=private-key.pem=<path-to-private-key>
   ```

Without the Secret, the control plane starts but cannot fetch issues or mint tokens, and `daggry run` fails.

## Provide the model credential

Agent steps need a credential for the agent engine. You store it in a Kubernetes Secret under the key `key`, in the release namespace. The tenant config names the Secret in the engine's `credential.ref` and never holds its value. Each job pod references the Secret and passes the value to the engine process only. A job with no agent step starts without it.

```sh
kubectl --namespace <namespace> create secret generic <model-secret> \
  --from-literal=key=<credential>
```

A pod never renews a credential. Replace the Secret before the credential expires.

## Write the tenant config

The tenant config says how the factory works: the workflow catalogue, the orchestration limits, the engines and agents, the job images, the validators it admits and the projects the factory serves, with the workflows that run on each. It opens with `format: daggry/tenant@1`. The control plane holds it outside every job pod, and only a person changes it. A run records the configuration it started under, so a change applies to new runs only.

For every key and a worked example, see the [Tenant config reference](/reference/tenant-config). For the idea, see [The tenant defines the factory](/guide/concepts/tenant).

## Load native validators

A native validator is loaded in-process or run as a service that speaks the validator protocol, in any language. Only the person who runs the cluster installs one, and the tenant config admits it by name, version and digest. Script validators need no step here: the tenant config and each project config declare them. See the [Validators reference](/reference/validators).

## Reach the API

The control plane listens on plain HTTP on the API port and is not exposed outside the cluster. To reach it from your machine, use a port-forward.

1. Open the forward and leave it running.

   ```sh
   kubectl --namespace <namespace> port-forward service/<fullname> :8080
   ```

   Expected output:

   ```text
   Forwarding from 127.0.0.1:<port> -> 8080
   ```

2. Set the CLI variables. Read the tenant token from the token Secret the chart created. Its name ends in `tenant-token`.

   ```sh
   export DAGGRY_URL=http://127.0.0.1:<port>
   export DAGGRY_TOKEN=$(kubectl --namespace <namespace> get secret <token-secret> \
     --output jsonpath='{.data.token}' | base64 --decode)
   ```

## Install the CLI

The `daggry` CLI is a thin client for the control plane's API. Install it on the machine you work from, then set `DAGGRY_URL` and `DAGGRY_TOKEN` as described in [Reach the API](#reach-the-api).

1. Put the `daggry` binary on your path.
2. Check that the binary runs. Help works before you configure anything.

   ```sh
   daggry --help
   ```

For every command, see the [CLI reference](/reference/cli).

## Upgrade

To upgrade, push new images and install the chart again with the same values.

1. Build or obtain the new images and push them to your registry.
2. Install the chart again with your values, using the new digests.
3. Wait for the rollout, as in the first install.

The generated tokens are kept across upgrades, so the CLI variables stay valid. Jobs pin their image digests, so an upgrade changes new runs only.

The control plane keeps one replica and recreates it on upgrade, because the data volume can attach to one pod at a time. The log and blobs survive on the volume.

## Next steps

- To start your first run, read [Getting started](/guide/getting-started).
- For how the parts fit together, read [Where it runs](/guide/concepts/architecture).
- For the commands you use against the control plane, read the [CLI reference](/reference/cli).
