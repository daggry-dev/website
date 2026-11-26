# The modules and where they run

An agent makes mistakes, and a mistake reaches as far as the agent can: another workspace, the signing key, the evidence trail.
So Daggry is built from seven modules, and each module can reach only what its job needs.
Read this page if you install Daggry, review its security or want to replace a module.

<Architecture />

The diagram shows the forge, the control plane with the conductor, and a runner. The runner connects out to the control plane. Nothing connects into the runner.

Daggry runs on your Kubernetes cluster. To install it, follow [Install Daggry](/guide/how-to/deploy).

## The seven modules

You meet these seven names in logs, config and errors. The table gives each module's one job.

| Module | Its one job |
|---|---|
| Conductor | Decides which step runs next and starts runners. |
| Control plane | Holds the keys, checks results and writes the evidence trail. |
| Runner | Runs the steps of one job, then is thrown away. |
| Engine | The coding-agent program a persona runs on. |
| Forge | Keeps the workspace and its work items, and takes the result. For software, a git host. |
| Store | Keeps the trail and each tenant's state. |
| Validators | Check the work as code and return pass or fail. |

You can replace any module with your own, for example an engine for another coding-agent program or a store for another database. For what a replacement must do, see [Replace a module](/reference/conformance#replace-a-module).

## What each module holds

The keys never enter the place where an agent works. This list says what each module that takes part in a job holds.

- **The control plane** holds the signing key and the forge key, and both stay there. An agent's output arrives as a claim. Only the control plane seals a record and adds it to the evidence trail.
- **The conductor** holds no key and seals nothing. It reads the order of the steps from the workflow and the limits from the tenant config, such as how many jobs run at one time.
- **A runner** holds a token for its one job, a short-lived token for one workspace and your model credential. The job token can only submit results for that job. The workspace token never lets a step change what instructs, constrains or judges the run. The model credential goes to the engine only.

::: warning Limits
A step in a runner can reach the internet and your cluster's network, because outbound traffic is not filtered. The model credential is available inside the runner. The signing key and the forge key never enter it.
:::

## What happens inside a runner

You need this to know what a script or an agent in a step can touch. Each job gets its own runner. The runner starts from the version of the workspace the conductor names, then runs the steps one after another.

The runner runs a step in one of two ways: as a script, or with an agent. A script step never starts an agent. Your validator runs on a clean copy of the workspace, after the agent process has ended. No step can write the trail or a [protected path](/guide/concepts/protection).

A runner never restarts. If a runner stops responding, Daggry starts a new one from the last sealed change and repeats the step that was interrupted. A step that waits for your approval gives its runner back, and the job continues in a new runner when you approve.

Related:

- [Why you can trust a run](/guide/concepts/trust)
- [What an agent cannot change](/guide/concepts/protection)
- [Module contracts](/reference/conformance#module-contracts)
