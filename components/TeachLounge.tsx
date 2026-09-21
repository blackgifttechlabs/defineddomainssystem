import React, { useState, useMemo, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { addDoc, collection, getFirestore, onSnapshot } from 'firebase/firestore';
import { useStore } from '../store/useStore';
import { 
  Search, MessageSquare, Plus, Bell, BookOpen, Coffee, 
  ChevronRight, ChevronLeft, MoreHorizontal, Download, FileText,
  Calendar, CheckCircle2, Clock, Filter, Eye, ThumbsUp, MessageCircle
} from 'lucide-react';

interface LoungePost {
  id: string;
  refId: string;
  title: string;
  author: string;
  authorAvatar?: string;
  category: 'Announcement' | 'Lesson Plan' | 'ABA Resource' | 'Schedule' | 'Discussion';
  date: string;
  time: string;
  status: 'Published' | 'Important' | 'Discussion' | 'Archived';
  repliesCount: number;
  likesCount: number;
  preview: string;
}

export const TeachLounge: React.FC = () => {
  const { user, notify } = useStore();
  const [posts, setPosts] = useState<LoungePost[]>([]);
  const [isLoadingPosts, setIsLoadingPosts] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);
  const [selectedPost, setSelectedPost] = useState<LoungePost | null>(null);
  const [showNewPostModal, setShowNewPostModal] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newCategory, setNewCategory] = useState<LoungePost['category']>('Discussion');
  const [newContent, setNewContent] = useState('');
  const pageSize = 5;

  useEffect(() => {
    const unsubscribe = onSnapshot(collection(getFirestore(), 'lounge_posts'), snapshot => {
      const next = snapshot.docs.map(item => ({ ...item.data(), id: item.id } as LoungePost));
      next.sort((a, b) => `${b.date} ${b.time}`.localeCompare(`${a.date} ${a.time}`));
      setPosts(next);
      setIsLoadingPosts(false);
    }, () => {
      setIsLoadingPosts(false);
      notify('error', 'Failed to load Teacher Lounge posts.');
    });
    return unsubscribe;
  }, [notify]);

  const filteredPosts = useMemo(() => {
    return posts.filter(p => {
      const matchSearch = p.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          p.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          p.refId.toLowerCase().includes(searchTerm.toLowerCase());
      const matchStatus = statusFilter === 'All' || p.status === statusFilter;
      const matchCat = categoryFilter === 'All' || p.category === categoryFilter;
      return matchSearch && matchStatus && matchCat;
    });
  }, [posts, searchTerm, statusFilter, categoryFilter]);

  const totalPages = Math.max(1, Math.ceil(filteredPosts.length / pageSize));
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * pageSize, currentPage * pageSize);

  const getStatusBadge = (status: LoungePost['status']) => {
    switch (status) {
      case 'Important':
        return 'bg-rose-50 text-rose-600 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900';
      case 'Published':
        return 'bg-emerald-50 text-emerald-600 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900';
      case 'Discussion':
        return 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800';
      case 'Archived':
      default:
        return 'bg-slate-50 text-slate-500 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700';
    }
  };

  const handleCreatePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const newEntry: LoungePost = {
      id: `post-${Date.now()}`,
      refId: `#LN-${Date.now().toString().slice(-6)}`,
      title: newTitle,
      author: user?.name || 'Unknown staff member',
      authorAvatar: user?.avatar,
      category: newCategory,
      date: new Date().toISOString().split('T')[0],
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      status: 'Published',
      repliesCount: 0,
      likesCount: 0,
      preview: newContent
    };

    await addDoc(collection(getFirestore(), 'lounge_posts'), newEntry);
    setNewTitle('');
    setNewContent('');
    setShowNewPostModal(false);
    notify('success', 'Announcement published to Teach Lounge', 3000);
  };

  return (
    <div className="w-full min-h-[calc(100vh-72px)] flex flex-col justify-between animate-in fade-in duration-500 font-sans">
      <div className="flex-1 flex flex-col">
        {/* Table Toolbar Header directly on page */}
        <div className="flex flex-col justify-between gap-3 border-b border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-950 sm:px-6 lg:flex-row lg:items-center lg:px-8">
          <div className="flex items-center gap-2">
            <h2 className="text-base font-semibold text-slate-950 dark:text-white md:text-lg">
              {filteredPosts.length} Lounge Posts & Bulletins
            </h2>
          </div>

        <div className="grid grid-cols-2 gap-2 sm:flex sm:flex-wrap sm:items-center">
          {/* Search Input */}
          <div className="relative col-span-2 w-full min-w-0 sm:col-span-1 sm:min-w-[220px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              type="text"
              placeholder="Search posts or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="h-10 w-full rounded-md border border-slate-200 bg-slate-50 pl-9 pr-3 text-xs font-medium text-slate-900 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-white"
            />
          </div>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="h-9 min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All Status</option>
            <option value="Published">Published</option>
            <option value="Important">Important</option>
            <option value="Discussion">Discussion</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="h-9 min-w-0 rounded-md border border-slate-200 bg-slate-50 px-2 text-xs font-medium text-slate-700 outline-none dark:border-slate-800 dark:bg-slate-900 dark:text-slate-200"
          >
            <option value="All">All Categories</option>
            <option value="Schedule">Schedule</option>
            <option value="ABA Resource">ABA Resource</option>
            <option value="Lesson Plan">Lesson Plan</option>
            <option value="Announcement">Announcement</option>
          </select>

          <button 
            onClick={() => setShowNewPostModal(true)}
            className="col-span-2 flex h-9 items-center justify-center gap-1.5 rounded-md bg-slate-950 px-3 text-xs font-medium text-white transition hover:bg-slate-800 sm:col-span-1 dark:bg-white dark:text-slate-950"
          >
            <Plus size={14} />
            <span>New Post</span>
          </button>
        </div>
      </div>

      {/* Data Table */}
        <div className="divide-y divide-slate-200 dark:divide-slate-800 md:hidden">
          {isLoadingPosts ? (
            <div className="px-5 py-16 text-center text-sm text-slate-400">Loading lounge posts…</div>
          ) : paginatedPosts.length === 0 ? (
            <div className="px-5 py-16 text-center text-sm text-slate-400">No lounge posts yet.</div>
          ) : paginatedPosts.map(post => (
            <button key={post.id} type="button" onClick={() => setSelectedPost(post)} className="flex w-full min-w-0 items-start gap-3 px-4 py-4 text-left transition hover:bg-slate-50 dark:hover:bg-slate-900">
              <div className="grid h-10 w-10 shrink-0 place-items-center overflow-hidden rounded-full bg-slate-100 text-xs font-semibold text-slate-600 dark:bg-slate-800 dark:text-slate-300">{post.authorAvatar ? <img src={post.authorAvatar} alt="" className="h-full w-full object-cover" /> : post.author[0]}</div>
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-2"><p className="line-clamp-1 text-sm font-semibold text-slate-950 dark:text-white">{post.title}</p><span className={`shrink-0 rounded-full border px-2 py-0.5 text-[9px] font-medium ${getStatusBadge(post.status)}`}>{post.status}</span></div>
                <p className="mt-1 line-clamp-2 text-xs leading-5 text-slate-500">{post.preview}</p>
                <p className="mt-2 text-[10px] text-slate-400">{post.author} · {post.date} · {post.category}</p>
              </div>
              <ChevronRight size={16} className="mt-3 shrink-0 text-slate-400" />
            </button>
          ))}
        </div>
        <div className="hidden overflow-x-auto md:block">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50/70 dark:bg-slate-800/40 text-[11px] font-semibold text-slate-400 border-b border-slate-100 dark:border-slate-800">
                <th className="py-3.5 px-5 font-semibold">Post ID</th>
                <th className="py-3.5 px-5 font-semibold">Author</th>
                <th className="py-3.5 px-5 font-semibold">Topic / Title</th>
                <th className="py-3.5 px-5 font-semibold">Category</th>
                <th className="py-3.5 px-5 font-semibold">Date & Time</th>
                <th className="py-3.5 px-5 font-semibold">Engagement</th>
                <th className="py-3.5 px-5 font-semibold">Status</th>
                <th className="py-3.5 px-5 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 text-xs">
              {isLoadingPosts ? (
                <tr><td colSpan={8} className="py-12 text-center text-slate-400">Loading lounge posts…</td></tr>
              ) : paginatedPosts.length === 0 ? (
                <tr>
                  <td colSpan={8} className="py-12 text-center text-slate-400 font-medium">
                    No lounge entries matching the selected criteria.
                  </td>
                </tr>
              ) : (
                paginatedPosts.map((post) => (
                  <tr 
                    key={post.id} 
                    className="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors cursor-pointer"
                    onClick={() => setSelectedPost(post)}
                  >
                    <td className="py-4 px-5 font-mono text-[11px] text-slate-500 font-bold">
                      {post.refId}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-2.5">
                        {post.authorAvatar ? (
                          <img 
                            src={post.authorAvatar} 
                            alt={post.author} 
                            className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700" 
                          />
                        ) : (
                          <div className="w-8 h-8 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-200 font-black flex items-center justify-center text-xs">
                            {post.author[0]}
                          </div>
                        )}
                        <span className="font-bold text-slate-900 dark:text-white">
                          {post.author}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <p className="font-bold text-slate-900 dark:text-white line-clamp-1 max-w-[280px]">
                        {post.title}
                      </p>
                      <p className="text-[11px] text-slate-400 truncate max-w-[280px] mt-0.5">
                        {post.preview}
                      </p>
                    </td>

                    <td className="py-4 px-5">
                      <span className="text-slate-600 dark:text-slate-300 font-medium">
                        {post.category}
                      </span>
                    </td>

                    <td className="py-4 px-5 font-mono text-[11px] text-slate-500">
                      {post.date} • {post.time}
                    </td>

                    <td className="py-4 px-5">
                      <div className="flex items-center gap-3 text-slate-500 text-[11px]">
                        <span className="flex items-center gap-1">
                          <ThumbsUp size={12} className="text-slate-400" /> {post.likesCount}
                        </span>
                        <span className="flex items-center gap-1">
                          <MessageCircle size={12} className="text-slate-400" /> {post.repliesCount}
                        </span>
                      </div>
                    </td>

                    <td className="py-4 px-5">
                      <span className={`px-2.5 py-1 rounded-[9px] text-[10px] font-bold border ${getStatusBadge(post.status)}`}>
                        {post.status}
                      </span>
                    </td>

                    <td className="py-4 px-5 text-right">
                      <button 
                        onClick={(e) => { e.stopPropagation(); setSelectedPost(post); }}
                        className="p-1.5 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-[9px] transition-colors"
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination Footer at very bottom */}
      <div className="mt-auto flex flex-col items-center justify-between gap-3 border-t border-slate-200 bg-white px-4 py-4 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-950 sm:flex-row sm:px-6 md:px-8">
        <div>
          Showing <span className="font-bold text-slate-900 dark:text-white">{filteredPosts.length > 0 ? (currentPage - 1) * pageSize + 1 : 0}</span> to{' '}
          <span className="font-bold text-slate-900 dark:text-white">
            {Math.min(currentPage * pageSize, filteredPosts.length)}
          </span> of{' '}
          <span className="font-bold text-slate-900 dark:text-white">{filteredPosts.length}</span> results
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="px-3 py-1.5 rounded-[9px] border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
          >
            Previous
          </button>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(num => (
            <button
              key={num}
              onClick={() => setCurrentPage(num)}
              className={`hidden h-8 w-8 rounded-md text-xs font-medium transition-all sm:block ${
                currentPage === num
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
              }`}
            >
              {num}
            </button>
          ))}
          <button
            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="px-3 py-1.5 rounded-[9px] border border-slate-200 dark:border-slate-700 font-medium hover:bg-slate-50 dark:hover:bg-slate-800 disabled:opacity-40 disabled:pointer-events-none"
          >
            Next
          </button>
        </div>
      </div>

      {/* Post Detail Drawer / Modal */}
      {selectedPost && createPortal(
        <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
          <div className="flex min-h-0 w-full flex-col space-y-5 overflow-y-auto bg-white p-4 shadow-xl dark:bg-slate-900 sm:max-h-[90vh] sm:max-w-2xl sm:rounded-xl sm:border sm:border-slate-200 sm:p-6 dark:sm:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center gap-3">
                <span className={`px-2.5 py-1 rounded-[9px] text-[10px] font-bold border ${getStatusBadge(selectedPost.status)}`}>
                  {selectedPost.status}
                </span>
                <span className="text-xs font-mono text-slate-400 font-bold">{selectedPost.refId}</span>
              </div>
              <button 
                onClick={() => setSelectedPost(null)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-[9px]"
              >
                ✕
              </button>
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
                {selectedPost.title}
              </h3>
              <div className="flex items-center gap-3 text-xs text-slate-500 pb-3 border-b border-slate-100 dark:border-slate-800">
                <span className="font-semibold text-slate-700 dark:text-slate-300">By {selectedPost.author}</span>
                <span>•</span>
                <span>{selectedPost.date} at {selectedPost.time}</span>
                <span>•</span>
                <span className="text-blue-600 font-semibold">{selectedPost.category}</span>
              </div>
            </div>

            <p className="text-sm text-slate-700 dark:text-slate-300 leading-relaxed bg-slate-50 dark:bg-slate-800/50 p-4 rounded-[9px] border border-slate-100 dark:border-slate-800">
              {selectedPost.preview}
            </p>

            <div className="flex items-center justify-between pt-2">
              <div className="flex items-center gap-2">
                <button 
                  onClick={() => notify('success', 'Liked post!', 2000)}
                  className="px-3.5 py-1.5 rounded-[9px] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 flex items-center gap-1.5"
                >
                  <ThumbsUp size={14} /> Like ({selectedPost.likesCount})
                </button>
              </div>
              <button
                onClick={() => setSelectedPost(null)}
                className="px-4 py-1.5 bg-slate-900 dark:bg-blue-600 text-white text-xs font-bold rounded-[9px]"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      , document.body)}

      {/* New Post Modal */}
      {showNewPostModal && createPortal(
        <div className="fixed inset-0 z-[100] flex items-stretch justify-center bg-slate-950/50 backdrop-blur-sm animate-in fade-in duration-200 sm:items-center sm:p-4">
          <form onSubmit={handleCreatePost} className="flex min-h-0 w-full flex-col space-y-4 overflow-y-auto bg-white p-4 shadow-xl dark:bg-slate-900 sm:max-h-[90vh] sm:max-w-xl sm:rounded-xl sm:border sm:border-slate-200 sm:p-6 dark:sm:border-slate-800">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <h3 className="text-lg font-black uppercase text-slate-900 dark:text-white">
                Create Lounge Post
              </h3>
              <button 
                type="button"
                onClick={() => setShowNewPostModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white p-1 rounded-[9px]"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Title</label>
                <input
                  type="text"
                  required
                  placeholder="Post title or topic..."
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[9px] text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Category</label>
                <select
                  value={newCategory}
                  onChange={(e) => setNewCategory(e.target.value as any)}
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[9px] text-xs font-medium text-slate-900 dark:text-white outline-none"
                >
                  <option value="Announcement">Announcement</option>
                  <option value="Lesson Plan">Lesson Plan</option>
                  <option value="ABA Resource">ABA Resource</option>
                  <option value="Schedule">Schedule</option>
                  <option value="Discussion">Discussion</option>
                </select>
              </div>

              <div>
                <label className="text-[11px] font-bold text-slate-500 uppercase">Content / Instructions</label>
                <textarea
                  rows={4}
                  required
                  placeholder="Share details, updates or questions..."
                  value={newContent}
                  onChange={(e) => setNewContent(e.target.value)}
                  className="w-full mt-1 px-3.5 py-2.5 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-[9px] text-xs font-medium text-slate-900 dark:text-white outline-none focus:border-blue-600"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setShowNewPostModal(false)}
                className="px-4 py-2 rounded-[9px] border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-600 dark:text-slate-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-5 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-[9px] shadow-sm"
              >
                Publish Post
              </button>
            </div>
          </form>
        </div>
      , document.body)}
    </div>
  );
};
