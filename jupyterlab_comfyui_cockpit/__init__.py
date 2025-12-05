from ._version import __version__
from .config import Config
from .handlers import setup_handlers

# 設定を初期化（.envファイルを読み込む）
_config = Config()

def _jupyter_labextension_paths():
    return [{
        "src": "labextension",
        "dest": "jupyterlab-comfyui-cockpit"
    }]

def _jupyter_server_extension_points():
    return [{
        "module": "jupyterlab_comfyui_cockpit"
    }]

def _load_jupyter_server_extension(server_app):
    """Registers the API handler to receive HTTP requests from the frontend extension.
    """
    setup_handlers(server_app.web_app)
    server_app.log.info("Registered ComfyUI Cockpit server extension")
