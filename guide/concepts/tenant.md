# The tenant defines the factory

Two teams rarely work the same way. One lets agents open pull requests all night, and another wants a person to approve every plan. If those choices are compiled into the platform, each team needs its own platform. In Daggry they are data: the tenant config says how a factory works, and the modules read it.

A tenant is a party whose runs an installation hosts, such as a team. A factory is what the tenant gets: a system that takes in work, puts agents on it and hands back checked results.

## Three things the tenant config captures

The tenant config answers three questions. It also names the runner images the tenant offers, the repositories the factory serves and the extensions it admits. For every key, see the [Tenant config reference](/reference/tenant-config).

### Which workflows

The tenant config holds a catalogue: the workflows the factory offers, each with a name and the repository, path and commit its file is read from. A workflow is still a file of steps. A run uses only a workflow from the catalogue, and the commit pins exactly one content of the file. See [Work graphs](/guide/concepts/workflows).

The tenant config also assigns the workflows. For each repository the factory serves, it lists the workflows that may run there and the one that runs by default. A repository never assigns a workflow to itself. See [Why the project does not choose workflows](/guide/concepts/standards#why-the-project-does-not-choose-workflows).

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
- **Autonomy and approval rules.** The points where a run always waits for a person: before work builds on a plan, before an effect such as opening a pull request, or both. The rules bind every workflow in the catalogue. Autonomy is what is left: between those points, the agents work without a person.

## Three documents, three questions

The tenant config is one of three documents that shape a run. Each answers a different question, and the question tells you where a setting belongs.

| Document | The question it answers | Example |
|---|---|---|
| Tenant config | How does this factory work? | At most four job attempts at a time. Plans need approval. This repository gets the delivery workflow. |
| Project config | What is true of this repository? | This check is the verification evidence. These paths are protected. |
| Workflow | What is this piece of work? | Write a plan, wait for approval, then a test and a fix for each item. |

A setting that holds for every repository belongs to the tenant. A setting that is true of one repository whatever the work, and whichever factory works on it, belongs to the project. A decision about one repository, such as which workflows run on it, belongs to the tenant. A setting that holds for one kind of work belongs to the workflow. See [Project config](/reference/project-config) and the [Workflow schema](/reference/workflow-schema).

## Precedence: narrow freely, widen by a person

The three documents are layered. The tenant config is the outer layer, the project config is inside it, and the workflow is inside both.

The rule has two halves.

- **An inner layer can narrow.** A project can protect more paths and name the areas a run can be limited to. A workflow can give a step a smaller scope inside that limit.
- **An inner layer never widens.** A project cannot choose a workflow, an engine or an approval rule, and a workflow cannot open a path the project protects or replace the project's canonical check. Where two layers disagree, the outer one wins: the tenant's rule over the project's, and the project's over the workflow's.

An extension key follows the same rule. It narrows or adds, and never widens.

The table says who may widen each layer.

| To widen | Who decides | How |
|---|---|---|
| A limit in the tenant config | The tenant's owner | By changing the tenant config. |
| A limit in the project config | The repository's owner, inside what the tenant allows | By merging a change to the project config. It applies from the next run. |
| A rule inside one run | A person, by a grant | By an approval that is sealed as evidence and opens one thing once. |

An agent is never on that list. An agent never changes what instructs it, constrains it or judges it, and the tenant config, the project config and the workflow are all three. The control plane holds the tenant config outside every pod, and a run reads the project config from the commit it started from, so an edit by a step changes nothing for the run. See [What an agent cannot change](/guide/concepts/protection).

Every run records the configuration it started under. A later change applies to new runs only.

## Why the tenant holds it

- **A new way of working is an edit, not a release.** Adding an agent to the roster, changing an engine or requiring one more approval changes one file.
- **You can read how the factory works.** The rules are in one document with a published schema, not spread across code and settings.
- **Another factory can use the same file.** The tenant config is an open standard. See [Open standards](/guide/concepts/standards).

## Next steps

- To see the modules that read the tenant config, read [The modules](/guide/concepts/modules).
- To look up a key, see the [Tenant config](/reference/tenant-config) and [Project config](/reference/project-config) references.
- For what exists today, see the [Roadmap](/roadmap).
