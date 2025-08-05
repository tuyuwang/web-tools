'use client';

// import { ToolLayout } from '@/components/tool-layout';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Save, X, FileText, Clock } from 'lucide-react';
import { useToolTranslations } from '@/components/tool-translations';

interface Note {
  id: string;
  title: string;
  content: string;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
  priority: 'low' | 'medium' | 'high';
}

export default function NotesPage() {
  const { getToolTranslation } = useToolTranslations();
  const toolTranslation = getToolTranslation('learn-notes');
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    const savedNotes = localStorage.getItem('notes');
    if (savedNotes) {
      const parsedNotes = JSON.parse(savedNotes).map((note: any) => ({
        ...note,
        createdAt: new Date(note.createdAt),
        updatedAt: new Date(note.updatedAt),
      }));
      setNotes(parsedNotes);
    }
  }, []);

  const saveNotes = (newNotes: Note[]) => {
    localStorage.setItem('notes', JSON.stringify(newNotes));
    setNotes(newNotes);
  };

  const createNote = () => {
    const newNote: Note = {
      id: Date.now().toString(),
      title: '',
      content: '',
      tags: [],
      priority: 'medium',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentNote(newNote);
    setIsEditing(true);
  };

  const getAllTags = (notesList: Note[]) => {
    const allTags = notesList.flatMap(note => note.tags || []);
    return Array.from(new Set(allTags));
  };

  const addTag = (tag: string) => {
    if (currentNote && tag.trim() && !currentNote.tags.includes(tag.trim())) {
      setCurrentNote({
        ...currentNote,
        tags: [...currentNote.tags, tag.trim()]
      });
    }
  };

  const removeTag = (tagToRemove: string) => {
    if (currentNote) {
      setCurrentNote({
        ...currentNote,
        tags: currentNote.tags.filter(tag => tag !== tagToRemove)
      });
    }
  };

  const saveNote = () => {
    if (!currentNote || !currentNote.title.trim()) return;

    const updatedNote = {
      ...currentNote,
      updatedAt: new Date(),
    };

    const existingNoteIndex = notes.findIndex(note => note.id === currentNote.id);
    let newNotes;
    
    if (existingNoteIndex >= 0) {
      // Update existing note
      newNotes = [...notes];
      newNotes[existingNoteIndex] = updatedNote;
    } else {
      // Add new note
      newNotes = [...notes, updatedNote];
    }
    
    saveNotes(newNotes);
    setIsEditing(false);
    setCurrentNote(null);
  };

  const deleteNote = (id: string) => {
    if (confirm('确定要删除这个笔记吗？')) {
      const newNotes = notes.filter(note => note.id !== id);
      saveNotes(newNotes);
    }
  };

  const filteredNotes = notes.filter(note => {
    const matchesSearch = note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         note.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesTag = selectedTag === '' || note.tags.includes(selectedTag);
    return matchesSearch && matchesTag;
  });

  // Update tags list when notes change
  useEffect(() => {
    setTags(getAllTags(notes));
  }, [notes]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'medium': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'low': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-6xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="flex justify-center mb-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                  <FileText className="w-8 h-8 text-white" />
                </div>
              </div>
              <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
                智能笔记
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
                创建、管理和搜索您的学习笔记，支持标签分类和优先级管理
              </p>
            </div>

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Sidebar */}
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 border border-gray-100 dark:border-gray-700">
                {/* Search */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    搜索笔记
                  </label>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="搜索标题、内容或标签..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                {/* Tag Filter */}
                {tags.length > 0 && (
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      按标签筛选
                    </label>
                    <select
                      value={selectedTag}
                      onChange={(e) => setSelectedTag(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    >
                      <option value="">所有标签</option>
                      {tags.map(tag => (
                        <option key={tag} value={tag}>{tag}</option>
                      ))}
                    </select>
                  </div>
                )}

                {/* Stats */}
                <div className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">{notes.length}</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">总笔记数</div>
                  </div>
                </div>

                {/* Create Button */}
                <button
                  onClick={createNote}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-4 rounded-xl transition-all duration-300 flex items-center justify-center shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  新建笔记
                </button>
              </div>
            </div>

            {/* Main Content */}
            <div className="lg:col-span-3">
              {isEditing ? (
                <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-100 dark:border-gray-700">
                  <div className="flex justify-between items-center mb-6">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
                      {currentNote?.id ? '编辑笔记' : '新建笔记'}
                    </h2>
                    <div className="flex space-x-3">
                      <button
                        onClick={saveNote}
                        className="bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setCurrentNote(null);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-6 py-3 rounded-lg transition-all duration-200 flex items-center shadow-lg hover:shadow-xl"
                      >
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </button>
                    </div>
                  </div>

                  <div className="space-y-6">
                    {/* Title */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        标题
                      </label>
                      <input
                        type="text"
                        placeholder="输入笔记标题..."
                        value={currentNote?.title || ''}
                        onChange={(e) => setCurrentNote(currentNote ? { ...currentNote, title: e.target.value } : null)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-semibold"
                      />
                    </div>

                    {/* Priority */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        优先级
                      </label>
                      <select
                        value={currentNote?.priority || 'medium'}
                        onChange={(e) => setCurrentNote(currentNote ? { ...currentNote, priority: e.target.value as 'low' | 'medium' | 'high' } : null)}
                        className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      >
                        <option value="low">低</option>
                        <option value="medium">中</option>
                        <option value="high">高</option>
                      </select>
                    </div>

                    {/* Tags */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        标签
                      </label>
                      <div className="flex flex-wrap gap-2 mb-3">
                        {currentNote?.tags.map((tag, index) => (
                          <span
                            key={index}
                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                          >
                            {tag}
                            <button
                              onClick={() => removeTag(tag)}
                              className="ml-2 text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200"
                            >
                              <X className="w-3 h-3" />
                            </button>
                          </span>
                        ))}
                      </div>
                      <input
                        type="text"
                        placeholder="添加标签，按回车确认"
                        onKeyPress={(e) => {
                          if (e.key === 'Enter') {
                            addTag(e.currentTarget.value);
                            e.currentTarget.value = '';
                          }
                        }}
                        className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                      />
                    </div>

                    {/* Content */}
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                        内容
                      </label>
                      <textarea
                        placeholder="开始写笔记..."
                        value={currentNote?.content || ''}
                        onChange={(e) => setCurrentNote(currentNote ? { ...currentNote, content: e.target.value } : null)}
                        className="w-full h-80 px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                      />
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredNotes.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-12 text-center border border-gray-100 dark:border-gray-700">
                      <div className="w-24 h-24 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center mx-auto mb-6">
                        <FileText className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                      </div>
                      <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">
                        {searchTerm || selectedTag ? '未找到匹配的笔记' : '暂无笔记'}
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-6 max-w-md mx-auto">
                        {searchTerm || selectedTag 
                          ? '尝试调整搜索条件或清除筛选器' 
                          : '点击"新建笔记"开始记录您的想法和学习心得'
                        }
                      </p>
                      {!searchTerm && !selectedTag && (
                        <button
                          onClick={createNote}
                          className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-3 px-6 rounded-lg transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
                        >
                          创建第一个笔记
                        </button>
                      )}
                    </div>
                  ) : (
                    <div className="grid gap-6">
                      {filteredNotes.map(note => (
                        <div
                          key={note.id}
                          className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-6 hover:shadow-2xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100 dark:border-gray-700"
                        >
                          <div className="flex justify-between items-start mb-4">
                            <div className="flex-1">
                              <div className="flex items-center gap-3 mb-2">
                                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                                  {note.title}
                                </h3>
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getPriorityColor(note.priority)}`}>
                                  {note.priority === 'high' ? '高' : note.priority === 'medium' ? '中' : '低'}
                                </span>
                              </div>
                              {note.tags && note.tags.length > 0 && (
                                <div className="flex flex-wrap gap-1 mb-3">
                                  {note.tags.map((tag, tagIndex) => (
                                    <span
                                      key={tagIndex}
                                      className="inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                                    >
                                      {tag}
                                    </span>
                                  ))}
                                </div>
                              )}
                            </div>
                            <div className="flex space-x-2">
                              <button
                                onClick={() => {
                                  setCurrentNote(note);
                                  setIsEditing(true);
                                }}
                                className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-200 p-2 rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors"
                                title="编辑笔记"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => deleteNote(note.id)}
                                className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 p-2 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors"
                                title="删除笔记"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>

                          <p className="text-gray-600 dark:text-gray-300 mb-4 line-clamp-3 leading-relaxed">
                            {note.content || '暂无内容'}
                          </p>

                          <div className="flex justify-between items-center text-sm text-gray-500 dark:text-gray-400">
                            <div className="flex items-center space-x-4">
                              <span>创建于 {note.createdAt.toLocaleDateString()}</span>
                              {note.updatedAt.getTime() !== note.createdAt.getTime() && (
                                <span>更新于 {note.updatedAt.toLocaleDateString()}</span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1">
                              <Clock className="w-3 h-3" />
                              <span>{Math.ceil(note.content.length / 200)} 分钟阅读</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 