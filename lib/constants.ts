export const APP_NAME = "Instaclone";
export const APP_DESCRIPTION = "Share your moments with the world";

export const MAX_CAPTION_LENGTH = 2200;
export const MAX_COMMENT_LENGTH = 300;
export const MAX_BIO_LENGTH = 150;
export const STORY_DURATION_HOURS = 24;

export const POSTS_PER_PAGE = 12;
export const COMMENTS_PER_PAGE = 20;
export const MESSAGES_PER_PAGE = 50;
export const NOTIFICATIONS_PER_PAGE = 30;

export const AVATAR_PLACEHOLDER = "/placeholder-avatar.png";
export const POST_PLACEHOLDER = "/placeholder-post.png";

export const ROUTES = {
  HOME: "/",
  LOGIN: "/login",
  SIGNUP: "/signup",
  EXPLORE: "/explore",
  CREATE: "/create",
  MESSAGES: "/messages",
  NOTIFICATIONS: "/notifications",
  PROFILE: (username: string) => `/profile/${username}`,
  POST: (id: string) => `/post/${id}`,
  STORIES: (userId: string) => `/stories/${userId}`,
};
