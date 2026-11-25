# The modules

A factory is mainly three things: a control plane, a conductor and a stack that delivers verified evidence. It pairs two kinds of work. Agents do the non-deterministic work, and code gives the deterministic judgement: code runs every check, and an agent never grades its own work.

A platform built as one piece can do one thing. If the scheduler, the agent and the checks are welded together, a new kind of work, a new agent or a new cluster means a new platform. Daggry is built as modules instead. Each module has one job, a contract that defines it and a stated list of what it never does. Anything that meets the contract can replace the module. The checks are plug-ins too: a validator is the platform's extension point for judging work.

A workflow is the unit all the modules serve: one document that describes a piece of work as steps.

<Modules />

The diagram shows the four open standards on top and the three running modules below: the conductor, the runner, drawn as its two kinds of step execution, and the control plane. The conductor reads the tenant config and the workflow and hands each job attempt to a runner. The runner reads the project config and sends claims to the control plane. The control plane writes evidence. Validators are the plug-in point: script validators run in the deterministic runner, and built-in and native validators judge beside the control plane. The forge and the store are drawn as parts of their own. Each box is a contract, and any part can be replaced.

## Seven modules

Three modules run. Four are documents, each an open standard. The table lists each module's one job. The runner has two rows, one for each kind of step execution it provides.

| Module | Its one job | What it never does |
|---|---|---|
| Conductor | Orders the steps of a run and schedules job attempts across runners. | Holds a key, seals a record or runs a step's work. |
| Control plane | The one backend: holds the keys, seals, judges, serves the API and keeps tenant state. It runs the built-in validators. | Runs a command or an agent, or seals a claim that code has not checked. |
| Runner, as the deterministic runner | Runs commands and script validators. | Starts a model. |
| Runner, as the agent runner | Runs agentic or model-generated work through an engine adapter. | Judges its own work, or changes what instructs, constrains or judges it. |
| Evidence | The standard for sealed records: one envelope, signed and linked. | Names a cluster, a forge, a tool or an agent. |
| Workflow | The standard for describing work as steps, outputs, gates, loops and human waits. | Changes during a run. |
| Project config | The standard for what is true of one project. | Widens a limit the tenant set. |
| Tenant config | The standard for how a factory works. | Holds a secret. It names a credential, and the secret stays in the cluster. |

## Every part is a contract

Each part of the factory is defined by a contract, and anything that meets the contract can replace it. The table names each part, its role and an example of what replaces it. For each contract, see [Contracts](/reference/contracts).

| Part | Its role | Defined by | Replace it with |
|---|---|---|---|
| Conductor | Orders the steps and schedules job attempts. | The conductor interface | A scheduler of your own that hands out job attempts under leases. |
| Control plane | Seals, judges and holds the keys. | The evidence envelope and kinds, and each interface it meets another part through | An implementation of your own that seals evidence by the same rules. |
| Runner | Runs the steps of a job. | The runner protocol | A runner for a different execution environment. |
| Engine | The agent program that does the work of an agent step. | The engine interface | An engine for another agent. |
| Forge | Keeps the workspace and its work items, and takes the result. | The forge and effect interface | A forge for another kind of work source. |
| Store | Keeps the trail and the tenant state. | The store interfaces | A store for another database. |
| Validator | Judges the work in code. | The validator contract | A validator in any language. |

The reference implementation is one implementation. Nothing in a contract depends on its language, its database or its cluster.

## The conductor orders and schedules

The conductor decides which step comes next and where it runs. It reads the workflow for the order and the tenant config for the limits. It hands each job attempt to a runner. In the reference implementation a job runs in one throwaway pod (a container that lives for one job): the conductor asks for the pod, and the launcher (a separate small part, in process by default) creates it. In a default install the conductor runs inside the control plane process.

Liveness is decided by lease. A lease is a time-limited claim on a job attempt that the runner keeps alive. If the lease lapses, for example because a machine died, the conductor starts a new attempt from the last sealed change. No other signal says whether a runner is alive.

The conductor's interface is the job attempt: the steps to run, the version of the workspace to start from and the lease. A runner that accepts a job attempt and keeps its lease can be scheduled, whether it runs in a pod, a virtual machine or a process.

## The control plane seals and judges

The control plane is the one backend. It holds the signing key and the key for the forge. It takes in claims, runs the built-in validators, seals the results and serves the API. It keeps each tenant's state, including the tenant's evidence trail, in the store.

There is one control plane so that there is one place where a claim becomes evidence. A key held in one module can be guarded in one module.

Its interfaces are the [HTTP API](/reference/api) and the evidence standard. See [Where it runs](/guide/concepts/architecture).

## The runner: two kinds of step execution

The runner is the part that runs a job's steps, and the module of that name. It provides two kinds of step execution: the deterministic runner and the agent runner. Deterministic work and agentic work run by different mechanisms, because they deserve different trust.

The **deterministic runner** runs what gives the same result for the same input: a command, a script validator or a script of the project's own. It never starts a model. A script validator runs on a clean copy of the workspace, after any agent process has ended.

The **agent runner** runs work whose result a model produces. It starts an agent through an engine adapter. The engine (the agent program that does the work) is replaceable: the adapter gives every engine the same prompt, the same tools and the same way to hand in a result. Whatever the agent hands in is a claim.

Both kinds have the same interface to the rest of the platform. Each accepts a job attempt and sends back claims. Neither holds the signing key. A tenant config may name more than one runner class; see the [Tenant config reference](/reference/tenant-config).

## Validators: the extension point

A validator is a check written as code, with a name. A workflow's `verify` step names one or more validators, and the platform runs them. The validator interface is an extension point of the platform: a validator takes sealed inputs and yields a result and a verdict, whoever wrote it.

A validator comes from one of three sources.

- **Built-in.** Shipped with the platform, in the `daggry` namespace. It runs in the control plane.
- **Script.** A script or an executable that the tenant config declares as `tenant/<name>`, or the project config as `project/<name>`. It runs in the deterministic runner, on a clean copy of the workspace.
- **Native.** A validator loaded in-process or run as a service that speaks the validator protocol, in any language. The cluster admin installs it, and the tenant admits it by name, version and digest. It is a pure function over sealed inputs.

See [Validators: the extension point](/guide/concepts/validators).

## Four standards connect them

The running modules never call each other through private formats. They read and write four documents.

- **Workflow.** The work, as steps. The conductor reads it. See [Work graphs](/guide/concepts/workflows).
- **Evidence.** The sealed records. The control plane writes them, and anyone can verify them. See [Why you can trust a run](/guide/concepts/trust).
- **Project config.** What is true of one project: its areas, its validators, the one canonical validator whose result is the verification evidence, and the paths it protects. The runner reads it. See [Project config](/reference/project-config).
- **Tenant config.** How the factory works: which workflows run on which project, how they are orchestrated, which agents work and under which rules. The conductor and the control plane read it. See [The tenant defines the factory](/guide/concepts/tenant).

Each document has a published schema, a version and an extension mechanism. See [Open standards](/guide/concepts/standards).

## Why modules

Nothing in the platform is specific to one kind of work, one set of checks, one agent, one cluster, one implementation or one factory.

- **Not one kind of work.** The work lives in a workflow file, and the standards name no tool. A binding maps them onto one kind of work: in the software binding an issue becomes a pull request. A document review or a data refresh is another file. See [Workflow patterns](/guide/how-to/workflow-patterns) and [Bindings](/reference/bindings).
- **Not one set of checks.** A `verify` step names its validators. Add a script validator or a native validator and the platform runs it like its own. See [Validators](/guide/concepts/validators).
- **Not one agent.** The agent runner knows an engine adapter, not an engine. Another agent needs another adapter and nothing else.
- **Not one cluster.** The conductor schedules onto runners through the job attempt, so a runner for a different execution environment changes nothing else.
- **Not one implementation.** Every part is defined by a contract. See [Contracts](/reference/contracts).
- **Not one factory.** How a factory works is data in its tenant config. Another tenant writes its own tenant config and uses the same modules. Another platform can implement the same standards and produce evidence the same tools verify. See [Conformance](/reference/conformance).

## Next steps

- To read what each standard says, see [Open standards](/guide/concepts/standards).
- To plug in a check of your own, read [Validators](/guide/concepts/validators).
- To see what the tenant config captures, read [The tenant defines the factory](/guide/concepts/tenant).
- To see where the modules run, read [Where it runs](/guide/concepts/architecture).
