import React, { useState, useEffect } from 'react';
import api, { BACKEND_URL } from '../../services/api';
import axios from 'axios';
import { useAuth } from '../../context/AuthContext';
import Loader from '../../components/Loader';
import { FileText, FileDown, Search, BookOpen } from 'lucide-react';

const Resources = () => {
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [downloadingId, setDownloadingId] = useState(null);

  const { showToast } = useAuth();

  const handleDownload = async (resource) => {
    setDownloadingId(resource._id);
    try {
      const fileUrl = resource.fileUrl.startsWith('http')
        ? resource.fileUrl
        : `${BACKEND_URL}${resource.fileUrl}`;

      const res = await axios.get(fileUrl, {
        responseType: 'blob',
      });
      
      const blobUrl = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = blobUrl;
      
      const extension = resource.fileUrl.split('.').pop() || 'pdf';
      const cleanTitle = resource.title.replace(/[^a-zA-Z0-9]/g, '_');
      link.setAttribute('download', `${cleanTitle}.${extension}`);

      
      document.body.appendChild(link);
      link.click();
      
      document.body.removeChild(link);
      window.URL.revokeObjectURL(blobUrl);
    } catch (err) {
      console.error(err);
      showToast('Error downloading study material', 'error');
    } finally {
      setDownloadingId(null);
    }
  };

  const loadResources = async () => {
    try {
      const res = await api.get('/resources');
      if (res.data?.success) {
        setResources(res.data.resources);
      }
    } catch (err) {
      showToast('Error loading study materials', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadResources();
  }, []);

  const filteredResources = resources.filter(
    (r) =>
      r.title.toLowerCase().includes(search.toLowerCase()) ||
      (r.courseId?.title && r.courseId.title.toLowerCase().includes(search.toLowerCase()))
  );

  if (loading) return <Loader />;

  return (
    <div className="space-y-8 animate-fade-in">
      
      {/* Intro Header */}
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-slate-800 dark:text-zinc-50 font-outfit">
          Study Materials & Resources
        </h1>
        <p className="text-sm font-medium text-slate-500 dark:text-zinc-400 mt-1">
          Download PDF notes, tutorial drawings, references sheets, and resources assigned to your course.
        </p>
      </div>

      {/* Filter and search bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 flex items-center shadow-sm">
        <div className="relative flex-1 max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4.5 h-4.5" />
          </div>
          <input
            type="text"
            placeholder="Search resources by title or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-zinc-800 bg-slate-55 dark:bg-zinc-850 text-slate-800 dark:text-zinc-100 text-sm focus:outline-none"
          />
        </div>
      </div>

      {/* Grid listing */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.length === 0 ? (
          <div className="col-span-full text-center py-20 bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 rounded-3xl">
            <FileText className="w-12 h-12 mx-auto text-slate-350 dark:text-zinc-650 mb-3 animate-pulse" />
            <p className="text-sm font-medium text-slate-400 dark:text-zinc-500">
              No study materials found for your search.
            </p>
          </div>
        ) : (
          filteredResources.map((resource) => (
            <div
              key={resource._id}
              className="flex flex-col rounded-3xl bg-white dark:bg-zinc-900 border border-slate-150/60 dark:border-zinc-800/80 overflow-hidden shadow-sm hover:shadow-md transition-all p-6 space-y-4 justify-between"
            >
              
              <div className="space-y-3.5">
                <div className="flex items-center space-x-2">
                  <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-500 shrink-0">
                    <FileText className="w-5 h-5" />
                  </div>
                  <h3 className="text-base font-bold font-outfit text-slate-800 dark:text-zinc-150 leading-tight">
                    {resource.title}
                  </h3>
                </div>

                <div className="space-y-2 text-xs font-semibold text-slate-500 dark:text-zinc-400">
                  <div className="flex items-center">
                    <BookOpen className="w-4 h-4 mr-2.5 text-slate-400 shrink-0" />
                    Course: <span className="ml-1 text-slate-800 dark:text-zinc-200">{resource.courseId?.title || 'General'}</span>
                  </div>
                </div>
              </div>

              {/* Actions row */}
              <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-zinc-800/80">
                <button
                  onClick={() => handleDownload(resource)}
                  disabled={downloadingId === resource._id}
                  className="inline-flex items-center justify-center w-full py-2.5 rounded-xl bg-brand-50 hover:bg-brand-100 dark:bg-zinc-850 dark:hover:bg-zinc-800 text-brand-600 dark:text-brand-400 hover:text-brand-700 text-xs font-bold transition-all disabled:opacity-75"
                >
                  {downloadingId === resource._id ? (
                    <>
                      <div className="w-4 h-4 border-2 border-brand-600 dark:border-brand-400 border-t-transparent rounded-full animate-spin mr-1.5" />
                      Downloading...
                    </>
                  ) : (
                    <>
                      <FileDown className="w-4 h-4 mr-1.5" />
                      Download study file
                    </>
                  )}
                </button>
              </div>

            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default Resources;
