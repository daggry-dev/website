# Where it runs

Whatever an agent can reach, it can misuse: another repository, the signing key, the record of the run. The agent's pod holds none of them. Daggry runs on your own Kubernetes cluster as ordinary pods, in four parts: the control plane (the module that holds the keys and seals results), the conductor (the module that orders the steps and schedules them), the pod where a job runs, and the CLI.

This page shows the modules as they run on Kubernetes. Kubernetes is the first place they run, and the split between them does not depend on it. For each module's job and interface, see [The modules](/guide/concepts/modules).

<Architecture />

The diagram shows GitHub on the left, the control plane and the conductor in the middle and a throwaway pod on the right. The pod dials the control plane. Nothing dials into the pod.

## The control plane seals and holds the keys

The control plane is the one backend. It takes in work, checks and seals the results, serves the API and keeps each tenant's state. It holds the keys: the key that signs the record and the key for your GitHub App. Both stay there. An agent's output reaches the control plane as a claim, and only the control plane turns it into a sealed record.

## The conductor orders and schedules

The conductor decides which step comes next and asks for a pod for each job attempt. In a default install it runs inside the control plane process. The launcher, a separate small part that runs in process by default, creates the pod. The conductor reads the order from the workflow and the limits from the tenant config, such as how many job attempts run at a time. It holds no key and seals nothing.

Liveness is decided by lease. The runner in a pod keeps its lease alive, and a lapsed lease is the one sign that a pod is gone.

## The pod does the work

Each job runs in its own throwaway pod. It holds a token for one repository and never the signing key. The pod holds three things:

- A token for this one job attempt, which can only submit results for it.
- A short-lived GitHub token for one repository. It never carries permission to change workflow files.
- Your model credential, passed to the coding-agent engine only.

The pod starts from the commit the conductor names, then runs the steps one after another in the same workspace. The runner in the pod provides two kinds of step execution, and a tenant config may name more than one runner class (see the [Tenant config reference](/reference/tenant-config)). As the deterministic runner it runs commands and checks and never starts a model. As the agent runner it starts the coding agent through an engine adapter, so the engine is replaceable. A check measures a clean copy of the code after the agent process has ended. A step that waits for you releases the pod, and the job continues in a new pod when you approve.

Pods never restart. If a machine dies at 3 a.m., its lease lapses, and the conductor asks for a new pod from the last sealed commit, and the launcher creates it, to repeat the step that was interrupted. A shell in a step cannot write the record or a [protected path](/guide/concepts/protection).

::: warning Limits
A step in the pod can reach the internet and your cluster's network, because outbound traffic is not filtered. The model credential is available inside the pod. The signing key and the GitHub App key never enter it.
:::

## The CLI is how you talk to it

The `daggry` command starts runs and shows status and logs. It approves a wait and verifies the record on your machine. It holds your tenant token.

For example, `daggry verify` recomputes every fingerprint and signature itself. See [Verify a run](/guide/how-to/verify-a-run).

## Next steps

- To install the parts on your cluster, follow [Deploy Daggry](/guide/how-to/deploy).
- To see each module's job and interface, read [The modules](/guide/concepts/modules).
- For which modules exist today, see the [Roadmap](/roadmap).
- To see what the control plane seals, read [Why you can trust a run](/guide/concepts/trust).
- To see how steps are ordered, read [Work graphs](/guide/concepts/workflows).
- For every command and endpoint, see the [CLI](/reference/cli) and [HTTP API](/reference/api) references.
