# hp

[![CI](https://github.com/tomo1227/hp/actions/workflows/ci.yml/badge.svg)](https://github.com/tomo1227/hp/actions/workflows/ci.yml) [![CodeQL](https://github.com/tomo1227/hp/actions/workflows/code_ql.yml/badge.svg)](https://github.com/tomo1227/hp/actions/workflows/code_ql.yml)
 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  

HPのブランチ

# Usage

```sh
cd projects
pnpm run dev
```

## APM policy

[apm-policy.yml](apm-policy.yml) に APM のインストールポリシーを定義しています。
依存パッケージのバージョン固定、許可元、マニフェストの必須項目を検査します。
原則拒否とし、依存パッケージは GitHub の Microsoft (`github.com/microsoft/**`)、
Anthropic (`github.com/anthropics/**`)、GitHub (`github.com/github/**`) の3組織のみ許可します。
`dependencies.deny` は空リストとし、allowlist に一致しない依存を拒否します
（`deny: ["*"]` は allow より優先され、許可した org も拒否してしまうため使用しません）。
MCP（インライン定義を含む）、マーケットプレイス、依存パッケージの実行コード、
マニフェストのスクリプトは拒否します。
`enforcement: block` / `fetch_failure: block` により、違反やポリシー取得失敗時は処理を失敗させます。

```sh
apm policy status --policy-source ./apm-policy.yml --check
apm audit --ci --policy ./apm-policy.yml
```

このローカルファイルは `apm install` では自動検出されません。
インストール時にも適用するには、組織ポリシー用リポジトリに配置してください。

## コミットメッセージ

エージェント向けの共通ルールは [AGENTS.md](AGENTS.md) にあります。
[英語版スキル](.agents/skills/conventional-commit/SKILL.md) をベースにし、矛盾する場合は [このリポジトリの独自ルール](.agents/skills/conventional-commit-ja/SKILL.md) を優先します。
コミットメッセージは `type(scope): 日本語の要約` の1行のみ（本文・フッターなし）とし、`scope` は必須です。
例：`chore(apm): 日本語のコミットスキルを追加`

## PORTの割り当て

[.env](.env)でホストIPを変更すれば、他プロジェクトとポートが被っても使用できる。

> [!IMPORTANT]
> .envのHOST_IPに127.0.0.1以外のホストIP(ループバックアドレス)を指定するとき
> 以下のコマンドをターミナルで事前に叩いておく必要がある。(127.0.0.2の箇所にHOST IPを指定)
>
> ```txt
> sudo ifconfig lo0 alias 127.0.0.2
> ```
