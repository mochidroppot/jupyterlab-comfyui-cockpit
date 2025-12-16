import React, { useEffect, useState } from 'react';
import {
  Box,
  Typography,
  Divider,
  Stack,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Alert,
  Chip,
  Button,
  CircularProgress,
} from '@mui/material';
import { ProcessStatusArea } from './ProcessStatusArea';
import { useProcessStatus } from '../../hooks/useProcess';
import { useVersion, useVersionList, switchVersion } from '../../hooks/useVersion';

type ProcessAction = 'start' | 'stop' | 'restart';

export const ProcessPanel = () => {
  const { status, message, isLoading, start, stop, restart } = useProcessStatus();
  const { comfyuiVersion, isLoading: isVersionLoading, mutate: mutateVersion } = useVersion();
  const { availableVersions, isLoading: isVersionListLoading } = useVersionList();
  const [pendingActions, setPendingActions] = useState<Record<ProcessAction, boolean>>({
    start: false,
    stop: false,
    restart: false,
  });
  const [selectedVersion, setSelectedVersion] = useState<string>('');
  const [isSwitchingVersion, setIsSwitchingVersion] = useState(false);
  const [versionSwitchMessage, setVersionSwitchMessage] = useState<{
    type: 'success' | 'error';
    message: string;
  } | null>(null);

  const setPendingAction = (action: ProcessAction, value: boolean) => {
    setPendingActions((prev) => {
      if (prev[action] === value) {
        return prev;
      }
      return { ...prev, [action]: value };
    });
  };

  const controlProcess = async (action: ProcessAction) => {
    setPendingAction(action, true);
    try {
      if (action === 'start') await start();
      if (action === 'stop') await stop();
      if (action === 'restart') await restart();
    } catch (error) {
      console.error(`Error ${action}ing process:`, error);
      setPendingAction(action, false);
    }
  };

  const handleVersionSelect = (targetVersion: string) => {
    setSelectedVersion(targetVersion);
    setVersionSwitchMessage(null); // メッセージをクリア
  };

  const handleVersionConfirm = async () => {
    if (!selectedVersion || selectedVersion === comfyuiVersion) {
      return;
    }

    setIsSwitchingVersion(true);
    setVersionSwitchMessage(null);

    try {
      const result = await switchVersion(selectedVersion);
      if (result.success) {
        setVersionSwitchMessage({
          type: 'success',
          message: `ComfyUIをバージョン ${selectedVersion} に切り替えました`,
        });
        // バージョン情報を再取得
        mutateVersion();
        setSelectedVersion(''); // 選択状態をリセット
      } else {
        setVersionSwitchMessage({
          type: 'error',
          message: result.message,
        });
      }
    } catch (error) {
      setVersionSwitchMessage({
        type: 'error',
        message: 'バージョン切り替えに失敗しました',
      });
    } finally {
      setIsSwitchingVersion(false);
    }
  };

  useEffect(() => {
    if (!pendingActions.start && !pendingActions.stop && !pendingActions.restart) {
      return;
    }

    setPendingActions((prev) => {
      let hasChanges = false;
      const next = { ...prev };

      if (prev.start && (status === 'starting' || status === 'running' || status === 'error')) {
        next.start = false;
        hasChanges = true;
      }
      if (prev.stop && (status === 'stopped' || status === 'error')) {
        next.stop = false;
        hasChanges = true;
      }
      // restartの場合: supervisorctl restartはstop->startの順で実行されるため、
      // 最終的にrunning状態になるまでpendingを維持
      if (prev.restart && (status === 'running' || status === 'error')) {
        next.restart = false;
        hasChanges = true;
      }

      return hasChanges ? next : prev;
    });
  }, [status, pendingActions]);

  return (
    <Box sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column', boxSizing: 'border-box' }}>
      {/* Status Area */}
      <ProcessStatusArea
        status={status}
        message={message}
        onStart={() => controlProcess('start')}
        onStop={() => controlProcess('stop')}
        onRestart={() => controlProcess('restart')}
        isStartPending={pendingActions.start}
        isStopPending={pendingActions.stop}
        isRestartPending={pendingActions.restart}
        disabled={isSwitchingVersion}
      />

      {isLoading && (
          <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
              Loading status...
          </Typography>
      )}

      <Divider sx={{ my: 2 }} />

      {/* Version Information */}
      <Stack spacing={1}>
        <Typography variant="subtitle2" color="text.secondary" sx={{ fontWeight: 'bold' }}>
          バージョン情報
        </Typography>

        {/* Version Switch Message */}
        {versionSwitchMessage && (
          <Alert
            severity={versionSwitchMessage.type}
            onClose={() => setVersionSwitchMessage(null)}
            sx={{ mb: 1 }}
          >
            {versionSwitchMessage.message}
          </Alert>
        )}

        {isVersionLoading || isVersionListLoading ? (
          <Typography variant="body2" color="text.secondary">
            Loading...
          </Typography>
        ) : (
          <Stack spacing={2}>
            {/* Current Version Display */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '80px' }}>
                現在のバージョン:
              </Typography>
              <Chip
                label={comfyuiVersion || '不明'}
                size="small"
                color="primary"
                variant="filled"
                sx={{
                  fontSize: '0.75rem',
                  height: '24px',
                  '& .MuiChip-label': {
                    px: 1,
                  },
                }}
              />
            </Box>

            {/* Version Selection */}
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Typography variant="body2" color="text.secondary" sx={{ minWidth: '80px' }}>
                切り替え先:
              </Typography>
              <FormControl size="small" sx={{ minWidth: '200px' }}>
                <InputLabel>バージョン選択</InputLabel>
                <Select
                  value={selectedVersion}
                  label="バージョン選択"
                  onChange={(e) => handleVersionSelect(e.target.value)}
                  disabled={isVersionLoading || isVersionListLoading || isSwitchingVersion}
                >
                  <MenuItem value="">
                    <em>選択してください</em>
                  </MenuItem>
                  {availableVersions.length > 0 ? (
                    availableVersions.map((version) => (
                      <MenuItem key={version} value={version}>
                        {version}
                      </MenuItem>
                    ))
                  ) : (
                    <MenuItem value={comfyuiVersion || ''}>
                      {comfyuiVersion || '不明'}
                    </MenuItem>
                  )}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                size="small"
                onClick={handleVersionConfirm}
                disabled={!selectedVersion || selectedVersion === comfyuiVersion || isSwitchingVersion}
                sx={{
                  minWidth: '80px',
                  textTransform: 'none',
                }}
              >
                {isSwitchingVersion ? (
                  <>
                    <CircularProgress size={16} sx={{ mr: 1 }} />
                    切り替え中...
                  </>
                ) : (
                  '切り替え'
                )}
              </Button>
            </Box>

            {!comfyuiVersion && availableVersions.length === 0 && (
              <Typography variant="body2" color="text.secondary">
                バージョン情報を取得できませんでした
              </Typography>
            )}
          </Stack>
        )}
      </Stack>
    </Box>
  );
};
