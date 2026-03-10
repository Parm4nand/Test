'use client';

import { MAX_CAPTION_LENGTH } from '@/lib/constants';
import { validateImageFile } from '@/lib/utils';
import { ImagePlus, Loader2, X } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { ChangeEvent, DragEvent, FormEvent, useRef, useState } from 'react';

type Step = 'upload' | 'caption';

export default function CreatePage() {
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);

  const [step, setStep] = useState<Step>('upload');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [caption, setCaption] = useState('');
  const [location, setLocation] = useState('');
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [dragging, setDragging] = useState(false);

  const handleFile = (f: File) => {
    const validationError = validateImageFile(f);
    if (validationError) {
      setError(validationError);
      return;
    }
    setError('');
    setFile(f);
    setPreview(URL.createObjectURL(f));
    setStep('caption');
  };

  const handleInputChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) handleFile(f);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(false);
    const f = e.dataTransfer.files?.[0];
    if (f) handleFile(f);
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => setDragging(false);

  const handleRemoveFile = () => {
    setFile(null);
    setPreview(null);
    setStep('upload');
    setCaption('');
    setLocation('');
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!file) return;
    setUploading(true);
    setError('');
    try {
      // Upload image
      const formData = new FormData();
      formData.append('file', file);
      const uploadRes = await fetch('/api/upload', { method: 'POST', body: formData });
      if (!uploadRes.ok) {
        const uploadData = await uploadRes.json();
        throw new Error(uploadData.error ?? 'Upload failed');
      }
      const { url } = await uploadRes.json();

      // Create post
      const postRes = await fetch('/api/posts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ image_url: url, caption: caption.trim() || null, location: location.trim() || null }),
      });
      if (!postRes.ok) {
        const postData = await postRes.json();
        throw new Error(postData.error ?? 'Failed to create post');
      }

      router.push('/');
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Something went wrong');
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="flex justify-center px-4 py-8">
      <div className="w-full max-w-lg">
        <h1 className="text-lg font-semibold text-gray-900 mb-6 text-center">Create new post</h1>

        {step === 'upload' ? (
          <div
            className={`flex flex-col items-center justify-center gap-4 rounded-xl border-2 border-dashed p-16 transition-colors cursor-pointer ${
              dragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50 hover:border-gray-400'
            }`}
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => inputRef.current?.click()}
          >
            <div className="rounded-full bg-gray-100 p-4">
              <ImagePlus className="h-10 w-10 text-gray-400" />
            </div>
            <div className="text-center">
              <p className="text-base font-medium text-gray-700">Drag photo here</p>
              <p className="mt-1 text-sm text-gray-400">or click to browse</p>
            </div>
            <p className="text-xs text-gray-400">JPEG, PNG, GIF, WebP — up to 10 MB</p>
            {error && <p className="text-sm text-red-500">{error}</p>}
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
              className="hidden"
              onChange={handleInputChange}
            />
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            {/* Preview */}
            <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100">
              {preview && (
                <Image
                  src={preview}
                  alt="Preview"
                  fill
                  className="object-cover"
                  unoptimized
                />
              )}
              <button
                type="button"
                onClick={handleRemoveFile}
                aria-label="Remove image"
                className="absolute right-3 top-3 rounded-full bg-black/60 p-1.5 text-white hover:bg-black/80 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            {/* Caption */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Caption</label>
              <textarea
                rows={4}
                value={caption}
                onChange={(e) => setCaption(e.target.value)}
                maxLength={MAX_CAPTION_LENGTH}
                placeholder="Write a caption…"
                className="w-full resize-none rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
              />
              <p className="self-end text-xs text-gray-400">
                {caption.length} / {MAX_CAPTION_LENGTH}
              </p>
            </div>

            {/* Location */}
            <div className="flex flex-col gap-1">
              <label className="text-sm font-medium text-gray-700">Location</label>
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="Add location"
                className="w-full rounded-lg border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
              />
            </div>

            {error && <p className="text-sm text-red-500 text-center">{error}</p>}

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleRemoveFile}
                className="flex-1 rounded-lg border border-gray-300 py-2 text-sm font-semibold text-gray-700 transition hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={uploading}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
              >
                {uploading ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Sharing…
                  </>
                ) : (
                  'Share'
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
