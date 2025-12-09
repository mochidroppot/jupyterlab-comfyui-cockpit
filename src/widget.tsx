import React, { useState } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { IThemeManager } from '@jupyterlab/apputils';
import { Tabs, Tab, Box } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import { ComfyUIThemeProvider } from './theme-provider';
import { TabPanel } from './components/common/TabPanel';
import { ProcessPanel } from './features/process/ProcessPanel';
import { WorkflowPanel } from './features/workflow/WorkflowPanel';

/**
 * ComfyUI Cockpitのメインコンポーネント
 */
interface ComfyUICockpitComponentProps {
  themeManager: IThemeManager | null;
}

const ComfyUICockpitComponent = ({
  themeManager
}: ComfyUICockpitComponentProps) => {
  const [currentTab, setCurrentTab] = useState(0);

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setCurrentTab(newValue);
  };

  return (
    <ComfyUIThemeProvider themeManager={themeManager}>
      <div className="jp-ComfyUI-Cockpit-content">
        <Box sx={{ width: '100%', height: '100%', display: 'flex', flexDirection: 'column' }}>
          <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
            <Tabs
              value={currentTab}
              onChange={handleTabChange}
              aria-label="ComfyUI Cockpit tabs"
            >
              <Tab
                icon={<PlayArrowIcon />}
                iconPosition="start"
                label="プロセス"
                id="comfyui-tab-0"
                aria-controls="comfyui-tabpanel-0"
              />
              <Tab
                icon={<DescriptionIcon />}
                iconPosition="start"
                label="ワークフロー"
                id="comfyui-tab-1"
                aria-controls="comfyui-tabpanel-1"
              />
            </Tabs>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <TabPanel value={currentTab} index={0}>
              <ProcessPanel />
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
              <WorkflowPanel />
            </TabPanel>
          </Box>
        </Box>
      </div>
    </ComfyUIThemeProvider>
  );
};

/**
 * JupyterLabのウィジェットを作成するファクトリ関数
 */
export function createComfyUICockpitWidget(
  themeManager: IThemeManager | null = null
): ReactWidget {
  const widget = ReactWidget.create(
    <ComfyUICockpitComponent themeManager={themeManager} />
  );
  
  widget.addClass('jp-ComfyUI-Cockpit');
  widget.title.label = 'ComfyUI Cockpit';
  widget.title.closable = true;
  widget.title.iconClass = 'jp-ComfyIcon';
  
  return widget;
}
