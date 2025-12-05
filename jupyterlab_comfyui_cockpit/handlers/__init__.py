from jupyter_server.utils import url_path_join
from .process import ProcessHandler

def setup_handlers(web_app):
    host_pattern = ".*$"
    base_url = web_app.settings["base_url"]
    
    # 名前空間
    namespace = "comfyui-cockpit"
    
    handlers = [
        (url_path_join(base_url, namespace, "process"), ProcessHandler),
    ]
    
    web_app.add_handlers(host_pattern, handlers)
