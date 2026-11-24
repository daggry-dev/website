# The modules

A platform built as one piece can do one thing. If the scheduler, the agent and the checks are welded together, a new kind of work, a new agent or a new cluster means a new platform. Daggry is built as modules instead. Each module has one job, one open interface and a stated list of what it never does.

A workflow (also called a pipeline) is the unit all the modules serve: one document that describes a piece of work as steps.

<Modules />

The diagram shows the four open standards on top and the four running modules below. The conductor reads the tenant config and the workflow and hands each job attempt to a runner. The runners read the project config and send claims to the control plane. The control plane writes evidence.

## Eight modules

Four modules run. Four are documents, each an open standard. The table lists each module's one job.

| Module | Its one job | What it never does |
|---|---|---|
| Conductor | Orders the steps of a run and schedules job attempts across runners. | Holds a key, seals a record or runs a step's work. |
| Control plane | The one backend: holds the keys, seals, judges, serves the API and keeps tenant state. | Runs a command or an agent, or seals a claim that code has not checked. |
| Deterministic runner | Runs commands, measures and checks. | Starts a model. |
| Agent runner | Runs agentic or model-generated work through an engine adapter. | Judges its own work, or changes what instructs, constrains or judges it. |
| Evidence | The standard for sealed records: one envelope, signed and linked. | Names a cloud, a repository host or an agent. |
| Workflow | The standard for describing work as steps, outputs, gates, loops and human waits. | Changes during a run. |
| Project config | The standard for what is true of one repository. | Widens a limit the tenant set. |
| Tenant config | The standard for how a factory works. | Holds a secret. It names a credential, and the secret stays in the cluster. |

## The conductor orders and schedules

The conductor decides which step comes next and where it runs. It reads the workflow for the order and the tenant config for the limits. It hands each job attempt to a runner. On Kubernetes a job runs in one throwaway pod: the conductor asks for the pod, and the launcher (a separate small part, in process by default) creates it.

Liveness is decided by lease. A lease is a time-limited claim on a job attempt that the runner keeps alive. If the lease lapses, for example because a machine died, the conductor starts a new attempt from the last sealed commit. No other signal says whether a runner is alive.

The conductor's interface is the job attempt: the steps to run, the commit to start from and the lease. A runner that accepts a job attempt and keeps its lease can be scheduled, whether it is a pod, a virtual machine or a process.

## The control plane seals and judges

The control plane is the one backend. It holds the signing key and the key for the repository host. It takes in claims, runs the checks, seals the results and serves the API. It keeps each tenant's state, including the tenant's evidence trail.

There is one control plane so that there is one place where a claim becomes evidence. A key that exists in one module can be guarded in one module.

Its interfaces are the [HTTP API](/reference/api) and the evidence standard. See [Where it runs](/guide/concepts/architecture).

## Two runners, two mechanisms

Deterministic work and agentic work run by different mechanisms, because they deserve different trust.

The **deterministic runner** runs code that gives the same result for the same input: a shell command, a test run, a linter, a build or a script of the project's own. It never starts a model. A measurement runs on a clean copy of the code, after any agent process has ended.

The **agent runner** runs work whose result a model produces. It starts a coding agent through an engine adapter. The engine (the coding-agent CLI that does the work) is replaceable: the adapter gives every engine the same prompt, the same tools and the same way to hand in a result. Whatever the agent hands in is a claim.

Both runners have the same interface to the rest of the platform. Each accepts a job attempt and sends back claims. Neither holds the signing key. A tenant config may name more than one runner class; see the [Tenant config reference](/reference/tenant-config).

## Four standards connect them

The running modules never call each other through private formats. They read and write four documents.

- **Workflow.** The work, as steps. The conductor reads it. See [Work graphs](/guide/concepts/workflows).
- **Evidence.** The sealed records. The control plane writes them, and anyone can verify them. See [Why you can trust a run](/guide/concepts/trust).
- **Project config.** What is true of one repository: its checks, and the one canonical check whose result is the verification evidence. The runners read it. See [Project config](/reference/project-config).
- **Tenant config.** How the factory works: which workflows run on which repository, how they are orchestrated, which agents work and under which rules. The conductor and the control plane read it. See [The tenant defines the factory](/guide/concepts/tenant).

Each document has a published schema, a version and an extension mechanism. See [Open standards](/guide/concepts/standards).

## Why modules

Nothing in the platform is specific to one kind of work, one agent, one cloud or one factory.

- **Not one kind of work.** The work lives in a workflow file. A pull request from an issue is the first workload. A report, a migration or a release check is another file. See [Workflow patterns](/guide/how-to/workflow-patterns).
- **Not one agent.** The agent runner knows an engine adapter, not an engine. Another coding agent needs another adapter and nothing else.
- **Not one cloud.** The conductor schedules onto runners through the job attempt. Kubernetes pods are the first runners.
- **Not one factory.** How a factory works is data in its tenant config. Another team writes another tenant config and uses the same modules. Another platform can implement the same standards and produce evidence the same tools verify. See [Conformance](/reference/conformance).

## Next steps

- To read what each standard says, see [Open standards](/guide/concepts/standards).
- To see what the tenant config captures, read [The tenant defines the factory](/guide/concepts/tenant).
- To see where the modules run, read [Where it runs](/guide/concepts/architecture).
- For which modules exist today, see the [Roadmap](/roadmap).
