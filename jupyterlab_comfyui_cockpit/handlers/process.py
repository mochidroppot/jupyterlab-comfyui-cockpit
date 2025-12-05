import json
import subprocess
import tornado
from jupyter_server.base.handlers import APIHandler

from ..config import Config


class ProcessHandler(APIHandler):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.config = Config()
    
    @tornado.web.authenticated
    def get(self):
        if self.config.dummy_mode:
            # ダミーデータを返す
            self.finish(json.dumps({
                "status": "running",
                "message": "DUMMY: comfyui RUNNING   pid 12345, uptime 0:00:10"
            }))
            return
        
        service_name = "comfyui"
        cmd = ["supervisorctl", "status", service_name]
        try:
            result = subprocess.run(cmd, capture_output=True, text=True)
            # supervisorctl status output example: "comfyui RUNNING   pid 12345, uptime 0:00:10"
            # or "comfyui STOPPED   Dec 05 12:00 PM"
            
            output = result.stdout.strip()
            status = "stopped"
            if "RUNNING" in output:
                status = "running"
            elif "STARTING" in output:
                status = "starting"
            elif "BACKOFF" in output or "FATAL" in output:
                status = "error"
            
            self.finish(json.dumps({
                "status": status,
                "message": output
            }))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({"status": "error", "message": str(e)}))

    @tornado.web.authenticated
    def post(self):
        if self.config.dummy_mode:
            input_data = self.get_json_body()
            action = input_data.get("action")
            
            if action not in ["start", "stop", "restart"]:
                self.set_status(400)
                self.finish(json.dumps({"status": "error", "message": "Invalid action"}))
                return
            
            # ダミーレスポンスを返す
            self.finish(json.dumps({
                "status": "success",
                "message": f"DUMMY: comfyui: {action}ed"
            }))
            return
        
        input_data = self.get_json_body()
        action = input_data.get("action")

        if action not in ["start", "stop", "restart"]:
             self.set_status(400)
             self.finish(json.dumps({"status": "error", "message": "Invalid action"}))
             return
        
        service_name = "comfyui"
        cmd = ["supervisorctl", action, service_name]

        try:
            result = subprocess.run(cmd, capture_output=True, text=True)

            if result.returncode == 0:
                self.finish(json.dumps({
                    "status": "success",
                    "message": result.stdout.strip()
                }))
            else:
                self.set_status(500)
                self.finish(json.dumps({
                    "status": "error",
                    "message": result.stderr.strip() or result.stdout.strip()
                }))
        except Exception as e:
            self.set_status(500)
            self.finish(json.dumps({"status": "error", "message": str(e)}))
