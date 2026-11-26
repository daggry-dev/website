# What an agent cannot change

The easiest way to pass a validator is to change the validator.
An agent that can edit its validators, its instructions or its limits can make any run look good, so Daggry protects those files in code. The control is code, never an instruction to the agent.
Read this page if you own a project or write workflows and want to know what an agent can never touch.

<Boundary />

The diagram shows an agent in its runner. The agent can write the files its step is scoped to. It cannot write the validators, its instruction files or its limits. A change to a protected file is put back and recorded.

The rule is short: an agent never changes what instructs it, constrains it or judges it. The control is code, never a prompt: Daggry does not ask the agent to behave, it checks what the agent did. Only a person can loosen a rule.

Daggry enforces the rule twice. The runner puts back a protected file when a step ends. The control plane then checks the change again from outside the runner, where an agent cannot skip it, and fails the step. Each restored file is sealed as a record, so the evidence trail shows every attempt to change a protected path.

## Three groups of files are off limits

You need this list to know which of your files an agent can never edit. Three groups of files are off limits to an agent.

- **What instructs it.** The instructions of its persona, and your project's own agent configuration: instruction files, agent folders, skills, commands, hooks and project settings. The agent reads them and cannot change them.
- **What constrains it.** The workflow, each step's scope (the paths it can write) and the protected paths. Daggry keeps the workflow outside the runner.
- **What judges it.** The validators and the judges. The files that your validators' `run` commands name are protected by default. A run takes a project's validators from the version of the workspace it started from, never from the agent's change.

A project owner can add protected paths in the project config. For the exact list, see [Protected paths](/reference/protected-paths).

::: warning Limits
These rules guard against an agent that makes mistakes, not one that attacks. Text in a work item can mislead an agent. Daggry marks a step's inputs as data and not as instructions, which lowers that risk and does not remove it. A protected path stays protected whatever the agent was told.
:::

## Frozen paths

A run that writes its own test could also rewrite it, so the test is frozen once sealed. In a loop, a proof step writes the proof for a criterion, and Daggry seals it with the digest of each file before the work starts. From then on, the paths the proof step wrote are frozen paths. The work cannot pass by weakening its own proof.

In this illustrative example, a proof step writes `checks/leave-policy.sh`. A later step whose scope holds `checks/**` still cannot change that file.

If the agent believes a frozen proof is wrong, it does not edit it. It ends its step with the proof failing, and the loop stops and asks you.

::: details How do I let the agent change a frozen path?
You grant it. The run must be waiting at the approval that the loop goes to when it reaches its limit.

```sh
daggry approve <run-id> --unfreeze <path>
```

`<run-id>` is the waiting run. `<path>` is the frozen path to open. Daggry seals the grant as an approval, bound to the digest of the file at that moment. The grant opens that one path for the next iteration only.
:::

Related:

- [Add a loop](/guide/how-to/add-a-loop)
- [Why you can trust a run](/guide/concepts/trust)
- [Protected paths reference](/reference/protected-paths)
