# Comments and approvals

*Reference*

You work with a run where you already work: on the issue, then on the pull request. This page lists who Daggry listens to, how it reads a reply, what it posts and what starts and stops a run. Read it if you set up a project on GitHub or need to know exactly when a comment counts.

A comment is a claim until Daggry seals it. Daggry checks who wrote it, then seals it as an `input`, or as an `approval` bound to the digest of what was approved. The evidence trail therefore holds the whole conversation and shows which person said yes to which version.

<IssueThread />

The diagram shows a thread on an issue: a question from a persona, replies from a person, a comment made while an agent works, and an approval. Beside each comment it names the record Daggry seals.

## One thread for each run

A run has one conversation: the issue, then the pull request. You can say something at any time, not only when the run asks.

- **Everything a person says is kept.** Daggry seals each comment as an `input` when it arrives. The persona that works next reads it. A persona that is working reads it when its step ends.
- **A persona can ask.** It posts a question, the run waits, and the next reply continues the work.
- **A checkpoint asks for a yes.** A `human` step posts what it wants approved. An approver's yes continues the run. Any other reply from an approver sends the run back with that reply. What other people say is input the team reads when it next works. See [human](/reference/workflow-schema#human).
- **An edit to the issue is input too.** The objective that Daggry sealed at the start stays as it was.

## Who Daggry listens to

Anyone can comment on an issue, so Daggry sorts people into three groups. The table lists them.

| Who | Their comments | Can approve and start runs |
|---|---|---|
| An approver: a person on the `approvers` list of the [Tenant config](/reference/tenant-config#the-document) who can write to the repository | Sealed as input. | Yes. |
| Anyone else who can write to the repository | Sealed as input. | No. |
| Everyone else, and every bot, including Daggry's own GitHub App | Ignored. Sealed as nothing. | No. |

The list holds numeric GitHub ids, which do not change when someone renames an account. Daggry checks the write permission again for every comment. An agent's token is the App's token, so nothing an agent writes can approve.

## How Daggry reads a yes

An approval is unambiguous where it can be. The table lists the three ways an approver says yes.

| The approver | Daggry |
|---|---|
| Adds a thumbs-up to the request | Seals an `approval`. |
| Submits an approving review on the pull request | Seals an `approval`. |
| Writes a clear yes, such as "Looks good, go ahead" | Reads the words, seals an `approval` with the phrase it read, and replies with what it understood: "Read as approval of the plan." |

Reading words is the one place where a model decides what a person meant. It can only fail safe: when Daggry is not sure, it seals an `input` and asks again, and the run never continues on a guess. Every approval is bound to a digest. A yes that answers an older version is not applied, and Daggry replies with the current one.

A frozen test opens the same way. A persona that believes one is wrong asks and names the path, and an approver's yes opens that one path once. An approver can also say so unasked, by naming the path. See [Unfreeze grant](/reference/protected-paths#unfreeze-grant).

## What Daggry posts

Daggry keeps the thread readable. The table lists what it posts.

| When | The comment |
|---|---|
| A step ends | A short status line: the step, the persona and a link to the sealed records. |
| A persona asks, or a checkpoint is reached | The question, or what is to be approved. |
| A reviewer persona has findings | Review comments on the pull request, each on its line. They are sealed as input: advice for the developer persona and for you, never a verdict. |
| A pull request is opened | A description written from the plan and the trail: the criteria as a checklist, a link to the trail and `Closes #<n>`. |
| A run waits, ends, fails or stops | The state and the reason. |

Daggry never posts a credential, a secret, an environment value or a raw transcript of an agent's session. The comments are a convenience. A comment that someone edits or deletes later changes nothing that was sealed.

## Starting, waiting and stopping

The table lists the rules that keep runs from piling up or hanging.

| Rule | Detail |
|---|---|
| Who can start | A label starts a run only when an approver applied it. Otherwise Daggry says so in one comment and does nothing. |
| One run for each issue | While a run is active, applying the label again does nothing. |
| Continuing | When an approver applies the label again after a run stopped or failed, a new run continues from the last sealed change and links to the earlier trail. |
| Waiting | A run that waits for a person reminds the thread after 2 days and stops after 14 days. |
| Stopping | Removing the label, closing the issue or closing the pull request without a merge stops the run. A stopped run keeps its trail. |

::: warning Limits
Text on an issue or a pull request is untrusted input, and so is an edit by someone who is not an approver. Such text can mislead an agent, and Daggry does not solve that. An agent's runner can also reach the network. Three things limit the damage: only an approver can approve or start, only code decides whether work passes or merges, and no agent can change its validators or its instructions. See [What a seal does not prove](/guide/concepts/trust#what-a-seal-does-not-prove).
:::

## Next steps

The list names the pages to read next.

- For the checkpoint step, see [human](/reference/workflow-schema#human).
- For the approver list and triggers, see [Tenant config](/reference/tenant-config).
- For a full example, see [From a labelled issue to a merged pull request](/guide/how-to/issue-to-pr).
