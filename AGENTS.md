# リポジトリのルール

コミットメッセージを作成・レビューするときは、[英語版の `conventional-commit`](.agents/skills/conventional-commit/SKILL.md) をベースにし、矛盾する場合だけ [このリポジトリの独自ルール](.agents/skills/conventional-commit-ja/SKILL.md) を優先する。スキルを直接呼び出せない場合はリンク先を読む。

コミットメッセージは `type(scope): 日本語の要約` の1行だけとし、本文やフッターは付けない。空でない `scope` を必須とし、破壊的変更の場合は `type(scope)!: 日本語の要約` とする。
