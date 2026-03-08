import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, ActivityIndicator } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { cycleAPI } from '../services/api';
import GlassPanel from '../components/GlassPanel';
import { colors } from '../styles/theme';

const CycleTrackerScreen = () => {
  const [cycles, setCycles] = useState([]);
  const [predictions, setPredictions] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [cyclesData, predictionsData] = await Promise.all([
        cycleAPI.getCycles(),
        cycleAPI.getPredictions(),
      ]);
      setCycles(cyclesData);
      setPredictions(predictionsData);
    } catch (error) {
      console.error('Failed to fetch cycle data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Cycle Summary */}
        <GlassPanel style={styles.summaryCard}>
          <View style={styles.summaryHeader}>
            <Text style={styles.summaryLabel}>YOUR CYCLE</Text>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>NORMAL RANGE</Text>
            </View>
          </View>
          <View style={styles.summaryStats}>
            <Text style={styles.summaryNumber}>28</Text>
            <Text style={styles.summaryUnit}>days avg.</Text>
          </View>
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: '15%' }]} />
          </View>
          <Text style={styles.progressLabel}>Cycle irregularity: ± 2 days</Text>
        </GlassPanel>

        {/* Predictions */}
        {predictions && (
          <View>
            <Text style={styles.sectionTitle}>Predictions</Text>
            <GlassPanel style={styles.predictionCard}>
              <View style={styles.predictionRow}>
                <Ionicons name="water" size={24} color={colors.primary} />
                <View style={styles.predictionInfo}>
                  <Text style={styles.predictionLabel}>Next Period</Text>
                  <Text style={styles.predictionValue}>
                    {predictions.next_period_date || 'Calculating...'}
                  </Text>
                </View>
              </View>
            </GlassPanel>

            <GlassPanel style={styles.predictionCard}>
              <View style={styles.predictionRow}>
                <Ionicons name="heart" size={24} color={colors.accent} />
                <View style={styles.predictionInfo}>
                  <Text style={styles.predictionLabel}>Fertile Window</Text>
                  <Text style={styles.predictionValue}>
                    {predictions.fertile_window || 'Calculating...'}
                  </Text>
                </View>
              </View>
            </GlassPanel>
          </View>
        )}

        {/* Recent Cycles */}
        <Text style={styles.sectionTitle}>Recent Cycles</Text>
        {cycles.length > 0 ? (
          cycles.map((cycle, index) => (
            <GlassPanel key={index} style={styles.cycleCard}>
              <View style={styles.cycleRow}>
                <View>
                  <Text style={styles.cycleDate}>
                    {new Date(cycle.start_date).toLocaleDateString()}
                  </Text>
                  {cycle.end_date && (
                    <Text style={styles.cycleDuration}>
                      {cycle.cycle_length} days
                    </Text>
                  )}
                </View>
                <Ionicons name="chevron-forward" size={20} color={colors.slate[400]} />
              </View>
            </GlassPanel>
          ))
        ) : (
          <View style={styles.emptyContainer}>
            <Ionicons name="calendar-outline" size={64} color={colors.slate[300]} />
            <Text style={styles.emptyText}>No cycle data yet</Text>
            <Text style={styles.emptySubtext}>Start tracking your cycle</Text>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.powder,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.powder,
  },
  content: {
    padding: 24,
  },
  summaryCard: {
    padding: 24,
    marginBottom: 24,
  },
  summaryHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryLabel: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.slate[400],
    letterSpacing: 2,
  },
  badge: {
    backgroundColor: colors.pink[100],
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
  },
  summaryStats: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 24,
  },
  summaryNumber: {
    fontSize: 48,
    fontWeight: '900',
    color: colors.slate[800],
  },
  summaryUnit: {
    fontSize: 16,
    fontWeight: '700',
    color: colors.slate[400],
    marginLeft: 8,
    marginBottom: 8,
  },
  progressBar: {
    height: 6,
    backgroundColor: colors.slate[100],
    borderRadius: 3,
    marginBottom: 12,
  },
  progressFill: {
    height: '100%',
    backgroundColor: colors.primary,
    borderRadius: 3,
  },
  progressLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate[600],
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.slate[800],
    marginBottom: 16,
  },
  predictionCard: {
    padding: 16,
    marginBottom: 12,
  },
  predictionRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  predictionInfo: {
    marginLeft: 16,
    flex: 1,
  },
  predictionLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate[500],
    marginBottom: 4,
  },
  predictionValue: {
    fontSize: 16,
    fontWeight: '900',
    color: colors.slate[800],
  },
  cycleCard: {
    padding: 16,
    marginBottom: 12,
  },
  cycleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cycleDate: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.slate[800],
    marginBottom: 4,
  },
  cycleDuration: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.slate[500],
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 64,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: '900',
    color: colors.slate[800],
    marginTop: 16,
  },
  emptySubtext: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate[500],
    marginTop: 8,
  },
});

export default CycleTrackerScreen;
