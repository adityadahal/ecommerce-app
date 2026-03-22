---
name: git-push
description: Stage all changes, commit with a message, and push to GitHub. Use when the user wants to save and push their work.
argument-hint: [optional commit message]
disable-model-invocation: true
allowed-tools: Bash, Read, Glob, Grep
---

Stage all changes, create a commit, and push to the remote repository.

## Instructions

1. Run `git status` to see all changes. Never use `-uall` flag.

2. Run `git diff` to understand what changed. Run `git log --oneline -5` to see recent commit style.

3. Stage files using specific file names: `git add file1.ts file2.tsx`. Do NOT use `git add -A` or `git add .`. Never stage `.env` files or secret files.

4. Analyze the diff and create a commit message.

   Use this format: `<type>: <short description>`

   Types:
   - `feat:` for new features, pages, components, API routes
   - `fix:` for bug fixes

   Rules for the description:
   - Max 72 characters, lowercase, no period at end
   - Describe WHAT was done not HOW
   - If multiple things changed, summarize the main change

   If `$ARGUMENTS` is provided, use it as the description but still add the correct type prefix.

   Use this exact HEREDOC pattern to commit (replace the message with your generated one):

   git commit -m "feat: your message here"

5. Push to remote:
   - Check remote exists: `git remote -v`
   - If remote exists: `git push origin HEAD`
   - If no remote, tell the user to add one: `git remote add origin https://github.com/USERNAME/REPO.git`

6. Report what was committed and pushed. Show commit hash and branch name.

## Rules

- NEVER force push (--force, -f)
- NEVER skip hooks (--no-verify)
- NEVER commit .env, credentials, or secret files
- NEVER use git add -A or git add .
- If commit fails, fix the issue and create a NEW commit — do NOT use --amend
- If push fails because remote is ahead, tell the user to pull first
