import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();
    const { searchParams } = new URL(request.url);
    const q = searchParams.get('q');
    const username = searchParams.get('username');
    const limit = parseInt(searchParams.get('limit') ?? '10', 10);

    if (username) {
      // Fetch a single user profile by exact username
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('username', username)
        .single();

      if (error) {
        if (error.code === 'PGRST116') {
          return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }
        throw error;
      }

      return NextResponse.json({ profile: data });
    }

    if (!q) {
      return NextResponse.json({ error: 'q or username query parameter is required' }, { status: 400 });
    }

    // Search users by username or full_name
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .or(`username.ilike.%${q}%,full_name.ilike.%${q}%`)
      .limit(limit);

    if (error) throw error;

    return NextResponse.json({ users: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch users' },
      { status: 500 }
    );
  }
}
