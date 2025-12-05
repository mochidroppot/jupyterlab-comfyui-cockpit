import {
  JupyterFrontEnd,
  JupyterFrontEndPlugin
} from '@jupyterlab/application';

import { ILauncher } from '@jupyterlab/launcher';
import { ICommandPalette, WidgetTracker, IThemeManager } from '@jupyterlab/apputils';
import { ComfyUICockpitWidget } from './widget';

/**
 * コマンドIDの定義
 */
namespace CommandIDs {
  export const open = 'comfyui-cockpit:open';
}

/**
 * 拡張機能の初期化プラグイン
 */
const plugin: JupyterFrontEndPlugin<void> = {
  id: 'comfyui-cockpit:plugin',
  autoStart: true,
  optional: [ILauncher, ICommandPalette, IThemeManager],
  activate: (
    app: JupyterFrontEnd,
    launcher: ILauncher | null,
    palette: ICommandPalette | null,
    themeManager: IThemeManager | null
  ) => {
    console.log('JupyterLab extension comfyui-cockpit is activated!');

    const { commands, shell } = app;

    // インスタンスを管理するためのトラッカーを作成
    const tracker = new WidgetTracker<ComfyUICockpitWidget>({
      namespace: 'comfyui-cockpit'
    });

    // コマンドの登録
    commands.addCommand(CommandIDs.open, {
      label: 'ComfyUI Cockpit',
      caption: 'Open ComfyUI Cockpit',
      execute: async () => {
        try {
          console.log('ComfyUI Cockpit: Opening widget...');
          
          // すでに開いているウィジェットがあればそれをアクティブにする
          let widget = tracker.currentWidget;
          
          // currentWidgetが取れない場合も考慮して、トラッカー内の最初のウィジェットを探す
          if (!widget && tracker.size > 0) {
            tracker.forEach(w => {
              if (!widget) {
                widget = w;
              }
            });
          }

          // ウィジェットが存在しない場合は新規作成
          if (!widget) {
            console.log('ComfyUI Cockpit: Creating new widget...');
            widget = new ComfyUICockpitWidget(themeManager);
            widget.id = 'comfyui-cockpit';
            widget.title.closable = true;
            
            // ウィジェットをシェルに追加
            shell.add(widget, 'main');
            
            // トラッカーに追加
            await tracker.add(widget);
            console.log('ComfyUI Cockpit: Widget created and added to tracker, ID:', widget.id);
          }
          
          // ウィジェットをアクティブにする
          shell.activateById(widget.id);
          console.log('ComfyUI Cockpit: Widget activated');
        } catch (error) {
          console.error('ComfyUI Cockpit: Error opening widget:', error);
        }
      }
    });

    // ランチャーへの追加
    if (launcher) {
      launcher.add({
        command: CommandIDs.open,
        category: 'Other',
        rank: 0
      });
    }

    // コマンドパレットへの追加
    if (palette) {
      palette.addItem({
        command: CommandIDs.open,
        category: 'ComfyUI'
      });
    }
  }
};

export default plugin;
