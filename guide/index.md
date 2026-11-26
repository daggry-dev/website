# What is Daggry?

An agent can do a night's work, but its own report is the only proof.
Daggry runs the work as fixed steps, has code check each step, and signs every result into an evidence trail you can verify yourself.
Read this page if you want agents to work while you are away and need to know that the result holds.

Daggry is a factory kit: modules you set up as your own factory, where agents do the work and code checks it. Daggry is Danish for dawn. You start the work and go to sleep. At first light the work is done and checked, or the run has stopped and says why.

## One night with Daggry

Here is what a night of unattended work looks like. The example is software, where the work item is an issue and the result is a pull request.

**22:00.** You write an issue. An agent drafts a plan from it: a list of criteria. You approve the plan before bed.

**Overnight.** Each job runs in its own throwaway runner, which never holds the signing key. The agent works through the plan. It writes a test for each criterion, Daggry shows that the tests fail, the agent makes them pass, and Daggry runs the test again on a clean copy of the repository. If a machine dies at 3 a.m., a new runner starts from the last sealed change and repeats the interrupted step.

**06:30.** The pull request is open, with the evidence trail beside it. A run that needed you stopped and says why.

## What you find in the morning

You do not read a report in the morning. You read a trail of records that code checked and signed, each linked to the one before.

<MorningTrail />

The example shows the trail of one night, record by record. Each record answers one question, and the list names the four.

- **Who did it.** A record of an agent's step names the persona that did the work and the digest of the instructions it worked under. A persona is a named agent your team defines once.
- **What changed.** A change record holds the version of the workspace the step produced and the paths it changed.
- **What proves it.** A measurement holds what a validator reported on a clean copy. A verdict holds the pass or fail that a judge decided from it.
- **What you approved.** Your approval is bound to the digest of the exact plan you read, so nobody can move it to another plan.

A digest is a short code computed from every byte of a record. Change one byte, and `daggry verify` shows where. For how that works and what it does not prove, see [Why you can trust a run](/guide/concepts/trust).

## A factory kit

You are not buying one fixed machine: you set up the modules as your own factory.

- **The work is a file.** The plan, the test that fails first, the approval and the pull request are steps in a workflow, a file you can read and change. Another workflow describes other work: a report, a review, a data refresh, an audit.
- **The rules are files too.** Which personas work, how many jobs run at a time and where a person must approve are settings you write.
- **You can replace a module.** Daggry is built from seven modules, each with one job. You can replace any of them, including the engine an agent runs on.

Software is the first kind of work, not the only one. Daggry works for any work a script can check.

## Who it is for

Daggry fits you if your work lives in files and a script can check it. You put agents on work of your own, and you want it to finish while you are away.

You stay in the loop where it matters: you approve the plan, and you review the result. In between, you do not have to trust whoever does the work, because Daggry never takes the agent's word.

Next: [What you can use it for](/guide/use-cases)
