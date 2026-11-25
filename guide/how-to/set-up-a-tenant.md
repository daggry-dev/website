# Set up a tenant

Two teams rarely work the same way. One lets agents deliver all night, and another wants a person to approve every plan. The tenant config is one file where you choose which workflows run on which project, which agents work and where a person must approve. Read this page if you are the tenant admin.

The file on this page is illustrative. `<engine>` stands for the name of an engine your cluster admin provides.

## A small tenant config

This tenant offers one workflow, runs at most four jobs at a time, has one agent, asks for approval of every plan and serves one project.

```yaml
format: daggry/tenant@1

workflows:
  - name: review
    source:
      workspace: factory-workflows
      path: workflows/review.yaml
      revision: v-0017

orchestration:
  concurrency_cap: 4
  attempts:
    max: 3

agents:
  engines:
    - name: <engine>
      credential:
        ref: model-credential
  roster:
    - name: reviewer
      engine: <engine>
      instructions: agents/reviewer.md
  approval:
    require: [plan]

runners:
  images:
    - name: documents
      image: registry.example/jobs/documents@sha256:<digest>
      default: true

projects:
  - workspace: handbook
    workflows:
      allowed: [review]
      default: review
    validators:
      admit: all

extensions:
  bindings:
    - name: review
      version: "1.0.0"
```

## Write your tenant config

Each step answers one question about how your team works. Every section is optional, so add them one at a time.

1. **List the workflows you offer.** Under `workflows`, give each one a name and say where its file is: the workspace, the path and the version. A run uses only a workflow from this list, at exactly that version.

2. **Set the scheduling limits.** Under `orchestration`, `concurrency_cap` is the most jobs that run at one time. `attempts.max` is the most attempts one job gets before the run fails.

3. **Name the agents.** Under `agents.engines`, register each engine with the name of the stored secret it uses. The file never holds the secret. Under `agents.roster`, give each agent a name, an engine and an instruction file.

4. **Choose where a person must approve.** `agents.approval.require` takes `plan`, `effect` or both. With `plan`, every workflow must stop for approval before work builds on a plan. With `effect`, every workflow must stop before it delivers a result. Daggry refuses a workflow that does not fit.

5. **List your projects.** Under `projects`, add each project by the name of its workspace. A run starts only for a listed project. For each one, say which workflows can run there and which runs by default. `validators.admit` says which of the project's own validators count: `all`, `none` or a list of names. Without it, none count.

6. **Name the kind of work.** Under `extensions.bindings`, register the binding your projects use. A binding is a ready-made setup for one kind of work.

7. **Hand the file to the cluster admin.** Daggry holds it in the control plane, outside every runner. See [Install Daggry](/guide/how-to/deploy).

A run records the tenant config it started under. A later change applies to new runs only.

::: details Can I add a validator for every project?
Yes. Declare a script under `validators.scripts`, and a workflow names it `tenant/<name>`. It then checks every project you serve. See [Add a validator](/guide/how-to/add-a-validator).
:::

::: details Can one project have stricter rules?
Yes. A project entry can limit the agents, add an approval point and limit runs to named areas of the project.

```yaml
projects:
  - workspace: example/shop-web
    agents:
      roster: [lead]
    approval:
      require: [effect]
    validators:
      admit: [test, lint, types]
    areas: [app]
```

A project entry can add an approval point. It cannot remove one.
:::

## Who can loosen a rule

You need this when a project owner asks for an exception. The tenant config wins over the project config, which wins over the workflow. An agent can change none of them.

A project or a workflow can add limits. Only a person can remove one. For the full rules, see the [Tenant config reference](/reference/tenant-config).

Related:

- [Set up a project](/guide/how-to/set-up-a-project)
- [Add a validator](/guide/how-to/add-a-validator)
- [Tenant config reference](/reference/tenant-config)
