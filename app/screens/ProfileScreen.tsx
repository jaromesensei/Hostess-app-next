import React from 'react';
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  SafeAreaView,
  StatusBar,
} from 'react-native';
import { useApp } from '../context/AppContext';
import { TagChip } from '../components/TagChip';

export default function ProfileScreen() {
  const { userDog } = useApp();

  const healthScore = 87;
  const scoreWidth = `${healthScore}%`;

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="#FAFAFA" />
      <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
        <View style={styles.profileHeader}>
          <View style={styles.avatarContainer}>
            <Text style={styles.avatar}>🐕</Text>
          </View>
          <Text style={styles.dogName}>{userDog.name || 'Your Dog'}</Text>
          <Text style={styles.ownerLabel}>Your companion 🐾</Text>
        </View>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>🐕</Text>
            <Text style={styles.statValue}>{userDog.breed || '—'}</Text>
            <Text style={styles.statLabel}>Breed</Text>
          </View>
          <View style={[styles.statCard, styles.statCardMiddle]}>
            <Text style={styles.statIcon}>🎂</Text>
            <Text style={styles.statValue}>{userDog.age ? `${userDog.age}y` : '—'}</Text>
            <Text style={styles.statLabel}>Age</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statIcon}>{userDog.gender === 'Female' ? '🐩' : '🐶'}</Text>
            <Text style={styles.statValue}>{userDog.gender || '—'}</Text>
            <Text style={styles.statLabel}>Gender</Text>
          </View>
        </View>

        {userDog.personality.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Personality</Text>
            <View style={styles.tagsRow}>
              {userDog.personality.map((tag) => (
                <TagChip key={tag} label={tag} selected />
              ))}
            </View>
          </View>
        )}

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Health Overview</Text>
          <View style={styles.healthCard}>
            <View style={styles.healthRow}>
              <Text style={styles.healthIcon}>💉</Text>
              <View style={styles.healthInfo}>
                <Text style={styles.healthLabel}>Next Vaccine</Text>
                <Text style={styles.healthValue}>March 2025</Text>
              </View>
              <View style={[styles.healthBadge, styles.upcomingBadge]}>
                <Text style={styles.upcomingText}>Upcoming</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.healthRow}>
              <Text style={styles.healthIcon}>⚖️</Text>
              <View style={styles.healthInfo}>
                <Text style={styles.healthLabel}>Weight</Text>
                <Text style={styles.healthValue}>12 kg</Text>
              </View>
              <View style={[styles.healthBadge, styles.goodBadge]}>
                <Text style={styles.goodText}>Normal</Text>
              </View>
            </View>
            <View style={styles.divider} />
            <View style={styles.healthRow}>
              <Text style={styles.healthIcon}>🏥</Text>
              <View style={styles.healthInfo}>
                <Text style={styles.healthLabel}>Last Vet Visit</Text>
                <Text style={styles.healthValue}>3 months ago</Text>
              </View>
              <View style={[styles.healthBadge, styles.goodBadge]}>
                <Text style={styles.goodText}>Recent</Text>
              </View>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Woofy Score</Text>
          <View style={styles.scoreCard}>
            <View style={styles.scoreHeader}>
              <View>
                <Text style={styles.scoreTitle}>Health Score</Text>
                <Text style={styles.scoreSubtitle}>Based on vet visits & activity</Text>
              </View>
              <Text style={styles.scoreNumber}>{healthScore}/100</Text>
            </View>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: scoreWidth as any }]} />
            </View>
            <View style={styles.scoreLabels}>
              <Text style={styles.scoreLabelText}>🏆 Excellent health!</Text>
              <Text style={styles.scoreLabelText}>Last updated today</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Activity</Text>
          <View style={styles.activityRow}>
            <View style={styles.activityCard}>
              <Text style={styles.activityEmoji}>🤝</Text>
              <Text style={styles.activityNum}>24</Text>
              <Text style={styles.activityLabel}>Meets</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityEmoji}>❤️</Text>
              <Text style={styles.activityNum}>47</Text>
              <Text style={styles.activityLabel}>Likes</Text>
            </View>
            <View style={styles.activityCard}>
              <Text style={styles.activityEmoji}>💬</Text>
              <Text style={styles.activityNum}>8</Text>
              <Text style={styles.activityLabel}>Chats</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FAFAFA',
  },
  scroll: {
    paddingBottom: 32,
  },
  profileHeader: {
    alignItems: 'center',
    paddingTop: 24,
    paddingBottom: 20,
    backgroundColor: '#fff',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
    marginBottom: 16,
  },
  avatarContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#FFF5F2',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderWidth: 3,
    borderColor: '#FF6B35',
  },
  avatar: {
    fontSize: 52,
  },
  dogName: {
    fontSize: 26,
    fontWeight: '800',
    color: '#2D3561',
    marginBottom: 4,
  },
  ownerLabel: {
    fontSize: 14,
    color: '#aaa',
  },
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 14,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  statCardMiddle: {
    backgroundColor: '#FF6B35',
  },
  statIcon: {
    fontSize: 22,
    marginBottom: 6,
  },
  statValue: {
    fontSize: 14,
    fontWeight: '700',
    color: '#2D3561',
    textAlign: 'center',
  },
  statLabel: {
    fontSize: 11,
    color: '#aaa',
    marginTop: 2,
  },
  section: {
    paddingHorizontal: 16,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#2D3561',
    marginBottom: 10,
  },
  tagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  healthCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  healthRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
  },
  healthIcon: {
    fontSize: 24,
    marginRight: 12,
  },
  healthInfo: {
    flex: 1,
  },
  healthLabel: {
    fontSize: 12,
    color: '#aaa',
    marginBottom: 2,
  },
  healthValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2D3561',
  },
  healthBadge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  goodBadge: {
    backgroundColor: '#E8F8F0',
  },
  upcomingBadge: {
    backgroundColor: '#FFF3E0',
  },
  goodText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#27AE60',
  },
  upcomingText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#F39C12',
  },
  divider: {
    height: 1,
    backgroundColor: '#F5F5F5',
  },
  scoreCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  scoreHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  scoreTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2D3561',
  },
  scoreSubtitle: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
  scoreNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FF6B35',
  },
  progressTrack: {
    height: 12,
    backgroundColor: '#F0F0F0',
    borderRadius: 6,
    overflow: 'hidden',
    marginBottom: 10,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FF6B35',
    borderRadius: 6,
  },
  scoreLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  scoreLabelText: {
    fontSize: 12,
    color: '#888',
  },
  activityRow: {
    flexDirection: 'row',
    gap: 10,
  },
  activityCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  activityEmoji: {
    fontSize: 24,
    marginBottom: 6,
  },
  activityNum: {
    fontSize: 22,
    fontWeight: '800',
    color: '#2D3561',
  },
  activityLabel: {
    fontSize: 12,
    color: '#aaa',
    marginTop: 2,
  },
});
