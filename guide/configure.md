# Configure Daggry

A setting in the wrong place is hard to find and easy to get wrong.
Three files hold every setting in Daggry, and one table tells you which file a setting goes in.
Read this page before you set up a project or a tenant. Skip it if you only start and approve runs.

## Three files, three questions

Each file answers one question. Ask the question, and you know where a setting belongs.

| File | The question it answers | Example |
|---|---|---|
| Workflow | What is this piece of work? | Write a plan, wait for approval, then do the work and validate it for each plan item. |
| Project config | What is true of this project? | This is its main validator. These paths are protected. |
| Tenant config | How does our factory work? | At most four jobs run at a time. Plans need approval. This project gets the review workflow. |

Put the steps of one job in the workflow, how to check one project in its project config, and how your team works in the tenant config.

A project config never names a workflow. The project says how to check it and what to protect; the tenant decides what work is done on it.

## Who writes which file

Each file has one owner, so you know whom to ask for a change.

| File | Who writes it | Where it lives |
|---|---|---|
| Workflow | You, or whoever designs the work | A YAML file you pass to `daggry run`, or one the tenant offers |
| Project config | The project owner | `.daggry/project.yaml` in the project |
| Tenant config | The tenant admin | One YAML file for the tenant |

The tenant config wins over the project config, which wins over the workflow; an agent can change none of them. A project or a workflow can add limits. Only a person can remove one.

A new way of working is an edit to one file, not a new release.

## The four tasks

Configuring Daggry comes down to four tasks. Each has its own page.

1. [Set up a project](/guide/how-to/set-up-a-project): tell Daggry how to check your project and what to protect in it.
2. [Set up a tenant](/guide/how-to/set-up-a-tenant): choose which workflows run where, which agents work and where a person must approve.
3. [Write a workflow](/guide/how-to/write-a-workflow): turn a piece of work into a file an agent must follow.
4. [Add a validator](/guide/how-to/add-a-validator): make Daggry enforce a rule of your own on every run.

For every key of each file, see the [Reference](/reference/).

Next: [How it works](/guide/how-it-works)
