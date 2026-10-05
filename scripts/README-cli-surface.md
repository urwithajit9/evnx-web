# Keeping the docs honest about the CLI

Three checks, one input: **the CLI binary's own argument parser.**

```bash
pnpm cli:index          # 5.3 · regenerate the command → guide index
pnpm cli:index:check    #       … or fail if it is stale or mismatched
pnpm cli:check          # 5.4 · every `evnx …` in the guides resolves
pnpm cli:diff v0.9.0    # 5.5 · what a release changed, and which guides it touches
```

All three need a `--all-features` build of the CLI:

```bash
cd ../evnx && cargo build --release --all-features
```

⚠️ They **skip** when no binary is present rather than failing, so evnx-web
stays buildable by anyone who has not cloned the Rust repo. They **refuse** a
binary built without `cloud` — that surface has 18 commands instead of 80 and no
`auth`, `vault`, `cloud` or `org`, so every cloud guide would be reported as
documenting commands that do not exist.

---

## Why these exist

Five documentation errors of one shape, every one found by a hand sweep:

| | |
|---|---|
| `evnx vault rekey` | documented before it existed |
| "arriving in the next release" | stale the moment 0.7.0 shipped |
| `commands/auth` | missing four subcommands for a whole release |
| `cloud delete-version` | shipped with no row in its own table |
| `EVNX_COMMANDS` | omitted `spec` entirely |

Hand sweeps do not repeat. All five are *a second list of what the CLI does,
maintained by hand* — so none of these scripts keeps one.

---

## 5.3 · `cli:index`

Writes `packages/docs-content/src/command-index.json`: every top-level command,
its subcommands, and the guide that documents it. Rendered on
[`/cli`](https://docs.evnx.dev/cli) — the only place the docs admit that
`evnx vault share` exists, since it has no page of its own.

**It reports both directions of mismatch**, which is the part that earns its
place:

* a command with no guide → a warning, and the count is baked into the JSON so a
  new gap shows up in the diff
* a guide documenting a command that does not exist → a **failure**

⚠️ "No guide yet" is a warning, not an error, on purpose. A command can
legitimately ship before its guide — `evnx commands` did — and failing on it
would mean the only way to land a command is to land its guide in the same push,
across two repositories.

---

## 5.4 · `cli:check`

Every `evnx …` in the guides, resolved against the real command tree: the
command exists, the subcommand exists, the long flags exist.

### ⚠️ The hard part is precision, not coverage

Measured before it was written: a naive scan of all prose finds **396
"failures"**, and essentially all are English — *"evnx is"*, *"evnx does"*,
*"evnx never"*. A check that cries wolf 396 times is a check somebody turns off,
and then it catches nothing.

Each narrowing is a decision about what this does **not** cover:

| Narrowing | Consequence |
|---|---|
| Only shell-tagged fences and inline `` `code` `` | A command named only in prose is not checked |
| `#` comments stripped | This is where most remaining noise lived |
| Only the first segment of a pipeline | A wrong flag after a `\|` is not checked |
| Everything after a bare `--` ignored | `evnx cloud run -- npm run build --prod` passes `--prod` to **npm** |
| Placeholders (`<vault>`, `$VAR`, `…`) skipped | Not guessed at |
| Guides only, not the blog | See below |

### ⚠️ Guides only, and the baseline

Run across the blog, it found fourteen failures — **every one inside a
retraction**:

> Retracted: `evnx link aws`, `evnx pull`, `evnx run`, `evnx push KEY=value`
>
> Corrected September 2026: this policy listed `evnx audit` and
> `evnx onboarding`. Neither command exists.

Those posts are doing the right thing. A check that fails on a correction
teaches people to delete the correction.

The same is true inside the guides — all ten remaining hits are deliberate
mentions of a removed flag, in prose that says so. They live in
`cli-invocations-baseline.json`, **one entry each, with why**. Anything not
listed is a failure.

⚠️ The baseline is checked in the other direction too: an entry that no longer
occurs is reported, so it cannot quietly accumulate permissions for text
somebody removed.

`--all` includes the blog for a manual sweep, where a human can tell a
retraction from a mistake.

---

## 5.5 · `cli:diff <tag>`

Builds the CLI at a git tag in a **worktree** (never `git checkout` — you run
this while preparing a release, the worst moment to switch branches under
yourself), reads its surface, and diffs it against the current binary.

Reports commands added, removed and changed — including a changed one-line
description, because that is documentation too and a guide quoting the old one
is wrong in the way nobody notices.

Then it names the guides mentioning the affected commands.

⚠️ **Mentioning is not documenting.** Nothing declares which commands a
reference guide covers — that is 5.2, which has not been built — so the guide
list is a **shortlist to review**, not a list of files that are wrong.

### ⚠️ It cannot run yet

The emitter landed **after** v0.9.0 was tagged, so no released version has it —
0.10.0 is the first. The first useful comparison is therefore 0.10.0 → 0.11.0,
and until then the script fails with a message saying exactly that.

It is shipped now because the alternative is writing it during a release, which
is when nobody wants to be debugging a build script.

### What it is for

37 guides sat on a `0.2.x` badge through four releases. A bulk find-and-replace
was rejected, correctly: the badge would then claim each guide had been checked
when nothing had been. This produces the other half — the guides a release
actually affects, so the badge is raised on those and honestly left alone on the
rest.

---

## In CI

```bash
pnpm cli:index:check && pnpm cli:check
```

⚠️ Both need the CLI binary, so they belong in a job that checks out both repos —
or they skip, which is the default and is safe.
