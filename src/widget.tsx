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
}: ComfyUICockpitComponentProps): JSX.Element => {
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
 * JupyterLabのウィジェットとしてラップするクラス
 */
export class ComfyUICockpitWidget extends ReactWidget {
  private themeManager: IThemeManager | null;

  constructor(themeManager: IThemeManager | null = null) {
    super();
    this.themeManager = themeManager;
    this.addClass('jp-ComfyUI-Cockpit');
    this.title.label = 'ComfyUI Cockpit';
    this.title.closable = true;
    this.title.iconClass = 'jp-ComfyIcon';
  }

  render(): JSX.Element {
    return <ComfyUICockpitComponent themeManager={this.themeManager} />;
  }
}
