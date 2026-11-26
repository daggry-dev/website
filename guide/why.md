# Why use it

When an agent works unattended, you get its own report in the morning and nothing else.
Daggry replaces the report with evidence: results that code checked and signed, in a trail you can verify.
Read this page if you are deciding whether Daggry is worth setting up.

## The problem

An agent can say "Done, all tests pass" whether or not the tests pass. That sentence is a claim. You then have two choices: trust the claim, or redo the work to find out.

<Compare />

The comparison shows the same work reported twice: once in the agent's own words, and once as a result that code checked and sealed. With Daggry, the agent's report counts for nothing. Code runs the validators again on a clean copy of the project's files, writes down the result and seals it. To seal a result is to check it with code, then sign it so that a later change shows.

## What you get

You get four things you can act on.

- **You can leave the work alone.** A run follows the steps you wrote. A loop has a limit, so an agent cannot run all night on work that will not pass. If a machine dies in the night, a new runner starts from the last sealed change.
- **You decide only where it matters.** The run stops at the approvals you chose and says why. Normally that is twice: you approve the plan, then you review the result. Each approval is sealed against the exact plan or change you saw.
- **A pass means the same thing every time.** A validator is code, so the same work gets the same result. An agent cannot talk its way to a pass, and it cannot change its validators, its instructions or its limits.
- **You can prove what happened.** Every result is a signed record, linked to the one before it. The trail shows which persona did each step, what changed and what code measured. Run `daggry verify` on your own machine, and a record that anyone changed shows up.

## What it does not prove

Know the limits before you rely on the evidence trail. A seal proves that code checked the work and that the record is unchanged; it does not prove that you chose the right validators. Daggry treats an agent as error-prone, not hostile: text in a work item can still mislead an agent, and Daggry records that risk and does not solve it.

For the full account, see [Why you can trust a run](/guide/concepts/trust).

Next: [What it does](/guide/features)
