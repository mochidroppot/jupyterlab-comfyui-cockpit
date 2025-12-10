import threading
import time
from typing import Dict, Optional, Literal

from tornado.ioloop import IOLoop

ProcessAction = Literal['start', 'stop', 'restart']


class DummyProcessState:
  def __init__(self):
    self._lock = threading.Lock()
    self._status: str = 'running'
    self._pid: int = 12345
    self._start_time: Optional[float] = time.time()
    self._pending_handle = None
    self._pending_loop: Optional[IOLoop] = None

  def start(self, loop: Optional[IOLoop] = None) -> str:
    loop = loop or IOLoop.current()
    with self._lock:
      if self._status == 'running':
        return 'DUMMY: comfyui already running'
      self._status = 'starting'
      self._start_time = None
      self._schedule_running_transition_locked(loop)
      return 'DUMMY: comfyui starting'

  def stop(self, loop: Optional[IOLoop] = None) -> str:
    del loop
    with self._lock:
      self._cancel_pending_transition_locked()
      if self._status == 'stopped':
        return 'DUMMY: comfyui already stopped'
      self._status = 'stopped'
      self._start_time = None
      return 'DUMMY: comfyui stopped'

  def restart(self, loop: Optional[IOLoop] = None) -> str:
    loop = loop or IOLoop.current()
    with self._lock:
      self._cancel_pending_transition_locked()
      self._status = 'starting'
      self._start_time = None
      self._schedule_running_transition_locked(loop)
      return 'DUMMY: comfyui restarting'

  def perform_action(self, action: ProcessAction, loop: Optional[IOLoop] = None) -> str:
    if action == 'start':
      return self.start(loop)
    if action == 'stop':
      return self.stop(loop)
    if action == 'restart':
      return self.restart(loop)
    raise ValueError(f'Unsupported dummy action: {action}')

  def get_status_payload(self) -> Dict[str, str]:
    with self._lock:
      return {
        'status': self._status,
        'message': self._build_message_locked(),
      }

  def _schedule_running_transition_locked(self, loop: IOLoop) -> None:
    self._cancel_pending_transition_locked()

    def mark_running():
      with self._lock:
        self._pending_handle = None
        self._pending_loop = None
        self._status = 'running'
        self._start_time = time.time()

    self._pending_loop = loop
    self._pending_handle = loop.call_later(1.0, mark_running)

  def _cancel_pending_transition_locked(self) -> None:
    if self._pending_handle and self._pending_loop:
      try:
        self._pending_loop.remove_timeout(self._pending_handle)
      except Exception:
        pass
    self._pending_handle = None
    self._pending_loop = None

  def _build_message_locked(self) -> str:
    status = self._status.upper()
    if self._status == 'running':
      uptime = self._format_uptime_locked()
      return f'DUMMY: comfyui {status}   pid {self._pid}, uptime {uptime}'
    if self._status == 'starting':
      return f'DUMMY: comfyui {status}'
    if self._status == 'stopped':
      return 'DUMMY: comfyui STOPPED'
    return f'DUMMY: comfyui {status}'

  def _format_uptime_locked(self) -> str:
    if not self._start_time:
      return '0:00:00'
    elapsed = max(0, int(time.time() - self._start_time))
    hours, remainder = divmod(elapsed, 3600)
    minutes, seconds = divmod(remainder, 60)
    return f'{hours}:{minutes:02d}:{seconds:02d}'


dummy_process_state = DummyProcessState()
