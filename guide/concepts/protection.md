# What an agent cannot change

The easiest way to pass a check is to change the check. An agent that can edit its validators, its instructions or its check settings can make any run look green. Daggry puts those files off limits by code, not by asking the agent nicely.

The rule is short: an agent never changes what instructs it, constrains it or judges it. Only a person can widen the rules.

<Boundary />

The diagram shows a run in the software binding. An agent can write the files its step is scoped to. It cannot write what judges it (there, the tests), instruction files or check settings. Anything off limits is put back and recorded.

## What instructs, constrains and judges

- **Instructs.** Daggry's own instructions, such as the step prompt, and your project's own agent configuration: instruction files, agent folders, skills, commands, hooks and project settings. The runner holds Daggry's own instructions on a read-only volume. The agent reads your project's configuration from the workspace, so it works the way your project says. The boundary check keeps the rule for those files: a changed path is restored in the runner and rechecked in the control plane, and the step fails.
- **Constrains.** The workflow, each step's scope (the files it may write) and the protected set. These live outside the runner. The conductor (the module that orders the steps) reads the workflow, and the control plane (the module that holds the keys, seals and judges) checks scope and the protected set.
- **Judges.** The validators and what they read. The files of a script validator are protected by default, whether the tenant config or the project config declares it. A run takes a project's validators from the baseline, the version of the workspace the run started from, and built-in and native validators from the factory, never from the agent's change. Checks that the run itself wrote in an earlier iteration are frozen. See [Validators](/guide/concepts/validators).

A project can add paths of its own to the protected set. For the exact list of protected paths and what a project adds, see [Protected paths](/reference/protected-paths).

## Frozen tests

Some work is judged by a check the run itself writes. Once such a check is sealed, it is frozen, so the work cannot pass by weakening it. The software binding shows how, and this section and the next describe that binding. See [Bindings](/reference/bindings).

In a loop that shows the test failing first, the agent writes a test and Daggry seals it. From then on the test files are frozen. Daggry compares each frozen file with the last sealed commit, and a changed or missing file is a violation.

If the agent believes a frozen test is wrong, it does not edit it. It ends its step with the test failing, and the loop stops and asks you.

## Unfreeze a test

To let the agent change one frozen test, you grant it. The run must be waiting at the approval that an exhausted loop routes to.

```sh
daggry approve <run-id> --unfreeze <path>
```

`<run-id>` is the waiting run. `<path>` is the frozen test file to open. The grant is recorded against the file's current content and opens that one path for the next iteration only.

## Why the check holds

Daggry checks twice. The program that runs the steps inside the runner restores violating paths when a step ends. Then the control plane rechecks from the forge's own view of the change, and a violation there fails the step. Because the second check runs outside the runner, an agent cannot skip it. The steps are in [Protected paths](/reference/protected-paths).

## Next steps

- To see how loops use frozen checks, read [Work graphs](/guide/concepts/workflows).
- To see who may add a validator, read [Validators](/guide/concepts/validators).
- To see how the record of an approval is kept, read [Why you can trust a run](/guide/concepts/trust).
