import React, { useState, useRef, useCallback, useMemo } from 'react';
import {
  View,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Image,
  Animated,
  Modal,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Dimensions,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText } from '@/components/ui/Text';
import { useApp } from '@/context/AppContext';
import { Post, PostComment, Story } from '@/types';
import { MOCK_POSTS, MOCK_STORIES } from '@/data/mockFeed';

const { width: SCREEN_W } = Dimensions.get('window');

// ─── Helpers ──────────────────────────────────────────────────────────────────

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60_000);
  if (m < 1) return 'עכשיו';
  if (m < 60) return `${m}ד׳`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}ש׳`;
  const d = Math.floor(h / 24);
  if (d < 7) return `${d}י׳`;
  return `${Math.floor(d / 7)}שב׳`;
}

// ─── Story Item ───────────────────────────────────────────────────────────────

interface StoryItemProps {
  name: string;
  photo?: string;
  seen?: boolean;
  isAdd?: boolean;
  onPress?: () => void;
}

const StoryItem = React.memo<StoryItemProps>(({ name, photo, seen, isAdd, onPress }) => {
  const ringColor = seen ? Colors.border : Colors.terra;
  const ringWidth = seen ? 1.5 : 2.5;

  return (
    <TouchableOpacity style={styles.storyItem} onPress={onPress} activeOpacity={0.75}>
      <View style={[styles.storyRing, { borderColor: ringColor, borderWidth: ringWidth }]}>
        {photo ? (
          <Image source={{ uri: photo }} style={styles.storyAvatar} />
        ) : (
          <View style={[styles.storyAvatar, { backgroundColor: Colors.cream2 }]} />
        )}
        {isAdd && (
          <View style={styles.storyAddBadge}>
            <Ionicons name="add" size={11} color={Colors.white} />
          </View>
        )}
      </View>
      <WText style={styles.storyName} numberOfLines={1}>{name}</WText>
    </TouchableOpacity>
  );
});

// ─── Post Card ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  likeAnim: Animated.Value;
  onLike: (postId: string) => void;
  onCommentPress: (post: Post) => void;
}

const PostCard = React.memo<PostCardProps>(({ post, likeAnim, onLike, onCommentPress }) => {
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const caption = post.caption;
  const shortened = caption.length > 88;

  return (
    <View style={styles.postCard}>
      {/* ── Header ── */}
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.postHeaderLeft} activeOpacity={0.8}>
          <Image source={{ uri: post.dogPhoto }} style={styles.postAvatar} />
          <View style={styles.postHeaderInfo}>
            <WText style={styles.postDogName}>{post.dogName}</WText>
            <WText style={styles.postMeta}>
              {post.ownerCity}  ·  {timeAgo(post.createdAt)}
            </WText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity
          hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          activeOpacity={0.6}
        >
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      {/* ── Photo ── */}
      <Image
        source={{ uri: post.photo }}
        style={styles.postImage}
        resizeMode="cover"
      />

      {/* ── Actions ── */}
      <View style={styles.actionsRow}>
        {/* Left: comment + share */}
        <View style={styles.actionsLeft}>
          <TouchableOpacity
            style={styles.actionBtn}
            onPress={() => onCommentPress(post)}
            activeOpacity={0.75}
          >
            <Ionicons name="chatbubble-outline" size={24} color={Colors.text} />
            {post.comments.length > 0 && (
              <WText style={styles.actionCount}>{post.comments.length}</WText>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.75}>
            <Ionicons
              name="paper-plane-outline"
              size={23}
              color={Colors.text}
              style={styles.shareIcon}
            />
          </TouchableOpacity>
        </View>

        {/* Right: heart */}
        <TouchableOpacity
          style={styles.actionBtn}
          onPress={() => onLike(post.id)}
          activeOpacity={0.75}
        >
          <Animated.View style={{ transform: [{ scale: likeAnim }] }}>
            <Ionicons
              name={post.likedByMe ? 'heart' : 'heart-outline'}
              size={26}
              color={post.likedByMe ? Colors.terra : Colors.text}
            />
          </Animated.View>
          {post.likes > 0 && (
            <WText style={[styles.actionCount, post.likedByMe && styles.actionCountLiked]}>
              {post.likes}
            </WText>
          )}
        </TouchableOpacity>
      </View>

      {/* ── Caption ── */}
      <View style={styles.captionWrap}>
        <TouchableOpacity
          onPress={() => setCaptionExpanded(v => !v)}
          activeOpacity={0.9}
          disabled={!shortened}
        >
          <WText style={styles.captionText} textBreakStrategy="simple">
            <WText style={styles.captionDogName}>{post.dogName} </WText>
            {captionExpanded || !shortened ? caption : caption.slice(0, 88) + '… '}
            {shortened && !captionExpanded && (
              <WText style={styles.captionMore}>עוד</WText>
            )}
          </WText>
        </TouchableOpacity>
      </View>

      {/* ── Comments preview ── */}
      {post.comments.length > 0 && (
        <TouchableOpacity
          style={styles.commentsPreview}
          onPress={() => onCommentPress(post)}
          activeOpacity={0.8}
        >
          {post.comments.length >= 2 && (
            <WText style={styles.viewAllComments}>
              צפה בכל {post.comments.length} התגובות
            </WText>
          )}
          <View style={styles.commentPreviewRow}>
            <Image
              source={{ uri: post.comments[post.comments.length - 1].authorDogPhoto }}
              style={styles.commentPreviewAvatar}
            />
            <WText style={styles.commentPreviewText} numberOfLines={1}>
              <WText style={styles.commentPreviewAuthor}>
                {post.comments[post.comments.length - 1].authorDogName}{' '}
              </WText>
              {post.comments[post.comments.length - 1].text}
            </WText>
          </View>
        </TouchableOpacity>
      )}

      {/* Bottom spacer */}
      <View style={styles.postBottom} />
    </View>
  );
});

// ─── Feed Screen ──────────────────────────────────────────────────────────────

export const FeedScreen: React.FC = () => {
  const { state, addPost } = useApp();

  // Local feed state (mock + user posts)
  const [feedPosts, setFeedPosts] = useState<Post[]>([...state.posts, ...MOCK_POSTS]);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);

  // Per-post like animation refs
  const likeAnims = useRef<Record<string, Animated.Value>>({});
  const getLikeAnim = useCallback((id: string): Animated.Value => {
    if (!likeAnims.current[id]) likeAnims.current[id] = new Animated.Value(1);
    return likeAnims.current[id];
  }, []);

  // Comments modal state
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Create post modal state
  const [showCreate, setShowCreate] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Always derive commentsPost from latest feedPosts
  const commentsPost = useMemo(
    () => commentsPostId ? feedPosts.find(p => p.id === commentsPostId) ?? null : null,
    [commentsPostId, feedPosts],
  );

  // ── Like handler ─────────────────────────────────────────────────────────────

  const handleLike = useCallback((postId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const anim = getLikeAnim(postId);
    Animated.sequence([
      Animated.spring(anim, { toValue: 1.35, useNativeDriver: true, speed: 40, bounciness: 10 }),
      Animated.spring(anim, { toValue: 1, useNativeDriver: true, speed: 20, bounciness: 4 }),
    ]).start();
    setFeedPosts(prev =>
      prev.map(p =>
        p.id === postId
          ? { ...p, likedByMe: !p.likedByMe, likes: p.likedByMe ? p.likes - 1 : p.likes + 1 }
          : p,
      ),
    );
  }, [getLikeAnim]);

  // ── Comment handlers ──────────────────────────────────────────────────────────

  const handleCommentPress = useCallback((post: Post) => {
    setCommentsPostId(post.id);
  }, []);

  const handleSendComment = useCallback(() => {
    if (!commentText.trim() || !commentsPostId) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    const comment: PostComment = {
      id: `c_${Date.now()}`,
      authorDogName: state.dog?.name ?? 'כלב',
      authorDogPhoto: state.dog?.photos?.[0] ?? 'https://placedog.net/100/100?id=1',
      authorOwnerName: state.ownerName || '',
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
    };
    const targetId = commentsPostId;
    setFeedPosts(prev =>
      prev.map(p =>
        p.id === targetId ? { ...p, comments: [...p.comments, comment] } : p,
      ),
    );
    setCommentText('');
  }, [commentText, commentsPostId, state.dog, state.ownerName]);

  // ── Create post handlers ──────────────────────────────────────────────────────

  const handlePickImage = useCallback(async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('הרשאה נדרשת', 'אנא אשר גישה לגלריה');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.85,
    });
    if (!result.canceled && result.assets[0]) {
      setNewImage(result.assets[0].uri);
    }
  }, []);

  const handlePublishPost = useCallback(async () => {
    if (!newImage) {
      Alert.alert('חסרה תמונה', 'אנא בחר תמונה לפני פרסום');
      return;
    }
    setPublishing(true);
    await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const post: Post = {
      id: `post_u_${Date.now()}`,
      dogId: state.dog?.id ?? 'me',
      dogName: state.dog?.name ?? 'כלב',
      dogPhoto: state.dog?.photos?.[0] ?? 'https://placedog.net/100/100?id=1',
      ownerName: state.ownerName || '',
      ownerCity: state.ownerCity || '',
      photo: newImage,
      caption: newCaption.trim(),
      likes: 0,
      likedByMe: false,
      comments: [],
      createdAt: new Date().toISOString(),
    };
    addPost(post);
    setFeedPosts(prev => [post, ...prev]);
    setShowCreate(false);
    setNewImage(null);
    setNewCaption('');
    setPublishing(false);
  }, [newImage, newCaption, state.dog, state.ownerName, state.ownerCity, addPost]);

  const handleCloseCreate = useCallback(() => {
    setShowCreate(false);
    setNewImage(null);
    setNewCaption('');
  }, []);

  // ── Story press ───────────────────────────────────────────────────────────────

  const handleStoryPress = useCallback((storyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, seen: true } : s));
  }, []);

  // ── Render helpers ────────────────────────────────────────────────────────────

  const sortedStories = useMemo(
    () => [...stories].sort((a, b) => Number(a.seen) - Number(b.seen)),
    [stories],
  );

  const StoriesBar = useCallback(() => (
    <View style={styles.storiesBar}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.storiesContent}
      >
        <StoryItem
          name={state.dog?.name ?? 'שלי'}
          photo={state.dog?.photos?.[0]}
          isAdd
          onPress={() => setShowCreate(true)}
        />
        {sortedStories.map(story => (
          <StoryItem
            key={story.id}
            name={story.dogName}
            photo={story.dogPhoto}
            seen={story.seen}
            onPress={() => handleStoryPress(story.id)}
          />
        ))}
      </ScrollView>
    </View>
  ), [sortedStories, state.dog, handleStoryPress]);

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostCard
      post={item}
      likeAnim={getLikeAnim(item.id)}
      onLike={handleLike}
      onCommentPress={handleCommentPress}
    />
  ), [getLikeAnim, handleLike, handleCommentPress]);

  // ── Comments modal ────────────────────────────────────────────────────────────

  const CommentsModal = (
    <Modal
      visible={!!commentsPostId}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => { setCommentsPostId(null); setCommentText(''); }}
    >
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom'] as any}>
        {/* Header */}
        <View style={styles.modalHeader}>
          <TouchableOpacity
            onPress={() => { setCommentsPostId(null); setCommentText(''); }}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
          >
            <Ionicons name="close" size={26} color={Colors.text} />
          </TouchableOpacity>
          <WText style={styles.modalTitle}>תגובות</WText>
          <View style={{ width: 26 }} />
        </View>

        {/* Comments list */}
        <FlatList
          data={commentsPost?.comments ?? []}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.commentsListContent}
          ListEmptyComponent={
            <WText style={styles.emptyComments}>
              עוד אין תגובות — היה הראשון! 💬
            </WText>
          }
          renderItem={({ item }) => (
            <View style={styles.commentRow}>
              <Image source={{ uri: item.authorDogPhoto }} style={styles.commentRowAvatar} />
              <View style={styles.commentBubble}>
                <View style={styles.commentBubbleTop}>
                  <WText style={styles.commentBubbleName}>{item.authorDogName}</WText>
                  <WText style={styles.commentBubbleTime}>{timeAgo(item.createdAt)}</WText>
                </View>
                <WText style={styles.commentBubbleText}>{item.text}</WText>
              </View>
            </View>
          )}
        />

        {/* Input row */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <View style={styles.commentInputRow}>
            <Image
              source={{ uri: state.dog?.photos?.[0] ?? 'https://placedog.net/100/100?id=1' }}
              style={styles.commentInputAvatar}
            />
            <View style={styles.commentInputWrap}>
              <TextInput
                style={styles.commentInput}
                placeholder="הוסף תגובה..."
                placeholderTextColor={Colors.placeholder}
                value={commentText}
                onChangeText={setCommentText}
                textAlign="right"
                multiline
                maxLength={300}
              />
            </View>
            <TouchableOpacity
              style={[styles.sendBtn, !commentText.trim() && styles.sendBtnDisabled]}
              onPress={handleSendComment}
              disabled={!commentText.trim()}
            >
              <Ionicons
                name="send"
                size={17}
                color={Colors.white}
                style={styles.sendIcon}
              />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  // ── Create post modal ─────────────────────────────────────────────────────────

  const CreatePostModal = (
    <Modal
      visible={showCreate}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCloseCreate}
    >
      <SafeAreaView style={styles.createSafe} edges={['top', 'bottom'] as any}>
        {/* Header */}
        <View style={styles.createHeader}>
          <TouchableOpacity onPress={handleCloseCreate}>
            <WText style={styles.createCancel}>ביטול</WText>
          </TouchableOpacity>
          <WText style={styles.createTitle}>פוסט חדש</WText>
          <TouchableOpacity onPress={handlePublishPost} disabled={!newImage || publishing}>
            {publishing ? (
              <ActivityIndicator size="small" color={Colors.terra} />
            ) : (
              <WText style={[styles.createShare, !newImage && styles.createShareDisabled]}>
                שתף
              </WText>
            )}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView
          style={styles.flex}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
          <ScrollView showsVerticalScrollIndicator={false}>
            {/* Image area */}
            <TouchableOpacity
              style={styles.imagePickerArea}
              onPress={handlePickImage}
              activeOpacity={0.85}
            >
              {newImage ? (
                <Image source={{ uri: newImage }} style={styles.pickedImage} resizeMode="cover" />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="camera-outline" size={52} color={Colors.gray} />
                  <WText style={styles.imagePlaceholderText}>הקש לבחור תמונה</WText>
                  <WText style={styles.imagePlaceholderSub}>מהגלריה שלך</WText>
                </View>
              )}
            </TouchableOpacity>

            {/* Caption */}
            <View style={styles.captionInputArea}>
              <Image
                source={{ uri: state.dog?.photos?.[0] ?? 'https://placedog.net/100/100?id=1' }}
                style={styles.createAvatar}
              />
              <TextInput
                style={styles.captionInputField}
                placeholder={`${state.dog?.name ?? 'הכלב שלך'} היה/הייתה היום...`}
                placeholderTextColor={Colors.placeholder}
                value={newCaption}
                onChangeText={setNewCaption}
                textAlign="right"
                multiline
                numberOfLines={4}
                maxLength={300}
              />
            </View>
            {newCaption.length > 0 && (
              <WText style={styles.charCount}>{newCaption.length}/300</WText>
            )}
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top'] as any}>
      {/* App bar */}
      <View style={styles.appBar}>
        <TouchableOpacity
          onPress={() => setShowCreate(true)}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="camera-outline" size={26} color={Colors.text} />
        </TouchableOpacity>

        <WText style={styles.appLogo}>Woofy 🐾</WText>

        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        >
          <Ionicons name="heart-outline" size={26} color={Colors.text} />
        </TouchableOpacity>
      </View>

      {/* Feed */}
      <FlatList
        data={feedPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListHeaderComponent={<StoriesBar />}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      />

      {CommentsModal}
      {CreatePostModal}
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  flex: {
    flex: 1,
  },

  // ── App bar ──
  appBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  appLogo: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize.xl,
    color: Colors.forest,
    letterSpacing: -0.5,
  },

  // ── Stories bar ──
  storiesBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  storiesContent: {
    paddingHorizontal: Spacing.base,
    gap: Spacing.base,
  },
  storyItem: {
    alignItems: 'center',
    width: 72,
  },
  storyRing: {
    width: 68,
    height: 68,
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  storyAvatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: Colors.cream2,
  },
  storyAddBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.white,
  },
  storyName: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.xs,
    color: Colors.text,
    textAlign: 'center',
  },

  // ── Post card ──
  feedContent: {
    paddingBottom: Spacing['2xl'],
  },
  postCard: {
    backgroundColor: Colors.white,
    marginBottom: Spacing.xs,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  postHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.md,
  },
  postHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  postAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cream2,
    marginRight: Spacing.md,
  },
  postHeaderInfo: {
    flex: 1,
  },
  postDogName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'left',
  },
  postMeta: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    textAlign: 'left',
    marginTop: 1,
  },
  postImage: {
    width: SCREEN_W,
    height: SCREEN_W,
    backgroundColor: Colors.cream2,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.md,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  actionsLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.base,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  actionCount: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  actionCountLiked: {
    color: Colors.terra,
  },
  shareIcon: {
    transform: [{ scaleX: -1 }],
  },
  captionWrap: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.sm,
  },
  captionText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'right',
    lineHeight: 20,
  },
  captionDogName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  captionMore: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  commentsPreview: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.md,
    gap: Spacing.xs,
  },
  viewAllComments: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.gray,
    textAlign: 'right',
    marginBottom: Spacing.xs,
  },
  commentPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  commentPreviewAvatar: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: Colors.cream2,
  },
  commentPreviewText: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'right',
  },
  commentPreviewAuthor: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  postBottom: {
    height: Spacing.xs,
  },

  // ── Comments modal ──
  modalSafe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  commentsListContent: {
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.md,
    paddingBottom: Spacing.xl,
    flexGrow: 1,
  },
  emptyComments: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.gray,
    textAlign: 'center',
    marginTop: Spacing['2xl'],
  },
  commentRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.lg,
    alignItems: 'flex-start',
  },
  commentRowAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: Colors.cream2,
    marginTop: 2,
  },
  commentBubble: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: Radius.medium,
    padding: Spacing.md,
  },
  commentBubbleTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs,
  },
  commentBubbleName: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.text,
  },
  commentBubbleTime: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  commentBubbleText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'right',
    lineHeight: 19,
  },
  commentInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderTopWidth: 0.5,
    borderTopColor: Colors.border,
    backgroundColor: Colors.white,
  },
  commentInputAvatar: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: Colors.cream2,
  },
  commentInputWrap: {
    flex: 1,
    backgroundColor: Colors.cream,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 2,
    minHeight: 38,
    justifyContent: 'center',
  },
  commentInput: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlignVertical: 'center',
    maxHeight: 100,
  },
  sendBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.terra,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: Colors.border,
  },
  sendIcon: {
    transform: [{ scaleX: -1 }],
    marginLeft: 1,
  },

  // ── Create post modal ──
  createSafe: {
    flex: 1,
    backgroundColor: Colors.white,
  },
  createHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  createCancel: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.base,
    color: Colors.gray,
  },
  createTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  createShare: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.terra,
  },
  createShareDisabled: {
    color: Colors.border,
  },
  imagePickerArea: {
    width: SCREEN_W,
    height: SCREEN_W,
    backgroundColor: Colors.cream2,
  },
  pickedImage: {
    width: SCREEN_W,
    height: SCREEN_W,
  },
  imagePlaceholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.sm,
  },
  imagePlaceholderText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: Colors.gray,
  },
  imagePlaceholderSub: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.sm,
    color: Colors.placeholder,
  },
  captionInputArea: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: Spacing.md,
    padding: Spacing.base,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  createAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.cream2,
    marginTop: 2,
  },
  captionInputField: {
    flex: 1,
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.text,
    textAlign: 'right',
    textAlignVertical: 'top',
    minHeight: 80,
    paddingTop: 0,
  },
  charCount: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.placeholder,
    textAlign: 'left',
    paddingHorizontal: Spacing.base,
    paddingTop: Spacing.xs,
  },
});
