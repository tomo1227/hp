---
name: conventional-commit-ja
description: '英語版の conventional-commit をベースに、このリポジトリの日本語・scope 必須・1行ルールでコミットメッセージを作成・レビューする。'
---

# このリポジトリの日本語 Conventional Commits

まず [英語版の `conventional-commit`](../conventional-commit/SKILL.md) を読み、変更の確認手順や `type` の選択など、以下と矛盾しない部分に従う。英語版の例や検証ルールと矛盾する場合は、以下の独自ルールを優先する。

- コミットメッセージは `type(scope): 日本語の要約` の1行だけにする。本文やフッター、XMLタグは出力しない。破壊的変更は `type(scope)!: 日本語の要約` で示す。
- `scope` は省略せず、主な変更対象を示す短い英小文字の名前（`apm`、`auth`、`gallery` など）を入れる。空の `()` は認めない。
- 要約は「何を変えたか」が分かる簡潔な日本語にする。
- メッセージの提案・レビューだけを頼まれた場合は、英語版の自動コミット手順を実行しない。ステージングも行わない。

有効な例：

- `fix(auth): ログイン後の遷移先を修正`
- `chore(apm): 日本語のコミットスキルを追加`
- `feat(gallery)!: ギャラリーの公開URLを変更`

無効な例：`fix: ログインを修正`（scope なし）、`fix(): ログインを修正`（空の scope）、`fix(auth): fix login`（要約が日本語ではない）。
