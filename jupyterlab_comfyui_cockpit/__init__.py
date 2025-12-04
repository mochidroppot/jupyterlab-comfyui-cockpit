from ._version import __version__

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
    server_app.log.info("Registered ComfyUI Cockpit server extension")
