# AI Context: JupyterLab ComfyUI Cockpit

## プロジェクト概要
このプロジェクトは、Paperspace環境で動作する ComfyUI のプロセス管理を行うための JupyterLab 拡張機能です。
Docker環境内での動作を前提としており、ComfyUIの操作（再起動、ログ確認など）をJupyterLab上からコマンドレベルで行うことを目的としています。

## 前提環境
- **プラットフォーム**: Paperspace
- **Docker環境**: [paperspace-stable-diffusion-suite](https://github.com/mochidroppot/paperspace-stable-diffusion-suite)
- **ComfyUI インストールパス**: `/opt/app/ComfyUI`

## 主な機能（想定）
1. **ComfyUIの再起動**: プロセスの再起動機能。
2. **ログの確認**: 実行ログの表示・監視。
3. **コマンド操作**: ComfyUIに関連する各種コマンドの実行。

## 開発の目的
ComfyUIの管理をJupyterLabのUIに統合し、別のターミナルを開いてコマンドを打つ手間を省き、ワークフローを効率化すること。

