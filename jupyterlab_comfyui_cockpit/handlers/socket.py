import json
import asyncio
from tornado.websocket import WebSocketHandler, WebSocketClosedError
from tornado.ioloop import IOLoop, PeriodicCallback
from jupyter_server.base.handlers import JupyterHandler
from ..config import Config

class ComfySocketHandler(JupyterHandler, WebSocketHandler):
    def initialize(self):
        self.cockpit_config = Config()
        self.status_callback = None
        self.last_status = None
        self.dummy_tasks = []

    async def open(self):
        try:
            self.log.info(f"ComfyUI Cockpit: WebSocket connected from {self.request.remote_ip}")
            
            if self.cockpit_config.dummy_mode:
                self.start_dummy_tasks()
            else:
                self.start_real_tasks()
        except Exception as e:
            self.log.error(f"Error in WebSocket open: {e}", exc_info=True)
            self.close()

    def on_message(self, message):
        # Client generally doesn't send messages, but we can handle ping/pong if needed
        pass

    def check_origin(self, origin):
        # Paperspace等のプロキシ環境下での接続エラーを回避するため、Originチェックを無効化
        return True

    def on_close(self):
        self.log.info("ComfyUI Cockpit: WebSocket disconnected")
        self.cleanup_tasks()

    def cleanup_tasks(self):
        if self.status_callback:
            self.status_callback.stop()
            self.status_callback = None
            
        for task in self.dummy_tasks:
            task.cancel()
        self.dummy_tasks = []

    def start_real_tasks(self):
        # 1. Status Monitoring (Periodic)
        self.status_callback = PeriodicCallback(self.check_status, 1000)
        self.status_callback.start()

    async def check_status(self):
        service_name = "comfyui"
        cmd = ["supervisorctl", "status", service_name]
        try:
            proc = await asyncio.create_subprocess_exec(
                *cmd,
                stdout=asyncio.subprocess.PIPE,
                stderr=asyncio.subprocess.PIPE
            )
            stdout, stderr = await proc.communicate()
            output = stdout.decode().strip()
            
            status = "stopped"
            if "RUNNING" in output:
                status = "running"
            elif "STARTING" in output:
                status = "starting"
            elif "BACKOFF" in output or "FATAL" in output:
                status = "error"
            
            current_data = {"status": status, "message": output}
            
            # Send if changed or first time
            if self.last_status != current_data:
                self.last_status = current_data
                self.write_message(json.dumps({
                    "type": "status",
                    "data": current_data
                }))
                
        except Exception as e:
            self.log.error(f"Error checking status: {e}")

    # --- Dummy Mode ---

    def start_dummy_tasks(self):
        self.dummy_tasks.append(asyncio.create_task(self.dummy_status_loop()))

    async def dummy_status_loop(self):
        # Simulate status
        status = "running"
        message = "DUMMY: comfyui RUNNING   pid 12345, uptime 0:00:10"
        
        try:
            # Send initial
            self.write_message(json.dumps({
                "type": "status",
                "data": {"status": status, "message": message}
            }))
            
            # Keep sending (or just wait)
            while True:
                await asyncio.sleep(5)
                # Maybe change uptime?
                pass
        except (asyncio.CancelledError, WebSocketClosedError):
            pass
        except Exception as e:
            self.log.error(f"Error in dummy_status_loop: {e}")
