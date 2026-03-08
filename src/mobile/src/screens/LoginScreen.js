import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import GlassPanel from '../components/GlassPanel';
import { colors } from '../styles/theme';

const LoginScreen = ({ navigation }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login(email, password);
    } catch (err) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Logo */}
        <View style={styles.logoContainer}>
          <View style={styles.logoBox}>
            <View style={styles.logo}>
              <View style={styles.logoDot} />
              <View style={[styles.logoPetal, styles.logoPetalLeft]} />
              <View style={[styles.logoPetal, styles.logoPetalRight]} />
              <View style={styles.logoBud} />
            </View>
          </View>
          <Text style={styles.title}>Ovula</Text>
          <Text style={styles.subtitle}>Your wellness, blooming every day</Text>
        </View>

        {/* Form */}
        <GlassPanel style={styles.formContainer}>
          <Text style={styles.formTitle}>Welcome Back</Text>
          <Text style={styles.formSubtitle}>Continue your health journey</Text>

          {error ? (
            <View style={styles.errorContainer}>
              <Text style={styles.errorText}>{error}</Text>
            </View>
          ) : null}

          <View style={styles.inputContainer}>
            <Text style={styles.label}>EMAIL ADDRESS</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="mail-outline" size={20} color={colors.slate[500]} style={styles.inputIcon} />
              <TextInput
                style={styles.input}
                placeholder="hello@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>
          </View>

          <View style={styles.inputContainer}>
            <Text style={styles.label}>PASSWORD</Text>
            <View style={styles.inputWrapper}>
              <Ionicons name="lock-closed-outline" size={20} color={colors.slate[500]} style={styles.inputIcon} />
              <TextInput
                style={[styles.input, styles.inputWithIcon]}
                placeholder="••••••••"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeIcon}
              >
                <Ionicons
                  name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                  size={20}
                  color={colors.slate[400]}
                />
              </TouchableOpacity>
            </View>
          </View>

          <TouchableOpacity
            style={[styles.button, loading && styles.buttonDisabled]}
            onPress={handleLogin}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.buttonText}>LOG IN</Text>
            )}
          </TouchableOpacity>
        </GlassPanel>

        {/* Footer */}
        <View style={styles.footer}>
          <Text style={styles.footerText}>Don't have an account? </Text>
          <TouchableOpacity onPress={() => navigation.navigate('Register')}>
            <Text style={styles.footerLink}>SIGN UP</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.powder,
  },
  scrollContent: {
    flexGrow: 1,
    padding: 24,
    justifyContent: 'center',
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 40,
  },
  logoBox: {
    width: 96,
    height: 96,
    borderRadius: 40,
    backgroundColor: colors.dark,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 16,
    elevation: 8,
  },
  logo: {
    width: 60,
    height: 60,
    position: 'relative',
  },
  logoDot: {
    position: 'absolute',
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.primary,
    top: '25%',
    left: '20%',
  },
  logoPetal: {
    position: 'absolute',
    width: '40%',
    height: '55%',
    bottom: '15%',
  },
  logoPetalLeft: {
    left: '10%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 100,
    borderBottomLeftRadius: 100,
    transform: [{ rotate: '-15deg' }],
  },
  logoPetalRight: {
    right: '10%',
    backgroundColor: colors.primary,
    borderTopRightRadius: 100,
    borderBottomRightRadius: 100,
    transform: [{ rotate: '15deg' }],
  },
  logoBud: {
    position: 'absolute',
    width: '45%',
    height: '65%',
    bottom: '20%',
    left: '27.5%',
    backgroundColor: colors.primary,
    borderTopLeftRadius: 100,
    borderTopRightRadius: 100,
    borderBottomLeftRadius: 80,
    borderBottomRightRadius: 80,
  },
  title: {
    fontSize: 36,
    fontWeight: '900',
    color: colors.slate[900],
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate[600],
    opacity: 0.7,
  },
  formContainer: {
    padding: 32,
    marginBottom: 24,
  },
  formTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.slate[800],
    textAlign: 'center',
    marginBottom: 4,
  },
  formSubtitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate[500],
    textAlign: 'center',
    marginBottom: 32,
  },
  errorContainer: {
    backgroundColor: colors.red[50],
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
  },
  errorText: {
    color: colors.red[500],
    fontSize: 12,
    fontWeight: '700',
    textAlign: 'center',
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.slate[500],
    letterSpacing: 2,
    marginBottom: 8,
    marginLeft: 4,
  },
  inputWrapper: {
    position: 'relative',
  },
  inputIcon: {
    position: 'absolute',
    left: 16,
    top: 16,
    zIndex: 1,
  },
  input: {
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 16,
    paddingVertical: 16,
    paddingLeft: 48,
    paddingRight: 16,
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate[800],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.6)',
  },
  inputWithIcon: {
    paddingRight: 48,
  },
  eyeIcon: {
    position: 'absolute',
    right: 16,
    top: 16,
  },
  button: {
    backgroundColor: colors.primary,
    borderRadius: 16,
    paddingVertical: 18,
    alignItems: 'center',
    marginTop: 8,
    shadowColor: colors.pink[200],
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonDisabled: {
    opacity: 0.6,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '900',
    letterSpacing: 2,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 40,
  },
  footerText: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate[500],
  },
  footerLink: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.primary,
    letterSpacing: 2,
  },
});

export default LoginScreen;
