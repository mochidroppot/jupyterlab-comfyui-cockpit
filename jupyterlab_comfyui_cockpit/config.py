"""環境変数の読み込みと管理を行うクラス"""
import os
from pathlib import Path
from typing import Optional

from dotenv import load_dotenv


class Config:
    """ComfyUI Cockpitの設定を管理するクラス"""
    
    _instance: Optional['Config'] = None
    _initialized: bool = False
    
    def __new__(cls):
        """シングルトンパターンでインスタンスを管理"""
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance
    
    def __init__(self):
        """初期化処理（複数回呼ばれても問題ないように）"""
        if not self._initialized:
            self._load_env()
            Config._initialized = True
    
    def _load_env(self) -> None:
        """プロジェクトルートの.envファイルを読み込む"""
        # プロジェクトルートを探す（__file__から遡る）
        current_file = Path(__file__)
        # config.pyは jupyterlab_comfyui_cockpit/config.py にあるので
        # parent -> jupyterlab_comfyui_cockpit
        # parent.parent -> プロジェクトルート
        project_root = current_file.parent.parent
        env_path = project_root / ".env"
        
        if env_path.exists():
            load_dotenv(env_path)
    
    @property
    def dummy_mode(self) -> bool:
        """ダミーモードが有効かどうかを返す"""
        value = os.getenv("COMFYUI_COCKPIT_DUMMY_MODE", "false")
        return value.lower() in ("true", "1", "yes", "on")
    
    def get(self, key: str, default: Optional[str] = None) -> Optional[str]:
        """環境変数の値を取得する"""
        return os.getenv(key, default)
    
    def get_bool(self, key: str, default: bool = False) -> bool:
        """環境変数をbool値として取得する"""
        value = os.getenv(key, "")
        if not value:
            return default
        return value.lower() in ("true", "1", "yes", "on")
    
    def get_int(self, key: str, default: Optional[int] = None) -> Optional[int]:
        """環境変数をint値として取得する"""
        value = os.getenv(key)
        if value is None:
            return default
        try:
            return int(value)
        except ValueError:
            return default
