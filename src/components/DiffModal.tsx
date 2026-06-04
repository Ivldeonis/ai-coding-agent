import { useStore } from '../store';
import { diffLines } from 'diff';
import {
  X, Check, XCircle, Edit3, ChevronLeft, ChevronRight,
  FileText, FilePlus, Trash2, ArrowRight
} from 'lucide-react';
import { useState } from 'react';

export function DiffModal() {
  const { pendingDiffs, updateDiff, clearDiffs, showDiffModal, t } = useStore();
  const [currentIdx, setCurrentIdx] = useState(0);
  const [editMode, setEditMode] = useState(false);
  const [editContent, setEditContent] = useState('');

  if (!showDiffModal || pendingDiffs.length === 0) return null;

  const current = pendingDiffs[currentIdx];
  if (!current) return null;

  const changes = diffLines(current.oldContent, current.newContent);

  const handleApprove = () => {
    updateDiff(current.id, { status: 'approved', newContent: editMode ? editContent : current.newContent });
    if (currentIdx < pendingDiffs.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      clearDiffs();
    }
  };

  const handleReject = () => {
    updateDiff(current.id, { status: 'rejected' });
    if (currentIdx < pendingDiffs.length - 1) {
      setCurrentIdx(currentIdx + 1);
    } else {
      clearDiffs();
    }
  };

  const handleEdit = () => {
    setEditContent(current.newContent);
    setEditMode(true);
  };

  const handleApproveAll = () => {
    pendingDiffs.forEach((d) => updateDiff(d.id, { status: 'approved' }));
    clearDiffs();
  };

  const typeConfig = {
    create: { icon: FilePlus, label: 'Create', color: 'text-[#a6e3a1]', bg: 'bg-[#a6e3a1]/10' },
    modify: { icon: FileText, label: 'Modify', color: 'text-[#89b4fa]', bg: 'bg-[#89b4fa]/10' },
    delete: { icon: Trash2, label: 'Delete', color: 'text-[#f38ba8]', bg: 'bg-[#f38ba8]/10' },
    rename: { icon: ArrowRight, label: 'Rename', color: 'text-[#f9e2af]', bg: 'bg-[#f9e2af]/10' },
  };

  const Icon = typeConfig[current.type].icon;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="bg-[#1e1e2e] border border-[#313244] rounded-xl shadow-2xl w-full max-w-4xl max-h-[85vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-[#313244]">
          <div className="flex items-center gap-3">
            <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded ${typeConfig[current.type].bg}`}>
              <Icon size={13} className={typeConfig[current.type].color} />
              <span className={`text-[12px] font-medium ${typeConfig[current.type].color}`}>
                {typeConfig[current.type].label}
              </span>
            </div>
            <span className="text-[13px] text-[#cdd6f4] font-mono">{current.path}</span>
            {current.type === 'rename' && current.newPath && (
              <>
                <ArrowRight size={14} className="text-[#6c7086]" />
                <span className="text-[13px] text-[#cdd6f4] font-mono">{current.newPath}</span>
              </>
            )}
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[11px] text-[#6c7086]">
              {currentIdx + 1} / {pendingDiffs.length}
            </span>
            <button onClick={clearDiffs} className="p-1 hover:bg-[#313244] rounded text-[#6c7086]">
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Diff content */}
        <div className="flex-1 overflow-auto p-0">
          {editMode ? (
            <textarea
              value={editContent}
              onChange={(e) => setEditContent(e.target.value)}
              className="w-full h-full bg-[#11111b] text-[#cdd6f4] font-mono text-[12px] p-4 resize-none focus:outline-none"
              style={{ lineHeight: '1.6', tabSize: 2 }}
            />
          ) : (
            <div className="font-mono text-[12px] leading-relaxed">
              {changes.map((part, i) => {
                const lines = part.value.split('\n').filter((_, li, arr) => li < arr.length - 1 || _ !== '');
                return lines.map((line, j) => (
                  <div
                    key={`${i}-${j}`}
                    className={`px-4 py-0 flex ${
                      part.added ? 'bg-[#a6e3a1]/10 text-[#a6e3a1]' :
                      part.removed ? 'bg-[#f38ba8]/10 text-[#f38ba8]' :
                      'text-[#6c7086]'
                    }`}
                  >
                    <span className="w-6 text-right mr-3 select-none opacity-50">
                      {part.added ? '+' : part.removed ? '-' : ' '}
                    </span>
                    <span className="flex-1 whitespace-pre">{line}</span>
                  </div>
                ));
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between px-4 py-3 border-t border-[#313244]">
          <div className="flex gap-2">
            {pendingDiffs.length > 1 && (
              <>
                <button
                  onClick={() => setCurrentIdx(Math.max(0, currentIdx - 1))}
                  disabled={currentIdx === 0}
                  className="flex items-center gap-1 px-2 py-1 text-[12px] text-[#6c7086] hover:text-[#cdd6f4] disabled:opacity-30"
                >
                  <ChevronLeft size={14} /> Prev
                </button>
                <button
                  onClick={() => setCurrentIdx(Math.min(pendingDiffs.length - 1, currentIdx + 1))}
                  disabled={currentIdx === pendingDiffs.length - 1}
                  className="flex items-center gap-1 px-2 py-1 text-[12px] text-[#6c7086] hover:text-[#cdd6f4] disabled:opacity-30"
                >
                  Next <ChevronRight size={14} />
                </button>
              </>
            )}
          </div>
          <div className="flex gap-2">
            {pendingDiffs.length > 1 && (
              <button
                onClick={handleApproveAll}
                className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-[#a6e3a1]/10 text-[#a6e3a1] rounded-lg hover:bg-[#a6e3a1]/20"
              >
                <Check size={13} /> Accept All
              </button>
            )}
            <button
              onClick={handleEdit}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-[#f9e2af]/10 text-[#f9e2af] rounded-lg hover:bg-[#f9e2af]/20"
            >
              <Edit3 size={13} /> {t('common.rename')}
            </button>
            <button
              onClick={handleReject}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-[#f38ba8]/10 text-[#f38ba8] rounded-lg hover:bg-[#f38ba8]/20"
            >
              <XCircle size={13} /> {t('diff.discard')}
            </button>
            <button
              onClick={handleApprove}
              className="flex items-center gap-1 px-3 py-1.5 text-[12px] bg-[#a6e3a1] text-[#1e1e2e] rounded-lg hover:bg-[#a6e3a1]/90 font-medium"
            >
              <Check size={13} /> {editMode ? t('common.save') : t('diff.apply')}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
