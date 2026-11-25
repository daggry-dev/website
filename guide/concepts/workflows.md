# Work graphs

A work graph is a workflow: a document that tells Daggry how a piece of work goes. Every other page says workflow. An agent left to decide its own process can skip a step or loop all night, and you cannot predict which. Daggry takes that choice away: the agent follows the file and cannot change it.

The workflow is one of Daggry's four open standards. The file has a standard layout with a published schema and opens with the header `format: daggry/workflow@1`, so the work is defined by a document, not by the platform. A pull request from an issue is the first workflow, not the only one. See [Open standards](/guide/concepts/standards).

## Five building blocks

A workflow is a document in the tenant's catalogue. Its file is kept in a repository the tenant chooses, which can be the repository the work is done on. The tenant decides which workflows run on which repository, and the repository does not. `daggry run --workflow <file>` supplies a workflow as a file from the machine that starts the run. A new kind of work needs a new file, not a new release of Daggry. For a picture of the delivery workflow, see [Write a workflow](/guide/how-to/write-a-workflow).

- A **step** is one unit of work: an agent session, a script, a check, a wait for a person, or opening a pull request.
- An **output** is what a step hands to the next one. Daggry seals it: code checks it, then signs it so it cannot be quietly changed.
- A **gate** is a rule over facts that code computed. It decides whether a loop can stop.
- A **loop** repeats steps for each item of an approved plan, with a hard limit.
- A **human wait** stops the run until you decide.

Because each output is sealed, a later step cannot rewrite what an earlier one delivered. See [Why you can trust a run](/guide/concepts/trust).

## Loops always end

A loop is where an agent can spin, so each loop has a limit and a gate. After every iteration, Daggry checks the gate. If the check passed, the loop moves on. If it failed, the same item repeats. If the limit runs out, the run fails or waits for you, whichever the file says.

<LoopGate />

The diagram shows one loop iteration, the gate after it, and the exit when the limit is spent: the run fails, or a person decides.

In a delivery loop, an iteration is a test, a fix and a check. The agent cannot edit the test it is trying to pass.

## You decide where a person is needed

Some decisions are yours, and an agent that guesses them can build the wrong plan to the end. A human wait stops the run where you chose and shows why. Normally there are two: approve the plan before work starts, and review the result before it leaves the repository.

<HumanWait />

The diagram shows an approval card moving from Waiting to Approved, with the reason shown while it waits. Your approval is recorded against the exact plan or change you saw, so a later edit cannot ride on it.

## The file fixes, the run decides

Anything that makes a run predictable is fixed in the file before it starts. Anything that depends on the work is decided while it runs.

| The file fixes | The run decides |
|---|---|
| The order of steps and loops | How many iterations a loop needs, one for each item in the approved plan |
| The limit on every loop, and whether the run fails or waits for you when it runs out | Whether a loop stops early because its gate already holds |
| Where a person waits | Which paths each step changed |
| What each step may write | Whether those paths stayed in scope |

A gate reads only facts that code computed from sealed records, never what an agent said. For the syntax, see [Gate expressions](/reference/gates).

## Who runs each step

A step's kind decides what runs it: the runner in the pod, the control plane, or nobody while the run waits for a person. For each kind, see [Which module runs a step](/reference/workflow-schema#which-module-runs-a-step).

A `verify` step names no command. It runs the check that the repository's project config calls canonical, which can be a test suite, a build or a script of the project's own. The same workflow therefore works on projects in different languages. See [Project config](/reference/project-config).

The conductor orders the steps and hands each job to a runner. How many jobs run at a time, how long a lease lasts and where a person must decide come from the tenant config. See [The modules](/guide/concepts/modules) and [The tenant defines the factory](/guide/concepts/tenant).

## Extending the workflow

The standard grows without changing. A step kind that the standard does not define is named `<namespace>/<name>`, and a tenant admits it by name in its tenant config. A key the standard does not define is written `<namespace>/<key>`. A key or a kind without a namespace that the standard does not define is refused. See the [Workflow schema](/reference/workflow-schema).

## Limits that keep a run readable

An agent never adds, removes or reorders steps. The conductor (the module that orders the steps and schedules them across runners) reads the file, and the control plane (the module that holds the keys and seals results) keeps it outside every workspace. There is no `if`: branching happens at gates, loops and human waits. Steps run in order and loops do not nest. You can read a workflow and know every path a run can take.

Daggry fits work that you can break into steps with named outputs, check with a script, and hand to a person where code cannot decide. For ready-made files, see [Workflow patterns](/guide/how-to/workflow-patterns).

## Next steps

- To turn your kind of work into a workflow, read [Design a workflow](/guide/how-to/design-a-workflow).
- To write the file, read [Write a workflow](/guide/how-to/write-a-workflow).
- To see what an agent cannot change, read [What an agent cannot change](/guide/concepts/protection).
- To see which module runs each step, read [The modules](/guide/concepts/modules).
- To see where each step runs, read [Where it runs](/guide/concepts/architecture).
