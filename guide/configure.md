# Configure Daggry

A setting in the wrong place is hard to find and easy to get wrong.
Three files hold every setting in Daggry, and this page tells you which file a setting goes in.
Read it before you set up a project. Tenant settings matter only to the person who runs Daggry for a team.

## Three files, three questions

Each file answers one question and has one owner. Ask the question, and you know where a setting belongs and whom to ask for a change. The table lists the three files.

| File | The question it answers | Who writes it | Example |
|---|---|---|---|
| Workflow | What is this piece of work? | You, or whoever designs the work | Write a plan, wait for approval, then do the work and validate it until every criterion is covered. |
| Project config | What is true of this project? | The project owner | This is its main validator. These paths are protected. |
| Tenant config | How does our factory work? | The tenant admin | These personas work for us. Plans need approval. This project gets the review workflow. |

Where two files disagree, the tenant config wins over the project config, which wins over the workflow. A project or a workflow can add limits. Only a person can remove one, and an agent can change none of the three files.

## What each file defines

You need this to know where to look when a run names something. A workflow names personas, validators and judges, and never defines them: the tenant config and the project config do.

<WhereThingsLive />

The diagram shows four columns: what the tenant config defines, what the project config defines, what a workflow says and what a run adds.

- **The tenant config** defines what your projects share: personas, validators and judges, the workflows on offer, the engines, the approval rules and the limits.
- **The project config** defines what is true of one project: its areas, its validators and judges, personas of its own and its protected paths. It never names a workflow.
- **The workflow** says how one piece of work goes: the steps, the persona for each agent step, the validators and judges for each `verify` step, each step's scope, the loops with their gates, the approvals and the effect.
- **The run** adds the rest: the work item, the baseline (the version of the workspace it starts from) and the sealed records.

A persona is a named agent: an engine and its instructions. A workflow step names a persona, so the instructions live in one place and not in every workflow. When a project and the tenant define the same name, the project's wins.

## What a run pins

A setting that changes during a run would make the trail hard to read. So the first record of every run is a run lock. It pins the validators, the judges, the personas with the digest of their instructions, the boundary rules, the runner image and the workflow.

The evidence trail therefore shows which rules a run ran under. A later change to a file applies to new runs only.

## The four tasks

Configuring Daggry comes down to four tasks. Each has its own page.

1. [Set up a project](/guide/how-to/set-up-a-project): tell Daggry how to check your project and what to protect in it.
2. [Set up a tenant](/guide/how-to/set-up-a-tenant): define your personas, choose which workflows run where and say where a person must approve.
3. [Write a workflow](/guide/how-to/write-a-workflow): turn a piece of work into a file an agent must follow.
4. [Add a validator](/guide/how-to/add-a-validator): make Daggry enforce a rule of your own on every run.

For every key of each file, see the [Reference](/reference/).

Next: [How it works](/guide/how-it-works)
