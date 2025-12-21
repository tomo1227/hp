# hp

[![CI](https://github.com/tomo1227/hp/actions/workflows/ci.yml/badge.svg)](https://github.com/tomo1227/hp/actions/workflows/ci.yml) [![CodeQL](https://github.com/tomo1227/hp/actions/workflows/code_ql.yml/badge.svg)](https://github.com/tomo1227/hp/actions/workflows/code_ql.yml)
 [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)  

HPのブランチ

# Usage

```sh
cd projects
pnpm run dev
```

## PORTの割り当て

[.env](.env)でホストIPを変更すれば、他プロジェクトとポートが被っても使用できる。

> [!IMPORTANT]
> .envのHOST_IPに127.0.0.1以外のホストIP(ループバックアドレス)を指定するとき
> 以下のコマンドをターミナルで事前に叩いておく必要がある。(127.0.0.2の箇所にHOST IPを指定)
>
> ```txt
> sudo ifconfig lo0 alias 127.0.0.2
> ```
