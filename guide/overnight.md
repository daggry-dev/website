# Overnight

Daggry is Danish for dawn. You set the work in motion, go to sleep, and at first light the work is done and checked. This page tells that story in one evening and one morning, for readers who want the idea before the mechanics.

<Overnight />

## An evening and a morning

**22:00.** You write an issue. An agent drafts a plan from it, and you approve the plan before bed. That is the first of your two decisions.

**Overnight.** Daggry starts a pod for the job. The agent writes a test, the runner proves it fails, the agent makes it pass, and a fresh worktree measures the result. Code checks and seals each handover. If a runner is killed, another attempt takes over from the last sealed commit.

**06:30.** A pull request is open, and reviewing it is your second decision. Next to it is the trail that explains it: the plan, the red proofs, the measurements and the verdicts, chained and signed. A retro can then run on the finished run and open issues for what to improve.

## Why this works unattended

Unattended work needs you to not have to watch. Daggry earns that by never taking an agent's word for it.

- A step cannot move on until code has checked what it handed over.
- The agent cannot change the tests, configuration or instructions that judge it.
- A run that needs a person stops and waits, with a reason you can read, instead of guessing.
- Nothing is edited after the fact. If something looks wrong in the morning, `daggry verify` tells you whether the record is intact.

## Next steps

- To learn how a record becomes trustworthy, read [Sealed evidence](/guide/concepts/evidence).
- To learn how a run is shaped, read [Work graphs](/guide/concepts/workflows).
