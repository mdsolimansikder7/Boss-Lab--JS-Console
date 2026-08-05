import React, { useState } from 'react';
import { X, Search, BookOpen, Plus, Trash2, Code2, Check, Sparkles } from 'lucide-react';
import { Snippet, ThemeConfig } from '../types';

interface SnippetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  snippets: Snippet[];
  onSelectSnippet: (snippet: Snippet) => void;
  onSaveCurrentAsSnippet: (title: string, description: string) => void;
  onDeleteSnippet: (id: string) => void;
  currentCode: string;
  theme: ThemeConfig;
}

export const SnippetsModal: React.FC<SnippetsModalProps> = ({
  isOpen,
  onClose,
  snippets,
  onSelectSnippet,
  onSaveCurrentAsSnippet,
  onDeleteSnippet,
  currentCode,
  theme
}) => {
  if (!isOpen) return null;

  const [activeTab, setActiveTab] = useState<'browse' | 'save'>('browse');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [newTitle, setNewTitle] = useState<string>('');
  const [newDesc, setNewDesc] = useState<string>('');
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);

  const categories = ['All', 'Saved', 'Beginner', 'Data Structures', 'Async & Fetch', 'Algorithms', 'Fun & Utility'];

  const filteredSnippets = snippets.filter(s => {
    const matchesCategory = selectedCategory === 'All' || 
      (selectedCategory === 'Saved' ? s.isCustom : s.category === selectedCategory);
    
    const matchesSearch = s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.code.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    onSaveCurrentAsSnippet(newTitle.trim(), newDesc.trim() || 'Custom user snippet');
    setNewTitle('');
    setNewDesc('');
    setSaveSuccess(true);
    setTimeout(() => {
      setSaveSuccess(false);
      setActiveTab('browse');
      setSelectedCategory('Saved');
    }, 1000);
  };

  const isLight = theme.id === 'light';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/70 backdrop-blur-sm animate-fadeIn">
      <div 
        className="w-full max-w-3xl rounded-xl border shadow-2xl flex flex-col max-h-[90vh] sm:max-h-[85vh] overflow-hidden"
        style={{
          backgroundColor: theme.panelBg,
          borderColor: theme.border,
          color: theme.text
        }}
      >
        {/* Modal Header */}
        <div 
          className="flex items-center justify-between px-4 sm:px-5 py-3 sm:py-4 border-b"
          style={{ borderColor: theme.border }}
        >
          <div className="flex items-center gap-2">
            <BookOpen className={`w-5 h-5 ${isLight ? 'text-sky-600' : 'text-sky-400'}`} />
            <h2 className="text-sm sm:text-base font-bold tracking-tight">Code Snippets Library</h2>
          </div>

          <button
            onClick={onClose}
            className={`p-1.5 rounded-lg transition-colors ${
              isLight ? 'hover:bg-slate-200 text-slate-600 hover:text-slate-900' : 'hover:bg-white/10 text-gray-400 hover:text-white'
            }`}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Header & Action */}
        <div 
          className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 px-4 sm:px-5 py-2.5 border-b text-xs"
          style={{ backgroundColor: theme.bg, borderColor: theme.border }}
        >
          <div className="flex gap-2">
            <button
              onClick={() => setActiveTab('browse')}
              className={`px-3 py-1.5 rounded-lg font-semibold transition-all ${
                activeTab === 'browse' 
                  ? (isLight ? 'bg-sky-600 text-white font-bold' : 'bg-sky-500/20 text-sky-400 border border-sky-500/30') 
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200')
              }`}
            >
              Browse Examples ({snippets.length})
            </button>
            <button
              onClick={() => setActiveTab('save')}
              className={`px-3 py-1.5 rounded-lg font-semibold flex items-center gap-1 transition-all ${
                activeTab === 'save' 
                  ? (isLight ? 'bg-emerald-600 text-white font-bold' : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30') 
                  : (isLight ? 'text-slate-600 hover:text-slate-900' : 'text-gray-400 hover:text-gray-200')
              }`}
            >
              <Plus className="w-3.5 h-3.5" />
              Save Current Code
            </button>
          </div>

          {activeTab === 'browse' && (
            <div className="relative w-full sm:w-auto">
              <input
                type="text"
                placeholder="Search snippets..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`py-1 pl-7 pr-3 rounded-lg border outline-none text-xs w-full sm:w-44 focus:sm:w-56 transition-all ${
                  isLight ? 'bg-slate-100 border-slate-300 text-slate-800 placeholder-slate-400' : 'bg-black/30 border-white/10 text-white'
                }`}
              />
              <Search className={`w-3.5 h-3.5 absolute left-2 top-1/2 -translate-y-1/2 ${isLight ? 'text-slate-400' : 'text-gray-400'}`} />
            </div>
          )}
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-5">
          {activeTab === 'browse' ? (
            <div className="space-y-4">
              {/* Category Pills */}
              <div className="flex flex-wrap gap-1.5">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-2.5 py-1 rounded-full text-xs font-medium transition-all ${
                      selectedCategory === cat
                        ? 'bg-sky-500 text-white shadow-sm'
                        : (isLight ? 'bg-slate-200 text-slate-700 hover:bg-slate-300' : 'bg-white/5 text-gray-400 hover:bg-white/10')
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Snippet Grid */}
              {filteredSnippets.length === 0 ? (
                <div className={`py-12 text-center font-mono text-xs ${isLight ? 'text-slate-500' : 'text-gray-400'}`}>
                  No snippets found matching your search.
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filteredSnippets.map((s) => (
                    <div
                      key={s.id}
                      className={`p-3.5 rounded-xl border transition-all flex flex-col justify-between gap-3 group ${
                        isLight ? 'bg-white hover:border-sky-500' : 'bg-black/20 hover:border-sky-500/50'
                      }`}
                      style={{ borderColor: theme.border }}
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2 mb-1">
                          <h3 className={`font-bold text-sm ${isLight ? 'text-sky-800' : 'text-sky-300 group-hover:text-sky-200'}`}>
                            {s.title}
                          </h3>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono border ${
                            isLight ? 'bg-slate-100 text-slate-600 border-slate-200' : 'bg-white/5 text-gray-400 border-white/10'
                          }`}>
                            {s.category}
                          </span>
                        </div>
                        <p className={`text-xs line-clamp-2 leading-relaxed ${isLight ? 'text-slate-600' : 'text-gray-400'}`}>
                          {s.description}
                        </p>
                      </div>

                      <div className={`flex items-center justify-between pt-2 border-t ${isLight ? 'border-slate-200' : 'border-white/5'}`}>
                        <button
                          onClick={() => {
                            onSelectSnippet(s);
                            onClose();
                          }}
                          className={`px-3 py-1 rounded-lg text-xs font-semibold flex items-center gap-1 transition-all ${
                            isLight ? 'bg-sky-100 text-sky-800 hover:bg-sky-200' : 'bg-sky-500/20 text-sky-300 hover:bg-sky-500/30'
                          }`}
                        >
                          <Code2 className="w-3.5 h-3.5" />
                          Load Snippet
                        </button>

                        {s.isCustom && (
                          <button
                            onClick={() => onDeleteSnippet(s.id)}
                            className={`p-1 rounded transition-colors ${
                              isLight ? 'hover:bg-red-100 text-slate-500 hover:text-red-600' : 'hover:bg-red-500/20 text-gray-400 hover:text-red-400'
                            }`}
                            title="Delete Saved Snippet"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ) : (
            /* Save Snippet Form */
            <form onSubmit={handleSave} className="space-y-4 max-w-lg mx-auto py-2 sm:py-4">
              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  Snippet Title *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Array Flattening Helper"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none text-xs focus:border-emerald-500 transition-all ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/30 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  Description
                </label>
                <input
                  type="text"
                  placeholder="e.g. Utility function to recursively flatten nested arrays"
                  value={newDesc}
                  onChange={(e) => setNewDesc(e.target.value)}
                  className={`w-full px-3 py-2 rounded-lg border outline-none text-xs focus:border-emerald-500 transition-all ${
                    isLight ? 'bg-slate-100 border-slate-300 text-slate-900 placeholder-slate-400' : 'bg-black/30 border-white/10 text-white'
                  }`}
                />
              </div>

              <div>
                <label className={`block text-xs font-semibold mb-1 ${isLight ? 'text-slate-700' : 'text-gray-300'}`}>
                  Current Editor Code Preview ({currentCode.split('\n').length} lines)
                </label>
                <pre className={`p-3 rounded-lg border font-mono text-xs max-h-36 overflow-y-auto ${
                  isLight ? 'bg-slate-100 border-slate-300 text-emerald-800' : 'bg-black/50 border-white/10 text-emerald-300/80'
                }`}>
                  {currentCode || '// No code in editor'}
                </pre>
              </div>

              <button
                type="submit"
                disabled={!newTitle.trim() || !currentCode.trim()}
                className="w-full py-2.5 rounded-lg font-bold text-xs bg-emerald-500 hover:bg-emerald-600 text-black flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {saveSuccess ? (
                  <>
                    <Check className="w-4 h-4" />
                    Saved Successfully!
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Save Snippet
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
