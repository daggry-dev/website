# How it works

Names such as conductor and control plane appear in status output, settings and errors, and they mean little until you have seen a run.
This page follows one run through Daggry's seven modules, so the rest of the site makes sense.
Read it once you have run a workflow. Skip it if you only want to follow a how-to.

## A run from start to finish

Whatever an agent can reach, it can misuse. So agents work in a throwaway runner, and the keys stay in the control plane.

<Architecture run />

A run goes through five stages. The diagram numbers them.

1. **Work comes in.** You start a run with the CLI, for one work item in the forge.
2. **The conductor picks the next step.** It reads the order from the workflow and the limits from the tenant config, and starts a runner for the job.
3. **The runner does the work.** It runs a step in one of two ways: as a script, or with an agent. The agent runs on an engine.
4. **The control plane checks and seals.** What the runner sends back is only a claim. Your validators measure it, the judges decide the verdict, and the control plane signs both and adds them to the evidence trail in the store.
5. **The result goes out.** An `effect` step delivers the result to the forge, for example by opening a pull request.

A step that needs your approval releases its runner. The job continues in a new runner when you approve. If a runner stops responding, Daggry starts a new one from the last sealed change.

## The seven modules

You meet these seven names in status output, settings and errors. Each module has one job.

| Module | Its one job |
|---|---|
| Conductor | Decides which step runs next and starts runners. |
| Control plane | Holds the keys, checks results and writes the trail. |
| Runner | Runs one job in a throwaway environment. It never holds the signing key. |
| Engine | The coding-agent program an agent runs on. |
| Forge | Where work comes from and where results go. For software, GitHub. |
| Store | Keeps the trail. |
| Validators | Measure the work as code. Judges decide a verdict from the evidence trail. |

You can replace any module with your own. Daggry runs on your Kubernetes cluster.

## What keeps it honest

Four rules make a pass worth something.

- **A claim is not a record.** What an agent says it did counts for nothing until a validator has measured it and a judge has decided on it.
- **Only the control plane signs.** The signing key never enters a runner, so no agent can sign a record.
- **Each record is linked to the one before.** A record carries a digest, a short code computed from every byte. Change one byte, and `daggry verify` shows where.
- **An agent cannot change the rules.** Its validators, its instructions and its limits are protected paths.

For the details, see [Why you can trust a run](/guide/concepts/trust) and [What an agent cannot change](/guide/concepts/protection).

## Built on open formats

You are not locked in to Daggry's own tools. You write three files: the workflow, the project config and the tenant config. Daggry writes the fourth, the evidence trail. All four formats are published and versioned, and you can add your own keys. You can read and check them with your own tools. See [Open formats](/reference/open-formats).

## Where to go from here

You have finished the path. To do a task, open a how-to, such as [Design a workflow](/guide/how-to/design-a-workflow) or [Install Daggry](/guide/how-to/deploy). To look up a key, a command or a term, open the [Reference](/reference/).

Next: [Workflow examples](/guide/how-to/workflow-patterns)
