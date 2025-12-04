import React, { useEffect, useState } from 'react';
import {
  ThemeProvider,
  createTheme,
  Theme
} from '@mui/material/styles';
import { ScopedCssBaseline } from '@mui/material';
import { IThemeManager } from '@jupyterlab/apputils';

/**
 * JupyterLabのCSS変数から色を取得するヘルパー関数
 */
function getCSSVariable(name: string): string {
  if (typeof document !== 'undefined') {
    return getComputedStyle(document.documentElement)
      .getPropertyValue(name)
      .trim();
  }
  return '';
}

/**
 * CSS色文字列からRGB値を取得するヘルパー関数
 * 16進数形式（#ffffff）、rgb()、rgba()形式に対応
 */
function parseColorToRGB(color: string): { r: number; g: number; b: number } | null {
  if (!color) {
    return null;
  }

  // 16進数形式 (#ffffff, #fff)
  if (color.startsWith('#')) {
    const hex = color.replace('#', '');
    if (hex.length === 3) {
      // 短縮形式 (#fff)
      const r = parseInt(hex[0] + hex[0], 16);
      const g = parseInt(hex[1] + hex[1], 16);
      const b = parseInt(hex[2] + hex[2], 16);
      return { r, g, b };
    } else if (hex.length === 6) {
      // 完全形式 (#ffffff)
      const r = parseInt(hex.substring(0, 2), 16);
      const g = parseInt(hex.substring(2, 4), 16);
      const b = parseInt(hex.substring(4, 6), 16);
      if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
        return { r, g, b };
      }
    }
    return null;
  }

  // rgb() または rgba() 形式
  const rgbMatch = color.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1], 10);
    const g = parseInt(rgbMatch[2], 10);
    const b = parseInt(rgbMatch[3], 10);
    if (!isNaN(r) && !isNaN(g) && !isNaN(b)) {
      return { r, g, b };
    }
  }

  return null;
}

/**
 * RGB値から相対輝度（luminance）を計算
 * 0.0（黒）から1.0（白）の範囲
 */
function getLuminance(rgb: { r: number; g: number; b: number }): number {
  // 相対輝度の計算式（WCAG 2.1）
  const [r, g, b] = [rgb.r, rgb.g, rgb.b].map(val => {
    val = val / 255;
    return val <= 0.03928 ? val / 12.92 : Math.pow((val + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * CSS色文字列からダークモードかどうかを判定
 */
function isDarkColor(color: string): boolean {
  const rgb = parseColorToRGB(color);
  if (!rgb) {
    return false;
  }
  const luminance = getLuminance(rgb);
  // 輝度が0.5未満ならダークモードと判定
  return luminance < 0.5;
}

/**
 * JupyterLabのテーマに基づいてMUIテーマを作成
 */
function createComfyUITheme(isDark: boolean): Theme {
  // JupyterLabのCSS変数を取得
  const layoutColor1 = getCSSVariable('--jp-layout-color1') || (isDark ? '#111111' : '#ffffff');
  const layoutColor2 = getCSSVariable('--jp-layout-color2') || (isDark ? '#1e1e1e' : '#f5f5f5');
  const layoutColor3 = getCSSVariable('--jp-layout-color3') || (isDark ? '#2a2a2a' : '#e0e0e0');
  const uiFontColor1 = getCSSVariable('--jp-ui-font-color1') || (isDark ? '#ffffff' : '#000000');
  const uiFontColor2 = getCSSVariable('--jp-ui-font-color2') || (isDark ? '#b0b0b0' : '#666666');
  const brandColor1 = getCSSVariable('--jp-brand-color1') || '#2196f3';
  const accentColor1 = getCSSVariable('--jp-accent-color1') || '#1976d2';
  const borderColor = getCSSVariable('--jp-border-color1') || (isDark ? '#3a3a3a' : '#d0d0d0');

  return createTheme({
    palette: {
      mode: isDark ? 'dark' : 'light',
      primary: {
        main: brandColor1,
        light: accentColor1,
      },
      background: {
        default: layoutColor1,
        paper: layoutColor2,
      },
      text: {
        primary: uiFontColor1,
        secondary: uiFontColor2,
      },
      divider: borderColor,
    },
    components: {
      MuiTabs: {
        styleOverrides: {
          root: {
            backgroundColor: layoutColor2,
            borderBottom: `1px solid ${borderColor}`,
          },
          indicator: {
            backgroundColor: brandColor1,
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            color: uiFontColor2,
            '&.Mui-selected': {
              color: uiFontColor1,
            },
            '&:hover': {
              backgroundColor: layoutColor3,
            },
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundColor: layoutColor2,
            color: uiFontColor1,
          },
        },
      },
    },
  });
}

/**
 * ComfyUI Cockpit用のテーマプロバイダー
 * JupyterLabのテーマ変更に自動的に追従します
 */
export interface ComfyUIThemeProviderProps {
  themeManager: IThemeManager | null;
  children: React.ReactNode;
}

export function ComfyUIThemeProvider({
  themeManager,
  children
}: ComfyUIThemeProviderProps): JSX.Element {
  const [isDark, setIsDark] = useState(() => {
    if (themeManager) {
      return themeManager.theme === 'JupyterLab Dark';
    }
    // フォールバック: CSS変数から判定
    const bgColor = getCSSVariable('--jp-layout-color1');
    return bgColor ? isDarkColor(bgColor) : false;
  });

  useEffect(() => {
    if (!themeManager) {
      return;
    }

    // テーマ変更を監視
    const updateTheme = () => {
      const currentTheme = themeManager.theme;
      setIsDark(currentTheme === 'JupyterLab Dark');
    };

    // 初期テーマを設定
    updateTheme();

    // テーマ変更シグナルを購読
    themeManager.themeChanged.connect(updateTheme);

    return () => {
      themeManager.themeChanged.disconnect(updateTheme);
    };
  }, [themeManager]);

  const theme = createComfyUITheme(isDark);

  return (
    <ThemeProvider theme={theme}>
      <ScopedCssBaseline>
        {children}
      </ScopedCssBaseline>
    </ThemeProvider>
  );
}

