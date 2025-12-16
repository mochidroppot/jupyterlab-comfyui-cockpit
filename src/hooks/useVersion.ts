import useSWR from 'swr';
import { requestAPI } from '../handler';

export interface VersionInfo {
  comfyui_version: string | null;
}

export interface VersionListInfo {
  available_versions: string[];
}

export interface VersionSwitchResult {
  success: boolean;
  message: string;
  version: string | null;
}

const fetcher = (endPoint: string) => requestAPI<VersionInfo>(endPoint);
const versionListFetcher = (endPoint: string) => requestAPI<VersionListInfo>(endPoint);

export function useVersion() {
  const { data, error, isLoading, mutate } = useSWR<VersionInfo>(
    'version',
    fetcher,
    {
      refreshInterval: 0, // バージョン情報は変更されないので、一度だけ取得
      revalidateOnFocus: false, // フォーカス時も再取得しない
    }
  );

  return {
    comfyuiVersion: data?.comfyui_version || null,
    isLoading,
    error,
    mutate, // バージョン変更後に再取得用
  };
}

export function useVersionList() {
  const { data, error, isLoading } = useSWR<VersionListInfo>(
    'version?action=list',
    versionListFetcher,
    {
      refreshInterval: 0, // 一度だけ取得
      revalidateOnFocus: false,
    }
  );

  return {
    availableVersions: data?.available_versions || [],
    isLoading,
    error,
  };
}

export async function switchVersion(targetVersion: string): Promise<VersionSwitchResult> {
  try {
    const result = await requestAPI<VersionSwitchResult>('version', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ version: targetVersion }),
    });
    return result;
  } catch (error) {
    console.error('Error switching version:', error);
    return {
      success: false,
      message: `Failed to switch version: ${error}`,
      version: null,
    };
  }
}


