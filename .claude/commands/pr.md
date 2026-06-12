Create a Pull Request from the current branch to `boostcampwm-2024:develop`.

> Upstream repository: https://github.com/boostcampwm-2024/web05-Denamu

---

## Step 1: Gather Information

Run these commands:

```bash
git branch --show-current
git log upstream/develop..HEAD --oneline
git diff upstream/develop..HEAD --stat
gh issue list -R boostcampwm-2024/web05-Denamu --state open --json number,title,labels --limit 50
```

## Step 2: Determine PR Metadata

**Title Prefix** — pick the best fit from `.cz-config.js`:

- `✨ feat` — new feature
- `🐛 fix` — bug fix
- `♻️ refactor` — structural/architectural change
- `⚡️ perf` — performance improvement
- `💄 style` — style changes
- `📝 docs` — documentation only
- `✅ test` — test code
- `📦 chore` — config / environment setup
- `🧼 clean` — minor code cleanup

**Label** — pick one:

- `✨ Feature` — feature implementation
- `👹 BugFix` — bug fix
- `🔧 Chore` — config / environment setup
- `🧹 Cleanup` — minor code cleanup
- `🔨 Refactor` — structural/architectural change
- `📝 Docs` — documentation (swagger, storybook)
- `✅ Test` — test related
- `⚡ Performance` — performance improvement

**Related Issues** — match the changes to open issues in `boostcampwm-2024/web05-Denamu`.

- If the issue is **fully resolved** by this PR → `close #N`
- If the issue is **only partially addressed** → `#N` (mention only)

## Step 3: Write PR Body

Read `.github/pull_request_template.md` and use it as the template structure.

## Step 4: Create the PR

```bash
BRANCH=$(git branch --show-current)
GH_USER=$(gh api user --jq '.login')
gh pr create \
  --repo boostcampwm-2024/web05-Denamu \
  --base develop \
  --head $GH_USER:$BRANCH \
  --title "[PREFIX] [concise title]" \
  --label "[selected label]" \
  --body "$(cat <<'EOF'
[PR body here]
EOF
)"
```

If there are multiple closed issues, repeat Steps 5-1 and 5-2 for each one.
