# Install Daggry

No run can start until Daggry is on a cluster. This page takes you from an empty namespace to a working `daggry` command on your own Kubernetes cluster. It is for the cluster admin. If someone else installs Daggry for you, go to [Run your first workflow](/guide/getting-started).

The page installs Daggry for software work, where the forge is GitHub. The commands and outputs are illustrative. Placeholders in angle brackets, such as `<namespace>`, stand for values you choose.

## Before you start

Check these before you start. Each missing item stops the install.

- A Kubernetes cluster with a default storage class.
- `kubectl` and `helm` on the machine you work from.
- A container registry your cluster can pull from.
- A GitHub account or organization where you can create a GitHub App.
- A credential for the engine, if your workflows have agent steps.
- A scratch repository with one open issue, to try a first run.

## Install Daggry

Nine steps take you from an empty namespace to a working CLI. The steps are the same whichever way you obtain the images.

1. **Get the images.** Build or obtain the control plane image, the runner image and each job image the tenant config offers. Push them to your registry. Reference each one by digest.

2. **Create a namespace for the release.**

   ```sh
   kubectl create namespace <namespace>
   ```

3. **Connect GitHub.** Daggry reaches GitHub as a GitHub App. The App's private key is the forge key. It stays in the control plane and never enters a runner.

   1. Create a GitHub App with the webhook turned off. Daggry does not need a public address.
   2. Grant these repository permissions: Contents (read and write), Pull requests (read and write), Issues (read) and Metadata (read). Leave Workflows ungranted.
   3. Generate a private key.
   4. Install the App on the repositories Daggry can work on, and no others.
   5. Create the Secret in the release namespace. Its keys are `app-id` and `private-key.pem`. Its name must match the chart value `github.secret`. The chart never creates it.

      ```sh
      kubectl --namespace <namespace> create secret generic <github-secret> \
        --from-literal=app-id=<app-id> \
        --from-file=private-key.pem=<path-to-private-key>
      ```

   Without the Secret, the control plane starts but cannot fetch issues, and `daggry run` fails.

4. **Store the engine's credential.** Agent steps need a credential for the engine. Store it in a Secret under the key `key`. The tenant config names the Secret and never holds its value.

   ```sh
   kubectl --namespace <namespace> create secret generic <model-secret> \
     --from-literal=key=<credential>
   ```

   A runner never renews a credential. Replace the Secret before the credential expires.

5. **Write the tenant config.** It says which workflows run, which agents work and where a person must approve. See [Set up a tenant](/guide/how-to/set-up-a-tenant).

6. **Install the Daggry chart with your values.** Set only the values you need to change. For every value, see [Helm chart values](/reference/helm-chart).

7. **Wait for the control plane.**

   ```sh
   kubectl --namespace <namespace> rollout status deployment/<fullname>
   ```

   Expected output:

   ```text
   deployment "<fullname>" successfully rolled out
   ```

8. **Reach the API.** The control plane listens on plain HTTP inside the cluster only. Open a port-forward and leave it running.

   ```sh
   kubectl --namespace <namespace> port-forward service/<fullname> :8080
   ```

   Expected output:

   ```text
   Forwarding from 127.0.0.1:<port> -> 8080
   ```

   Then set the CLI variables. Read the tenant token from the token Secret the chart created. Its name ends in `tenant-token`.

   ```sh
   export DAGGRY_URL=http://127.0.0.1:<port>
   export DAGGRY_TOKEN=$(kubectl --namespace <namespace> get secret <token-secret> \
     --output jsonpath='{.data.token}' | base64 --decode)
   ```

9. **Install the CLI.** Put the `daggry` binary on your path and check that it runs.

   ```sh
   daggry --help
   ```

   For every command, see the [CLI reference](/reference/cli).

::: details What gets installed?
The chart creates one control-plane Deployment with a single replica, a Service, a data volume and two token Secrets. Five things run on your cluster.

- **Control plane.** Takes in work, seals results and serves the API. It holds the signing key, the forge key and the evidence trail.
- **Conductor.** Decides which step runs next. It holds no key and seals nothing. By default it runs inside the control plane process.
- **Launcher.** Turns each job into a pod, watches it and deletes it when it ends. It runs in the control plane process by default.
- **Runner.** Runs the steps of one job inside the pod, with a token for that one job, a GitHub token for one repository and the engine's credential.
- **Engine.** The coding-agent program an agent step runs on.

Every connection goes out from the pod. Nothing dials into a pod. If a runner stops responding, Daggry deletes its pod and starts a new one from the last sealed change. See [The modules and where they run](/guide/concepts/modules).
:::

::: details Do I need to install validators?
No. A project declares its validators in `.daggry/project.yaml`, and the tenant config declares shared ones. The default judge and the named judges `coverage` and `no_regression` need no declaration. See [Add a validator](/guide/how-to/add-a-validator).
:::

## Upgrade

Upgrade when you have new images. Runs that are in progress keep their old ones.

1. Build or obtain the new images and push them to your registry.
2. Install the chart again with the same values and the new digests.
3. Wait for the rollout, as in the first install.

The chart keeps the generated tokens across upgrades, so the CLI variables stay valid. The control plane has one replica and is recreated on upgrade, because the data volume attaches to one pod at a time. The evidence trail survives on the volume.

Related:

- [Set up a tenant](/guide/how-to/set-up-a-tenant)
- [Run your first workflow](/guide/getting-started)
- [Helm chart values](/reference/helm-chart)
