# What an agent cannot change

The easiest way to pass a validator is to change the validator. An agent that can edit its validators, its instructions or its limits can make any run look good, so Daggry protects those files in code and does not rely on the agent's instructions. Read this page if you own a project or write workflows and want to know what an agent can never touch.

<Boundary />

The diagram shows an agent in its runner. The agent can write the files its step is scoped to. It cannot write the validators, its instruction files or its limits. A change to a protected file is put back and recorded.

The rule is short: an agent never changes what instructs it, constrains it or judges it. Only a person can loosen a rule.

Daggry enforces the rule twice. The runner puts back a protected file when a step ends. The control plane then checks the change again from outside the runner, where an agent cannot skip it, and fails the step.

## Three groups of files are off limits

You need this list to know which of your files an agent can never edit. Three groups of files are off limits to an agent.

- **What instructs it.** The step prompt, and your project's own agent configuration: instruction files, agent folders, skills, commands, hooks and project settings. The agent reads them and cannot change them.
- **What constrains it.** The workflow, each step's scope (the paths it can write) and the protected paths. Daggry keeps the workflow outside the runner.
- **What measures it.** The validators and the files they read. The files that your validators' `run` commands name are protected by default. A run takes a project's validators from the version of the workspace it started from, never from the agent's change.

A project owner can add protected paths in the project config. For the exact list, see [Protected paths](/reference/protected-paths).

## Frozen paths

A run that writes its own test could also rewrite it, so the test is frozen once sealed. In a loop, a proof step writes the proof for a criterion, and Daggry seals it. From then on, the paths the proof step wrote are frozen paths. The work cannot pass by weakening its own proof.

In this illustrative example, a proof step writes `checks/leave-policy.sh`. A later step whose scope holds `checks/**` still cannot change that file.

If the agent believes a frozen proof is wrong, it does not edit it. It ends its step with the proof failing, and the loop stops and asks you.

::: details How do I let the agent change a frozen path?
You grant it. The run must be waiting at the approval that the loop goes to when it reaches its limit.

```sh
daggry approve <run-id> --unfreeze <path>
```

`<run-id>` is the waiting run. `<path>` is the frozen path to open. Daggry records the grant against the file's content at that moment. The grant opens that one path for the next iteration only.
:::

Related:

- [Add a loop](/guide/how-to/add-a-loop)
- [Why you can trust a run](/guide/concepts/trust)
- [Protected paths reference](/reference/protected-paths)
