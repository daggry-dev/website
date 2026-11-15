# Architecture

Daggry is one control plane that decides and seals, and a sandboxed pod for each job where the work happens. This page explains what runs where, what each part holds and what it can reach. It is for readers who want to judge Daggry's trust boundaries before they deploy it.

<Architecture />

The diagram shows GitHub on the left, the cluster's control plane in the middle, and a sandboxed pod on the right. The pod dials the control plane. Nothing dials into the pod.

## Parts

Five parts make up Daggry. The control plane is the only one that decides the next step.

| Part | What it does | What it holds |
|---|---|---|
| Control plane | Takes in work, schedules steps, seals artifacts, judges them and serves the API | The seal key, the GitHub App key and the log |
| Launcher | Turns each job attempt into a pod, watches it and deletes it when it ends | Rights to manage pods and their Secrets in the release namespace only. It cannot read Secrets and never reads the work graph. |
| Runner | Runs inside the pod. Runs the steps, the engine, verification and git | A token for one job attempt, a GitHub token for one repository and a model credential |
| Engine | The coding-agent CLI that does the work of an agent step | Nothing of its own |
| `daggry` CLI | Starts runs and shows status, logs and verification. Approves work | Your tenant token |

An engine is a coding-agent CLI. Each agent step names the engine it uses with `engine: <engine>`.

## Roles

Two roles are kept apart.

- The **operator** owns the cluster, the control plane, the seal key and the GitHub App. The operator provides the built-in kinds and validators and the engine versions.
- The **tenant** owns its projects, its model credential and its project harness. The tenant installs the GitHub App on its repositories and approves work.

A tenant sees only its own runs, artifacts, transcripts and evidence. Each tenant has its own log, so reading it never exposes another tenant's entries.

## The pod

One pod runs a whole job. Verification and review are steps inside that pod, so the workspace carries over from step to step. The one break is a `human` step: the pod is released while the run waits, and the job continues in a new pod when you approve.

Before the steps start, the pod checks out the commit the control plane names and fetches the step's inputs by digest. Then it runs your project's own image.

Pods never restart. Each pod holds a lease that its runner keeps alive. If the lease lapses, for example because the pod was killed, the launcher deletes the pod and a new attempt starts from the last sealed commit.

The engine reaches Daggry only through a small tool server inside the pod. The tool server offers the step's inputs, a `submit` tool for claims and a `validate` tool for a preview. The engine never connects to the control plane.

## Boundaries that hold

- **Connections are outbound.** The pod and the launcher dial the control plane. Nothing dials into a pod.
- **Keys stay in the control plane.** The seal key and the GitHub App key never enter a pod. An agent's output reaches the control plane as a claim.
- **Credentials are narrow.** The token in a pod is bound to one job attempt and can only submit for it. The GitHub token is limited to one repository, is short-lived, and never carries permission to change workflow files.
- **A shell in a step cannot write the log or a protected path.** See [Protected paths](/guide/concepts/protection).
- **Kubernetes only.** Daggry creates plain pods. It defines no custom resources and has no operator.
- **You do not have to trust the storage.** A reader recomputes digests, links and signatures itself. See [Verify a run](/guide/how-to/verify-a-run).

## Next steps

- To see what the control plane seals, read [Sealed evidence](/guide/concepts/evidence).
- To see how steps are ordered, read [Work graphs](/guide/concepts/workflows).
- To deploy the pieces, follow [Deploy Daggry](/guide/how-to/deploy).
- For every command and endpoint, see the [CLI](/reference/cli) and [HTTP API](/reference/api) references.
