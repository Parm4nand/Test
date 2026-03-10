-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- Profiles table (extends Supabase Auth users)
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  username text unique not null,
  full_name text,
  avatar_url text,
  bio text,
  website text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Posts table
create table public.posts (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  caption text,
  location text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Comments table
create table public.comments (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Likes table
create table public.likes (
  id uuid default uuid_generate_v4() primary key,
  post_id uuid references public.posts(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(post_id, user_id)
);

-- Follows table
create table public.follows (
  follower_id uuid references public.profiles(id) on delete cascade not null,
  following_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  primary key (follower_id, following_id)
);

-- Stories table
create table public.stories (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  image_url text not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  expires_at timestamp with time zone default (timezone('utc'::text, now()) + interval '24 hours') not null
);

-- Conversations table
create table public.conversations (
  id uuid default uuid_generate_v4() primary key,
  participant_1 uuid references public.profiles(id) on delete cascade not null,
  participant_2 uuid references public.profiles(id) on delete cascade not null,
  last_message_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(participant_1, participant_2)
);

-- Messages table
create table public.messages (
  id uuid default uuid_generate_v4() primary key,
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  sender_id uuid references public.profiles(id) on delete cascade not null,
  content text not null,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Notifications table
create table public.notifications (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  actor_id uuid references public.profiles(id) on delete cascade not null,
  type text not null check (type in ('like', 'comment', 'follow')),
  post_id uuid references public.posts(id) on delete cascade,
  read boolean default false not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Bookmarks table
create table public.bookmarks (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  post_id uuid references public.posts(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, post_id)
);

-- Row Level Security
alter table public.profiles enable row level security;
alter table public.posts enable row level security;
alter table public.comments enable row level security;
alter table public.likes enable row level security;
alter table public.follows enable row level security;
alter table public.stories enable row level security;
alter table public.conversations enable row level security;
alter table public.messages enable row level security;
alter table public.notifications enable row level security;
alter table public.bookmarks enable row level security;

-- Profiles policies
create policy "Public profiles are viewable by everyone" on public.profiles for select using (true);
create policy "Users can insert their own profile" on public.profiles for insert with check (auth.uid() = id);
create policy "Users can update their own profile" on public.profiles for update using (auth.uid() = id);

-- Posts policies
create policy "Posts are viewable by everyone" on public.posts for select using (true);
create policy "Users can insert their own posts" on public.posts for insert with check (auth.uid() = user_id);
create policy "Users can update their own posts" on public.posts for update using (auth.uid() = user_id);
create policy "Users can delete their own posts" on public.posts for delete using (auth.uid() = user_id);

-- Comments policies
create policy "Comments are viewable by everyone" on public.comments for select using (true);
create policy "Authenticated users can insert comments" on public.comments for insert with check (auth.uid() = user_id);
create policy "Users can delete their own comments" on public.comments for delete using (auth.uid() = user_id);

-- Likes policies
create policy "Likes are viewable by everyone" on public.likes for select using (true);
create policy "Authenticated users can insert likes" on public.likes for insert with check (auth.uid() = user_id);
create policy "Users can delete their own likes" on public.likes for delete using (auth.uid() = user_id);

-- Follows policies
create policy "Follows are viewable by everyone" on public.follows for select using (true);
create policy "Authenticated users can follow" on public.follows for insert with check (auth.uid() = follower_id);
create policy "Users can unfollow" on public.follows for delete using (auth.uid() = follower_id);

-- Stories policies
create policy "Stories are viewable by everyone" on public.stories for select using (true);
create policy "Users can insert their own stories" on public.stories for insert with check (auth.uid() = user_id);
create policy "Users can delete their own stories" on public.stories for delete using (auth.uid() = user_id);

-- Conversations policies
create policy "Users can view their own conversations" on public.conversations for select using (auth.uid() = participant_1 or auth.uid() = participant_2);
create policy "Authenticated users can create conversations" on public.conversations for insert with check (auth.uid() = participant_1 or auth.uid() = participant_2);

-- Messages policies
create policy "Users can view messages in their conversations" on public.messages for select using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
    and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  )
);
create policy "Authenticated users can send messages" on public.messages for insert with check (auth.uid() = sender_id);
create policy "Users can update read status of their messages" on public.messages for update using (
  exists (
    select 1 from public.conversations c
    where c.id = conversation_id
    and (c.participant_1 = auth.uid() or c.participant_2 = auth.uid())
  )
);

-- Notifications policies
create policy "Users can view their own notifications" on public.notifications for select using (auth.uid() = user_id);
create policy "System can insert notifications" on public.notifications for insert with check (true);
create policy "Users can update their own notifications" on public.notifications for update using (auth.uid() = user_id);

-- Bookmarks policies
create policy "Users can view their own bookmarks" on public.bookmarks for select using (auth.uid() = user_id);
create policy "Authenticated users can bookmark" on public.bookmarks for insert with check (auth.uid() = user_id);
create policy "Users can remove their own bookmarks" on public.bookmarks for delete using (auth.uid() = user_id);

-- Functions
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id, username, full_name, avatar_url)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'username', split_part(new.email, '@', 1)),
    coalesce(new.raw_user_meta_data->>'full_name', new.raw_user_meta_data->>'name'),
    new.raw_user_meta_data->>'avatar_url'
  );
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexes for performance
create index idx_posts_user_id on public.posts(user_id);
create index idx_posts_created_at on public.posts(created_at desc);
create index idx_comments_post_id on public.comments(post_id);
create index idx_likes_post_id on public.likes(post_id);
create index idx_likes_user_id on public.likes(user_id);
create index idx_follows_follower_id on public.follows(follower_id);
create index idx_follows_following_id on public.follows(following_id);
create index idx_stories_user_id on public.stories(user_id);
create index idx_stories_expires_at on public.stories(expires_at);
create index idx_messages_conversation_id on public.messages(conversation_id);
create index idx_notifications_user_id on public.notifications(user_id);
create index idx_bookmarks_user_id on public.bookmarks(user_id);

-- Enable Realtime
alter publication supabase_realtime add table public.likes;
alter publication supabase_realtime add table public.comments;
alter publication supabase_realtime add table public.notifications;
alter publication supabase_realtime add table public.messages;
alter publication supabase_realtime add table public.follows;
