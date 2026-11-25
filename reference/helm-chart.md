# Helm chart values

*Reference*

The Daggry chart installs with defaults that suit a first cluster. This page lists every value the chart takes and the option to run the launcher in its own pod. Read it if you are the cluster admin and you install or upgrade Daggry. For the steps, follow [Install Daggry](/guide/how-to/deploy).

The chart holds what is true of the installation. How a tenant's factory works is in the [Tenant config](/reference/tenant-config): the lease length, the concurrency cap, the job images and each engine's credential.

## Chart values

Set only the values you need to change. The table lists every value.

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

The `github.*` values belong to the software binding, where the forge is GitHub. See [Bindings](/reference/bindings).

## Tokens

Give the tokens with `--set-string`, not `--set`. If you leave them empty, the chart generates 40-character tokens on first install and keeps them on upgrade.

## What the chart creates

The chart creates one control-plane Deployment with a single replica, a Service, a data volume and two token Secrets. It never creates the Secret that `github.secret` names. You create that Secret yourself.

## Run the launcher in its own pod

The launcher is the program that turns each job attempt into a pod, watches it and deletes it when it ends. By default it runs in the control-plane process. Run it in its own pod when the control plane must hold no right to create pods.

With `launcher.separatePod=true`, the table lists what each pod holds.

| Pod | Holds |
|---|---|
| Launcher | A separate Deployment with the rights to create, get, list, watch and delete pods, and to create and delete Secrets, in the release namespace only. It cannot read Secrets. |
| Control plane | No service-account token, and only the hash of the launcher token. |
