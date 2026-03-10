'use client';

import Avatar from '@/components/ui/Avatar';
import { createClient } from '@/lib/supabase/client';
import { MAX_BIO_LENGTH } from '@/lib/constants';
import { validateImageFile } from '@/lib/utils';
import { Loader2 } from 'lucide-react';
import { ChangeEvent, FormEvent, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';

interface ProfileFormState {
  full_name: string;
  username: string;
  bio: string;
  website: string;
  avatar_url: string | null;
}

export default function EditProfilePage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [form, setForm] = useState<ProfileFormState>({
    full_name: '',
    username: '',
    bio: '',
    website: '',
    avatar_url: null,
  });
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) { router.push('/login'); return; }

        const { data } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();

        if (data) {
          setForm({
            full_name: data.full_name ?? '',
            username: data.username ?? '',
            bio: data.bio ?? '',
            website: data.website ?? '',
            avatar_url: data.avatar_url ?? null,
          });
        }
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [router]);

  const handleAvatarChange = (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const validationError = validateImageFile(file);
    if (validationError) { setError(validationError); return; }
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
    setError('');
  };

  const handleChange = (field: keyof ProfileFormState) => (
    e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => setForm((prev) => ({ ...prev, [field]: e.target.value }));

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      let avatarUrl = form.avatar_url;

      // Upload new avatar if selected
      if (avatarFile) {
        const formData = new FormData();
        formData.append('file', avatarFile);
        const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
        if (!uploadRes.ok) {
          const d = await uploadRes.json();
          throw new Error(d.error ?? 'Failed to upload avatar');
        }
        const { url } = await uploadRes.json();
        avatarUrl = url;
      }

      const { error: updateError } = await supabase
        .from('profiles')
        .update({
          full_name: form.full_name,
          username: form.username,
          bio: form.bio,
          website: form.website,
          avatar_url: avatarUrl,
        })
        .eq('id', user.id);

      if (updateError) throw updateError;

      setSuccess('Profile saved!');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save profile');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center py-20">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-xl px-4 py-8">
      <h1 className="text-lg font-semibold text-gray-900 mb-6">Edit profile</h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-5">
        {/* Avatar */}
        <div className="flex items-center gap-5">
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 relative group"
            aria-label="Change profile photo"
          >
            <Avatar src={avatarPreview ?? form.avatar_url} alt={form.username} size="xl" />
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/30 opacity-0 group-hover:opacity-100 transition-opacity">
              <span className="text-white text-xs font-semibold">Change</span>
            </div>
          </button>
          <div>
            <p className="text-sm font-semibold text-gray-900">{form.username}</p>
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="text-sm font-semibold text-blue-500 hover:text-blue-600 transition-colors"
            >
              Change profile photo
            </button>
          </div>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/gif,image/webp"
            className="hidden"
            onChange={handleAvatarChange}
          />
        </div>

        {/* Full name */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Full name</label>
          <input
            type="text"
            value={form.full_name}
            onChange={handleChange('full_name')}
            placeholder="Full name"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>

        {/* Username */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Username</label>
          <input
            type="text"
            value={form.username}
            onChange={handleChange('username')}
            placeholder="Username"
            required
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>

        {/* Bio */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Bio</label>
          <textarea
            rows={3}
            value={form.bio}
            onChange={handleChange('bio')}
            placeholder="Bio"
            maxLength={MAX_BIO_LENGTH}
            className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <p className="self-end text-xs text-gray-400">{form.bio.length} / {MAX_BIO_LENGTH}</p>
        </div>

        {/* Website */}
        <div className="flex flex-col gap-1">
          <label className="text-sm font-medium text-gray-700">Website</label>
          <input
            type="url"
            value={form.website}
            onChange={handleChange('website')}
            placeholder="https://yoursite.com"
            className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
        </div>

        {error && <p className="text-sm text-red-500">{error}</p>}
        {success && <p className="text-sm text-green-600">{success}</p>}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => router.back()}
            className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={saving}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {saving ? <><Loader2 className="h-4 w-4 animate-spin" /> Saving…</> : 'Save'}
          </button>
        </div>
      </form>
    </div>
  );
}
