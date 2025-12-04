# JupyterLab ComfyUI Cockpit

A JupyterLab extension for managing ComfyUI.

## Installation

```bash
pip install -e .
```

## Development

### セットアップ

1. venv環境を作成して有効化：
```bash
python -m venv venv
.\venv\Scripts\Activate.ps1  # Windows PowerShell
# または
venv\Scripts\activate.bat     # Windows CMD
```

2. パッケージをインストール：
```bash
pip install -e .
```

3. Node.jsの依存関係をインストール：
```bash
jlpm install
```

### 開発コマンド

#### ビルド

```bash
# 開発モードでビルド（推奨）
jlpm run build

# 本番モードでビルド
jlpm run build:prod

# TypeScriptのみコンパイル
jlpm run build:lib

# JupyterLab拡張のみビルド（開発モード）
jlpm run build:labextension:dev

# JupyterLab拡張のみビルド（本番モード）
jlpm run build:labextension
```

#### ウォッチモード（自動再ビルド）

```bash
# ファイル変更を監視して自動再ビルド
jlpm run watch

# TypeScriptのみ監視
jlpm run watch:src

# JupyterLab拡張のみ監視
jlpm run watch:labextension
```

#### クリーンアップ

```bash
# ビルド成果物を削除
jlpm run clean:all

# TypeScriptのビルド成果物のみ削除
jlpm run clean:lib

# JupyterLab拡張のビルド成果物のみ削除
jlpm run clean:labextension
```

#### リント

```bash
# ESLintでコードをチェック・修正
jlpm run eslint

# リント（prettier + eslint）
jlpm run lint
```

### JupyterLabの起動

```bash
jupyter lab
```

### 動作確認

1. ブラウザのコンソール（F12）で `JupyterLab extension comfyui-cockpit is activated!` が表示されることを確認
2. ランチャーに「ComfyUI Cockpit」が表示されることを確認
3. コマンドパレット（Ctrl+Shift+C）で「ComfyUI」を検索してコマンドが表示されることを確認

### 拡張機能の状態確認

```bash
# インストールされている拡張機能の一覧を表示
jupyter labextension list
```
