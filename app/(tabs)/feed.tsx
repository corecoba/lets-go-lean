import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList, 
  ActivityIndicator, 
  Image, 
  TouchableOpacity,
  RefreshControl 
} from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useAuth } from '../../src/contexts/AuthContext';
import { supabase } from '../../src/lib/supabase';
import { Ionicons, FontAwesome } from '@expo/vector-icons';
import { PostWithUser } from '../../src/types/social';
import Colors from '../../src/constants/Colors';
import { useColorScheme } from 'react-native';

export default function FeedScreen() {
  const insets = useSafeAreaInsets();
  const { session } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  
  const [posts, setPosts] = useState<PostWithUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadPosts() {
    try {
      setError(null);
      
      // Fetch posts with user information
      const { data, error } = await supabase
        .from('social_posts')
        .select(`
          *,
          user:users(first_name, last_name)
        `)
        .order('created_at', { ascending: false });

      if (error) {
        throw error;
      }

      if (data) {
        setPosts(data as PostWithUser[]);
      }
    } catch (error: any) {
      console.error('Error loading posts:', error.message);
      setError('Failed to load posts. Please try again later.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  async function handleLike(postId: string) {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase.rpc('interact_with_post', {
        user_id: session.user.id,
        post_id: postId,
        interaction_type: 'like'
      });
      
      if (error) throw error;
      
      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          // Toggle like
          const userLiked = post.likes_count > 0; // This is a simplified check - ideally would check if user liked it
          return {
            ...post,
            likes_count: userLiked ? post.likes_count - 1 : post.likes_count + 1
          };
        }
        return post;
      }));
    } catch (error: any) {
      console.error('Error liking post:', error.message);
    }
  }

  async function handleHug(postId: string) {
    if (!session?.user) return;
    
    try {
      const { data, error } = await supabase.rpc('interact_with_post', {
        user_id: session.user.id,
        post_id: postId,
        interaction_type: 'hug'
      });
      
      if (error) throw error;
      
      // Update local state
      setPosts(posts.map(post => {
        if (post.id === postId) {
          // Toggle hug
          const userHugged = post.hugs_count > 0; // This is a simplified check
          return {
            ...post,
            hugs_count: userHugged ? post.hugs_count - 1 : post.hugs_count + 1
          };
        }
        return post;
      }));
    } catch (error: any) {
      console.error('Error hugging post:', error.message);
    }
  }

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    loadPosts();
  }, []);

  useEffect(() => {
    loadPosts();
  }, []);

  function formatDate(dateStr: string) {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffSecs = Math.floor(diffMs / 1000);
    const diffMins = Math.floor(diffSecs / 60);
    const diffHours = Math.floor(diffMins / 60);
    const diffDays = Math.floor(diffHours / 24);

    if (diffSecs < 60) {
      return `${diffSecs}s ago`;
    } else if (diffMins < 60) {
      return `${diffMins}m ago`;
    } else if (diffHours < 24) {
      return `${diffHours}h ago`;
    } else if (diffDays < 7) {
      return `${diffDays}d ago`;
    } else {
      return date.toLocaleDateString();
    }
  }

  function renderPostMedia(post: PostWithUser) {
    if (!post.media_urls || post.media_urls.length === 0) {
      return null;
    }

    return (
      <View style={styles.mediaContainer}>
        <Image 
          source={{ uri: post.media_urls[0] as string }} 
          style={styles.mediaImage} 
          resizeMode="cover"
        />
      </View>
    );
  }

  function renderPostBadge(post: PostWithUser) {
    switch (post.post_type) {
      case 'weight_milestone':
        return (
          <View style={[styles.badge, { backgroundColor: colors.success }]}>
            <Text style={styles.badgeText}>Weight Milestone</Text>
          </View>
        );
      case 'food_log':
        return (
          <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
            <Text style={styles.badgeText}>Food</Text>
          </View>
        );
      case 'activity_log':
        return (
          <View style={[styles.badge, { backgroundColor: colors.primary }]}>
            <Text style={styles.badgeText}>Activity</Text>
          </View>
        );
      case 'progress_photo':
        return (
          <View style={[styles.badge, { backgroundColor: colors.warning }]}>
            <Text style={styles.badgeText}>Progress</Text>
          </View>
        );
      default:
        return null;
    }
  }

  function renderItem({ item }: { item: PostWithUser }) {
    return (
      <View style={styles.postContainer}>
        {/* Post Header */}
        <View style={styles.postHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatarText}>
              {item.user.first_name.charAt(0).toUpperCase()}
            </Text>
          </View>
          <View style={styles.postHeaderText}>
            <Text style={styles.userName}>
              {item.user.first_name} {item.user.last_name || ''}
            </Text>
            <Text style={styles.postTime}>{formatDate(item.created_at)}</Text>
          </View>
          {renderPostBadge(item)}
        </View>
        
        {/* Post Content */}
        <View style={styles.postContent}>
          {item.content && <Text style={styles.postText}>{item.content}</Text>}
          {renderPostMedia(item)}
        </View>
        
        {/* Post Stats */}
        <View style={styles.postStats}>
          <Text style={styles.statsText}>
            {item.likes_count} {item.likes_count === 1 ? 'like' : 'likes'} · {item.comments_count} {item.comments_count === 1 ? 'comment' : 'comments'} · {item.hugs_count} {item.hugs_count === 1 ? 'hug' : 'hugs'}
          </Text>
        </View>
        
        {/* Post Actions */}
        <View style={styles.postActions}>
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleLike(item.id)}
          >
            <Ionicons name="heart-outline" size={24} color={colors.text} />
            <Text style={styles.actionText}>Like</Text>
          </TouchableOpacity>
          
          <TouchableOpacity style={styles.actionButton} onPress={() => {}}>
            <Ionicons name="chatbubble-outline" size={24} color={colors.text} />
            <Text style={styles.actionText}>Comment</Text>
          </TouchableOpacity>
          
          <TouchableOpacity 
            style={styles.actionButton} 
            onPress={() => handleHug(item.id)}
          >
            <FontAwesome name="hand-peace-o" size={22} color={colors.text} />
            <Text style={styles.actionText}>Hug</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  function renderEmptyList() {
    if (loading) {
      return (
        <View style={styles.emptyContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
          <Text style={styles.emptyText}>Loading posts...</Text>
        </View>
      );
    }

    if (error) {
      return (
        <View style={styles.emptyContainer}>
          <Ionicons name="alert-circle" size={48} color={colors.error} />
          <Text style={styles.emptyText}>{error}</Text>
          <TouchableOpacity style={styles.retryButton} onPress={loadPosts}>
            <Text style={styles.retryButtonText}>Retry</Text>
          </TouchableOpacity>
        </View>
      );
    }

    return (
      <View style={styles.emptyContainer}>
        <Ionicons name="people" size={48} color={colors.primary} />
        <Text style={styles.emptyTitle}>Welcome to Let's Go Lean!</Text>
        <Text style={styles.emptyText}>
          This is where you'll see posts from the community. Share your progress, achievements, and meals to inspire others!
        </Text>
        <TouchableOpacity style={styles.createPostButton}>
          <Text style={styles.createPostButtonText}>Create Your First Post</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Feed</Text>
        <TouchableOpacity style={styles.headerAction}>
          <Ionicons name="add-circle-outline" size={24} color={colors.primary} />
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={posts}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        ListEmptyComponent={renderEmptyList}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[colors.primary]}
            tintColor={colors.primary}
          />
        }
      />
      
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  headerAction: {
    padding: 4,
  },
  listContainer: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  postContainer: {
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
    paddingVertical: 12,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  avatarContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  avatarText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  postHeaderText: {
    flex: 1,
  },
  userName: {
    fontWeight: 'bold',
    fontSize: 16,
  },
  postTime: {
    fontSize: 12,
    color: '#757575',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginLeft: 8,
  },
  badgeText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: 'bold',
  },
  postContent: {
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  postText: {
    fontSize: 16,
    lineHeight: 22,
    marginBottom: 8,
  },
  mediaContainer: {
    width: '100%',
    height: 300,
    borderRadius: 8,
    overflow: 'hidden',
    backgroundColor: '#f0f0f0',
  },
  mediaImage: {
    width: '100%',
    height: '100%',
  },
  postStats: {
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  statsText: {
    fontSize: 14,
    color: '#757575',
  },
  postActions: {
    flexDirection: 'row',
    borderTopWidth: 1,
    borderTopColor: '#e0e0e0',
    paddingTop: 8,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 8,
  },
  actionText: {
    marginLeft: 4,
    fontSize: 14,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 24,
    minHeight: 400,
  },
  emptyTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginVertical: 12,
    textAlign: 'center',
  },
  emptyText: {
    fontSize: 16,
    textAlign: 'center',
    color: '#757575',
    marginVertical: 8,
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 24,
  },
  retryButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
  createPostButton: {
    marginTop: 24,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: '#2196F3',
    borderRadius: 24,
  },
  createPostButtonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
}); 