# Set up a tenant

A team should not have to design a factory before it can try one.
To put Daggry's default team on your issues you write one small file: who can approve, a credential for the engine and one trigger. Everything else has a default that you can replace later.
Read this page if you run Daggry for a team. Project developers do not need it.

The files on this page are illustrative. `<engine>` stands for the name of a coding-agent engine your installation provides.

## Start with three things

This is a complete tenant config. An approver who labels an issue `factory` on this repository gets a planner, a developer and a reviewer on it.

```yaml
format: daggry/tenant@1

approvers: [4411, 5207]

agents:
  engines:
    <engine>:
      credential:
        ref: model-credential

projects:
  example/shop-web:
    triggers:
      factory_label:
        on: issue-labeled
        label: factory
        workflow: idea-to-pr
```

1. **Say who can approve.** `approvers` lists people by numeric GitHub id. Only they can start a run, steer it and approve. See [Comments and approvals](/reference/conversation).
2. **Give the engine a credential.** `credential.ref` names a stored secret. The file never holds the secret.
3. **Add one trigger.** It connects a label on a repository to a workflow. `idea-to-pr` is the workflow Daggry ships.
4. **Install Daggry's GitHub App on the repository,** and give the file to Daggry. See [Install Daggry](/guide/how-to/deploy).

To see what happens next, read [From a labelled issue to a merged pull request](/guide/how-to/issue-to-pr). The control plane holds this file outside every runner, so no agent can change it, and each run pins what it used from it in its first record.

## Make the team yours

The default team is a starting point. A persona is a named agent: an engine and the instructions it works under. Define one with the name of a shipped persona, and yours is used instead.

```yaml
personas:
  developer:
    description: Writes the proof for each criterion, then the work, in our house style.
    engine: <engine>
    source:
      workspace: factory-personas
      revision: v-0021
    instructions:
      path: personas/developer.md
```

Instructions say who the persona is and how it always works. What to do now comes from the objective of each run, so one team serves many kinds of work. A project can define its own version in `.daggry/project.yaml`, and the project's persona wins on that project.

<Lookup />

The diagram shows how Daggry resolves a name in a workflow, for a persona, a validator or a judge: the project config first, then the tenant config, then what Daggry ships. What it finds is pinned in the run lock.

## Add rules when you need them

Every other section is optional. Add one when you have a reason. The table lists the common ones.

| You want to | Add | See |
|---|---|---|
| Start work from a bug label, an issue type or a schedule | More `triggers` | [Triggers](/reference/tenant-config#triggers) |
| Offer workflows of your own | `workflows` | [workflows](/reference/tenant-config#workflows) |
| Require a person before every plan is built on, or before every effect | `agents.approval.require` | [agents](/reference/tenant-config#agents) |
| Check every project with the same validator | `validators.scripts` | [validators](/reference/tenant-config#validators) |
| Limit a project to some workflows, personas or areas | Keys of the project entry | [projects](/reference/tenant-config#projects) |

A project or a workflow can add limits. Only a person can remove one, and an agent can change none of these files.

Related:

- [From a labelled issue to a merged pull request](/guide/how-to/issue-to-pr)
- [Send the team on a mission](/guide/how-to/autonomy)
- [Tenant config reference](/reference/tenant-config)
