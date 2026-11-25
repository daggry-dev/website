# How Daggry works

An agent can do a night's work, but its own report is the only proof. Daggry runs the work as fixed steps, has code re-check each step, and keeps a signed record you can verify yourself.

Daggry is a factory kit. A factory is a system that takes in work, puts agents on it and hands back checked results. The kit is a set of modules, each with one job, and four open standards that connect them. A pull request from an issue is the first workload, not the only one.

Daggry is Danish for dawn. You start the work, go to sleep, and at first light it is done and checked.

## One night

**22:00.** You write an issue. An agent drafts a plan from it, and you approve the plan before bed.

**Overnight.** Each job runs in its own throwaway pod (a container that lives for one job). It holds a token for one repository and never the signing key. The agent takes the plan one item at a time. It writes a test, Daggry shows that the test fails, the agent makes it pass, and Daggry runs it again on a clean copy of the code. If a machine dies at 3 a.m., a new pod starts from the last commit Daggry sealed and repeats the interrupted step.

**06:30.** The pull request is open, with the record of each check that passed beside it. A run that needed you stopped and says why. Reviewing the pull request is normally your second decision.

<MorningTrail />

The trail shows one night in four entries: the plan you approved, the test that failed first, the same test passing, and the pull request opening. Each entry is checked by code and signed.

## One night is one workflow

Nothing in that night is built into Daggry. The plan, the test that fails first, the approval and the pull request are steps in a workflow, a file you can read and change. Another file describes other work: a report, a migration, a release check.

The same holds for the rest of the factory. Which agents work, on which engine, how many jobs run at a time and where a person must decide are data in the tenant config. What is true of one repository, such as how to check it, is in its project config.

## Built from modules and open standards

**Modules.** A conductor orders the steps and schedules them across runners. A control plane holds the keys, seals and judges. A runner runs the steps in the pod in two ways: as the deterministic runner it runs commands and checks and never starts a model, and as the agent runner it runs a coding agent through an adapter, so the agent is replaceable. See [The modules](/guide/concepts/modules).

**Open standards.** Four documents connect the modules: the workflow, the evidence, the project config and the tenant config. Each has a published schema, a version and a way to extend it. Any factory can implement the same specification and the same signing and chaining of evidence. See [Open standards](/guide/concepts/standards).

**The tenant defines the factory.** How workflows are chosen, how they are orchestrated and how agents are put to work is captured in the tenant config, not in code. See [The tenant defines the factory](/guide/concepts/tenant).

## Four ideas, and the reason for each

**Fixed steps.** An agent left to choose its own process can skip testing or loop all night. You describe the work as a short file of steps. The agent follows it and cannot change it. See [Work graphs](/guide/concepts/workflows).

**Checked by code.** Code, not the agent, runs each check and writes the record. The same work always gets the same verdict, so an agent cannot talk its way to a pass. See [Why you can trust a run](/guide/concepts/trust).

**Off limits.** The easiest way to pass a test is to change the test, so tests, instructions and check settings are off limits to the agent. See [What an agent cannot change](/guide/concepts/protection).

**Stops and asks.** Some decisions are yours. The run stops where you chose, says why, and records your approval against the exact plan you saw. There are normally two decisions: approve the plan, then review the result. If a loop runs out of attempts, it can hand over to a person at a step you name.

## Who it is for

You run coding-agent CLIs on your own repositories and want the work to finish while you are away. Daggry fits work that lives in a repository and has a check a script can run. A pull request from an issue is the first workload. For others, see [Workflow patterns](/guide/how-to/workflow-patterns).

You can only leave work alone if you do not need to trust whoever is doing it. Daggry never takes the agent's word.

## Where to go next

1. To see the parts and what connects them, read [The modules](/guide/concepts/modules) and [Open standards](/guide/concepts/standards).
2. To check the record yourself, read [Why you can trust a run](/guide/concepts/trust).
3. To run a workflow, follow [Getting started](/guide/getting-started).
4. To look up a field, command or term, open the [Reference](/reference/).
