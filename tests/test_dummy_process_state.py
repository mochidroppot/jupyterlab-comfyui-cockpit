import re

from jupyterlab_comfyui_cockpit.handlers._dummy.dummy_process import DummyProcessState


class FakeIOLoop:
    """Minimal IOLoop stub for deterministic unit tests."""

    def __init__(self):
        self._scheduled = []

    def call_later(self, delay, callback):
        handle = object()
        self._scheduled.append((handle, delay, callback))
        return handle

    def remove_timeout(self, handle):
        self._scheduled = [item for item in self._scheduled if item[0] is not handle]

    def run_next(self):
        if not self._scheduled:
            raise AssertionError("No scheduled callbacks")
        handle, delay, callback = self._scheduled.pop(0)
        callback()
        return handle, delay


def test_start_transitions_to_running_when_scheduled_callback_runs():
    loop = FakeIOLoop()
    s = DummyProcessState()

    # DummyProcessState is initialized as running; stop first to test start transition.
    s.stop(loop)

    msg = s.start(loop)
    assert "starting" in msg.lower()

    payload = s.get_status_payload()
    assert payload["status"] == "starting"

    loop.run_next()

    payload2 = s.get_status_payload()
    assert payload2["status"] == "running"
    assert "pid" in payload2["message"].lower()
    assert re.search(r"uptime\s+\d+:\d{2}:\d{2}", payload2["message"].lower())


def test_stop_cancels_pending_transition_and_sets_stopped():
    loop = FakeIOLoop()
    s = DummyProcessState()

    s.stop(loop)
    s.start(loop)
    assert s.get_status_payload()["status"] == "starting"
    assert len(loop._scheduled) == 1

    msg = s.stop(loop)
    assert "stopped" in msg.lower()
    assert s.get_status_payload()["status"] == "stopped"
    assert len(loop._scheduled) == 0


def test_restart_cancels_previous_pending_transition_and_reschedules():
    loop = FakeIOLoop()
    s = DummyProcessState()

    s.stop(loop)
    s.start(loop)
    assert len(loop._scheduled) == 1

    s.restart(loop)
    assert s.get_status_payload()["status"] == "starting"
    assert len(loop._scheduled) == 1

    loop.run_next()
    assert s.get_status_payload()["status"] == "running"


