import json
import subprocess
import tornado
from jupyter_server.base.handlers import APIHandler

from ..config import Config
from ._dummy import dummy_process_state


class ProcessHandler(APIHandler):
    def initialize(self, *args, **kwargs):
        super().initialize(*args, **kwargs)
        self.cockpit_config = Config()
    
    @tornado.web.authenticated
    def get(self):
        self.set_header('Content-Type', 'application/json')

        if self.cockpit_config.dummy_mode:
            self.finish(json.dumps(dummy_process_state.get_status_payload()))
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
            self.log.error(f"Error in ProcessHandler.get: {e}", exc_info=True)
            self.set_status(500)
            self.finish(json.dumps({"status": "error", "message": str(e)}))

    @tornado.web.authenticated
    def post(self):
        self.set_header('Content-Type', 'application/json')
        try:
            input_data = self.get_json_body()
        except Exception:
            self.set_status(400)
            self.finish(json.dumps({"status": "error", "message": "Invalid JSON data"}))
            return

        if not isinstance(input_data, dict):
            self.set_status(400)
            self.finish(json.dumps({"status": "error", "message": "Invalid JSON data"}))
            return
        
        if self.cockpit_config.dummy_mode:
            action = input_data.get("action")
            
            if action not in ["start", "stop", "restart"]:
                self.set_status(400)
                self.finish(json.dumps({"status": "error", "message": "Invalid action"}))
                return
            
            result_message = dummy_process_state.perform_action(action)
            self.finish(json.dumps({
                "status": "success",
                "message": result_message
            }))
            return
        
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
            self.log.error(f"Error in ProcessHandler.post: {e}", exc_info=True)
            self.set_status(500)
            self.finish(json.dumps({"status": "error", "message": str(e)}))
