# The tenant defines the factory

Two tenants rarely work the same way. One lets agents hand over results all night, and another wants a person to approve every plan. If those choices are compiled into the platform, each tenant needs its own platform. In Daggry they are data: the tenant config says how a factory works, and the modules read it.

A tenant is a party whose runs an installation hosts. A factory is what the tenant gets: a system that takes in work, puts agents on it and hands back checked results.

## What the tenant config captures

The tenant config answers four questions. It also names the runner images the tenant offers, the projects the factory serves, the validators it admits and the extensions it admits. For every key, see the [Tenant config reference](/reference/tenant-config).

### Which workflows

The tenant config holds a catalogue: the workflows the factory offers, each with a name and the workspace, path and version its file is read from. A workflow is still a file of steps. A run uses only a workflow from the catalogue, and the version pins exactly one content of the file. See [Work graphs](/guide/concepts/workflows).

The tenant config also assigns the workflows. For each project the factory serves, it lists the workflows that may run there and the one that runs by default. A project never assigns a workflow to itself. See [Why the project does not choose workflows](/guide/concepts/standards#why-the-project-does-not-choose-workflows).

### How they are orchestrated

The conductor schedules by the tenant's rules, not by its own. The tenant config sets four things.

- **Concurrency.** The most job attempts that run at one time for the tenant.
- **Leases.** How long a job lease lasts. A runner that stops renewing its lease is taken as gone.
- **Limits.** The ceilings no run exceeds, such as the most attempts one job may have and the longest a run may wait for a limit to reset.
- **Retry.** How long the conductor waits before it starts a new attempt after a lapsed lease.

### How autonomous agents are put to work

The tenant config says which agents work, with what, and how far they go alone.

- **Roster.** The agents the factory has, each with a name, an engine and an instruction file.
- **Engines.** The registered engines. The agent runner starts an engine through an engine adapter, so changing an agent's engine is a change to this file.
- **Credentials.** Which stored secret each engine uses. The tenant config holds a reference to the secret, never its value.
- **Autonomy and approval rules.** The points where a run always waits for a person: before work builds on a plan, before an effect (the step that hands the result over), or both. The rules bind every workflow in the catalogue. Autonomy is what is left: between those points, the agents work without a person.

### Which validators judge the work

A validator is a check written as code, and a `verify` step names the ones it runs. The tenant config says which validators a run may name.

- **Its own script validators.** The tenant declares a script or an executable as `tenant/<name>`. It holds for every project the factory serves.
- **A project's validators.** A project declares its own as `project/<name>`. The tenant decides whether they count as evidence. By default they do not, and they still run as previews.
- **Native validators.** A native validator is loaded in-process or run as a service that speaks the validator protocol, in any language. The cluster admin installs it, and the tenant admits it by name, version and digest.

See [Validators: the extension point](/guide/concepts/validators).

## Three documents, three questions

The tenant config is one of three documents that shape a run. Each answers a different question, and the question tells you where a setting belongs.

| Document | The question it answers | Example |
|---|---|---|
| Tenant config | How does this factory work? | At most four job attempts at a time. Plans need approval. This project gets the review workflow. |
| Project config | What is true of this project? | These are its areas. This validator is the verification evidence. These paths are protected. |
| Workflow | What is this piece of work? | Write a plan, wait for approval, then do the work and verify it for each item. |

A setting that holds for every project belongs to the tenant. A setting that is true of one project whatever the work, and whichever factory works on it, belongs to the project. A decision about one project, such as which workflows run on it, belongs to the tenant. A setting that holds for one kind of work belongs to the workflow. See [Project config](/reference/project-config) and the [Workflow schema](/reference/workflow-schema).

## Precedence: narrow freely, widen by a person

The three documents are layered. The tenant config is the outer layer, the project config is inside it, and the workflow is inside both.

The rule has two halves.

- **An inner layer can narrow.** A project can protect more paths. A workflow can give a step a smaller scope inside the scope of the run. The scope of a run is the tenant's choice among the areas the project defines: the project names the areas, and never says which of them a run may change.
- **An inner layer never widens.** A project cannot choose a workflow, an engine or an approval rule, or make its own validators count as evidence. A workflow cannot open a path the project protects or replace the project's canonical validator. Where two layers disagree, the outer one wins: the tenant's rule over the project's, and the project's over the workflow's.

An extension key follows the same rule. It narrows or adds, and never widens.

The table says who may widen each layer.

| To widen | Who decides | How |
|---|---|---|
| A limit in the tenant config | The tenant's owner | By changing the tenant config. |
| A limit in the project config | The project's owner, inside what the tenant allows | By an accepted change to the project config. It applies from the next run. |
| A rule inside one run | A person, by a grant | By an approval that is sealed as evidence and opens one thing once. |

An agent is never on that list. An agent never changes what instructs it, constrains it or judges it, and the tenant config, the project config and the workflow are all three. The control plane holds the tenant config outside every runner, and a run reads the project config from the baseline, the version of the workspace the run started from, so an edit by a step changes nothing for the run. See [What an agent cannot change](/guide/concepts/protection).

Every run records the configuration it started under. A later change applies to new runs only.

## Why the tenant holds it

- **A new way of working is an edit, not a release.** Adding an agent to the roster, changing an engine or requiring one more approval changes one file.
- **You can read how the factory works.** The rules are in one document with a published schema, not spread across code and settings.
- **Another factory can use the same file.** The tenant config is an open standard. See [Open standards](/guide/concepts/standards).

## Next steps

- To see the modules that read the tenant config, read [The modules](/guide/concepts/modules).
- To look up a key, see the [Tenant config](/reference/tenant-config) and [Project config](/reference/project-config) references.
