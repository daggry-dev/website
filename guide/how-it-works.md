# How it works

Names such as conductor and control plane appear in status output, settings and errors, and they mean little until you have seen a run.
This page follows one run from the files you write to the trail you verify, and names the record sealed at each stage.
Read it once you have run a workflow. Skip it if you only want to follow a how-to.

## The whole model

Everything in Daggry leads to one thing: an evidence trail you can verify.

<ModelOverview />

The diagram reads in order. The tenant config defines personas, validators and the workflows on offer. The project config adds the project's own validators, areas and personas. A run follows one workflow on one workspace. Every step seals records, the records form the evidence trail, and `daggry verify` checks the trail on your own machine.

You write the first three files, and Daggry writes the trail. All four formats are published, so your own tools can read them. See [Formats and versioning](/reference/open-formats).

## A run from start to finish

An agent makes mistakes, and a mistake can damage whatever the agent can reach. So agents work in a throwaway runner, and the keys stay in the control plane.

<Architecture run />

A run goes through five stages. The diagram numbers them, and the list names what each stage seals.

1. **Work comes in.** You label an issue, and a trigger in the tenant config starts the workflow for that label. The issue is the objective of the run: what it is asked to do. A schedule or the CLI can start a run too, with an objective of its own. The control plane seals a run lock, which pins the validators, the judges, the personas and the workflow, and it seals the work item.
2. **The conductor picks the next step.** It reads the order from the workflow and the limits from the tenant config, and starts a runner for the job. It holds no key and seals nothing.
3. **The runner does the work.** It runs a step as a script, or with an agent: the persona the step names, on that persona's engine. The persona gets its standing instructions, the objective and the sealed outputs of earlier steps. What the runner sends back is only a claim.
4. **The control plane checks and seals.** It checks the claim and seals a change, which carries the persona and the digest of its instructions. At a `verify` step, your validators measure the work on a clean copy and the judges decide. The control plane seals one measurement for each validator and one verdict for each judge.
5. **The result goes out.** An `effect` step delivers the result to the forge, for example by opening a pull request, and the control plane seals a record of the delivery.

A step that needs you releases its runner and asks you in a comment on the issue or the pull request. You answer in your own words. The control plane seals a clear yes as an approval and anything else as input, each against the digest of what you saw, and the job continues in a new runner. If a runner stops responding, Daggry starts a new one from the last sealed change.

For the seven modules and what each one holds, see [The modules and where they run](/guide/concepts/modules).

## What keeps it honest

Four rules make a pass worth something.

- **A claim is not a record.** What an agent says it did counts for nothing until a validator has measured it and a judge has decided on it.
- **Only the control plane signs.** The signing key never enters a runner, so no agent can sign a record.
- **Each record is linked to the one before.** A record carries a digest, a short code computed from every byte. Change one byte, and `daggry verify` shows where.
- **An agent cannot change the rules.** Its validators, its instructions and its limits are protected paths.

For the details and the limits, see [Why you can trust a run](/guide/concepts/trust) and [What an agent cannot change](/guide/concepts/protection).

## Where to go from here

You have finished the path. To do a task, open a how-to, such as [Write a workflow](/guide/how-to/write-a-workflow) or [Install Daggry](/guide/how-to/deploy). To look up a key, a command or a term, open the [Reference](/reference/).

Next: [From a labelled issue to a merged pull request](/guide/how-to/issue-to-pr)
