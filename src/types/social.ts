import { Database } from './database';

export type PostType = 'weight_milestone' | 'food_log' | 'activity_log' | 'progress_photo' | 'general';
export type VisibilityType = 'public' | 'followers' | 'private';
export type InteractionType = 'like' | 'comment' | 'hug' | 'share';
export type FollowStatus = 'active' | 'blocked' | 'muted';

export interface SocialPost {
  id: string;
  user_id: string;
  post_type: PostType;
  content: string | null;
  media_urls: string[] | null;
  related_food_log_id: string | null;
  related_activity_log_id: string | null;
  related_weight_log_id: string | null;
  visibility: VisibilityType;
  likes_count: number;
  comments_count: number;
  hugs_count: number;
  is_featured: boolean;
  created_at: string;
  updated_at: string;
}

export interface SocialInteraction {
  id: string;
  user_id: string;
  post_id: string;
  interaction_type: InteractionType;
  comment_content: string | null;
  created_at: string;
  updated_at: string;
}

export interface UserFollow {
  id: string;
  follower_id: string;
  following_id: string;
  created_at: string;
  status: FollowStatus;
}

export interface PostWithUser extends SocialPost {
  user: {
    first_name: string;
    last_name: string | null;
    avatar_url?: string | null;
  };
}

export interface CommentWithUser extends SocialInteraction {
  user: {
    first_name: string;
    last_name: string | null;
    avatar_url?: string | null;
  };
}

export interface CreatePostParams {
  user_id: string;
  post_type: PostType;
  content: string | null;
  media_urls?: string[] | null;
  related_food_log_id?: string | null;
  related_activity_log_id?: string | null;
  related_weight_log_id?: string | null;
  visibility?: VisibilityType;
}

export interface InteractWithPostParams {
  user_id: string;
  post_id: string;
  interaction_type: InteractionType;
  comment_content?: string | null;
} 