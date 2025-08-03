'use client';

import { ToolLayout } from '@/components/tool-layout';
import { useState, useEffect } from 'react';
import { Plus, Search, Edit3, Trash2, Save, X, FileText } from 'lucide-react';

interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: Date;
  updatedAt: Date;
}

export default function NotesPage() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [currentNote, setCurrentNote] = useState<Note | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    setCurrentNote(newNote);
    setIsEditing(true);
  };

  const saveNote = () => {
    if (!currentNote || !currentNote.title.trim()) return;

    const updatedNote = {
      ...currentNote,
      updatedAt: new Date(),
    };

    const newNotes = [...notes, updatedNote];
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

  const filteredNotes = notes.filter(note =>
    note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ToolLayout>
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-4xl mx-auto">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-2">
              <FileText className="inline-block w-8 h-8 mr-3 text-blue-600" />
              笔记工具
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              创建、编辑和管理你的笔记
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                <div className="mb-6">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                      type="text"
                      placeholder="搜索笔记..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>

                <button
                  onClick={createNote}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-4 rounded-lg transition-colors duration-200 flex items-center justify-center"
                >
                  <Plus className="w-5 h-5 mr-2" />
                  新建笔记
                </button>
              </div>
            </div>

            <div className="lg:col-span-2">
              {isEditing ? (
                <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6">
                  <div className="flex justify-between items-center mb-4">
                    <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                      新建笔记
                    </h2>
                    <div className="flex space-x-2">
                      <button
                        onClick={saveNote}
                        className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                      >
                        <Save className="w-4 h-4 mr-2" />
                        保存
                      </button>
                      <button
                        onClick={() => {
                          setIsEditing(false);
                          setCurrentNote(null);
                        }}
                        className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors duration-200 flex items-center"
                      >
                        <X className="w-4 h-4 mr-2" />
                        取消
                      </button>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <input
                      type="text"
                      placeholder="笔记标题..."
                      value={currentNote?.title || ''}
                      onChange={(e) => setCurrentNote(currentNote ? { ...currentNote, title: e.target.value } : null)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white text-lg font-semibold"
                    />

                    <textarea
                      placeholder="开始写笔记..."
                      value={currentNote?.content || ''}
                      onChange={(e) => setCurrentNote(currentNote ? { ...currentNote, content: e.target.value } : null)}
                      className="w-full h-64 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none"
                    />
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredNotes.length === 0 ? (
                    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8 text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
                        暂无笔记
                      </h3>
                      <p className="text-gray-600 dark:text-gray-300 mb-4">
                        点击"新建笔记"开始记录你的想法
                      </p>
                      <button
                        onClick={createNote}
                        className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-lg transition-colors duration-200"
                      >
                        创建第一个笔记
                      </button>
                    </div>
                  ) : (
                    filteredNotes.map(note => (
                      <div
                        key={note.id}
                        className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-6 hover:shadow-xl transition-shadow duration-200"
                      >
                        <div className="flex justify-between items-start mb-3">
                          <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                            {note.title}
                          </h3>
                          <button
                            onClick={() => deleteNote(note.id)}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        <p className="text-gray-600 dark:text-gray-300 mb-4">
                          {note.content}
                        </p>

                        <div className="text-xs text-gray-500 dark:text-gray-400">
                          创建于 {note.createdAt.toLocaleDateString()}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </ToolLayout>
  );
} 