# What it does

An agent left alone can skip a step, pass itself or loop all night.
Daggry has seven features. Each one removes one of those problems and adds something to the evidence trail.
Read this page to learn the seven names; the rest of the site uses them.

## The seven features

Each feature removes one problem. The sections name the feature, say what it does and say what it leaves in the trail.

<FeatureGrid />

### 1. Workflows

You describe the work as a file of fixed steps. The agent follows the file and cannot change it. The trail pins the digest of the workflow when the run starts, so you know which file the run followed.

Read more: [Write a workflow](/guide/how-to/write-a-workflow)

### 2. Personas

A persona is a named agent your team defines once, with its engine and its instructions. A workflow step names a persona and holds no instructions of its own. The trail records the persona and the digest of its instructions on every record of an agent's step.

Read more: [Set up a tenant](/guide/how-to/set-up-a-tenant)

### 3. Validators

Code checks every step; an agent never checks its own work. A validator is a command you declare: it measures the work, and a judge decides pass or fail. The trail holds one measurement for each validator and one verdict for each judge.

Read more: [Add a validator](/guide/how-to/add-a-validator)

### 4. Approvals

The run stops where you chose and waits for you. The trail holds your approval, bound to the digest of the exact plan or change you saw.

Read more: [Write a workflow](/guide/how-to/write-a-workflow)

### 5. Protected paths

An agent cannot change its validators, its instructions or its limits. If a step changes a protected path, Daggry restores the file and the step fails. The trail records each restored path.

Read more: [What an agent cannot change](/guide/concepts/protection)

### 6. Evidence trail

Every result is a signed record, linked to the one before it. One command, `daggry verify`, checks the whole trail again on your own machine.

Read more: [Why you can trust a run](/guide/concepts/trust)

### 7. Isolated runners

Each job runs in a throwaway runner that holds a token for one project's workspace. The signing key never enters a runner, so no agent can write a record into the trail.

Read more: [The modules and where they run](/guide/concepts/modules)

Next: [Run your first workflow](/guide/getting-started)
