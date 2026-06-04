import { useState } from 'react';
import { useStore } from '../store';
import type { FileNode } from '../types';
import { getFileIcon, getLanguageFromPath } from '../utils/fileIcons';
import { getFileContent } from '../services/aiService';
import {
  ChevronRight, ChevronDown, FolderOpen, Folder,
  FilePlus, FolderPlus, RefreshCw, MoreHorizontal,
  Trash2, Edit3, Copy, Download
} from 'lucide-react';

function FileTreeNode({ node, depth = 0 }: { node: FileNode; depth?: number }) {
  const { toggleFolder, openTab, t } = useStore();
  const [showMenu, setShowMenu] = useState(false);

  const handleClick = () => {
    if (node.type === 'folder') {
      toggleFolder(node.path);
    } else {
      const content = getFileContent(node.path);
      openTab({
        path: node.path,
        name: node.name,
        content,
        savedContent: content,
        language: getLanguageFromPath(node.path),
        isModified: false,
      });
    }
  };

  const icon = node.type === 'folder'
    ? null
    : getFileIcon(node.name);

  return (
    <div>
      <div
        className={`group flex items-center h-[28px] px-2 cursor-pointer hover:bg-[#313244] transition-colors text-[13px] relative`}
        style={{ paddingLeft: `${depth * 16 + 8}px` }}
        onClick={handleClick}
        onContextMenu={(e) => { e.preventDefault(); setShowMenu(!showMenu); }}
      >
        {node.type === 'folder' ? (
          <>
            <span className="mr-1 text-[#6c7086]">
              {node.expanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            </span>
            <span className="mr-1.5">
              {node.expanded
                ? <FolderOpen size={15} className="text-[#fab387]" />
                : <Folder size={15} className="text-[#fab387]" />
              }
            </span>
          </>
        ) : (
          <>
            <span className="w-[14px] mr-1" />
            <span
              className="mr-1.5 text-[11px] font-bold w-[15px] text-center flex-shrink-0 leading-none"
              style={{ color: icon?.color }}
            >
              {icon?.icon}
            </span>
          </>
        )}
        <span className={`truncate ${node.type === 'folder' ? 'text-[#cdd6f4] font-medium' : 'text-[#bac2de]'}`}>
          {node.name}
        </span>
        <button
          className="ml-auto opacity-0 group-hover:opacity-100 p-0.5 hover:bg-[#45475a] rounded transition-opacity"
          onClick={(e) => { e.stopPropagation(); setShowMenu(!showMenu); }}
        >
          <MoreHorizontal size={14} className="text-[#6c7086]" />
        </button>

        {showMenu && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setShowMenu(false)} />
            <div className="absolute right-2 top-full z-50 bg-[#1e1e2e] border border-[#313244] rounded-lg shadow-xl py-1 min-w-[160px]">
              <button className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-[#cdd6f4] hover:bg-[#313244]" onClick={() => setShowMenu(false)}>
                <Edit3 size={13} /> {t('common.rename')}
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-[#cdd6f4] hover:bg-[#313244]" onClick={() => setShowMenu(false)}>
                <Copy size={13} /> {t('common.copy')}
              </button>
              <button className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-[#cdd6f4] hover:bg-[#313244]" onClick={() => setShowMenu(false)}>
                <Download size={13} /> {t('explorer.addToContext')}
              </button>
              <div className="border-t border-[#313244] my-1" />
              <button className="flex items-center gap-2 w-full px-3 py-1.5 text-[13px] text-[#f38ba8] hover:bg-[#313244]" onClick={() => setShowMenu(false)}>
                <Trash2 size={13} /> {t('common.delete')}
              </button>
            </div>
          </>
        )}
      </div>
      {node.type === 'folder' && node.expanded && node.children?.map((child) => (
        <FileTreeNode key={child.path} node={child} depth={depth + 1} />
      ))}
    </div>
  );
}

export function FileExplorer() {
  const { fileTree, currentProjectName, t } = useStore();
  const [searchQuery, setSearchQuery] = useState('');

  const filterTree = (nodes: FileNode[], query: string): FileNode[] => {
    if (!query) return nodes;
    return nodes.reduce<FileNode[]>((acc, node) => {
      if (node.name.toLowerCase().includes(query.toLowerCase())) {
        acc.push(node);
      } else if (node.children) {
        const filtered = filterTree(node.children, query);
        if (filtered.length > 0) {
          acc.push({ ...node, children: filtered, expanded: true });
        }
      }
      return acc;
    }, []);
  };

  const filteredTree = filterTree(fileTree, searchQuery);

  return (
    <div className="flex flex-col h-full bg-[#181825]">
      {/* Header */}
      <div className="flex items-center justify-between px-3 py-2 border-b border-[#313244]">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-[#a6adc8]">
          {t('common.explorer')} — {currentProjectName}
        </span>
        <div className="flex gap-1">
          <button className="p-1 hover:bg-[#313244] rounded text-[#6c7086] hover:text-[#cdd6f4]" title={t('explorer.newFile')}>
            <FilePlus size={14} />
          </button>
          <button className="p-1 hover:bg-[#313244] rounded text-[#6c7086] hover:text-[#cdd6f4]" title={t('explorer.newFolder')}>
            <FolderPlus size={14} />
          </button>
          <button className="p-1 hover:bg-[#313244] rounded text-[#6c7086] hover:text-[#cdd6f4]" title={t('explorer.refresh')}>
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Search */}
      <div className="px-2 py-1.5">
        <input
          type="text"
          placeholder={t('explorer.searchFiles')}
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full px-2 py-1 text-[12px] bg-[#1e1e2e] border border-[#313244] rounded text-[#cdd6f4] placeholder-[#6c7086] focus:border-[#89b4fa] focus:outline-none"
        />
      </div>

      {/* Tree */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden py-1">
        {filteredTree.map((node) => (
          <FileTreeNode key={node.path} node={node} />
        ))}
      </div>
    </div>
  );
}
