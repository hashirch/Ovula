import { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { logsAPI } from '../services/api';
import GlassPanel from '../components/GlassPanel';
import { colors } from '../styles/theme';

const AddLogScreen = ({ navigation }) => {
  const [symptoms, setSymptoms] = useState([]);
  const [mood, setMood] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);

  const symptomOptions = [
    { id: 'cramps', label: 'Cramps', icon: 'flash' },
    { id: 'bloating', label: 'Bloating', icon: 'balloon' },
    { id: 'acne', label: 'Acne', icon: 'water' },
    { id: 'fatigue', label: 'Fatigue', icon: 'bed' },
    { id: 'headache', label: 'Headache', icon: 'alert-circle' },
    { id: 'mood_swings', label: 'Mood Swings', icon: 'happy' },
  ];

  const toggleSymptom = (symptomId) => {
    setSymptoms(prev =>
      prev.includes(symptomId)
        ? prev.filter(s => s !== symptomId)
        : [...prev, symptomId]
    );
  };

  const handleSubmit = async () => {
    setLoading(true);
    try {
      await logsAPI.addLog({
        date: new Date().toISOString().split('T')[0],
        symptoms: symptoms.join(', '),
        mood,
        notes,
      });
      Alert.alert('Success', 'Log added successfully!');
      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', 'Failed to add log');
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <ScrollView style={styles.scrollView} contentContainerStyle={styles.content}>
        <Text style={styles.title}>How are you feeling today?</Text>

        <Text style={styles.sectionLabel}>SYMPTOMS</Text>
        <View style={styles.symptomGrid}>
          {symptomOptions.map(symptom => (
            <TouchableOpacity
              key={symptom.id}
              style={[
                styles.symptomButton,
                symptoms.includes(symptom.id) && styles.symptomButtonActive
              ]}
              onPress={() => toggleSymptom(symptom.id)}
            >
              <Ionicons
                name={symptom.icon}
                size={24}
                color={symptoms.includes(symptom.id) ? '#fff' : colors.slate[600]}
              />
              <Text style={[
                styles.symptomLabel,
                symptoms.includes(symptom.id) && styles.symptomLabelActive
              ]}>
                {symptom.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.sectionLabel}>MOOD</Text>
        <GlassPanel style={styles.inputContainer}>
          <TextInput
            style={styles.input}
            placeholder="How's your mood?"
            value={mood}
            onChangeText={setMood}
          />
        </GlassPanel>

        <Text style={styles.sectionLabel}>NOTES</Text>
        <GlassPanel style={styles.inputContainer}>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Any additional notes..."
            value={notes}
            onChangeText={setNotes}
            multiline
            numberOfLines={4}
          />
        </GlassPanel>

        <TouchableOpacity
          style={[styles.submitButton, loading && styles.submitButtonDisabled]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitButtonText}>
            {loading ? 'SAVING...' : 'SAVE LOG'}
          </Text>
        </TouchableOpacity>
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
  title: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.slate[800],
    marginBottom: 32,
    textAlign: 'center',
  },
  sectionLabel: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.slate[500],
    letterSpacing: 2,
    marginBottom: 12,
    marginLeft: 4,
  },
  symptomGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 24,
  },
  symptomButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    width: '30%',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  symptomButtonActive: {
    backgroundColor: colors.primary,
  },
  symptomLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: colors.slate[600],
    marginTop: 8,
  },
  symptomLabelActive: {
    color: '#fff',
  },
  inputContainer: {
    padding: 16,
    marginBottom: 24,
  },
  input: {
    fontSize: 14,
    fontWeight: '600',
    color: colors.slate[800],
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  submitButton: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: colors.pink[200],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
});

export default AddLogScreen;
