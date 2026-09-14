# 21 — `ubml next`

> **Status**: Proposed
> **Depends on**: Plan 04 (semantic validation), the `walk` command
> **Effort**: Small — one command, no schema change
> **References**: `src/cli/commands/walk.ts`

---

## Goal

Answer one question at model scope: **what is outstanding, and who owes the
next move.**

`walk next` hands over one claim to review, which works and does not change.
What is missing is the view above it: how much is unreviewed, what is waiting
on somebody the review cannot ask, and which of those is worth putting in front
of people.

Without it that answer is assembled by hand before every session, differently
each time, and only by whoever assembled it last.

---

## What outstanding means

| State | Who moves | What they do |
|---|---|---|
| insight `status: proposed` | the modeller | walk it |
| element `reviewStatus: proposed` | the modeller | accept or reject the modelling |
| insight `status: deferred` | someone outside the review | answer it |

*Outside the review* is deliberately not *the customer*. A consultancy's
outside is a client; an internal team's is another department, a regulator, or
somebody on leave.

The first two gate the third. A workspace with unwalked claims cannot show a
trustworthy list of open questions, because the unwalked ones may hold more. So
`next` reports the backlog and marks the rest incomplete until it clears.

---

## One undecided thing, one item

Claims joined by `related` are printed once, named by the claim the others hang
off. Tested against a workspace of twenty-two open claims this gave nine groups
rather than one blob.

Named by a claim, not a tag: tags describe a subject, several open things share
one, and the collisions land exactly where it matters — four groups all called
`orders` tells a reader nothing.

---

## Scope

```
ubml next [tag...] [--with <name>]
```

Tags are a union: in scope if it carries any of them. Several tags is the
normal case once a workspace holds more than one capability, and a session
covering two of them should not need two runs stitched together.

Tags are a label rather than a true scope — a claim another capability depends
on appears only if somebody tagged it for both. Accepted deliberately; a
workspace holding one capability cannot show whether tags hold. When they
visibly fail, resolve scope through `derivedFrom` and `related` instead.

---

## Who has to move

Recorded, never inferred. `custom.answeredBy` carries it — an actor id where
the person is modelled, their name where they are not.

Inference from a source's participants was tried against a real workspace and
fails in both directions. Ten of twenty-two deferred claims came from sessions
with one person present, so the heuristic says *go and ask yourself*; nine more
came from a call with seven people, so it names the whole cast. The claims that
most need an audience are the ones whose audience was not in the room, which is
what `deferred` means.

So unassigned is shown loudly rather than guessed at, and the gap gets filled
because it is visible.

---

## Where competing designs live

A claim that is really a choice between two coherent designs says so, and names
the branch each design is worked out on:

```yaml
IN00042:
  kind: decision
  status: deferred
  notes: >-
    Two answers, each worked out on its own branch:
    option-a, option-b. Both branch off the base, so
    a diff between them is the comparison.
```

The base branch carries neither. A base branch that holds one answer is wrong
whenever the other is chosen, so the elements say only what holds either way
and point at the claim.

### A decisions document type was considered and dropped

An earlier draft gave decisions their own document type, ID prefix, schema and
validation rules: at most one selected option, a decided option recording the
commit it was decided at, and so on.

Dropped as disproportionate. What it adds over a deferred claim is *which
option was chosen and at which commit*, in a form something other than a person
can read, and that earns its keep only once decisions recur. The first real
workspace had one.

The reasoning is kept here so it can come back when a second and third arrive,
rather than being reinvented from scratch.

---

## Output

One default shape, few flags. `git status` is the model to follow: it survived
because it answers one question the same way every time.

```
fulfilment, billing — 0 unreviewed · 4 open

  Whether a late delivery is invoiced at the old price or the new
    one.
    AC00004 · 3 more claims

  Who approves a refund above the usual limit.
    unassigned
```

Ordered by weight: group size first, unassigned before assigned at equal size.
An unordered list is one nobody reads past the first screen.

---

## Not in scope

- **Reading git.** A branch named in a note is a pointer for a person to
  follow. A workspace outside a repository still works and simply has nowhere
  to point.
- **Due dates and priority.** Nothing in the model carries either, and
  inventing them turns a reading of the model into a planning tool.
- **What changed since last time.** A real need and a different command: that
  reads history, this reads state.
- **Writing anything back.** `next` reads; `walk set` writes.

---

## Verification

- A workspace with unwalked claims marks the open list incomplete
- Claims joined by `related` appear once, under the claim the others hang off
- Several tags return the union; a claim carrying two appears once
- A group with no `answeredBy` reads as unassigned rather than being attributed
  to whoever happened to be in the room
- Output is ordered by weight, and the same workspace produces the same order
  twice
