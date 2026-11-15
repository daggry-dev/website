# How Daggry works

An agent can do a night's work, but its own report is the only proof. Daggry runs the work as fixed steps, has code re-check each step, and keeps a signed record you can verify yourself.

Daggry is Danish for dawn. You start the work, go to sleep, and at first light it is done and checked.

## One night

**22:00.** You write an issue. An agent drafts a plan from it, and you approve the plan before bed.

**Overnight.** Each job runs in its own throwaway pod (a container that exists for one job). It holds a token for one repository and never the signing key. The agent takes the plan one item at a time. It writes a test, Daggry shows that the test fails, the agent makes it pass, and Daggry runs it again on a clean copy of the code. If a machine dies at 3 a.m., a new pod starts from the last commit Daggry sealed and repeats the interrupted step.

**06:30.** The pull request is open, with the record of each check that passed beside it. A run that needed you stopped and says why. Reviewing the pull request is normally your second decision.

<MorningTrail />

The trail shows one night in four entries: the plan you approved, the test that failed first, the same test passing, and the pull request opening. Each entry is checked by code and signed.

## Four ideas, and why each exists

**Fixed steps.** An agent left to choose its own process can skip testing or loop all night. You describe the work as a short file of steps. The agent follows it and cannot change it. See [Work graphs](/guide/concepts/workflows).

**Checked by code.** Code, not the agent, runs each check and writes the record. The same work always gets the same verdict, so an agent cannot talk its way to a pass. See [Why you can trust a run](/guide/concepts/trust).

**Off limits.** The easiest way to pass a test is to change the test, so tests, instructions and check settings are off limits to the agent. See [What an agent cannot change](/guide/concepts/protection).

**Stops and asks.** Some decisions are yours. The run stops where you chose, says why, and records your approval against the exact plan you saw. There are normally two decisions: approve the plan, then review the result. If a loop runs out of attempts, it can hand over to a person at a step you name.

## Who it is for

You run coding-agent CLIs on your own repositories and want the work to finish while you are away. Daggry fits work that lives in a repository and has a check a script can run. A pull request from an issue is the first example. For others, see [Workflow patterns](/guide/how-to/workflow-patterns).

You can only leave work alone if you do not need to trust whoever is doing it. Daggry never takes the agent's word.

## Where to go next

1. To check the record yourself, read [Why you can trust a run](/guide/concepts/trust).
2. To run a workflow, follow [Getting started](/guide/getting-started).
3. To look up a field, command or term, open the [Reference](/reference/).

For what exists today and what comes next, see the [Roadmap](/roadmap).
