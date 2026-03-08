import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Alert } from 'react-native';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { useAuth } from '../contexts/AuthContext';
import GlassPanel from '../components/GlassPanel';
import { colors } from '../styles/theme';

const ProfileScreen = () => {
  const { user, logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Logout', onPress: logout, style: 'destructive' },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* User Info */}
        <View style={styles.userSection}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={48} color={colors.primary} />
          </View>
          <Text style={styles.userName}>{user?.full_name || 'User'}</Text>
          <Text style={styles.userEmail}>{user?.email || ''}</Text>
        </View>

        {/* Premium Card */}
        <View style={styles.premiumCard}>
          <View style={styles.premiumHeader}>
            <Ionicons name="star" size={24} color={colors.primary} />
            <Text style={styles.premiumTitle}>Ovula Premium</Text>
          </View>
          <Text style={styles.premiumText}>
            Unlock detailed cycle analysis, personalized fertility forecasts, and direct AI coaching.
          </Text>
          <TouchableOpacity style={styles.premiumButton}>
            <Text style={styles.premiumButtonText}>UPGRADE NOW</Text>
          </TouchableOpacity>
        </View>

        {/* Menu Items */}
        <GlassPanel style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.pink[50] }]}>
                <Ionicons name="heart" size={20} color={colors.primary} />
              </View>
              <Text style={styles.menuItemText}>Health Profile</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.slate[300]} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.indigo[50] }]}>
                <Ionicons name="lock-closed" size={20} color={colors.accent} />
              </View>
              <Text style={styles.menuItemText}>Privacy & Security</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.slate[300]} />
          </TouchableOpacity>
        </GlassPanel>

        <GlassPanel style={styles.menuSection}>
          <TouchableOpacity style={styles.menuItem}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.slate[50] }]}>
                <Ionicons name="help-circle" size={20} color={colors.slate[500]} />
              </View>
              <Text style={styles.menuItemText}>Help Center</Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color={colors.slate[300]} />
          </TouchableOpacity>

          <View style={styles.menuDivider} />

          <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
            <View style={styles.menuItemLeft}>
              <View style={[styles.menuIcon, { backgroundColor: colors.red[50] }]}>
                <Ionicons name="log-out" size={20} color={colors.red[500]} />
              </View>
              <Text style={[styles.menuItemText, { color: colors.red[500] }]}>Log Out</Text>
            </View>
          </TouchableOpacity>
        </GlassPanel>

        {/* App Version */}
        <View style={styles.versionContainer}>
          <Text style={styles.versionText}>OVULA AI V1.0.0</Text>
          <Text style={styles.copyrightText}>© 2025 Ovula Health</Text>
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
  content: {
    padding: 24,
  },
  userSection: {
    alignItems: 'center',
    marginBottom: 32,
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16,
    borderWidth: 4,
    borderColor: colors.pink[50],
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  userName: {
    fontSize: 24,
    fontWeight: '900',
    color: colors.slate[800],
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.slate[400],
  },
  premiumCard: {
    backgroundColor: colors.dark,
    borderRadius: 32,
    padding: 24,
    marginBottom: 24,
  },
  premiumHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  premiumTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#fff',
    marginLeft: 8,
  },
  premiumText: {
    fontSize: 12,
    color: '#fff',
    opacity: 0.7,
    lineHeight: 18,
    marginBottom: 20,
  },
  premiumButton: {
    backgroundColor: '#fff',
    borderRadius: 16,
    paddingVertical: 12,
    alignItems: 'center',
  },
  premiumButtonText: {
    fontSize: 12,
    fontWeight: '900',
    color: colors.slate[900],
    letterSpacing: 2,
  },
  menuSection: {
    padding: 0,
    marginBottom: 16,
    overflow: 'hidden',
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuIcon: {
    width: 40,
    height: 40,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  menuItemText: {
    fontSize: 14,
    fontWeight: '900',
    color: colors.slate[800],
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.pink[50],
    marginHorizontal: 16,
  },
  versionContainer: {
    alignItems: 'center',
    paddingVertical: 32,
    opacity: 0.4,
  },
  versionText: {
    fontSize: 10,
    fontWeight: '900',
    color: colors.slate[400],
    letterSpacing: 3,
    marginBottom: 4,
  },
  copyrightText: {
    fontSize: 9,
    fontWeight: '700',
    color: colors.slate[400],
  },
});

export default ProfileScreen;
