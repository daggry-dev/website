# Why use it

When an agent works unattended, you get its own report in the morning and nothing else.
Daggry replaces the report with results that code checked and signed, so you do not have to trust the agent.
Read this page if you are deciding whether Daggry is worth setting up.

## The problem

An agent can say "Done, all tests pass" whether or not the tests pass. You then have two choices: trust the report, or redo the work to find out.

<Compare />

With Daggry, the agent's report counts for nothing. Code runs the validators again on a clean copy of the project's files, writes down the result and seals it. To seal a result is to check it with code, then sign it so that a later change shows.

## What you get

You get four things you can act on.

- **You can leave the work alone.** A run follows the steps you wrote. A loop has a limit, so an agent cannot run all night on one item.
- **You decide only where it matters.** The run stops at the approvals you chose and says why. Normally that is twice: you approve the plan, then you review the result.
- **A pass means the same thing every time.** A validator is code, so the same work gets the same result. An agent cannot talk its way to a pass, and it cannot change its validators, its instructions or its limits.
- **You can prove what happened.** Every result is signed and linked to the one before it. Run `daggry verify` on your own machine, and a record that anyone changed shows up.

A run also survives a failure. If a machine dies in the night, a new runner starts from the last sealed change and repeats the interrupted step.

## What it does not prove

Know the limits before you rely on the evidence trail.

- **A seal is not a quality stamp.** A seal proves that the validator ran and that the record is unchanged. It does not prove that you chose the right validators. A result is only as good as the validator behind it.
- **A changed record shows; it is not prevented.** The trail is tamper-evident, not tamper-proof.
- **Records removed from the end need a second copy to show.** They show only against a signed copy of the trail's last link that is kept outside the cluster.

For the full account, see [Why you can trust a run](/guide/concepts/trust).

Next: [What it does](/guide/features)
