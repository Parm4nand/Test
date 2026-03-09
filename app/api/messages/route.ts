import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { MESSAGES_PER_PAGE } from '@/lib/constants';

export async function GET(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const conversationId = searchParams.get('conversation_id');

    if (conversationId) {
      // Fetch messages for a specific conversation
      const { data, error } = await supabase
        .from('messages')
        .select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true })
        .limit(MESSAGES_PER_PAGE);

      if (error) throw error;

      return NextResponse.json({ messages: data });
    }

    // Fetch conversations for the current user
    const { data, error } = await supabase
      .from('conversations')
      .select('*, other_user:profiles!conversations_participant_2_fkey(*)')
      .or(`participant_1.eq.${user.id},participant_2.eq.${user.id}`)
      .order('last_message_at', { ascending: false });

    if (error) throw error;

    return NextResponse.json({ conversations: data });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch messages' },
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
    const { receiverId, content } = body;

    if (!receiverId || !content) {
      return NextResponse.json({ error: 'receiverId and content are required' }, { status: 400 });
    }

    // Find or create conversation
    const participant1 = user.id < receiverId ? user.id : receiverId;
    const participant2 = user.id < receiverId ? receiverId : user.id;

    let conversationId: string;

    const { data: existing } = await supabase
      .from('conversations')
      .select('id')
      .eq('participant_1', participant1)
      .eq('participant_2', participant2)
      .single();

    if (existing) {
      conversationId = existing.id;
    } else {
      const { data: newConv, error: convError } = await supabase
        .from('conversations')
        .insert({ participant_1: participant1, participant_2: participant2 })
        .select('id')
        .single();

      if (convError) throw convError;
      conversationId = newConv.id;
    }

    const { data, error } = await supabase
      .from('messages')
      .insert({
        conversation_id: conversationId,
        sender_id: user.id,
        receiver_id: receiverId,
        content,
      })
      .select('*, sender:profiles!sender_id(*), receiver:profiles!receiver_id(*)')
      .single();

    if (error) throw error;

    // Update conversation last_message_at
    await supabase
      .from('conversations')
      .update({ last_message_at: new Date().toISOString(), last_message: content })
      .eq('id', conversationId);

    return NextResponse.json({ message: data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to send message' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const supabase = await createClient();

    const { data: { user }, error: authError } = await supabase.auth.getUser();
    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { conversationId } = body;

    if (!conversationId) {
      return NextResponse.json({ error: 'conversationId is required' }, { status: 400 });
    }

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .eq('receiver_id', user.id)
      .eq('read', false);

    if (error) throw error;

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to mark messages as read' },
      { status: 500 }
    );
  }
}
