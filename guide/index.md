# What is Daggry?

An agent can do a night's work, but its own report is the only proof.
Daggry runs the work as fixed steps, has code check each step, and keeps a signed evidence trail you can verify yourself.
Read this page if you want agents to work while you are away and need to know that the result holds.

Daggry is a factory kit: modules you set up as your own factory, where agents do the work and code checks it. Daggry is Danish for dawn. You start the work, go to sleep, and at first light it is done and checked.

## One night with Daggry

Here is what a night of unattended work looks like. The example is software, where the work item is an issue and the result is a pull request.

**22:00.** You write an issue. An agent drafts a plan from it, and you approve the plan before bed.

**Overnight.** Each job runs in its own throwaway runner, which never holds the signing key. The agent takes the plan one criterion at a time. It writes a test, Daggry shows that the test fails, the agent makes it pass, and Daggry runs the test again on a clean copy of the repository. If a machine dies at 3 a.m., a new runner starts from the last sealed change and repeats the interrupted step.

**06:30.** The pull request is open, with a record beside it of everything code checked. A run that needed you stopped and says why.

<MorningTrail />

## A factory kit

You are not buying one fixed machine: you set up the modules as your own factory.

- **The work is a file.** The plan, the test that fails first, the approval and the pull request are steps in a workflow, a file you can read and change. Another workflow describes other work: a report, a review, a data refresh, an audit.
- **The rules are files too.** Which agents work, how many jobs run at a time and where a person must approve are settings you write.
- **You can replace a module.** Daggry is built from seven modules, each with one job. You can replace any of them, including the engine an agent runs on.

Software is the first kind of work, not the only one. Daggry works for any kind of work a script can check.

## Who it is for

Daggry fits you if your work lives in files and a script can check it. You put agents on work of your own, and you want it to finish while you are away.

You can only leave work alone if you do not have to trust whoever does it. Daggry never takes the agent's word.

Next: [What you can use it for](/guide/use-cases)
