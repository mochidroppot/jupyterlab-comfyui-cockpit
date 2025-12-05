import React from 'react';
import {
  Box,
  Typography,
  Divider,
} from '@mui/material';
import { ProcessStatusArea } from './ProcessStatusArea';

export const ProcessPanel = (): JSX.Element => {
  return (
    <Box sx={{ p: 2 }}>
      {/* Status Area */}
      <ProcessStatusArea />
      <Divider sx={{ my: 2 }} />

      {/* Logs */}
      <Typography
       variant="subtitle1"
       sx={{
        mt: 2,
        mb: 1,
       }}
      >
        Logs
      </Typography>
      <Box
        sx={{
          backgroundColor: '#111',
          color: '#fff',
          p: 2,
          borderRadius: 1,
          fontFamily: 'monospace',
          height: 240,
          overflow: 'auto',
        }}
      >
        12:00:10 Starting ComfyUI...
        <br />
        12:00:11 Loading models...
        <br />
        12:00:13 Web UI running on 0.0.0.0:8188
        <br />
        ...
      </Box>
    </Box>
  );
};
