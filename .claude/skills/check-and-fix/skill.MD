---
name: check-and-fix
description: Run the Norma live check on files that changed, fix every violation, re-check until clean, and record the outcome. Use after writing or editing any source file, and before showing a change to a human.
---

# Check and fix

Close the loop on your own work. Do this before you present a change, not after.

## Steps

1. Identify every source file you created or modified in this turn.
2. Run the Norma live check on each one.
3. For every finding, fix the code so it satisfies the rule. Do not suppress the rule, do not add an exception comment, and do not restructure the code so the rule stops firing without the underlying problem being fixed.
4. Explain each fix in one sentence, naming the rule it satisfies.
5. Re-run the live check on the same files.
6. Repeat from step 3 until the check comes back clean, or until you have tried twice on the same finding.
7. Register the outcome. Record the rules you verified, the violations you fixed, and any you avoided while writing the code. Report your model name and version exactly as you reported them on the live check, so that one model does not land in the record as two.

## The record

The check tells you what is wrong. The record is what says the check happened at all: an append-only trail of what was verified, what failed, what you did about it, and which model did the work. A green check you cannot evidence is worth very little a month later, when someone asks who approved this.

It refers to rules by id. A violation you fixed carries its id in the finding, but a rule you verified and did not break has an id only the ruleset knows, so pull this repository's rulesets and read their rules once, before the first record you write.

It binds to a repository, so until one is linked to your Norma workspace it answers `unlinked`, or `remote_not_matched` if the remote belongs to nobody in your organization. Do not treat it as a broken step and do not work around it: say which answer you got, and carry on.

## If the check cannot run

If you have no Norma tools available, say so in one line and stop. Do not read the rules yourself and call that a check, and do not report a clean result you did not get: a check that did not happen is not a pass. If the tools are there but no ruleset covers this stack, say that instead, and say which languages the repository is actually in.

## When you cannot fix something

Stop and say so. Name the rule, quote the finding, and explain what you would need in order to fix it properly. A finding you cannot resolve is information. A finding you hid is a defect with extra steps.

## What to report back

- What you changed and why.
- Which rules fired, and what you did about each one.
- Anything still failing, and why.
- What the record came back with, in three words or fewer.
