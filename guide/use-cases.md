# What you can use it for

You have work an agent could do, but you cannot tell from its report whether the work is right.
If a script can check the result, Daggry can run the work, and this page lists nine examples you can copy.
Read it to decide whether your work fits. Skip it if you already have a workflow in mind.

## Work that fits

Daggry fits you if your work lives in files and a script can check it. Three things make a piece of work a good fit:

- **It lives in a project.** The work changes files that are kept under version control: code, documents, data, configuration.
- **A script can say pass or fail.** A test suite, a link checker, a row count, a list of required sections. The script is your validator.
- **You know where you want to decide.** Most work needs you twice: to approve the plan, and to review the result.

Software is the first kind of work Daggry is set up for. There, the work item is an issue and the result is a pull request. The first two examples work the same way for documents and data.

## Nine examples

Each example is a complete workflow file. Pick the one closest to your work, copy it and change the steps.

<ExampleGallery />

The examples combine. You can put a step from one in front of another.

## Work that does not fit

Daggry checks what a script can check. It does not fit these cases:

- **Only a person can say whether the result is good.** A script cannot decide whether a logo looks right or a strategy is sound. Daggry can still stop for your approval, but it cannot check the work for you.
- **The work does not live in files.** A run works on a project's files and delivers its result from them.
- **The validator is weak.** A run that passes proves that your script passed. If the script checks little, the pass means little.

Next: [Why use it](/guide/why)
