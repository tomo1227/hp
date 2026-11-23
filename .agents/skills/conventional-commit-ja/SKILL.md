---
name: conventional-commit-ja
description: 'このリポジトリで日本語の Conventional Commits 形式のコミットメッセージを作成・レビューする。コミット文の提案、コミットの作成、scope の確認に使う。'
---

# このリポジトリの日本語 Conventional Commits

1. `git status --short` と `git diff --cached` で、コミット予定の変更を確認する。未ステージの変更は `git diff` で確認し、コミットの対象と混同しない。
2. コミットメッセージは `<type>(<scope>): <日本語の要約>` の1行だけにする。本文やフッターは付けない。破壊的変更は `<type>(<scope>)!: <日本語の要約>` で示す。
3. `type` は変更の目的に合うものを選ぶ（`feat`、`fix`、`docs`、`style`、`refactor`、`perf`、`test`、`build`、`ci`、`chore`、`revert`）。`scope` は必須とし、主な変更対象を示す短い英小文字の名前（`apm`、`auth`、`gallery` など）を入れる。複数領域にまたがる場合は変更全体の目的を表す scope を選ぶ。括弧の省略や空の `()` は認めない。
4. 要約は「何を変えたか」が分かる簡潔な日本語にする。
5. メッセージの提案・レビューだけを頼まれた場合は、ステージングもコミットも行わない。

有効な例：

- `fix(auth): ログイン後の遷移先を修正`
- `chore(apm): 日本語のコミットスキルを追加`
- `feat(gallery)!: ギャラリーの公開URLを変更`

無効な例：`fix: ログインを修正`（scope なし）、`fix(): ログインを修正`（空の scope）、`fix(auth): fix login`（要約が日本語ではない）。
