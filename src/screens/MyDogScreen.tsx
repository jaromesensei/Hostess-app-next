import React, { useState } from 'react';
import {
  View,
  ScrollView,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useApp } from '@/context/AppContext';
import { Colors, FontFamily, FontSize, Spacing, Radius, Shadow } from '@/theme';
import {
  WText,
  WButton,
  WInput,
  WTag,
  WToggle,
  WBottomSheet,
} from '@/components/ui';
import { getAgeString } from '@/data/mockDogs';
import { generateId } from '@/services/storage';
import { notificationService } from '@/services/notifications';
import { HealthRecord, Reminder } from '@/types';

// ─── Health Record Types ────────────────────────────────────────────────────

type HealthType = HealthRecord['type'];
type ReminderType = Reminder['type'];

const HEALTH_TYPE_OPTIONS: { type: HealthType; emoji: string; label: string }[] = [
  { type: 'vaccine',    emoji: '💉', label: 'חיסון' },
  { type: 'vet_visit',  emoji: '🏥', label: 'ביקור וטרינר' },
  { type: 'medication', emoji: '💊', label: 'תרופה' },
  { type: 'other',      emoji: '📝', label: 'אחר' },
];

const REMINDER_TYPE_OPTIONS: { type: ReminderType; emoji: string; label: string }[] = [
  { type: 'food',       emoji: '🍖', label: 'אוכל' },
  { type: 'walk',       emoji: '🦮', label: 'טיול' },
  { type: 'medication', emoji: '💊', label: 'תרופה' },
  { type: 'other',      emoji: '🔔', label: 'אחר' },
];

const REMINDER_DEFAULT_TITLES: Record<ReminderType, string> = {
  food:       'ארוחת בוקר',
  walk:       'טיול בוקר',
  medication: 'מתן תרופה',
  vaccine:    'חיסון',
  other:      'תזכורת',
};

const HEB_DAYS: { key: string; label: string }[] = [
  { key: 'MON', label: 'ב' },
  { key: 'TUE', label: 'ג' },
  { key: 'WED', label: 'ד' },
  { key: 'THU', label: 'ה' },
  { key: 'FRI', label: 'ו' },
  { key: 'SAT', label: 'ש' },
  { key: 'SUN', label: 'א' },
];

// ─── Format date DD/MM/YYYY ─────────────────────────────────────────────────

function formatDate(iso: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (isNaN(d.getTime())) {
    // Try treating as DD/MM/YYYY already
    return iso;
  }
  const dd = String(d.getDate()).padStart(2, '0');
  const mm = String(d.getMonth() + 1).padStart(2, '0');
  const yyyy = d.getFullYear();
  return `${dd}/${mm}/${yyyy}`;
}

// Normalise a DD/MM/YYYY string to ISO for storage
function parseDateInput(input: string): string {
  const parts = input.split('/');
  if (parts.length === 3) {
    const [dd, mm, yyyy] = parts;
    return `${yyyy}-${mm.padStart(2, '0')}-${dd.padStart(2, '0')}`;
  }
  return input;
}

function healthTypeIcon(type: HealthType): string {
  switch (type) {
    case 'vaccine':    return '💉';
    case 'vet_visit':  return '🏥';
    case 'medication': return '💊';
    default:           return '📝';
  }
}

// ─── Main Screen ────────────────────────────────────────────────────────────

export const MyDogScreen: React.FC = () => {
  const { state, addHealthRecord, deleteHealthRecord, addReminder, updateReminder, deleteReminder, toggleReminder } = useApp();
  const dog = state.dog;

  // ── Health modal state ────
  const [showHealthModal, setShowHealthModal] = useState(false);
  const [hType,    setHType]    = useState<HealthType>('vaccine');
  const [hTitle,   setHTitle]   = useState('');
  const [hDate,    setHDate]    = useState('');
  const [hVet,     setHVet]     = useState('');
  const [hNext,    setHNext]    = useState('');
  const [hNotes,   setHNotes]   = useState('');
  const [hError,   setHError]   = useState('');

  // ── Reminder modal state ──
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [editingReminderId, setEditingReminderId] = useState<string | null>(null);
  const [rType,   setRType]   = useState<ReminderType>('food');
  const [rTitle,  setRTitle]  = useState('');
  const [rTime,   setRTime]   = useState('');
  const [rDays,   setRDays]   = useState<string[]>([]);
  const [rActive, setRActive] = useState(true);
  const [rError,  setRError]  = useState('');

  // ── Reset health form ─────
  const resetHealthForm = () => {
    setHType('vaccine');
    setHTitle('');
    setHDate('');
    setHVet('');
    setHNext('');
    setHNotes('');
    setHError('');
  };

  // ── Reset reminder form ───
  const resetReminderForm = () => {
    setEditingReminderId(null);
    setRType('food');
    setRTitle(REMINDER_DEFAULT_TITLES['food']);
    setRTime('');
    setRDays([]);
    setRActive(true);
    setRError('');
  };

  // ── Save health record ────
  const handleSaveHealth = () => {
    if (!hTitle.trim()) { setHError('נא להזין כותרת'); return; }
    if (!hDate.trim())  { setHError('נא להזין תאריך'); return; }
    if (!dog) return;

    const record: HealthRecord = {
      id:      generateId('hr'),
      dogId:   dog.id,
      type:    hType,
      title:   hTitle.trim(),
      date:    parseDateInput(hDate.trim()),
      vetName: hVet.trim() || undefined,
      nextDate:hNext.trim() ? parseDateInput(hNext.trim()) : undefined,
      notes:   hNotes.trim() || undefined,
    };
    addHealthRecord(record);
    setShowHealthModal(false);
    resetHealthForm();
  };

  // ── Save reminder ─────────
  const handleSaveReminder = async () => {
    if (!rTitle.trim())      { setRError('נא להזין כותרת'); return; }
    if (!rTime.trim())       { setRError('נא להזין שעה'); return; }
    if (!/^\d{1,2}:\d{2}$/.test(rTime.trim())) { setRError('פורמט שעה לא תקין (HH:MM)'); return; }
    if (rDays.length === 0)  { setRError('נא לבחור יום אחד לפחות'); return; }
    if (!dog) return;

    const reminder: Reminder = {
      id:      editingReminderId || generateId('rem'),
      dogId:   dog.id,
      type:    rType,
      title:   rTitle.trim(),
      time:    rTime.trim(),
      days:    rDays,
      isActive:rActive,
    };

    if (editingReminderId) {
      updateReminder(reminder);
    } else {
      addReminder(reminder);
    }

    // Schedule notification
    try {
      const ids = await notificationService.scheduleReminder(reminder, dog.name);
      if (ids.length > 0) {
        if (editingReminderId) {
          updateReminder({ ...reminder, notificationIds: ids });
        } else {
          // ids were already stored above; update with notification ids
          updateReminder({ ...reminder, notificationIds: ids });
        }
      }
    } catch {
      // Notification scheduling is best-effort
    }

    setShowReminderModal(false);
    resetReminderForm();
  };

  const openEditReminder = (rem: Reminder) => {
    setEditingReminderId(rem.id);
    setRType(rem.type);
    setRTitle(rem.title);
    setRTime(rem.time);
    setRDays([...rem.days]);
    setRActive(rem.isActive);
    setRError('');
    setShowReminderModal(true);
  };

  const handleDeleteHealth = (id: string) => {
    Alert.alert('מחיקת רשומה', 'האם למחוק את הרשומה?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => deleteHealthRecord(id) },
    ]);
  };

  const handleDeleteReminder = (id: string) => {
    Alert.alert('מחיקת תזכורת', 'האם למחוק את התזכורת?', [
      { text: 'ביטול', style: 'cancel' },
      { text: 'מחק', style: 'destructive', onPress: () => deleteReminder(id) },
    ]);
  };

  const toggleDay = (key: string) => {
    setRDays(prev =>
      prev.includes(key) ? prev.filter(d => d !== key) : [...prev, key]
    );
  };

  // ── No dog state ──────────
  if (!dog) {
    return (
      <SafeAreaView style={styles.root}>
        <View style={styles.noDogContainer}>
          <WText style={{ fontSize: 64 }}>🐾</WText>
          <WText variant="h3" color={Colors.forest} center style={{ marginTop: Spacing.base }}>
            לא נרשם כלב
          </WText>
          <WText variant="body" color={Colors.gray} center style={{ marginTop: Spacing.sm }}>
            השלם את ההרשמה כדי להוסיף את הכלב שלך
          </WText>
        </View>
      </SafeAreaView>
    );
  }

  const dogRecords = state.healthRecords.filter(r => r.dogId === dog.id);
  const dogReminders = state.reminders.filter(r => r.dogId === dog.id);

  return (
    <SafeAreaView style={styles.root} edges={['top']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* ═══ PROFILE SECTION ═══ */}

        {/* Hero Image */}
        <View style={styles.heroContainer}>
          {dog.photos && dog.photos.length > 0 ? (
            <Image
              source={{ uri: dog.photos[0] }}
              style={styles.heroImage}
              resizeMode="cover"
            />
          ) : (
            <View style={[styles.heroImage, styles.heroPlaceholder]}>
              <WText style={{ fontSize: 72 }}>🐾</WText>
            </View>
          )}
          {/* Edit button */}
          <TouchableOpacity
            style={styles.editButton}
            onPress={() => Alert.alert('עריכה', 'פונקציית עריכה תהיה זמינה בקרוב')}
            activeOpacity={0.8}
          >
            <WText style={styles.editButtonText}>✏️ ערוך</WText>
          </TouchableOpacity>
        </View>

        {/* Floating profile card */}
        <View style={styles.profileCard}>
          {/* Name */}
          <WText style={styles.dogName}>{dog.name}</WText>

          {/* Breed • Age • Gender row */}
          <View style={styles.infoRow}>
            <WText variant="captionMedium" color={Colors.gray}>{dog.breed}</WText>
            <WText variant="captionMedium" color={Colors.gray}> • </WText>
            <WText variant="captionMedium" color={Colors.gray}>{getAgeString(dog.birthDate)}</WText>
            <WText variant="captionMedium" color={Colors.gray}> • </WText>
            <WText variant="captionMedium" color={Colors.gray}>
              {dog.gender === 'male' ? '♂' : '♀'}
            </WText>
            {dog.isNeutered && (
              <View style={styles.neuteredTag}>
                <WText style={styles.neuteredTagText}>
                  {dog.gender === 'male' ? 'מסורס' : 'מעוקרת'}
                </WText>
              </View>
            )}
          </View>

          {/* Stats row */}
          <View style={styles.statsRow}>
            <View style={styles.statCell}>
              <WText style={styles.statNumber}>{state.matches.length}</WText>
              <WText variant="caption" color={Colors.gray}>Matches</WText>
            </View>
            <View style={[styles.statCell, styles.statCellBorder]}>
              <WText style={styles.statNumber}>0</WText>
              <WText variant="caption" color={Colors.gray}>טיולים</WText>
            </View>
            <View style={[styles.statCell, styles.statCellBorder]}>
              <WText style={styles.statNumber}>{state.likedDogIds.length}</WText>
              <WText variant="caption" color={Colors.gray}>חברים</WText>
            </View>
          </View>
        </View>

        {/* Personality tags */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tagsContainer}
          style={styles.tagsScroll}
        >
          {dog.personality.map(tag => (
            <WTag
              key={tag}
              label={tag}
              small
              color={Colors.terra}
              style={{ marginLeft: Spacing.sm }}
            />
          ))}
        </ScrollView>

        {/* ═══ HEALTH PASSPORT ═══ */}

        <View style={styles.sectionHeader}>
          <WText variant="h4" color={Colors.forest}>📋 פנקס בריאות</WText>
          <TouchableOpacity onPress={() => { resetHealthForm(); setShowHealthModal(true); }}>
            <WText variant="bodySemibold" color={Colors.terra}>הוסף +</WText>
          </TouchableOpacity>
        </View>

        {dogRecords.length === 0 ? (
          <View style={styles.emptyHealthCard}>
            <WText style={{ fontSize: 36 }}>💉</WText>
            <WText variant="bodyMedium" color={Colors.gray} center style={{ marginTop: Spacing.sm }}>
              עוד אין רשומות רפואיות
            </WText>
            <TouchableOpacity onPress={() => { resetHealthForm(); setShowHealthModal(true); }}>
              <WText variant="captionMedium" color={Colors.terra} center style={{ marginTop: Spacing.xs }}>
                הוסף את הביקור הראשון →
              </WText>
            </TouchableOpacity>
          </View>
        ) : (
          dogRecords.map(record => (
            <TouchableOpacity
              key={record.id}
              style={styles.healthCard}
              onLongPress={() => handleDeleteHealth(record.id)}
              activeOpacity={0.85}
            >
              <View style={styles.healthIconCircle}>
                <WText style={{ fontSize: 20 }}>{healthTypeIcon(record.type)}</WText>
              </View>
              <View style={styles.healthContent}>
                <WText variant="bodySemibold">{record.title}</WText>
                {record.vetName ? (
                  <WText variant="caption" color={Colors.gray}>{record.vetName}</WText>
                ) : null}
                <WText variant="captionMedium" color={Colors.forest}>
                  {formatDate(record.date)}
                </WText>
                {record.nextDate ? (
                  <WText variant="caption" color={Colors.terra}>
                    ביקור הבא: {formatDate(record.nextDate)}
                  </WText>
                ) : null}
                {record.notes ? (
                  <WText variant="caption" color={Colors.gray} numberOfLines={1}>
                    {record.notes}
                  </WText>
                ) : null}
              </View>
            </TouchableOpacity>
          ))
        )}

        {/* ═══ REMINDERS ═══ */}

        <View style={[styles.sectionHeader, { marginTop: Spacing['2xl'] }]}>
          <WText variant="h4" color={Colors.forest}>🔔 תזכורות</WText>
          <TouchableOpacity onPress={() => { resetReminderForm(); setShowReminderModal(true); }}>
            <WText variant="bodySemibold" color={Colors.terra}>הוסף +</WText>
          </TouchableOpacity>
        </View>

        {dogReminders.length === 0 ? (
          <View style={styles.emptyReminderRow}>
            <WText variant="caption" color={Colors.gray}>
              אין תזכורות פעילות.{' '}
              <WText
                variant="caption"
                color={Colors.terra}
                onPress={() => { resetReminderForm(); setShowReminderModal(true); }}
              >
                הוסף תזכורת ראשונה →
              </WText>
            </WText>
          </View>
        ) : (
          dogReminders.map(rem => (
            <TouchableOpacity
              key={rem.id}
              style={styles.reminderCard}
              onPress={() => openEditReminder(rem)}
              onLongPress={() => handleDeleteReminder(rem.id)}
              activeOpacity={0.85}
            >
              <View style={styles.reminderIconCircle}>
                <WText style={{ fontSize: 20 }}>
                  {REMINDER_TYPE_OPTIONS.find(o => o.type === rem.type)?.emoji ?? '🔔'}
                </WText>
              </View>
              <View style={styles.reminderContent}>
                <WText variant="bodySemibold">{rem.title}</WText>
                <WText variant="caption" color={Colors.gray}>
                  {rem.days.join(', ')} • {rem.time}
                </WText>
              </View>
              <WToggle
                value={rem.isActive}
                onToggle={() => toggleReminder(rem.id)}
              />
            </TouchableOpacity>
          ))
        )}

        {/* Bottom padding */}
        <View style={{ height: Spacing['3xl'] }} />
      </ScrollView>

      {/* ═══ ADD HEALTH RECORD MODAL ═══ */}
      <WBottomSheet
        visible={showHealthModal}
        onClose={() => { setShowHealthModal(false); resetHealthForm(); }}
        snapHeight={520}
        scrollable
      >
        <View style={styles.modalInner}>
          <WText variant="h3" color={Colors.forest} right style={{ marginBottom: Spacing.base }}>
            הוספת רשומה רפואית
          </WText>

          {/* Type chips */}
          <View style={styles.chipRow}>
            {HEALTH_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.type}
                style={[styles.chip, hType === opt.type && styles.chipSelected]}
                onPress={() => setHType(opt.type)}
              >
                <WText style={styles.chipText}>
                  {opt.emoji} {opt.label}
                </WText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: Spacing.base }} />

          <WInput
            label="כותרת"
            value={hTitle}
            onChangeText={setHTitle}
            placeholder="למשל: חיסון כלבת"
          />
          <View style={{ height: Spacing.sm }} />

          <WInput
            label="תאריך"
            value={hDate}
            onChangeText={setHDate}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
          />
          <View style={{ height: Spacing.sm }} />

          <WInput
            label="שם הווטרינר (אופציונלי)"
            value={hVet}
            onChangeText={setHVet}
            placeholder="ד״ר ישראל ישראלי"
          />
          <View style={{ height: Spacing.sm }} />

          <WInput
            label="תאריך ביקור הבא (אופציונלי)"
            value={hNext}
            onChangeText={setHNext}
            placeholder="DD/MM/YYYY"
            keyboardType="numeric"
          />
          <View style={{ height: Spacing.sm }} />

          <WInput
            label="הערות (אופציונלי)"
            value={hNotes}
            onChangeText={setHNotes}
            placeholder="הערות נוספות..."
            multiline
            numberOfLines={3}
            style={{ minHeight: 76 }}
          />

          {hError ? (
            <WText variant="caption" color={Colors.error} right style={{ marginTop: Spacing.xs }}>
              {hError}
            </WText>
          ) : null}

          <View style={{ height: Spacing.base }} />
          <WButton label="שמור" onPress={handleSaveHealth} variant="primary" />
        </View>
      </WBottomSheet>

      {/* ═══ ADD/EDIT REMINDER MODAL ═══ */}
      <WBottomSheet
        visible={showReminderModal}
        onClose={() => { setShowReminderModal(false); resetReminderForm(); }}
        snapHeight={480}
        scrollable
      >
        <View style={styles.modalInner}>
          <WText variant="h3" color={Colors.forest} right style={{ marginBottom: Spacing.base }}>
            {editingReminderId ? 'עריכת תזכורת' : 'תזכורת חדשה'}
          </WText>

          {/* Type chips */}
          <View style={styles.chipRow}>
            {REMINDER_TYPE_OPTIONS.map(opt => (
              <TouchableOpacity
                key={opt.type}
                style={[styles.chip, rType === opt.type && styles.chipSelected]}
                onPress={() => {
                  setRType(opt.type);
                  if (!editingReminderId) setRTitle(REMINDER_DEFAULT_TITLES[opt.type]);
                }}
              >
                <WText style={styles.chipText}>
                  {opt.emoji} {opt.label}
                </WText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: Spacing.base }} />

          <WInput
            label="כותרת"
            value={rTitle}
            onChangeText={setRTitle}
            placeholder="שם התזכורת"
          />
          <View style={{ height: Spacing.sm }} />

          <WInput
            label="שעה"
            value={rTime}
            onChangeText={setRTime}
            placeholder="HH:MM"
            keyboardType="numeric"
          />
          <View style={{ height: Spacing.base }} />

          {/* Days selector */}
          <WText variant="captionMedium" color={Colors.gray} right style={{ marginBottom: Spacing.xs }}>
            ימים
          </WText>
          <View style={styles.daysRow}>
            {HEB_DAYS.map(day => (
              <TouchableOpacity
                key={day.key}
                style={[styles.dayChip, rDays.includes(day.key) && styles.dayChipSelected]}
                onPress={() => toggleDay(day.key)}
              >
                <WText
                  style={[
                    styles.dayChipText,
                    rDays.includes(day.key) && styles.dayChipTextSelected,
                  ]}
                >
                  {day.label}
                </WText>
              </TouchableOpacity>
            ))}
          </View>

          <View style={{ height: Spacing.base }} />

          {/* Active toggle */}
          <View style={styles.toggleRow}>
            <WText variant="bodySemibold" color={Colors.text}>פעיל</WText>
            <WToggle value={rActive} onToggle={setRActive} />
          </View>

          {rError ? (
            <WText variant="caption" color={Colors.error} right style={{ marginTop: Spacing.xs }}>
              {rError}
            </WText>
          ) : null}

          <View style={{ height: Spacing.base }} />
          <WButton label="שמור" onPress={handleSaveReminder} variant="primary" />
        </View>
      </WBottomSheet>
    </SafeAreaView>
  );
};

// ─── Styles ──────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: Colors.cream,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: Spacing['3xl'],
  },

  // No-dog state
  noDogContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.xl,
  },

  // Hero
  heroContainer: {
    position: 'relative',
  },
  heroImage: {
    width: '100%',
    height: 260,
  },
  heroPlaceholder: {
    backgroundColor: Colors.cream2,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButton: {
    position: 'absolute',
    top: Spacing.base,
    right: Spacing.base,
    backgroundColor: Colors.white,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.base,
    paddingVertical: Spacing.xs,
    ...Shadow.soft,
  },
  editButtonText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.terra,
  },

  // Profile card
  profileCard: {
    marginTop: -40,
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.white,
    borderRadius: 20,
    padding: Spacing.lg,
    ...Shadow.medium,
  },
  dogName: {
    fontFamily: FontFamily.displayBlack,
    fontSize: 26,
    color: Colors.forest,
    textAlign: 'right',
  },
  infoRow: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginTop: Spacing.xs,
    flexWrap: 'wrap',
    gap: 2,
  },
  neuteredTag: {
    backgroundColor: Colors.forest,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.sm,
    paddingVertical: 2,
    marginRight: Spacing.xs,
  },
  neuteredTagText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.xs,
    color: Colors.white,
  },

  // Stats
  statsRow: {
    flexDirection: 'row',
    marginTop: Spacing.base,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    paddingTop: Spacing.base,
  },
  statCell: {
    flex: 1,
    alignItems: 'center',
  },
  statCellBorder: {
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  statNumber: {
    fontFamily: FontFamily.displayBlack,
    fontSize: FontSize.xl,
    color: Colors.forest,
  },

  // Tags
  tagsScroll: {
    marginHorizontal: Spacing.lg,
    marginTop: Spacing.md,
  },
  tagsContainer: {
    flexDirection: 'row-reverse',
    paddingRight: Spacing.sm,
    gap: Spacing.xs,
  },

  // Section header
  sectionHeader: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginTop: Spacing['2xl'],
    marginBottom: Spacing.md,
  },

  // Empty health card
  emptyHealthCard: {
    marginHorizontal: Spacing.lg,
    backgroundColor: Colors.cream2,
    borderRadius: Radius.medium,
    padding: Spacing.xl,
    alignItems: 'center',
  },

  // Health record card
  healthCard: {
    flexDirection: 'row-reverse',
    alignItems: 'flex-start',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.white,
    borderRadius: Radius.medium,
    padding: Spacing.base,
    ...Shadow.soft,
    gap: Spacing.md,
  },
  healthIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.terraDim,
    alignItems: 'center',
    justifyContent: 'center',
  },
  healthContent: {
    flex: 1,
    alignItems: 'flex-end',
    gap: 2,
  },

  // Empty reminder
  emptyReminderRow: {
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
  },

  // Reminder card
  reminderCard: {
    flexDirection: 'row-reverse',
    alignItems: 'center',
    marginHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    backgroundColor: Colors.cream2,
    borderRadius: Radius.medium,
    padding: Spacing.base - 2,
    ...Shadow.soft,
    gap: Spacing.sm,
  },
  reminderIconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.white,
    alignItems: 'center',
    justifyContent: 'center',
  },
  reminderContent: {
    flex: 1,
    alignItems: 'flex-end',
  },

  // Modal
  modalInner: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Platform.OS === 'android' ? Spacing['2xl'] : Spacing.base,
  },

  // Chips
  chipRow: {
    flexDirection: 'row-reverse',
    flexWrap: 'wrap',
    gap: Spacing.xs,
  },
  chip: {
    borderWidth: 1.5,
    borderColor: Colors.border,
    borderRadius: Radius.pill,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    backgroundColor: 'transparent',
  },
  chipSelected: {
    borderColor: Colors.terra,
    backgroundColor: Colors.terraDim,
  },
  chipText: {
    fontFamily: FontFamily.medium,
    fontSize: FontSize.sm,
    color: Colors.text,
  },

  // Days row
  daysRow: {
    flexDirection: 'row-reverse',
    gap: Spacing.xs,
  },
  dayChip: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: Colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'transparent',
  },
  dayChipSelected: {
    borderColor: Colors.terra,
    backgroundColor: Colors.terra,
  },
  dayChipText: {
    fontFamily: FontFamily.semibold,
    fontSize: FontSize.sm,
    color: Colors.gray,
  },
  dayChipTextSelected: {
    color: Colors.white,
  },

  // Toggle row
  toggleRow: {
    flexDirection: 'row-reverse',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
});
