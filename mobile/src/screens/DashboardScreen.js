import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import GlassPanel from '../components/GlassPanel';
import { colors } from '../styles/theme';

const DashboardScreen = ({ navigation }) => {
  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        {/* Main Cycle Card */}
        <GlassPanel style={styles.cycleCard}>
          <View style={styles.cycleCircle}>
            <Text style={styles.phaseText}>FOLLICULAR</Text>
            <Text style={styles.dayText}>Day 4 of cycle</Text>
            <Text style={styles.statusText}>Track your wellness</Text>
          </View>
        </GlassPanel>

        {/* Quick Actions */}
        <View style={styles.quickActions}>
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddLog')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.primary + '20' }]}>
              <Ionicons name="water" size={24} color={colors.primary} />
            </View>
            <Text style={styles.actionLabel}>Log Flow</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => navigation.navigate('AddLog')}
          >
            <View style={[styles.actionIcon, { backgroundColor: colors.accent + '20' }]}>
              <Ionicons name="happy" size={24} color={colors.accent} />
            </View>
            <Text style={styles.actionLabel}>Mood</Text>
          </TouchableOpacity>
        </View>

        {/* Daily Insights */}
        <Text style={styles.sectionTitle}>Your daily plan</Text>
        <GlassPanel style={styles.insightCard}>
          <View style={styles.insightBadge}>
            <Text style={styles.insightBadgeText}>NUTRITION</Text>
          </View>
          <Text style={styles.insightTitle}>Cycle Syncing: Breakfast for energy</Text>
          <Text style={styles.insightText}>
            Focus on protein-rich meals and light movement to support your follicular phase.
          </Text>
        </GlassPanel>

        {/* Feature Cards */}
        <View style={styles.featureGrid}>
          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colors.accent }]}
            onPress={() => navigation.navigate('Chat')}
          >
            <Ionicons name="chatbubbles" size={32} color="#fff" />
            <Text style={styles.featureTitle}>AI Chat</Text>
            <Text style={styles.featureSubtitle}>Ask about your cycle</Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={[styles.featureCard, { backgroundColor: colors.primary }]}
            onPress={() => navigation.navigate('Cycle')}
          >
            <Ionicons name="fitness" size={32} color="#fff" />
            <Text style={styles.featureTitle}>Workout</Text>
            <Text style={styles.featureSubtitle}>Low intensity cardio</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.powder,
  },
  scrollView: {
    flex: 1,
  },
  content: {
    padding: 24,
  },
  cycleCard: {
    padding: 32,
    marginBottom: 24,
    alignItems: 'center',
  },
  cycleCircle: {
    alignItems: 'center',
  },
  phaseText: {
    fontSize: 11,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
    marginBottom: 8,
  },
  dayText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate[500],
    marginBottom: 8,
  },
  statusText: {
    fontSize: 20,
    fontWeight: '900',
    color: colors.slate[800],
    textAlign: 'center',
  },
  quickActions: {
    flexDirection: 'row',
    gap: 16,
    marginBottom: 32,
  },
  actionButton: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 24,
    padding: 16,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  actionIcon: {
    width: 48,
    height: 48,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  actionLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.slate[800],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.slate[800],
    marginBottom: 16,
  },
  insightCard: {
    padding: 20,
    marginBottom: 24,
  },
  insightBadge: {
    backgroundColor: colors.pink[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 12,
  },
  insightBadgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
  },
  insightTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.slate[800],
    marginBottom: 8,
  },
  insightText: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate[500],
    lineHeight: 20,
  },
  featureGrid: {
    flexDirection: 'row',
    gap: 16,
  },
  featureCard: {
    flex: 1,
    borderRadius: 32,
    padding: 20,
    aspectRatio: 1,
    justifyContent: 'space-between',
  },
  featureTitle: {
    fontSize: 14,
    fontWeight: '900',
    color: '#fff',
    letterSpacing: 1,
  },
  featureSubtitle: {
    fontSize: 11,
    color: '#fff',
    opacity: 0.8,
  },
});

export default DashboardScreen;
