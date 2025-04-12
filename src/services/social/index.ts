import { supabase } from '../../lib/supabase';
import { 
  CreatePostParams, 
  InteractWithPostParams, 
  PostWithUser, 
  SocialInteraction, 
  SocialPost, 
  CommentWithUser 
} from '../../types/social';

/**
 * Get all social posts sorted by creation date (newest first)
 */
export async function getAllPosts(): Promise<PostWithUser[]> {
  const { data, error } = await supabase
    .from('social_posts')
    .select(`
      *,
      user:users(id, first_name, last_name)
    `)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }

  return data as PostWithUser[];
}

/**
 * Get posts from a specific user
 */
export async function getUserPosts(userId: string): Promise<PostWithUser[]> {
  const { data, error } = await supabase
    .from('social_posts')
    .select(`
      *,
      user:users(id, first_name, last_name)
    `)
    .eq('user_id', userId)
    .eq('visibility', 'public')
    .order('created_at', { ascending: false });

  if (error) {
    console.error(`Error fetching posts for user ${userId}:`, error);
    throw error;
  }

  return data as PostWithUser[];
}

/**
 * Create a new post
 */
export async function createPost(params: CreatePostParams): Promise<string> {
  const { data, error } = await supabase.rpc('create_post', {
    user_id: params.user_id,
    post_type: params.post_type,
    content: params.content,
    media_urls: params.media_urls,
    related_food_log_id: params.related_food_log_id,
    related_activity_log_id: params.related_activity_log_id,
    related_weight_log_id: params.related_weight_log_id,
    visibility: params.visibility || 'public'
  });

  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }

  return data as string;
}

/**
 * Get a specific post by ID
 */
export async function getPostById(postId: string): Promise<PostWithUser> {
  const { data, error } = await supabase
    .from('social_posts')
    .select(`
      *,
      user:users(id, first_name, last_name)
    `)
    .eq('id', postId)
    .single();

  if (error) {
    console.error(`Error fetching post ${postId}:`, error);
    throw error;
  }

  return data as PostWithUser;
}

/**
 * Delete a post
 */
export async function deletePost(postId: string): Promise<void> {
  const { error } = await supabase
    .from('social_posts')
    .delete()
    .eq('id', postId);

  if (error) {
    console.error(`Error deleting post ${postId}:`, error);
    throw error;
  }
}

/**
 * Like, comment, or hug a post
 */
export async function interactWithPost(params: InteractWithPostParams): Promise<string> {
  const { data, error } = await supabase.rpc('interact_with_post', {
    user_id: params.user_id,
    post_id: params.post_id,
    interaction_type: params.interaction_type,
    comment_content: params.comment_content
  });

  if (error) {
    console.error('Error interacting with post:', error);
    throw error;
  }

  return data as string;
}

/**
 * Get comments for a specific post
 */
export async function getPostComments(postId: string): Promise<CommentWithUser[]> {
  const { data, error } = await supabase
    .from('social_interactions')
    .select(`
      *,
      user:users(id, first_name, last_name)
    `)
    .eq('post_id', postId)
    .eq('interaction_type', 'comment')
    .order('created_at', { ascending: true });

  if (error) {
    console.error(`Error fetching comments for post ${postId}:`, error);
    throw error;
  }

  return data as CommentWithUser[];
}

/**
 * Follow a user
 */
export async function followUser(followerId: string, followingId: string): Promise<string> {
  const { data, error } = await supabase
    .from('user_follows')
    .insert({
      follower_id: followerId,
      following_id: followingId,
      status: 'active'
    })
    .select('id')
    .single();

  if (error) {
    console.error(`Error following user ${followingId}:`, error);
    throw error;
  }

  return data.id;
}

/**
 * Unfollow a user
 */
export async function unfollowUser(followerId: string, followingId: string): Promise<void> {
  const { error } = await supabase
    .from('user_follows')
    .delete()
    .eq('follower_id', followerId)
    .eq('following_id', followingId);

  if (error) {
    console.error(`Error unfollowing user ${followingId}:`, error);
    throw error;
  }
}

/**
 * Check if a user is following another user
 */
export async function isFollowing(followerId: string, followingId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('user_follows')
    .select('id')
    .eq('follower_id', followerId)
    .eq('following_id', followingId)
    .eq('status', 'active')
    .single();

  if (error && error.code !== 'PGRST116') { // PGRST116 is the error code for no rows returned
    console.error(`Error checking follow status for users ${followerId} and ${followingId}:`, error);
    throw error;
  }

  return !!data;
}

/**
 * Get followers of a user
 */
export async function getUserFollowers(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      id,
      follower:users!follower_id(id, first_name, last_name),
      created_at,
      status
    `)
    .eq('following_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error(`Error fetching followers for user ${userId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Get users followed by a user
 */
export async function getUserFollowing(userId: string): Promise<any[]> {
  const { data, error } = await supabase
    .from('user_follows')
    .select(`
      id,
      following:users!following_id(id, first_name, last_name),
      created_at,
      status
    `)
    .eq('follower_id', userId)
    .eq('status', 'active');

  if (error) {
    console.error(`Error fetching following for user ${userId}:`, error);
    throw error;
  }

  return data;
}

/**
 * Get suggested users to follow (simple implementation - just gets users with recent posts)
 */
export async function getSuggestedUsers(currentUserId: string, limit: number = 5): Promise<any[]> {
  // Get users with recent posts who aren't the current user
  const { data, error } = await supabase
    .from('social_posts')
    .select(`
      user:users(id, first_name, last_name)
    `)
    .neq('user_id', currentUserId)
    .order('created_at', { ascending: false })
    .limit(20); // Get more than we need to have variety

  if (error) {
    console.error('Error fetching suggested users:', error);
    throw error;
  }

  // Filter unique users and limit to requested amount
  const uniqueUsers = Array.from(
    new Map(data.map(item => [item.user.id, item.user])).values()
  ).slice(0, limit);

  return uniqueUsers;
} 