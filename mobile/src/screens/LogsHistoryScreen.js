import { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { logsAPI } from '../services/api';
import GlassPanel from '../components/GlassPanel';
import { colors } from '../styles/theme';

const LogsHistoryScreen = () => {
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLogs();
  }, []);

  const fetchLogs = async () => {
    try {
      const data = await logsAPI.getLogs();
      setLogs(data);
    } catch (error) {
      console.error('Failed to fetch logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderLogItem = ({ item }) => (
    <GlassPanel style={styles.logCard}>
      <View style={styles.logHeader}>
        <Text style={styles.logDate}>{new Date(item.date).toLocaleDateString()}</Text>
        <Ionicons name="calendar" size={16} color={colors.primary} />
      </View>
      {item.symptoms && (
        <Text style={styles.logSymptoms}>Symptoms: {item.symptoms}</Text>
      )}
      {item.mood && (
        <Text style={styles.logMood}>Mood: {item.mood}</Text>
      )}
      {item.notes && (
        <Text style={styles.logNotes}>{item.notes}</Text>
      )}
    </GlassPanel>
  );

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={logs}
        renderItem={renderLogItem}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Ionicons name="document-text-outline" size={64} color={colors.slate[300]} />
            <Text style={styles.emptyText}>No logs yet</Text>
            <Text style={styles.emptySubtext}>Start tracking your symptoms</Text>
          </View>
        }
      />
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
  listContent: {
    padding: 16,
  },
  logCard: {
    padding: 16,
    marginBottom: 12,
  },
  logHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  logDate: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.slate[800],
  },
  logSymptoms: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate[600],
    marginBottom: 4,
  },
  logMood: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.slate[600],
    marginBottom: 4,
  },
  logNotes: {
    fontSize: 12,
    fontWeight: '500',
    color: colors.slate[500],
    marginTop: 8,
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

export default LogsHistoryScreen;
