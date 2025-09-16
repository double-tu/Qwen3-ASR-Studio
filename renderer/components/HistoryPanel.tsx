
import React, { useState } from 'react';
import type { HistoryItem } from '../types';
import { DeleteIcon } from './icons/DeleteIcon';
import { LanguageIcon } from './icons/LanguageIcon';
import { CopyIcon } from './icons/CopyIcon';
import { CheckIcon } from './icons/CheckIcon';
import { RestoreIcon } from './icons/RestoreIcon';

interface HistoryPanelProps {
  items: HistoryItem[];
  onDelete: (id: number) => void;
  onRestore: (item: HistoryItem) => void;
  onError: (message: string) => void;
  disabled?: boolean;
}

const formatTimestamp = (timestamp: number) => {
  const date = new Date(timestamp);
  return date.toLocaleString('zh-CN', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const HistoryPanel: React.FC<HistoryPanelProps> = ({ items, onDelete, onRestore, onError, disabled }) => {
  const [copiedState, setCopiedState] = useState<{ id: number; type: 'original' | 'corrected' } | null>(null);

  const handleCopy = async (textToCopy: string, itemId: number, type: 'original' | 'corrected') => {
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopiedState({ id: itemId, type });
      setTimeout(() => {
          setCopiedState(currentState => (currentState?.id === itemId && currentState.type === type ? null : currentState));
      }, 2000);
    } catch (err) {
      console.error("Failed to copy from history:", err);
      onError('复制失败，请检查浏览器权限。');
    }
  };

  return (
    <div className="p-4 rounded-lg bg-base-200 border border-base-300">
      <h3 className="text-lg font-semibold text-content-100 mb-4">历史</h3>
      <div className="h-80 md:h-96">
        {items.length === 0 ? (
          <div className="flex items-center justify-center h-full">
            <p className="text-center text-content-200">历史记录为空。</p>
          </div>
        ) : (
          <div className="space-y-3 h-full overflow-y-auto pr-2">
            {items.map((item) => (
              <div key={item.id} className="p-3 rounded-md bg-base-100 border border-base-300">
                {item.originalTranscription && (
                  <div className="mb-2">
                    <p className="text-xs text-content-200 mb-1">原文:</p>
                    <p className="text-sm text-content-100 break-words">
                      {item.originalTranscription}
                    </p>
                  </div>
                )}
                <div className="mb-2">
                   <p className="text-xs text-content-200 mb-1">{item.originalTranscription ? '修正后:' : '识别结果:'}</p>
                   <p className="text-sm text-content-100 break-words font-medium">
                     {item.transcription || '（无识别结果）'}
                   </p>
                </div>

                <div className="flex items-center justify-between text-xs text-content-200">
                  <div className="flex flex-col gap-1 min-w-0">
                    <span className="truncate" title={item.fileName}>{item.fileName}</span>
                    <div className="flex items-center gap-2">
                      {item.detectedLanguage && (
                          <span className="flex items-center gap-1">
                              <LanguageIcon className="w-3 h-3" /> {item.detectedLanguage}
                          </span>
                      )}
                      <span>{formatTimestamp(item.timestamp)}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 flex-shrink-0 ml-2">
                    <button
                      onClick={() => onRestore(item)}
                      disabled={disabled}
                      title="恢复"
                      aria-label="恢复此条历史记录"
                      className="p-1 rounded-full text-content-200 hover:bg-base-300/50 hover:text-content-100 disabled:opacity-50"
                    >
                      <RestoreIcon className="w-4 h-4" />
                    </button>

                    {item.originalTranscription && (
                      <button
                        onClick={() => handleCopy(item.originalTranscription!, item.id, 'original')}
                        disabled={disabled}
                        title={copiedState?.id === item.id && copiedState?.type === 'original' ? "已复制原文" : "复制原文"}
                        aria-label="复制原文"
                        className={`p-1 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                          copiedState?.id === item.id && copiedState?.type === 'original'
                            ? 'text-brand-primary'
                            : 'text-content-200 hover:bg-base-300/50 hover:text-content-100'
                        }`}
                      >
                        {copiedState?.id === item.id && copiedState?.type === 'original' ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                      </button>
                    )}

                    <button
                      onClick={() => handleCopy(item.transcription, item.id, 'corrected')}
                      disabled={disabled || !item.transcription}
                      title={copiedState?.id === item.id && copiedState?.type === 'corrected' ? "已复制" : "复制" + (item.originalTranscription ? "修正文" : "结果")}
                      aria-label="复制识别结果"
                      className={`p-1 rounded-full transition-colors duration-200 disabled:opacity-50 ${
                        copiedState?.id === item.id && copiedState?.type === 'corrected'
                          ? 'text-brand-primary'
                          // A little visual separation if both copy buttons are present
                          : 'text-content-200 hover:bg-base-300/50 hover:text-content-100'
                      }`}
                    >
                      {copiedState?.id === item.id && copiedState?.type === 'corrected' ? <CheckIcon className="w-4 h-4" /> : <CopyIcon className="w-4 h-4" />}
                    </button>

                    <button
                      onClick={() => onDelete(item.id)}
                      disabled={disabled}
                      title="删除"
                      aria-label="删除此条历史记录"
                      className="p-1 rounded-full text-red-500 hover:bg-red-500/10 disabled:opacity-50"
                    >
                      <DeleteIcon className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
