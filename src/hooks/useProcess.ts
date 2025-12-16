import useSWR from 'swr';
import { mutate } from 'swr';
import { requestAPI } from '../handler';

export interface ProcessStatus {
  status: 'running' | 'stopped' | 'starting' | 'error';
  message: string;
}

const fetcher = (endPoint: string) => requestAPI<ProcessStatus>(endPoint);

export function useProcessStatus() {
  const { data, error, isLoading } = useSWR<ProcessStatus>(
    'process',
    fetcher,
    {
      refreshInterval: 5000, // 5秒ごとにポーリング
      revalidateOnFocus: true, // ウィンドウフォーカス時に再検証
    }
  );

  const controlProcess = async (action: 'start' | 'stop' | 'restart') => {
    try {
      await requestAPI<{ status: string; message: string }>('process', {
        method: 'POST',
        body: JSON.stringify({ action }),
      });
      // アクション実行後、即座にステータスを再取得
      mutate('process');
    } catch (error) {
      console.error(`Error ${action}ing process:`, error);
      throw error;
    }
  };

  return {
    status: data?.status || 'stopped',
    message: data?.message || '',
    isLoading,
    error,
    start: () => controlProcess('start'),
    stop: () => controlProcess('stop'),
    restart: () => controlProcess('restart'),
  };
}
