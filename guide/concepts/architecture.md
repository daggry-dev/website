# Where it runs

Whatever an agent can reach, it can misuse: another repository, the signing key, the record of the run. The agent's pod holds none of them. Daggry runs on your own Kubernetes cluster as ordinary pods, in three parts: the control plane (the part that schedules steps and signs results), the pod where a job runs, and the CLI.

<Architecture />

The diagram shows GitHub on the left, the control plane in the middle and a throwaway pod on the right. The pod dials the control plane. Nothing dials into the pod.

## The control plane decides and signs

The control plane takes in work, schedules each step, seals the results and serves the API. It holds the keys: the key that signs the record and the key for your GitHub App. Both stay there. An agent's output reaches the control plane as a claim, and only the control plane turns it into a sealed record.

## The pod does the work

Each job runs in its own throwaway pod. It holds a token for one repository and never the signing key. The pod holds three things:

- A token for this one job attempt, which can only submit results for it.
- A short-lived GitHub token for one repository. It never carries permission to change workflow files.
- Your model credential, passed to the coding-agent engine only.

The pod starts from the commit the control plane names, then runs the steps one after another in the same workspace. A step that waits for you releases the pod, and the job continues in a new pod when you approve.

Pods never restart. If a machine dies at 3 a.m., a new pod starts from the last sealed commit and repeats the step that was interrupted. A shell in a step cannot write the record or a [protected path](/guide/concepts/protection).

::: warning Limits
A step in the pod can reach the internet and your cluster's network, because outbound traffic is not filtered. The model credential is available inside the pod. The signing key and the GitHub App key never enter it.
:::

## The CLI is how you talk to it

The `daggry` command starts runs and shows status and logs. It approves a wait and verifies the record on your machine. It holds one token for your team.

For example, `daggry verify` recomputes every fingerprint and signature itself. See [Verify a run](/guide/how-to/verify-a-run).

## Next steps

- To install the parts on your cluster, follow [Deploy Daggry](/guide/how-to/deploy).
- To see what the control plane seals, read [Why you can trust a run](/guide/concepts/trust).
- To see how steps are ordered, read [Work graphs](/guide/concepts/workflows).
- For every command and endpoint, see the [CLI](/reference/cli) and [HTTP API](/reference/api) references.
