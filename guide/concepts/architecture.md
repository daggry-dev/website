# Where it runs

Daggry is a factory kit, and you assemble its modules into your own factory. This page shows where each part runs and what each part can reach. The split has one purpose: agents do the non-deterministic work, code gives the deterministic judgement, and an agent never grades its own work.

Whatever an agent can reach, it can misuse: another workspace, the signing key, the record of the run. So the place where an agent works holds none of them. Each job runs in a runner that lives for that one job, and the keys stay in the control plane.

<Architecture />

The diagram shows three parts: the forge, the control plane with the conductor, and a runner. The forge is the part that keeps the workspace and its work items and takes the result. The runner dials the control plane. Nothing dials into the runner. The boxes are the kit's parts. For each part's job and contract, see [The modules](/guide/concepts/modules) and [Contracts](/reference/contracts).

In the software binding the forge is a service that hosts repositories, the work item is an issue and the result is a pull request. See [Bindings](/reference/bindings).

## The reference implementation

The reference implementation is one implementation of these contracts. It runs on your own Kubernetes cluster as ordinary pods. The control plane is one deployment, the conductor runs inside the control plane process by default, and each job's runner is a throwaway pod (a container that lives for one job). The launcher, a separate small part that runs in process by default, creates the pod. Nothing in a contract depends on that cluster, on the language the parts are written in or on the database the store uses. To install it, see [Deploy Daggry](/guide/how-to/deploy).

## The control plane seals and holds the keys

The control plane is the one backend. It takes in work, judges and seals the results, serves the API and keeps each tenant's state in the store. It holds the keys: the key that signs the record and the key for the forge. Both stay there. An agent's output reaches the control plane as a claim, and only the control plane turns it into a sealed record.

The control plane runs the built-in validators, which read only sealed inputs. A native validator runs in-process with the control plane, or as a service that speaks the validator protocol. See [Validators: the extension point](/guide/concepts/validators).

## The conductor orders and schedules

The conductor decides which step comes next and asks for a runner for each job attempt. It reads the order from the workflow and the limits from the tenant config, such as how many job attempts run at a time. It holds no key and seals nothing.

Liveness is decided by lease. A runner keeps its lease alive, and a lapsed lease is the one sign that a runner is gone.

## The runner does the work

Each job runs in its own throwaway runner. It holds three things:

- A token for this one job attempt, which can only submit results for it.
- A short-lived token for one workspace. It never carries permission to change what instructs, constrains or judges the run.
- Your model credential, passed to the engine only.

The runner starts from the version of the workspace the conductor names, then runs the steps one after another in the same workspace. It provides two kinds of step execution, and a tenant config can name more than one runner class. See the [Tenant config reference](/reference/tenant-config#runners). As the deterministic runner it runs commands and script validators and never starts a model. As the agent runner it starts the engine, the coding agent that does the work, through an engine adapter, so the engine is replaceable. A script validator measures a clean copy of the workspace after the agent process has ended. A step that waits for you releases the runner, and the job continues in a new runner when you approve.

A runner never restarts. If a machine dies at 3 a.m., its lease lapses, and the conductor asks for a new runner from the last sealed change, to repeat the step that was interrupted. A shell in a step cannot write the record or a [protected path](/guide/concepts/protection).

::: warning Limits
In the reference implementation a step in the runner can reach the internet and your cluster's network, because outbound traffic is not filtered. The model credential is available inside the runner. The signing key and the forge key never enter it.
:::

## The CLI is how you talk to it

The `daggry` command starts runs and shows status and logs. It approves a wait and verifies the record on your machine. It holds your tenant token.

For example, `daggry verify` recomputes every fingerprint and signature itself. See [Verify a run](/guide/how-to/verify-a-run).

## Next steps

- To install the parts on your cluster, follow [Deploy Daggry](/guide/how-to/deploy).
- To see each module's job and contract, read [The modules](/guide/concepts/modules).
- To see what the control plane seals, read [Why you can trust a run](/guide/concepts/trust).
- To see how steps are ordered, read [Work graphs](/guide/concepts/workflows).
- For every command and endpoint, see the [CLI](/reference/cli) and [HTTP API](/reference/api) references.
