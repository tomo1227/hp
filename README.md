# template_node


[![CI](https://github.com/tomo1227/template_node/actions/workflows/ci.yml/badge.svg)](https://github.com/tomo1227/template_node/actions/workflows/ci.yml) [![CodeQL](https://github.com/tomo1227/template_node/actions/workflows/code_ql.yml/badge.svg)](https://github.com/tomo1227/template_node/actions/workflows/code_ql.yml)
 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  
Node.js の Template ブランチ

# Usage

このテンプレートをcloneしたら以下を自分の環境に合わせて編集しましょう。

- [devcontainer.json](.devcontainer/devcontainer.json)
- [compose.yml](.devcontainer/compose.yml)
- [pr_test.yml](.github/workflows/pr_test.yml)
- [pull_request_template](.github/pull_request_template.md)
- [.env](.env)
- [README.md](README.md)

## PORTの割り当て

[.env](.env)でホストIPを変更すれば、他プロジェクトとポートが被っても使用できる。

> [!IMPORTANT]
> .envのHOST_IPに127.0.0.1以外のホストIP(ループバックアドレス)を指定するとき
> 以下のコマンドをターミナルで事前に叩いておく必要がある。(127.0.0.2の箇所にHOST IPを指定)
>
> ```txt
> sudo ifconfig lo0 alias 127.0.0.2
> ```

## Commit Template の設定

```bash
git config --global commit.template .commit.template
```

## Commit Message ガイドライン

.commit template を参考に記述してください

## Pull Request ガイドライン

`[emoji][type]: (title)`

- ✨feat: ログイン機能を追加
- 👓fix(a11y): ナビゲーションのアクセシビリティを改善

### Pull Request Type

- fix: 🐛 バグの修正 (SemVer パッチと関連)
- feat: ✨ 新機能を追加 (SemVer のマイナーに対応)
- feat!: 💥 破壊的な新機能 (SemVer のメジャーになります)
- fix!: 💥 破壊的なバグ修正 (SemVer のメジャーになります)
- refactor: ♻️ コードの再構築
- revert: ⏪ 変更を取り消す
- test: 🧪 テストに関連する変更
- docs: 📚 ドキュメンテーションの変更
- style: 🎨 スタイルや書式の変更
- perf: ⚡ パフォーマンス改善
- build: 👷‍♀️ ビルドシステムや外部依存関係の変更
- chore: 🔧 その他の変更
- ci: 🎡 CI/CD パイプラインに関連する変更
