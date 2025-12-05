import React from 'react';
import { Box } from '@mui/material';

/**
 * タブパネルのプロパティ
 */
export interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * タブパネルコンポーネント
 */
export function TabPanel(props: TabPanelProps): JSX.Element {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`comfyui-tabpanel-${index}`}
      aria-labelledby={`comfyui-tab-${index}`}
      {...other}
      style={{ height: '100%', overflow: 'hidden' }}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%', overflow: 'auto', boxSizing: 'border-box' }}>
          {children}
        </Box>
      )}
    </div>
  );
}
