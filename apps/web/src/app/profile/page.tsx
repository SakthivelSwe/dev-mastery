'use client';

import React, { useState } from 'react';
import { useAuthStore } from '@/store/useAuthStore';
import { User, Github, Linkedin, Camera, Save, Loader2 } from 'lucide-react';
import { Topbar } from '@/components/shell/Topbar';

export default function ProfilePage() {
  const { user } = useAuthStore();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    githubUrl: '',
    linkedinUrl: '',
  });

  const handleSave = async () => {
    setIsSaving(true);
    // Simulate API call to auth-service / user-service
    await new Promise(r => setTimeout(r, 1000));
    setIsSaving(false);
    setIsEditing(false);
  };

  if (!user) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-[--bg-primary]">
      <Topbar />
      
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-8">
          
          {/* Header Section */}
          <div className="bg-[--bg-surface] border border-[--border-default] rounded-xl p-8 relative">
            <div className="absolute top-8 right-8">
              {!isEditing ? (
                <button 
                  onClick={() => setIsEditing(true)}
                  className="px-4 py-2 border border-[--border-muted] rounded-lg text-sm text-[--text-secondary] hover:bg-[--bg-elevated] hover:text-[--text-primary] transition-all"
                >
                  Edit Profile
                </button>
              ) : (
                <button 
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 bg-indigo-500 hover:bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm transition-all disabled:opacity-50"
                >
                  {isSaving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />}
                  Save Changes
                </button>
              )}
            </div>

            <div className="flex items-start gap-6">
              <div className="relative group">
                <div className="w-24 h-24 rounded-full bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center">
                  <User size={40} className="text-indigo-400" />
                </div>
                {isEditing && (
                  <button className="absolute bottom-0 right-0 p-2 bg-[--bg-elevated] border border-[--border-muted] rounded-full text-[--text-secondary] hover:text-[--text-primary] shadow-lg">
                    <Camera size={14} />
                  </button>
                )}
              </div>

              <div className="flex-1 pt-2">
                {isEditing ? (
                  <div className="space-y-4 max-w-md">
                    <div>
                      <label className="text-xs text-[--text-muted] mb-1 block">Full Name</label>
                      <input 
                        type="text" 
                        value={formData.fullName}
                        onChange={(e) => setFormData({...formData, fullName: e.target.value})}
                        className="w-full bg-[--bg-elevated] border border-[--border-default] rounded-md px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[--text-muted] mb-1 block">GitHub URL</label>
                      <input 
                        type="text" 
                        placeholder="https://github.com/..."
                        value={formData.githubUrl}
                        onChange={(e) => setFormData({...formData, githubUrl: e.target.value})}
                        className="w-full bg-[--bg-elevated] border border-[--border-default] rounded-md px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-xs text-[--text-muted] mb-1 block">LinkedIn URL</label>
                      <input 
                        type="text" 
                        placeholder="https://linkedin.com/in/..."
                        value={formData.linkedinUrl}
                        onChange={(e) => setFormData({...formData, linkedinUrl: e.target.value})}
                        className="w-full bg-[--bg-elevated] border border-[--border-default] rounded-md px-3 py-1.5 text-sm focus:border-indigo-500 focus:outline-none"
                      />
                    </div>
                  </div>
                ) : (
                  <div>
                    <h1 className="text-2xl font-bold text-[--text-primary]">{user.fullName || 'Student Developer'}</h1>
                    <p className="text-[--text-secondary] text-sm mt-1">{user.email}</p>
                    <div className="flex items-center gap-4 mt-4">
                      <a href="#" className="flex items-center gap-1.5 text-sm text-[--text-muted] hover:text-white transition-colors">
                        <Github size={16} /> Add GitHub
                      </a>
                      <a href="#" className="flex items-center gap-1.5 text-sm text-[--text-muted] hover:text-white transition-colors">
                        <Linkedin size={16} /> Add LinkedIn
                      </a>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Certificates Section */}
          <div className="bg-[--bg-surface] border border-[--border-default] rounded-xl p-8">
            <h2 className="text-lg font-bold text-[--text-primary] mb-6 border-b border-[--border-muted] pb-4">My Certificates</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border border-[--border-default] border-dashed rounded-lg p-6 flex flex-col items-center justify-center text-[--text-muted] h-32">
                <p className="text-sm">No certificates yet.</p>
                <p className="text-xs mt-1">Complete a learning path to earn one.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
