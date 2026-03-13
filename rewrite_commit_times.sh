#!/usr/bin/env bash
# =============================================================================
# rewrite_commit_times.sh  (v2 – fixes octal-hour and awk-quoting bugs)
#
# Rewrites AuthorDate & CommitDate of all commits on `main` whose KST time
# falls in the 09:00–18:59 window to a randomised time ≥ 20:00:00 KST on
# the same calendar date.
#
# Usage:
#   cd ~/Documents/dotenv-space-cli
#   chmod +x rewrite_commit_times.sh
#   bash rewrite_commit_times.sh
#
# After it completes, force-push with:
#   git push --force origin main
# =============================================================================

set -euo pipefail

REPO_DIR="${1:-$(pwd)}"
MAPPING_FILE="/tmp/git_date_mapping_$$.txt"
TIMEZONE="Asia/Seoul"
WORK_START=9   # inclusive  (KST hour)
WORK_END=19    # exclusive  (KST hour, i.e. up to 18:59:59)
AFTER_HOUR=20  # randomise in [20, 23]

# ── helpers ──────────────────────────────────────────────────────────────────

kst_hour() {
    TZ="$TIMEZONE" date -d "@$1" +"%H" 2>/dev/null \
        || TZ="$TIMEZONE" date -r  "$1" +"%H"   # macOS fallback
}

random_evening_timestamp() {
    # $1 = original unix timestamp
    # Returns a new unix timestamp on the same KST calendar date, after 20:00
    local orig_ts="$1"
    local date_kst
    date_kst=$(TZ="$TIMEZONE" date -d "@$orig_ts" +"%Y-%m-%d" 2>/dev/null \
               || TZ="$TIMEZONE" date -r "$orig_ts" +"%Y-%m-%d")

    local rh rm rs
    rh=$(( AFTER_HOUR + RANDOM % (24 - AFTER_HOUR) ))   # [20..23]
    rm=$(( RANDOM % 60 ))
    rs=$(( RANDOM % 60 ))

    local new_str
    new_str=$(printf "%s %02d:%02d:%02d +0900" "$date_kst" "$rh" "$rm" "$rs")

    # Convert back to unix timestamp
    TZ="$TIMEZONE" date -d "$new_str" +"%s" 2>/dev/null \
        || TZ="$TIMEZONE" date -j -f "%Y-%m-%d %H:%M:%S %z" \
               "${date_kst} $(printf '%02d:%02d:%02d' $rh $rm $rs) +0900" +"%s"
}

format_git_date() {
    # $1 = unix timestamp  →  "Thu, 01 Jan 2025 20:34:12 +0900"
    TZ="$TIMEZONE" date -d "@$1" +"%a, %d %b %Y %H:%M:%S %z" 2>/dev/null \
        || TZ="$TIMEZONE" date -r  "$1" +"%a, %d %b %Y %H:%M:%S %z"
}

# ── main ─────────────────────────────────────────────────────────────────────

cd "$REPO_DIR"

echo "==> Repository : $REPO_DIR"
echo "==> Scanning commits on branch: main"
echo ""

# Build mapping: <hash> <new_unix_ts>
rm -f "$MAPPING_FILE"
REWRITE_COUNT=0

while IFS= read -r hash; do
    author_ts=$(git log -1 --format="%at" "$hash")
    hour=$(kst_hour "$author_ts")

    # FIX 1: force decimal — prevents bash treating "09" as octal
    hour=$(( 10#$hour ))

    if (( hour >= WORK_START && hour < WORK_END )); then
        new_ts=$(random_evening_timestamp "$author_ts")
        echo "$hash $new_ts" >> "$MAPPING_FILE"

        old_fmt=$(TZ="$TIMEZONE" date -d "@$author_ts" +"%Y-%m-%d %H:%M:%S %Z" 2>/dev/null \
                  || TZ="$TIMEZONE" date -r "$author_ts" +"%Y-%m-%d %H:%M:%S %Z")
        new_fmt=$(TZ="$TIMEZONE" date -d "@$new_ts"     +"%Y-%m-%d %H:%M:%S %Z" 2>/dev/null \
                  || TZ="$TIMEZONE" date -r "$new_ts"     +"%Y-%m-%d %H:%M:%S %Z")

        echo "  [REWRITE] $hash  $old_fmt  →  $new_fmt"
        (( REWRITE_COUNT++ )) || true
    fi
done < <(git log --format="%H" main)

echo ""
if [[ $REWRITE_COUNT -eq 0 ]]; then
    echo "No commits found in the work-hours window (${WORK_START}:00–${WORK_END}:00 KST). Nothing to do."
    rm -f "$MAPPING_FILE"
    exit 0
fi

echo "==> $REWRITE_COUNT commit(s) will be rewritten. Proceeding with filter-branch …"
echo ""

# Export the mapping file path so the env-filter subshell can see it
export _MAPPING_FILE="$MAPPING_FILE"

# FIX 2: awk '$1==h' inside single-quotes expands $1/$2 as empty shell
# positional params before awk sees them → syntax error. Use grep+cut instead.
FILTER_BRANCH_SQUELCH_WARNING=1 \
git filter-branch -f --env-filter '
    NEW_TS=$(grep -m1 "^${GIT_COMMIT} " "$_MAPPING_FILE" | cut -d" " -f2)

    if [ -n "$NEW_TS" ]; then
        NEW_DATE=$(TZ="Asia/Seoul" date -d "@${NEW_TS}" +"%a, %d %b %Y %H:%M:%S %z" \
                   2>/dev/null || \
                   TZ="Asia/Seoul" date -r "${NEW_TS}" +"%a, %d %b %Y %H:%M:%S %z")
        export GIT_AUTHOR_DATE="$NEW_DATE"
        export GIT_COMMITTER_DATE="$NEW_DATE"
    fi
' -- main

rm -f "$MAPPING_FILE"

echo ""
echo "==> History rewrite complete."
echo ""
echo "Verify (all flagged commits should now show evening times):"
git log --format="%H  %ai  %s" main | head -20
echo ""
echo "==> When you are happy, force-push with:"
echo "    git push --force origin main"
echo ""
echo "    Or, if you want to preserve the old refs as a backup first:"
echo "    git push --force-with-lease origin main"
