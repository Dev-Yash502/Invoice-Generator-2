import React, { useState } from 'react';
import { X, Building2, ShieldCheck, Landmark, Globe } from 'lucide-react';
import { Workspace } from '../types';

interface NewWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddWorkspace: (ws: Workspace) => void;
}

export const NewWorkspaceModal: React.FC<NewWorkspaceModalProps> = ({
  isOpen,
  onClose,
  onAddWorkspace,
}) => {
  const [name, setName] = useState('');
  const [tagline, setTagline] = useState('');
  const [website, setWebsite] = useState('');
  const [agencyType, setAgencyType] = useState('');
  const [email, setEmail] = useState('');
  const [upi, setUpi] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    const key = name.toLowerCase().replace(/[^a-z0-9]/g, '-').slice(0, 15) || `ws-${Date.now()}`;
    const initial = name
      .split(' ')
      .map(w => w[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'WS';

    const newWs: Workspace = {
      key,
      name: name.trim(),
      initial,
      tagline: tagline.trim(),
      agencyType: agencyType.trim(),
      website: website.trim(),
      gstin: '',
      email: email.trim(),
      upi: upi.trim(),
      icon: 'business',
    };

    onAddWorkspace(newWs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl bg-white dark:bg-[#111624] border border-neutral-200 dark:border-white/10 p-5 shadow-2xl flex flex-col gap-3 max-h-[85vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-2 border-b border-neutral-200/60 dark:border-white/10">
          <div className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-[#635bff] dark:text-[#00f0ff]" />
            <h3 className="font-headline font-bold text-sm text-neutral-900 dark:text-white">
              Add New Online Entity
            </h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-neutral-400 hover:text-neutral-900 dark:hover:text-white p-1"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-3 text-xs">
          <div>
            <label className="block font-mono text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Agency / Brand Name *
            </label>
            <input
              type="text"
              required
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="Business or workspace name"
              className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl px-3 py-2 text-neutral-900 dark:text-white outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]"
            />
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              Tagline / Deliverables
            </label>
            <input
              type="text"
              value={tagline}
              onChange={e => setTagline(e.target.value)}
              placeholder="What your business does"
              className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl px-3 py-2 text-neutral-900 dark:text-white outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]"
            />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block font-mono text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Website / Domain
              </label>
              <input
                type="text"
                value={website}
                onChange={e => setWebsite(e.target.value)}
                placeholder="Your website"
                className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl px-3 py-2 text-neutral-900 dark:text-white outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]"
              />
            </div>
            <div>
              <label className="block font-mono text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
                Business Email
              </label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="Business email"
                className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-mono outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]"
              />
            </div>
          </div>

          <div>
            <label className="block font-mono text-[10px] font-semibold text-neutral-500 uppercase tracking-wider mb-1">
              UPI ID (VPA)
            </label>
            <input
              type="text"
              value={upi}
              onChange={e => setUpi(e.target.value)}
              placeholder="UPI ID"
              className="w-full bg-neutral-100/80 dark:bg-[#171b26]/80 border border-neutral-200/80 dark:border-white/[0.08] rounded-xl px-3 py-2 text-neutral-900 dark:text-white font-mono outline-none focus:border-[#635bff] dark:focus:border-[#00f0ff]"
            />
          </div>

          <div className="flex items-center gap-2 mt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl border border-neutral-200 dark:border-white/10 text-neutral-700 dark:text-neutral-300 font-headline font-semibold text-xs"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex-1 py-2.5 rounded-xl bg-[#635bff] dark:bg-[#00f0ff] text-white dark:text-[#002022] font-headline font-bold text-xs shadow-md"
            >
              Save Entity
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
