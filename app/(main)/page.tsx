import Feed from '@/components/feed/Feed';
import StoryBar from '@/components/stories/StoryBar';
import { createClient } from '@/lib/supabase/server';
import { Post, Story } from '@/types';

async function getPosts(): Promise<Post[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/posts`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    return data.posts ?? [];
  } catch {
    return [];
  }
}

async function getStories(): Promise<Story[]> {
  try {
    const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'}/api/stories`, {
      cache: 'no-store',
    });
    if (!res.ok) return [];
    const data = await res.json();
    // stories API returns grouped objects; flatten them
    if (Array.isArray(data.stories)) {
      return data.stories.flatMap((g: { stories: Story[] }) => g.stories ?? []);
    }
    return [];
  } catch {
    return [];
  }
}

export default async function HomePage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  let currentProfile = null;
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();
    currentProfile = data;
  }

  const [posts, stories] = await Promise.all([getPosts(), getStories()]);

  return (
    <div className="flex justify-center">
      <div className="w-full max-w-xl">
        <StoryBar stories={stories} currentUser={currentProfile} />
        <Feed posts={posts} />
      </div>
    </div>
  );
}
