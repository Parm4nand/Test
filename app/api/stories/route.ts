import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { STORY_DURATION_HOURS } from '@/lib/constants';

export async function GET() {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const now = new Date().toISOString();

    // Fetch active (non-expired) stories, joined with profiles
    const { data, error } = await supabase
      .from('stories')
      .select('*, user:profiles(*)')
      .gt('expires_at', now)
      .order('created_at', { ascending: false });

    if (error) throw error;

    // Group stories by user
    const grouped = (data ?? []).reduce<Record<string, { user: unknown; stories: unknown[] }>>(
      (acc, story) => {
        const uid = story.user_id as string;
        if (!acc[uid]) {
          acc[uid] = { user: story.user, stories: [] };
        }
        acc[uid].stories.push(story);
        return acc;
      },
      {}
    );

    return NextResponse.json({ stories: Object.values(grouped) });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch stories' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { image_url } = body;

    if (!image_url) {
      return NextResponse.json({ error: 'image_url is required' }, { status: 400 });
    }

    const expiresAt = new Date(
      Date.now() + STORY_DURATION_HOURS * 60 * 60 * 1000
    ).toISOString();

    const { data, error } = await supabase
      .from('stories')
      .insert({ user_id: user.id, image_url, expires_at: expiresAt })
      .select('*, user:profiles(*)')
      .single();

    if (error) throw error;

    return NextResponse.json({ story: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create story' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const storyId = searchParams.get('storyId');

    if (!storyId) {
      return NextResponse.json({ error: 'storyId is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('stories')
      .delete()
      .eq('id', storyId)
      .eq('user_id', user.id);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete story' },
      { status: 500 }
    );
  }
}
