import json
import subprocess
from pathlib import Path
from typing import Dict, Optional
import tornado
from jupyter_server.base.handlers import APIHandler

from ..config import Config


class VersionHandler(APIHandler):
    """ComfyUIのバージョン情報を取得するハンドラー"""
    
    def initialize(self, *args, **kwargs):
        super().initialize(*args, **kwargs)
        self.cockpit_config = Config()
    
    def _get_comfyui_path(self) -> Path:
        """ComfyUIのインストールパスを取得"""
        # 環境変数から取得、デフォルトは /opt/app/ComfyUI
        comfyui_path = self.cockpit_config.get("COMFYUI_PATH", "/opt/app/ComfyUI")
        return Path(comfyui_path)
    
    def _get_comfyui_version(self) -> Optional[str]:
        """ComfyUIのバージョンを取得"""
        comfyui_path = self._get_comfyui_path()

        # __version__.py から取得を試みる
        version_file = comfyui_path / "comfyui_version.py"
        if version_file.exists():
            try:
                with open(version_file, "r", encoding="utf-8") as f:
                    content = f.read()
                    # __version__ = "1.0.0" のような形式を探す
                    import re
                    match = re.search(r'__version__\s*=\s*["\']([^"\']+)["\']', content)
                    if match:
                        return match.group(1)
            except Exception as e:
                self.log.warning(f"Failed to read __version__.py: {e}")

        # git から取得を試みる
        try:
            result = subprocess.run(
                ["git", "-C", str(comfyui_path), "describe", "--tags", "--always"],
                capture_output=True,
                text=True,
                timeout=2
            )
            if result.returncode == 0:
                return result.stdout.strip()
        except Exception as e:
            self.log.debug(f"Failed to get git version: {e}")

        return None

    def _get_available_versions(self) -> list[str]:
        """利用可能なComfyUIバージョンの一覧を取得"""
        comfyui_path = self._get_comfyui_path()

        try:
            # gitタグ一覧を取得
            result = subprocess.run(
                ["git", "-C", str(comfyui_path), "tag", "--sort=-version:refname"],
                capture_output=True,
                text=True,
                timeout=5
            )
            if result.returncode == 0:
                tags = result.stdout.strip().split('\n')
                # 空の行を除去し、最大10個に制限
                return [tag for tag in tags if tag][:10]
        except Exception as e:
            self.log.debug(f"Failed to get git tags: {e}")

        # gitが使えない場合は空のリストを返す
        return []

    def _switch_version(self, target_version: str) -> Dict[str, any]:
        """ComfyUIのバージョンを切り替え（完全自動化）"""
        comfyui_path = self._get_comfyui_path()

        try:
            # ステップ1: git checkout
            self.log.info(f"Switching to version {target_version}...")
            result = subprocess.run(
                ["git", "-C", str(comfyui_path), "checkout", target_version],
                capture_output=True,
                text=True,
                timeout=60  # タイムアウトを延長
            )

            if result.returncode != 0:
                return {
                    "success": False,
                    "message": f"Failed to checkout version: {result.stderr.strip()}",
                    "version": None
                }

            # ステップ2: Python依存関係の更新
            self.log.info("Updating Python dependencies...")
            requirements_file = comfyui_path / "requirements.txt"
            if requirements_file.exists():
                pip_result = subprocess.run(
                    ["pip", "install", "-r", str(requirements_file)],
                    capture_output=True,
                    text=True,
                    timeout=300  # 5分タイムアウト
                )
                if pip_result.returncode != 0:
                    self.log.warning(f"Pip install failed: {pip_result.stderr.strip()}")

            # ステップ3: ComfyUIプロセス再起動
            self.log.info("Restarting ComfyUI process...")
            restart_result = subprocess.run(
                ["supervisorctl", "restart", "comfyui"],
                capture_output=True,
                text=True,
                timeout=30
            )

            if restart_result.returncode != 0:
                return {
                    "success": False,
                    "message": f"Failed to restart ComfyUI: {restart_result.stderr.strip()}",
                    "version": target_version
                }

            return {
                "success": True,
                "message": f"Successfully switched to version {target_version} and restarted ComfyUI",
                "version": target_version
            }

        except subprocess.TimeoutExpired:
            return {
                "success": False,
                "message": f"Version switch timed out for {target_version}",
                "version": None
            }
        except Exception as e:
            self.log.error(f"Error switching version: {e}")
            return {
                "success": False,
                "message": f"Error switching version: {str(e)}",
                "version": None
            }
    
    
    @tornado.web.authenticated
    def get(self):
        """バージョン情報を取得"""
        self.set_header('Content-Type', 'application/json')

        # クエリパラメータで一覧取得を指定
        action = self.get_argument('action', 'current')

        if action == 'list':
            # 利用可能なバージョン一覧を取得
            if self.cockpit_config.dummy_mode:
                available_versions = ["1.0.0-dummy", "0.9.0-dummy", "0.8.0-dummy"]
            else:
                available_versions = self._get_available_versions()

            self.finish(json.dumps({
                "available_versions": available_versions,
            }))
            return

        # 現在のバージョン情報を取得
        if self.cockpit_config.dummy_mode:
            # ダミーモードの場合は固定値を返す
            self.finish(json.dumps({
                "comfyui_version": "1.0.0-dummy",
            }))
            return

        comfyui_version = self._get_comfyui_version()

        response: Dict[str, Optional[str]] = {
            "comfyui_version": comfyui_version,
        }

        self.finish(json.dumps(response))

    @tornado.web.authenticated
    def post(self):
        """バージョン切り替えを実行"""
        self.set_header('Content-Type', 'application/json')

        try:
            data = json.loads(self.request.body)
            target_version = data.get('version')

            if not target_version:
                self.set_status(400)
                self.finish(json.dumps({
                    "success": False,
                    "message": "Version parameter is required"
                }))
                return

            if self.cockpit_config.dummy_mode:
                # ダミーモードではモックレスポンス
                result = {
                    "success": True,
                    "message": f"Successfully switched to version {target_version} (dummy mode)",
                    "version": target_version
                }
            else:
                result = self._switch_version(target_version)

            self.finish(json.dumps(result))

        except json.JSONDecodeError:
            self.set_status(400)
            self.finish(json.dumps({
                "success": False,
                "message": "Invalid JSON data"
            }))
        except Exception as e:
            self.log.error(f"Error in POST version: {e}")
            self.set_status(500)
            self.finish(json.dumps({
                "success": False,
                "message": f"Internal server error: {str(e)}"
            }))


