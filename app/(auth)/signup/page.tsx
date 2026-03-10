'use client';

import { createClient } from '@/lib/supabase/client';
import { generateUsername } from '@/lib/utils';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { FormEvent, useState } from 'react';

export default function SignupPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSignup = async (e: FormEvent) => {
    e.preventDefault();
    setError('');

    if (username.length < 3) {
      setError('Username must be at least 3 characters.');
      return;
    }
    if (!/^[a-z0-9._]+$/.test(username)) {
      setError('Username can only contain lowercase letters, numbers, dots, and underscores.');
      return;
    }
    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();

      // Check username uniqueness
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('username', username)
        .maybeSingle();

      if (existing) {
        setError('That username is already taken. Please choose another.');
        return;
      }

      const { error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { full_name: fullName, username },
          emailRedirectTo: `${window.location.origin}/api/auth/callback`,
        },
      });

      if (signUpError) {
        setError(signUpError.message);
        return;
      }

      router.push('/');
      router.refresh();
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Card */}
      <div className="bg-white border border-gray-200 rounded-sm px-10 py-10 flex flex-col items-center gap-4">
        {/* Logo */}
        <h1 className="text-4xl font-bold tracking-tighter text-gray-900 mb-1" style={{ fontFamily: 'Billabong, cursive' }}>
          Instaclone
        </h1>
        <p className="text-base font-semibold text-gray-500 text-center leading-snug">
          Sign up to see photos and videos from your friends.
        </p>

        <form onSubmit={handleSignup} className="flex flex-col gap-2 w-full mt-2">
          <input
            type="email"
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            autoComplete="email"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Full name"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            required
            autoComplete="name"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <input
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(generateUsername(e.target.value))}
            required
            autoComplete="username"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            autoComplete="new-password"
            className="w-full rounded border border-gray-300 bg-gray-50 px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-gray-400 focus:outline-none"
          />
          {error && <p className="text-xs text-red-500 text-center">{error}</p>}
          <button
            type="submit"
            disabled={loading || !email || !fullName || !username || !password}
            className="mt-1 w-full rounded-lg bg-blue-500 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Signing up…' : 'Sign up'}
          </button>
        </form>

        <p className="text-xs text-gray-400 text-center mt-2">
          By signing up, you agree to our{' '}
          <span className="font-semibold text-gray-700">Terms</span>,{' '}
          <span className="font-semibold text-gray-700">Privacy Policy</span> and{' '}
          <span className="font-semibold text-gray-700">Cookies Policy</span>.
        </p>
      </div>

      {/* Log in link */}
      <div className="bg-white border border-gray-200 rounded-sm px-10 py-5 text-center text-sm text-gray-700">
        Have an account?{' '}
        <Link href="/login" className="text-blue-500 font-semibold hover:underline">
          Log in
        </Link>
      </div>
    </div>
  );
}
