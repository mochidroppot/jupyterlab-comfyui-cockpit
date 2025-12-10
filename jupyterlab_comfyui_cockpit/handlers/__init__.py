from jupyter_server.utils import url_path_join
from .process import ProcessHandler
from .socket import ComfySocketHandler

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    
    # 名前空間
    namespace = "comfyui-cockpit"
    
    handlers = [
        (url_path_join(base_url, namespace, "process"), ProcessHandler),
        (url_path_join(base_url, namespace, "socket"), ComfySocketHandler),
    ]
    
    web_app.add_handlers(host_pattern, handlers)
