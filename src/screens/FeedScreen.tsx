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
  Text,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import * as ImagePicker from 'expo-image-picker';

import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import { WText } from '@/components/ui/Text';
import { WButton } from '@/components/ui/Button';
import { useApp } from '@/context/AppContext';
import { Post, PostComment, Story, Event } from '@/types';
import { MOCK_POSTS, MOCK_STORIES } from '@/data/mockFeed';
import { MOCK_EVENTS, formatEventDate } from '@/data/mockEvents';
import { MOCK_NOTIFICATIONS } from '@/data/mockNotifications';
import { NotificationsModal } from '@/screens/NotificationsModal';
import { DogProfileModal, DogProfileInfo } from '@/screens/DogProfileModal';
import { CameraFAB } from '@/components/CameraFAB';

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

const StoryItem = React.memo<StoryItemProps>(({ name, photo, seen, isAdd, onPress }) => (
  <TouchableOpacity style={styles.storyItem} onPress={onPress} activeOpacity={0.75}>
    <View
      style={[
        styles.storyRing,
        { borderColor: (isAdd || !seen) ? Colors.terra : Colors.border, borderWidth: (isAdd || !seen) ? 2.5 : 1.5 },
      ]}
    >
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
));

// ─── Event Card ───────────────────────────────────────────────────────────────

interface EventCardProps {
  event: Event;
  onPress: () => void;
  onJoin: () => void;
}

const EventCard = React.memo<EventCardProps>(({ event, onPress, onJoin }) => {
  const spotsLeft = event.maxAttendees ? event.maxAttendees - event.attendees : null;
  const almostFull = spotsLeft !== null && spotsLeft <= 3;

  return (
    <TouchableOpacity style={styles.eventCard} onPress={onPress} activeOpacity={0.88}>
      {/* Colored header with emoji */}
      <View style={[styles.eventCardTop, { backgroundColor: event.color }]}>
        <Text style={styles.eventCardEmoji}>{event.emoji}</Text>
        <View style={styles.eventDateChip}>
          <WText style={styles.eventDateText}>{formatEventDate(event.date)}</WText>
        </View>
      </View>

      {/* Body */}
      <View style={styles.eventCardBody}>
        <WText style={styles.eventCardTitle} numberOfLines={2}>{event.title}</WText>
        <View style={styles.eventCardLocation}>
          <Ionicons name="location-outline" size={12} color={Colors.gray} />
          <WText style={styles.eventCardLocationText} numberOfLines={1}>{event.location}</WText>
        </View>

        <View style={styles.eventCardFooter}>
          <WText style={styles.eventCardAttendees}>{event.attendees} 👥</WText>
          <TouchableOpacity
            style={[styles.eventJoinBtn, event.isAttending && styles.eventJoinBtnActive]}
            onPress={(e) => { (e as any).stopPropagation?.(); onJoin(); }}
            activeOpacity={0.75}
          >
            <WText style={[styles.eventJoinText, event.isAttending && styles.eventJoinTextActive]}>
              {event.isAttending ? 'נרשמת ✓' : '+ הצטרף'}
            </WText>
          </TouchableOpacity>
        </View>

        {almostFull && (
          <WText style={styles.almostFullText}>🔥 נשארו {spotsLeft} מקומות</WText>
        )}
      </View>
    </TouchableOpacity>
  );
});

// ─── Post Card ────────────────────────────────────────────────────────────────

interface PostCardProps {
  post: Post;
  likeAnim: Animated.Value;
  onLike: (postId: string) => void;
  onCommentPress: (post: Post) => void;
  onAvatarPress: (post: Post) => void;
}

const PostCard = React.memo<PostCardProps>(({ post, likeAnim, onLike, onCommentPress, onAvatarPress }) => {
  const [captionExpanded, setCaptionExpanded] = useState(false);
  const shortened = post.caption.length > 88;

  return (
    <View style={styles.postCard}>
      {/* Header */}
      <View style={styles.postHeader}>
        <TouchableOpacity style={styles.postHeaderLeft} activeOpacity={0.8} onPress={() => onAvatarPress(post)}>
          <Image source={{ uri: post.dogPhoto }} style={styles.postAvatar} />
          <View style={styles.postHeaderInfo}>
            <WText style={styles.postDogName}>{post.dogName}</WText>
            <WText style={styles.postMeta}>{post.ownerCity}  ·  {timeAgo(post.createdAt)}</WText>
          </View>
        </TouchableOpacity>
        <TouchableOpacity hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }} activeOpacity={0.6}>
          <Ionicons name="ellipsis-horizontal" size={20} color={Colors.gray} />
        </TouchableOpacity>
      </View>

      {/* Photo */}
      <Image source={{ uri: post.photo }} style={styles.postImage} resizeMode="cover" />

      {/* Actions */}
      <View style={styles.actionsRow}>
        <View style={styles.actionsLeft}>
          <TouchableOpacity style={styles.actionBtn} onPress={() => onCommentPress(post)} activeOpacity={0.75}>
            <Ionicons name="chatbubble-outline" size={24} color={Colors.text} />
            {post.comments.length > 0 && (
              <WText style={styles.actionCount}>{post.comments.length}</WText>
            )}
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionBtn} activeOpacity={0.75}>
            <Ionicons name="paper-plane-outline" size={23} color={Colors.text} style={styles.shareIcon} />
          </TouchableOpacity>
        </View>
        <TouchableOpacity style={styles.actionBtn} onPress={() => onLike(post.id)} activeOpacity={0.75}>
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

      {/* Caption */}
      <View style={styles.captionWrap}>
        <TouchableOpacity onPress={() => setCaptionExpanded(v => !v)} activeOpacity={0.9} disabled={!shortened}>
          <WText style={styles.captionText} textBreakStrategy="simple">
            <WText style={styles.captionDogName}>{post.dogName} </WText>
            {captionExpanded || !shortened ? post.caption : post.caption.slice(0, 88) + '… '}
            {shortened && !captionExpanded && <WText style={styles.captionMore}>עוד</WText>}
          </WText>
        </TouchableOpacity>
      </View>

      {/* Comments preview */}
      {post.comments.length > 0 && (
        <TouchableOpacity style={styles.commentsPreview} onPress={() => onCommentPress(post)} activeOpacity={0.8}>
          {post.comments.length >= 2 && (
            <WText style={styles.viewAllComments}>צפה בכל {post.comments.length} התגובות</WText>
          )}
          <View style={styles.commentPreviewRow}>
            <Image source={{ uri: post.comments[post.comments.length - 1].authorDogPhoto }} style={styles.commentPreviewAvatar} />
            <WText style={styles.commentPreviewText} numberOfLines={1}>
              <WText style={styles.commentPreviewAuthor}>{post.comments[post.comments.length - 1].authorDogName} </WText>
              {post.comments[post.comments.length - 1].text}
            </WText>
          </View>
        </TouchableOpacity>
      )}
      <View style={styles.postBottom} />
    </View>
  );
});

// ─── Feed Screen ──────────────────────────────────────────────────────────────

export const FeedScreen: React.FC = () => {
  const { state, addPost } = useApp();

  const [feedPosts, setFeedPosts] = useState<Post[]>([...state.posts, ...MOCK_POSTS]);
  const [stories, setStories] = useState<Story[]>(MOCK_STORIES);
  const [events, setEvents] = useState<Event[]>(MOCK_EVENTS);

  const likeAnims = useRef<Record<string, Animated.Value>>({});
  const getLikeAnim = useCallback((id: string): Animated.Value => {
    if (!likeAnims.current[id]) likeAnims.current[id] = new Animated.Value(1);
    return likeAnims.current[id];
  }, []);

  // Comments modal
  const [commentsPostId, setCommentsPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState('');

  // Create post modal
  const [showCreate, setShowCreate] = useState(false);
  const [newImage, setNewImage] = useState<string | null>(null);
  const [newCaption, setNewCaption] = useState('');
  const [publishing, setPublishing] = useState(false);

  // Event details modal
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);

  // Notifications modal
  const [showNotifications, setShowNotifications] = useState(false);
  const unreadNotifCount = useMemo(
    () => MOCK_NOTIFICATIONS.filter(n => !n.isRead).length,
    [],
  );

  // Dog profile modal
  const [dogProfile, setDogProfile] = useState<DogProfileInfo | null>(null);

  const commentsPost = useMemo(
    () => commentsPostId ? feedPosts.find(p => p.id === commentsPostId) ?? null : null,
    [commentsPostId, feedPosts],
  );

  // ── Like ─────────────────────────────────────────────────────────────────────

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

  // ── Comments ──────────────────────────────────────────────────────────────────

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
      prev.map(p => p.id === targetId ? { ...p, comments: [...p.comments, comment] } : p),
    );
    setCommentText('');
  }, [commentText, commentsPostId, state.dog, state.ownerName]);

  // ── Create post ───────────────────────────────────────────────────────────────

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
    if (!result.canceled && result.assets[0]) setNewImage(result.assets[0].uri);
  }, []);

  const handlePublishPost = useCallback(async () => {
    if (!newImage) { Alert.alert('חסרה תמונה', 'אנא בחר תמונה לפני פרסום'); return; }
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
    setShowCreate(false); setNewImage(null); setNewCaption('');
  }, []);

  // ── Stories ───────────────────────────────────────────────────────────────────

  const handleStoryPress = useCallback((storyId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setStories(prev => prev.map(s => s.id === storyId ? { ...s, seen: true } : s));
  }, []);

  const sortedStories = useMemo(
    () => [...stories].sort((a, b) => Number(a.seen) - Number(b.seen)),
    [stories],
  );

  // ── Dog profile ───────────────────────────────────────────────────────────────

  const handleAvatarPress = useCallback((post: Post) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setDogProfile({
      dogId: post.dogId,
      dogName: post.dogName,
      dogPhoto: post.dogPhoto,
      ownerName: post.ownerName,
      ownerCity: post.ownerCity,
      userPosts: state.posts,
    });
  }, [state.posts]);

  // ── Events ────────────────────────────────────────────────────────────────────

  const handleJoinEvent = useCallback((eventId: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setEvents(prev =>
      prev.map(e =>
        e.id === eventId
          ? { ...e, isAttending: !e.isAttending, attendees: e.isAttending ? e.attendees - 1 : e.attendees + 1 }
          : e,
      ),
    );
    // Also sync selectedEvent if open
    setSelectedEvent(prev =>
      prev?.id === eventId
        ? { ...prev, isAttending: !prev.isAttending, attendees: prev.isAttending ? prev.attendees - 1 : prev.attendees + 1 }
        : prev,
    );
  }, []);

  // ── Render ────────────────────────────────────────────────────────────────────

  const renderPost = useCallback(({ item }: { item: Post }) => (
    <PostCard
      post={item}
      likeAnim={getLikeAnim(item.id)}
      onLike={handleLike}
      onCommentPress={handleCommentPress}
      onAvatarPress={handleAvatarPress}
    />
  ), [getLikeAnim, handleLike, handleCommentPress, handleAvatarPress]);

  const listHeader = useMemo(() => (
    <View>
      {/* Stories bar */}
      <View style={styles.storiesBar}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.storiesContent}>
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

      {/* Events section */}
      <View style={styles.eventsSection}>
        <View style={styles.eventsSectionHeader}>
          <WText style={styles.eventsSectionTitle}>📅 אירועים קרובים</WText>
          <TouchableOpacity activeOpacity={0.7}>
            <WText style={styles.eventsSeeAll}>ראה הכל</WText>
          </TouchableOpacity>
        </View>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.eventsContent}>
          {events.map(ev => (
            <EventCard
              key={ev.id}
              event={ev}
              onPress={() => setSelectedEvent(ev)}
              onJoin={() => handleJoinEvent(ev.id)}
            />
          ))}
        </ScrollView>
      </View>
    </View>
  // eslint-disable-next-line react-hooks/exhaustive-deps
  ), [sortedStories, state.dog, events, handleStoryPress, handleJoinEvent]);

  // ── Comments Modal ────────────────────────────────────────────────────────────

  const CommentsModal = (
    <Modal
      visible={!!commentsPostId}
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => { setCommentsPostId(null); setCommentText(''); }}
    >
      <SafeAreaView style={styles.modalSafe} edges={['top', 'bottom'] as any}>
        <View style={styles.modalHeader}>
          <TouchableOpacity onPress={() => { setCommentsPostId(null); setCommentText(''); }} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={26} color={Colors.text} />
          </TouchableOpacity>
          <WText style={styles.modalTitle}>תגובות</WText>
          <View style={{ width: 26 }} />
        </View>

        <FlatList
          data={commentsPost?.comments ?? []}
          keyExtractor={c => c.id}
          contentContainerStyle={styles.commentsListContent}
          ListEmptyComponent={<WText style={styles.emptyComments}>עוד אין תגובות — היה הראשון! 💬</WText>}
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

        <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <View style={styles.commentInputRow}>
            <Image source={{ uri: state.dog?.photos?.[0] ?? 'https://placedog.net/100/100?id=1' }} style={styles.commentInputAvatar} />
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
              <Ionicons name="send" size={17} color={Colors.white} style={styles.sendIcon} />
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </Modal>
  );

  // ── Create Post Modal ─────────────────────────────────────────────────────────

  const CreatePostModal = (
    <Modal
      visible={showCreate}
      animationType="slide"
      presentationStyle="fullScreen"
      onRequestClose={handleCloseCreate}
    >
      <SafeAreaView style={styles.createSafe} edges={['top', 'bottom'] as any}>
        <View style={styles.createHeader}>
          <TouchableOpacity onPress={handleCloseCreate}>
            <WText style={styles.createCancel}>ביטול</WText>
          </TouchableOpacity>
          <WText style={styles.createTitle}>פוסט חדש</WText>
          <TouchableOpacity onPress={handlePublishPost} disabled={!newImage || publishing}>
            {publishing
              ? <ActivityIndicator size="small" color={Colors.terra} />
              : <WText style={[styles.createShare, !newImage && styles.createShareDisabled]}>שתף</WText>}
          </TouchableOpacity>
        </View>

        <KeyboardAvoidingView style={styles.flex} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
          <ScrollView showsVerticalScrollIndicator={false}>
            <TouchableOpacity style={styles.imagePickerArea} onPress={handlePickImage} activeOpacity={0.85}>
              {newImage
                ? <Image source={{ uri: newImage }} style={styles.pickedImage} resizeMode="cover" />
                : (
                  <View style={styles.imagePlaceholder}>
                    <Ionicons name="camera-outline" size={52} color={Colors.gray} />
                    <WText style={styles.imagePlaceholderText}>הקש לבחור תמונה</WText>
                    <WText style={styles.imagePlaceholderSub}>מהגלריה שלך</WText>
                  </View>
                )}
            </TouchableOpacity>
            <View style={styles.captionInputArea}>
              <Image source={{ uri: state.dog?.photos?.[0] ?? 'https://placedog.net/100/100?id=1' }} style={styles.createAvatar} />
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

  // ── Event Details Modal ───────────────────────────────────────────────────────

  const EventModal = selectedEvent ? (
    <Modal
      visible
      animationType="slide"
      presentationStyle="pageSheet"
      onRequestClose={() => setSelectedEvent(null)}
    >
      <SafeAreaView style={styles.eventModalSafe} edges={['top', 'bottom'] as any}>
        {/* Forest header */}
        <View style={[styles.eventModalHeader, { backgroundColor: selectedEvent.color }]}>
          <TouchableOpacity onPress={() => setSelectedEvent(null)} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={26} color={Colors.white} />
          </TouchableOpacity>
          <WText style={styles.eventModalHeaderTitle} numberOfLines={1}>{selectedEvent.title}</WText>
          <View style={{ width: 26 }} />
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ paddingBottom: 40 }}>
          {/* Hero */}
          <View style={[styles.eventHero, { backgroundColor: selectedEvent.color }]}>
            <Text style={styles.eventHeroEmoji}>{selectedEvent.emoji}</Text>
            <WText style={styles.eventHeroTitle}>{selectedEvent.title}</WText>
            <WText style={styles.eventHeroDate}>
              {formatEventDate(selectedEvent.date)} · {selectedEvent.time}
            </WText>
          </View>

          {/* Details card */}
          <View style={styles.eventDetailCard}>
            {/* Location */}
            <View style={styles.eventDetailRow}>
              <View style={[styles.eventDetailIcon, { backgroundColor: Colors.terraDim }]}>
                <Ionicons name="location" size={18} color={Colors.terra} />
              </View>
              <View style={styles.eventDetailText}>
                <WText style={styles.eventDetailLabel}>מיקום</WText>
                <WText style={styles.eventDetailValue}>{selectedEvent.location}</WText>
                <WText style={styles.eventDetailSub}>{selectedEvent.address}</WText>
              </View>
            </View>

            {/* Date & time */}
            <View style={styles.eventDetailRow}>
              <View style={[styles.eventDetailIcon, { backgroundColor: Colors.forestDim }]}>
                <Ionicons name="calendar-outline" size={18} color={Colors.forest} />
              </View>
              <View style={styles.eventDetailText}>
                <WText style={styles.eventDetailLabel}>מתי</WText>
                <WText style={styles.eventDetailValue}>{formatEventDate(selectedEvent.date)}</WText>
                <WText style={styles.eventDetailSub}>בשעה {selectedEvent.time}</WText>
              </View>
            </View>

            {/* Organizer */}
            <View style={styles.eventDetailRow}>
              <Image source={{ uri: selectedEvent.organizerDogPhoto }} style={styles.eventOrgAvatar} />
              <View style={styles.eventDetailText}>
                <WText style={styles.eventDetailLabel}>מארגן</WText>
                <WText style={styles.eventDetailValue}>{selectedEvent.organizer}</WText>
              </View>
            </View>

            {/* Attendees */}
            <View style={styles.eventAttendeesBadge}>
              <Ionicons name="people" size={16} color={Colors.forest} />
              <WText style={styles.eventAttendeesText}>
                {selectedEvent.attendees} נרשמו
                {selectedEvent.maxAttendees ? ` / ${selectedEvent.maxAttendees} מקומות` : ''}
              </WText>
            </View>

            {/* Description */}
            <WText style={styles.eventDetailDesc}>{selectedEvent.description}</WText>

            {/* CTA */}
            <WButton
              label={selectedEvent.isAttending ? 'ביטול השתתפות' : '🐾 הצטרף לאירוע'}
              onPress={() => handleJoinEvent(selectedEvent.id)}
              variant={selectedEvent.isAttending ? 'outline' : 'primary'}
              size="lg"
              fullWidth
            />
          </View>
        </ScrollView>
      </SafeAreaView>
    </Modal>
  ) : null;

  // ── Main render ───────────────────────────────────────────────────────────────

  return (
    <SafeAreaView style={styles.safe} edges={['top'] as any}>
      {/* App bar */}
      <View style={styles.appBar}>
        <TouchableOpacity onPress={() => setShowCreate(true)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
          <Ionicons name="camera-outline" size={26} color={Colors.text} />
        </TouchableOpacity>
        <WText style={styles.appLogo}>Woofy 🐾</WText>
        <TouchableOpacity
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => setShowNotifications(true)}
          style={{ position: 'relative' }}
        >
          <Ionicons name="heart-outline" size={26} color={Colors.text} />
          {unreadNotifCount > 0 && (
            <View style={styles.notifBadge}>
              <WText style={styles.notifBadgeText}>
                {unreadNotifCount > 9 ? '9+' : unreadNotifCount}
              </WText>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        data={feedPosts}
        keyExtractor={item => item.id}
        renderItem={renderPost}
        ListHeaderComponent={listHeader}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.feedContent}
      />

      {CommentsModal}
      {CreatePostModal}
      {EventModal}

      <NotificationsModal
        visible={showNotifications}
        onClose={() => setShowNotifications(false)}
      />

      <DogProfileModal
        profile={dogProfile}
        onClose={() => setDogProfile(null)}
      />

      <CameraFAB />
    </SafeAreaView>
  );
};

// ─── Styles ───────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: Colors.white },
  flex: { flex: 1 },

  // App bar
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
  notifBadge: {
    position: 'absolute',
    top: -4,
    right: -5,
    backgroundColor: Colors.terra,
    borderRadius: Radius.pill,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
    borderWidth: 1.5,
    borderColor: Colors.white,
  },
  notifBadgeText: {
    fontFamily: FontFamily.bold,
    fontSize: 9,
    color: Colors.white,
    lineHeight: 12,
  },

  // Stories
  storiesBar: {
    backgroundColor: Colors.white,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
    paddingVertical: Spacing.md,
  },
  storiesContent: { paddingHorizontal: Spacing.base, gap: Spacing.base },
  storyItem: { alignItems: 'center', width: 72 },
  storyRing: {
    width: 68, height: 68, borderRadius: 34,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: Spacing.xs,
  },
  storyAvatar: { width: 60, height: 60, borderRadius: 30, backgroundColor: Colors.cream2 },
  storyAddBadge: {
    position: 'absolute', bottom: 0, right: 0,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: Colors.terra,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 2, borderColor: Colors.white,
  },
  storyName: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.text, textAlign: 'center' },

  // Events section
  eventsSection: {
    backgroundColor: Colors.white,
    paddingTop: Spacing.base,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 0.5,
    borderBottomColor: Colors.border,
  },
  eventsSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    marginBottom: Spacing.md,
  },
  eventsSectionTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.text,
  },
  eventsSeeAll: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.terra,
  },
  eventsContent: { paddingHorizontal: Spacing.base, gap: Spacing.md, paddingBottom: Spacing.xs },

  // Event card
  eventCard: {
    width: 175,
    borderRadius: Radius.medium,
    backgroundColor: Colors.white,
    ...Shadow.soft,
    overflow: 'hidden',
  },
  eventCardTop: {
    height: 75,
    alignItems: 'center',
    justifyContent: 'center',
  },
  eventCardEmoji: { fontSize: 32 },
  eventDateChip: {
    position: 'absolute',
    top: Spacing.sm,
    right: Spacing.sm,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
  },
  eventDateText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },
  eventCardBody: { padding: Spacing.md },
  eventCardTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.sm,
    color: Colors.text,
    textAlign: 'right',
    marginBottom: Spacing.xs,
    lineHeight: 18,
  },
  eventCardLocation: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: Spacing.sm,
    flexDirection: 'row-reverse',
    justifyContent: 'flex-start',
  },
  eventCardLocationText: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.gray,
    flex: 1,
    textAlign: 'right',
  },
  eventCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  eventCardAttendees: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  eventJoinBtn: {
    backgroundColor: Colors.cream2,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 5,
  },
  eventJoinBtnActive: { backgroundColor: Colors.terra },
  eventJoinText: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.xs,
    color: Colors.gray,
  },
  eventJoinTextActive: { color: Colors.white },
  almostFullText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.terra,
    textAlign: 'right',
    marginTop: Spacing.xs,
  },

  // Post card
  feedContent: { paddingBottom: Spacing['2xl'] },
  postCard: { backgroundColor: Colors.white, marginBottom: Spacing.xs, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  postHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingVertical: Spacing.md },
  postHeaderLeft: { flexDirection: 'row', alignItems: 'center', flex: 1 },
  postAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cream2, marginRight: Spacing.md },
  postHeaderInfo: { flex: 1 },
  postDogName: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },
  postMeta: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.gray, marginTop: 1 },
  postImage: { width: SCREEN_W, height: SCREEN_W, backgroundColor: Colors.cream2 },
  actionsRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.md, paddingTop: Spacing.md, paddingBottom: Spacing.sm },
  actionsLeft: { flexDirection: 'row', alignItems: 'center', gap: Spacing.base },
  actionBtn: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
  actionCount: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.text },
  actionCountLiked: { color: Colors.terra },
  shareIcon: { transform: [{ scaleX: -1 }] },
  captionWrap: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.sm },
  captionText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text, textAlign: 'right', lineHeight: 20 },
  captionDogName: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },
  captionMore: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.gray },
  commentsPreview: { paddingHorizontal: Spacing.md, paddingBottom: Spacing.md, gap: Spacing.xs },
  viewAllComments: { fontFamily: FontFamily.medium, fontSize: FontSize.sm, color: Colors.gray, textAlign: 'right', marginBottom: Spacing.xs },
  commentPreviewRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
  commentPreviewAvatar: { width: 24, height: 24, borderRadius: 12, backgroundColor: Colors.cream2 },
  commentPreviewText: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text, textAlign: 'right' },
  commentPreviewAuthor: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },
  postBottom: { height: Spacing.xs },

  // Comments modal
  modalSafe: { flex: 1, backgroundColor: Colors.white },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  modalTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text },
  commentsListContent: { paddingHorizontal: Spacing.base, paddingTop: Spacing.md, paddingBottom: Spacing.xl, flexGrow: 1 },
  emptyComments: { fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.gray, textAlign: 'center', marginTop: Spacing['2xl'] },
  commentRow: { flexDirection: 'row', gap: Spacing.md, marginBottom: Spacing.lg, alignItems: 'flex-start' },
  commentRowAvatar: { width: 38, height: 38, borderRadius: 19, backgroundColor: Colors.cream2, marginTop: 2 },
  commentBubble: { flex: 1, backgroundColor: Colors.cream, borderRadius: Radius.medium, padding: Spacing.md },
  commentBubbleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: Spacing.xs },
  commentBubbleName: { fontFamily: FontFamily.bold, fontSize: FontSize.sm, color: Colors.text },
  commentBubbleTime: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.gray },
  commentBubbleText: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text, textAlign: 'right', lineHeight: 19 },
  commentInputRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm, paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderTopWidth: 0.5, borderTopColor: Colors.border, backgroundColor: Colors.white },
  commentInputAvatar: { width: 34, height: 34, borderRadius: 17, backgroundColor: Colors.cream2 },
  commentInputWrap: { flex: 1, backgroundColor: Colors.cream, borderRadius: Radius.pill, paddingHorizontal: Spacing.md, paddingVertical: Platform.OS === 'ios' ? Spacing.sm : 2, minHeight: 38, justifyContent: 'center' },
  commentInput: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.text, textAlignVertical: 'center', maxHeight: 100 },
  sendBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: Colors.terra, alignItems: 'center', justifyContent: 'center' },
  sendBtnDisabled: { backgroundColor: Colors.border },
  sendIcon: { transform: [{ scaleX: -1 }], marginLeft: 1 },

  // Create post modal
  createSafe: { flex: 1, backgroundColor: Colors.white },
  createHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: Spacing.base, paddingVertical: Spacing.md, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  createCancel: { fontFamily: FontFamily.medium, fontSize: FontSize.base, color: Colors.gray },
  createTitle: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text },
  createShare: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.terra },
  createShareDisabled: { color: Colors.border },
  imagePickerArea: { width: SCREEN_W, height: SCREEN_W, backgroundColor: Colors.cream2 },
  pickedImage: { width: SCREEN_W, height: SCREEN_W },
  imagePlaceholder: { flex: 1, alignItems: 'center', justifyContent: 'center', gap: Spacing.sm },
  imagePlaceholderText: { fontFamily: FontFamily.semibold, fontSize: FontSize.base, color: Colors.gray },
  imagePlaceholderSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.placeholder },
  captionInputArea: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md, padding: Spacing.base, borderBottomWidth: 0.5, borderBottomColor: Colors.border },
  createAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cream2, marginTop: 2 },
  captionInputField: { flex: 1, fontFamily: FontFamily.regular, fontSize: FontSize.base, color: Colors.text, textAlign: 'right', textAlignVertical: 'top', minHeight: 80, paddingTop: 0 },
  charCount: { fontFamily: FontFamily.regular, fontSize: FontSize.xs, color: Colors.placeholder, textAlign: 'left', paddingHorizontal: Spacing.base, paddingTop: Spacing.xs },

  // Event details modal
  eventModalSafe: { flex: 1, backgroundColor: Colors.cream },
  eventModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.md,
  },
  eventModalHeaderTitle: {
    fontFamily: FontFamily.bold,
    fontSize: FontSize.base,
    color: Colors.white,
    flex: 1,
    textAlign: 'center',
    marginHorizontal: Spacing.sm,
  },
  eventHero: {
    alignItems: 'center',
    paddingTop: Spacing.xl,
    paddingBottom: Spacing['2xl'] + Radius.large,
    paddingHorizontal: Spacing.xl,
  },
  eventHeroEmoji: { fontSize: 64, marginBottom: Spacing.md },
  eventHeroTitle: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize['2xl'],
    color: Colors.white,
    textAlign: 'center',
    marginBottom: Spacing.sm,
  },
  eventHeroDate: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.base,
    color: 'rgba(255,255,255,0.85)',
  },
  eventDetailCard: {
    backgroundColor: Colors.cream,
    borderTopLeftRadius: Radius.large,
    borderTopRightRadius: Radius.large,
    marginTop: -Radius.large,
    padding: Spacing.xl,
    gap: Spacing.lg,
  },
  eventDetailRow: { flexDirection: 'row', alignItems: 'flex-start', gap: Spacing.md },
  eventDetailIcon: {
    width: 40, height: 40, borderRadius: 20,
    alignItems: 'center', justifyContent: 'center',
  },
  eventOrgAvatar: { width: 40, height: 40, borderRadius: 20, backgroundColor: Colors.cream2 },
  eventDetailText: { flex: 1 },
  eventDetailLabel: { fontFamily: FontFamily.medium, fontSize: FontSize.xs, color: Colors.gray, textAlign: 'right', marginBottom: 2 },
  eventDetailValue: { fontFamily: FontFamily.bold, fontSize: FontSize.base, color: Colors.text, textAlign: 'right' },
  eventDetailSub: { fontFamily: FontFamily.regular, fontSize: FontSize.sm, color: Colors.gray, textAlign: 'right', marginTop: 1 },
  eventAttendeesBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
    backgroundColor: Colors.forestDim,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    alignSelf: 'flex-end',
  },
  eventAttendeesText: { fontFamily: FontFamily.semibold, fontSize: FontSize.sm, color: Colors.forest },
  eventDetailDesc: {
    fontFamily: FontFamily.regular,
    fontSize: FontSize.base,
    color: Colors.text,
    textAlign: 'right',
    lineHeight: 24,
  },
});
