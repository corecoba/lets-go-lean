import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { createPost } from '../../services/social';
import { CreatePostParams, PostType } from '../../types/social';
import { useAuth } from '../../contexts/AuthContext';
import Colors from '../../constants/Colors';
import { useColorScheme } from 'react-native';

type Props = {
  visible: boolean;
  onClose: () => void;
  onPostCreated: () => void;
  initialPostType?: PostType;
  relatedFoodLogId?: string;
  relatedActivityLogId?: string;
  relatedWeightLogId?: string;
};

export default function CreatePostModal({
  visible,
  onClose,
  onPostCreated,
  initialPostType = 'general',
  relatedFoodLogId,
  relatedActivityLogId,
  relatedWeightLogId,
}: Props) {
  const { session } = useAuth();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const [content, setContent] = useState('');
  const [postType, setPostType] = useState<PostType>(initialPostType);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!session?.user) {
      Alert.alert('Error', 'You must be logged in to create a post.');
      return;
    }

    if (!content.trim()) {
      Alert.alert('Error', 'Please add some content to your post.');
      return;
    }

    try {
      setLoading(true);

      const postParams: CreatePostParams = {
        user_id: session.user.id,
        post_type: postType,
        content: content,
        visibility: 'public',
      };

      // Add related IDs based on post type
      if (postType === 'food_log' && relatedFoodLogId) {
        postParams.related_food_log_id = relatedFoodLogId;
      } else if (postType === 'activity_log' && relatedActivityLogId) {
        postParams.related_activity_log_id = relatedActivityLogId;
      } else if (postType === 'weight_milestone' && relatedWeightLogId) {
        postParams.related_weight_log_id = relatedWeightLogId;
      }

      await createPost(postParams);
      
      // Reset form and close modal
      setContent('');
      setPostType('general');
      onPostCreated();
      onClose();
    } catch (error) {
      console.error('Error creating post:', error);
      Alert.alert('Error', 'Failed to create post. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const renderPostTypeButton = (type: PostType, label: string, icon: string) => (
    <TouchableOpacity
      style={[
        styles.postTypeButton,
        postType === type && { backgroundColor: colors.primary + '20' },
      ]}
      onPress={() => setPostType(type)}
    >
      <Ionicons
        name={icon as any}
        size={24}
        color={postType === type ? colors.primary : colors.text}
      />
      <Text
        style={[
          styles.postTypeText,
          postType === type && { color: colors.primary },
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent
      onRequestClose={onClose}
    >
      <KeyboardAvoidingView
        style={styles.centeredView}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View style={styles.modalView}>
          <View style={styles.header}>
            <Text style={styles.headerTitle}>Create Post</Text>
            <TouchableOpacity onPress={onClose} style={styles.closeButton}>
              <Ionicons name="close" size={24} color={colors.text} />
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.form}>
            {/* Post Type Selection */}
            <Text style={styles.label}>Post Type</Text>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.postTypeContainer}
            >
              {renderPostTypeButton('general', 'General', 'chatbubble-outline')}
              {renderPostTypeButton('food_log', 'Food', 'restaurant-outline')}
              {renderPostTypeButton('activity_log', 'Activity', 'fitness-outline')}
              {renderPostTypeButton('weight_milestone', 'Weight', 'trophy-outline')}
              {renderPostTypeButton('progress_photo', 'Progress', 'camera-outline')}
            </ScrollView>

            {/* Post Content */}
            <Text style={styles.label}>Content</Text>
            <TextInput
              style={styles.input}
              placeholder="What's on your mind?"
              value={content}
              onChangeText={setContent}
              multiline
              numberOfLines={5}
              textAlignVertical="top"
              placeholderTextColor="#A0A0A0"
            />

            {/* Related ID info */}
            {postType === 'food_log' && relatedFoodLogId && (
              <View style={styles.relatedInfo}>
                <Ionicons name="information-circle" size={18} color={colors.primary} />
                <Text style={styles.relatedInfoText}>
                  This post will be linked to your food log entry.
                </Text>
              </View>
            )}

            {postType === 'activity_log' && relatedActivityLogId && (
              <View style={styles.relatedInfo}>
                <Ionicons name="information-circle" size={18} color={colors.primary} />
                <Text style={styles.relatedInfoText}>
                  This post will be linked to your activity log entry.
                </Text>
              </View>
            )}

            {postType === 'weight_milestone' && relatedWeightLogId && (
              <View style={styles.relatedInfo}>
                <Ionicons name="information-circle" size={18} color={colors.primary} />
                <Text style={styles.relatedInfoText}>
                  This post will be linked to your weight milestone.
                </Text>
              </View>
            )}

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.button, { backgroundColor: colors.primary }]}
              onPress={handleSubmit}
              disabled={loading}
            >
              {loading ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.buttonText}>Post</Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0,0,0,0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 20,
    maxHeight: '80%',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeButton: {
    padding: 4,
  },
  form: {
    padding: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
    marginTop: 16,
  },
  input: {
    borderWidth: 1,
    borderColor: '#e0e0e0',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    minHeight: 120,
  },
  button: {
    padding: 16,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 24,
    marginBottom: 40,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postTypeContainer: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  postTypeButton: {
    padding: 12,
    borderRadius: 8,
    marginRight: 8,
    alignItems: 'center',
    minWidth: 80,
  },
  postTypeText: {
    marginTop: 4,
    fontSize: 12,
  },
  relatedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e3f2fd',
    padding: 12,
    borderRadius: 8,
    marginTop: 16,
  },
  relatedInfoText: {
    marginLeft: 8,
    fontSize: 14,
    flex: 1,
  },
}); 