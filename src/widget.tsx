import React from 'react';
import { ReactWidget } from '@jupyterlab/apputils';
import { IThemeManager } from '@jupyterlab/apputils';
import { ComfyUIThemeProvider } from './theme-provider';
import { ProcessPanel } from './features/process/ProcessPanel';

/**
 * ComfyUI Cockpitのメインコンポーネント
 */
interface ComfyUICockpitComponentProps {
  themeManager: IThemeManager | null;
}

const ComfyUICockpitComponent = ({
  themeManager
}: ComfyUICockpitComponentProps) => {
  return (
    <ComfyUIThemeProvider themeManager={themeManager}>
      <div className="jp-ComfyUI-Cockpit-content">
        <ProcessPanel />
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
