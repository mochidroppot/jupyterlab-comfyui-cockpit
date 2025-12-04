import React, { useState } from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { IThemeManager } from '@jupyterlab/apputils';
import { Tabs, Tab, Box, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import DescriptionIcon from '@mui/icons-material/Description';
import { ComfyUIThemeProvider } from './theme-provider';

/**
 * タブパネルのプロパティ
 */
interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

/**
 * タブパネルコンポーネント
 */
function TabPanel(props: TabPanelProps): JSX.Element {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`comfyui-tabpanel-${index}`}
      aria-labelledby={`comfyui-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3, height: '100%', overflow: 'auto' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

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
                label="ログ"
                id="comfyui-tab-1"
                aria-controls="comfyui-tabpanel-1"
              />
              <Tab
                icon={<DescriptionIcon />}
                iconPosition="start"
                label="ワークフロー"
                id="comfyui-tab-2"
                aria-controls="comfyui-tabpanel-2"
              />
            </Tabs>
          </Box>
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            <TabPanel value={currentTab} index={0}>
              <Typography variant="h6" gutterBottom>
                プロセス管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
                プロセス管理機能は後で実装されます。
              </Typography>
            </TabPanel>
            <TabPanel value={currentTab} index={1}>
              <Typography variant="h6" gutterBottom>
                ログ確認
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ログ確認機能は後で実装されます。
              </Typography>
            </TabPanel>
            <TabPanel value={currentTab} index={2}>
              <Typography variant="h6" gutterBottom>
                ワークフロー管理
              </Typography>
              <Typography variant="body2" color="text.secondary">
                ワークフローファイル管理機能は後で実装されます。
              </Typography>
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
    this.title.iconClass = 'jp-ComfyIcon'; // 後でアイコンを設定する
  }

  render(): JSX.Element {
    return <ComfyUICockpitComponent themeManager={this.themeManager} />;
  }
}

