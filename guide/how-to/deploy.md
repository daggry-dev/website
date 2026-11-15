# Deploy Daggry

This page shows you how to deploy the Daggry control plane on a Kubernetes cluster, reach its API, and upgrade it. It is for an operator, the person who owns the cluster, the GitHub App and the keys. For a faster first install, see [Getting started](/guide/getting-started).

Daggry runs on Kubernetes only. It defines no custom resources and no operator of its own. Job pods are plain pods in the same namespace as the release. Every connection is outbound from the pod or the launcher, and nothing dials into a pod. For how the parts fit, see [Architecture](/guide/concepts/architecture).

## Prerequisites

- A Kubernetes cluster with a default storage class. A single k3s node works.
- `kubectl`, `helm` 4 and `podman`.
- A container registry the cluster can pull from. On a single host, the `registry` chart installs one that is bound to the host's loopback address.
- The Daggry source checkout, for the charts and scripts.
- A GitHub account or organization where you can create a GitHub App.

## Deploy the control plane

1. Create the namespace.

   ```sh
   kubectl create namespace <namespace>
   ```

2. Build and push the images. This builds the control-plane, runner and default job images, pushes all three and writes their digests.

   ```sh
   scripts/build-images
   ```

   To build without pushing, add `--build-only`.

   The script writes a values file of this form:

   ```yaml
   images:
     controlPlane: "<registry>/<control-plane-image>@sha256:<digest>"
     runnerInstall: "<registry>/<runner-image>@sha256:<digest>"
     job: "<registry>/<job-image>@sha256:<digest>"
   ```

3. Create the GitHub App Secret. See [Connect the GitHub App](#connect-the-github-app).

4. Install the chart.

   ```sh
   scripts/deploy <namespace> deploy/daggry/values.yaml deploy/images/values.generated.yaml
   ```

   The script runs `helm upgrade --install daggry deploy/daggry` with each values file. To set a value, add `--` and Helm arguments:

   ```sh
   scripts/deploy <namespace> deploy/daggry/values.yaml deploy/images/values.generated.yaml -- \
     --set concurrencyCap=2
   ```

5. Wait for the control plane.

   ```sh
   kubectl --namespace <namespace> rollout status deployment/<fullname>
   ```

   Expected output:

   ```text
   deployment "<fullname>" successfully rolled out
   ```

The chart creates one control-plane Deployment with a single replica, a Service, a data volume and two token Secrets. The data volume holds the log, the stored blobs and the seal key.

### Set chart values

The chart takes these values. Set only the ones you need to change.

| Key | Default | Meaning |
|---|---|---|
| `images.controlPlane` | placeholder | Control-plane and launcher image, by digest |
| `images.runnerInstall` | placeholder | Runner image, by digest |
| `images.job` | placeholder | Default image for every job, by digest |
| `leaseSeconds` | `60` | Length of a job lease |
| `concurrencyCap` | `1` | Global cap on concurrent attempts |
| `controlPlane.port` | `8080` | API port of the Service and probes |
| `controlPlane.url` | `""` | In-cluster URL the runners use. Empty means the Service's cluster address |
| `storage.className` | `local-path` | Storage class of the data volume |
| `storage.size` | `1Gi` | Size of the data volume |
| `launcher.separatePod` | `false` | `true` runs the launcher as its own pod |
| `tokens.tenantToken` | `""` | Tenant token. Empty means generate one on first install |
| `tokens.launcherToken` | `""` | Launcher token. Empty means generate one on first install |
| `modelSecret` | a Secret name | Secret that holds the model credential |
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

Agent steps need a credential for the coding-agent engine. You store it in a Kubernetes Secret under the key `key`, in the release namespace. The name must match the chart value `modelSecret`. Each job pod references the Secret and passes the value to the engine container only. A job with no agent step starts without it.

```sh
kubectl --namespace <namespace> create secret generic <model-secret> \
  --from-literal=key=<credential>
```

A pod never renews a credential. Replace the Secret before the credential expires.

## Reach the API

The control plane listens on plain HTTP on the API port and is not exposed outside the cluster. Choose one of two ways to reach it.

### Use a port-forward

1. Open the forward and leave it running.

   ```sh
   kubectl --namespace <namespace> port-forward service/<fullname> :8080
   ```

   Expected output:

   ```text
   Forwarding from 127.0.0.1:<port> -> 8080
   ```

2. Set the CLI variables. Read the tenant token from the Secret the chart created.

   ```sh
   export DAGGRY_URL=http://127.0.0.1:<port>
   export DAGGRY_TOKEN=$(kubectl --namespace <namespace> get secret <fullname>-tenant-token \
     --output jsonpath='{.data.token}' | base64 --decode)
   ```

### Expose the API on a private tailnet

The `tailscale` chart publishes the API on your tailnet and nowhere else. It installs the Tailscale Kubernetes operator and one Ingress that terminates TLS for one tailnet host name. It does not enable Funnel, so the API is never on the public internet. Runners and the launcher still reach the control plane at its in-cluster address, not through the tailnet.

1. In your tailnet, turn on MagicDNS and HTTPS certificates. HTTPS publishes machine names in the public Certificate Transparency log.
2. Create an OAuth client for the operator, and store its ID and secret in a Secret in the operator's namespace.
3. Fetch the operator chart that the `tailscale` chart depends on.

   ```sh
   helm dependency build deploy/tailscale
   ```

4. Install the chart. Set the control plane's namespace and Service, and choose a host label.

   ```sh
   helm upgrade --install tailscale deploy/tailscale --namespace <operator-namespace> \
     --set controlPlane.namespace=<namespace> \
     --set controlPlane.serviceName=<fullname> \
     --set ingress.tailnetHostname=<host-label>
   ```

5. Set `DAGGRY_URL` to the HTTPS name the Ingress publishes, `https://<host-label>.<tailnet>.ts.net`, and `DAGGRY_TOKEN` as above.

## Upgrade

To upgrade, build new images and run the same deploy command.

1. Build and push the images.

   ```sh
   scripts/build-images
   ```

2. Run the deploy script again with the same values files.

   ```sh
   scripts/deploy <namespace> deploy/daggry/values.yaml deploy/images/values.generated.yaml
   ```

3. Wait for the rollout, as in the first install.

The generated tokens are kept across upgrades, so the CLI variables stay valid. Jobs pin their image digests, so an upgrade changes new runs only.

The control plane keeps one replica and recreates it on upgrade, because the data volume can attach to one pod at a time. The log and blobs survive on the volume.

## Next steps

- To start your first run, read [Getting started](/guide/getting-started).
- For the commands you use against the control plane, read the [CLI reference](/reference/cli).
