# What you can use it for

You have work an agent could do, but you cannot tell from its report whether the work is right.
If a script can check the result, Daggry can run the work, and this page lists nine examples you can copy.
Read it to decide whether your work fits. Skip it if you already have a workflow in mind.

## Work that fits

Daggry fits you if your work lives in files and a script can check it. Three things make a piece of work a good fit:

- **It lives in a project.** The work changes files that are kept under version control: code, documents, data, configuration.
- **A script can say pass or fail.** A test suite, a link checker, a row count, a list of required sections. The script is your validator.
- **You know where you want to decide.** Most work needs you twice: to approve the plan, and to review the result.

Software is the first kind of work Daggry is set up for. There, the work item is an issue and the result is a pull request. The first two examples in the table work the same way for documents and data.

## Nine examples

Each example is a complete workflow file. Pick the one closest to your work, copy it and change the steps.

| Example | Use it when | What you get |
|---|---|---|
| [Review a document](/guide/how-to/workflow-patterns#review-a-document) | A contract, a policy or a specification must meet a list of review rules. | A revised document that passes every rule, ready for a person to read. |
| [Refresh and publish data](/guide/how-to/workflow-patterns#refresh-and-publish-data) | A dataset is rebuilt from its sources again and again. | A checked new version, published only after you approve. No agent is needed. |
| [Ship a change from an issue](/guide/how-to/workflow-patterns#ship-a-change-from-an-issue) | You want an issue turned into a pull request, with tests written first. | A pull request where each test failed first, then passed. |
| [Write a sourced report](/guide/how-to/workflow-patterns#write-a-sourced-report) | The result is a document and every statement needs a source. | A report whose sources exist and whose links resolve. |
| [Process a list of items](/guide/how-to/workflow-patterns#process-a-list-of-items) | You work through a list one item at a time, such as a backlog. | One checked note for each item. |
| [Migrate files in batches](/guide/how-to/workflow-patterns#migrate-files-in-batches) | A large mechanical change must land in small pieces. | Each batch built and tested before the next one starts. |
| [Update documentation](/guide/how-to/workflow-patterns#update-documentation) | Wording matters more than structure. | A draft with working links and the required headings, which you read before it is delivered. |
| [Run a release check](/guide/how-to/workflow-patterns#run-a-release-check) | You prepare a release. | A build that passed, drafted release notes and your approval on record. |
| [Audit and report](/guide/how-to/workflow-patterns#audit-and-report) | You scan dependencies or configuration and want the findings written up. | A report in a fixed format, for you to review. |

The examples combine. You can put a step from one in front of another.

## Work that does not fit

Daggry checks what a script can check. It does not fit these cases:

- **Only a person can say whether the result is good.** A script cannot decide whether a logo looks right or a strategy is sound. Daggry can still stop for your approval, but it cannot check the work for you.
- **The work does not live in files.** A run works on a project's files and delivers its result from them.
- **The validator is weak.** A run that passes proves that your script passed. If the script checks little, the pass means little.

Next: [Why use it](/guide/why)
