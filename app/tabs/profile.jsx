import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

// Menu item component
function MenuItem({ icon, label, sublabel, onPress, danger }) {
  return (
    <TouchableOpacity
      style={styles.menuItem}
      onPress={onPress}
      activeOpacity={0.7}>
      <View style={[styles.menuIcon, danger && styles.menuIconDanger]}>
        <Text style={styles.menuIconText}>{icon}</Text>
      </View>
      <View style={styles.menuText}>
        <Text style={[styles.menuLabel, danger && styles.menuLabelDanger]}>
          {label}
        </Text>
        {sublabel && <Text style={styles.menuSublabel}>{sublabel}</Text>}
      </View>
      <Text style={styles.menuArrow}>›</Text>
    </TouchableOpacity>
  );
}

export default function Profile() {
  const { user, logout } = useAuth();

  // Get initials from email
  const initials = user?.email?.charAt(0).toUpperCase() ?? "U";

  function handleLogout() {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Sign Out",
          style: "destructive",
          onPress: async () => {
            await logout();
            router.replace("/auth/login");
          },
        },
      ]
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.scroll}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Profile</Text>
      </View>

      {/* Avatar + user info */}
      <View style={styles.profileCard}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.userName}>{user?.name ?? user?.email}</Text>
        <Text style={styles.userEmail}>{user?.email}</Text>
        <View style={styles.roleBadge}>
          <Text style={styles.roleText}>{user?.role ?? "Customer"}</Text>
        </View>
      </View>

      {/* Account section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>ACCOUNT</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="📋"
            label="My Bookings"
            sublabel="View all your bookings"
            onPress={() => router.push("/tabs/bookings")}
          />
          <View style={styles.menuDivider} />
          <MenuItem
            icon="🚗"
            label="Browse Cars"
            sublabel="Find available vehicles"
            onPress={() => router.push("/tabs")}
          />
        </View>
      </View>

      {/* App section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>APP</Text>
        <View style={styles.menuCard}>
          <MenuItem
            icon="ℹ️"
            label="About DriveHub"
            sublabel="Version 1.0.0"
            onPress={() => Alert.alert("DriveHub", "Car Rental Mobile App v1.0.0")}
          />
        </View>
      </View>

      {/* Sign out section */}
      <View style={styles.section}>
        <View style={styles.menuCard}>
          <MenuItem
            icon="🚪"
            label="Sign Out"
            sublabel="Log out of your account"
            onPress={handleLogout}
            danger
          />
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <View style={styles.footerLogo}>
          <Text style={styles.footerEmoji}>🚘</Text>
          <Text style={styles.footerText}>
            DRIVE<Text style={styles.footerAccent}>HUB</Text>
          </Text>
        </View>
        <Text style={styles.footerSub}>Your trusted car rental partner</Text>
      </View>

    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container:        { flex: 1, backgroundColor: "#0f1117" },
  scroll:           { paddingBottom: 40 },

  header:           { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 8 },
  headerTitle:      { fontSize: 28, fontWeight: "800", color: "#ffffff" },

  profileCard:      { alignItems: "center", paddingVertical: 28, paddingHorizontal: 20, marginHorizontal: 20, marginTop: 16, marginBottom: 24, backgroundColor: "#161b26", borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  avatar:           { width: 80, height: 80, borderRadius: 40, backgroundColor: "#e8c35a", justifyContent: "center", alignItems: "center", marginBottom: 14, shadowColor: "#e8c35a", shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 12, elevation: 8 },
  avatarText:       { fontSize: 32, fontWeight: "900", color: "#0f1117" },
  userName:         { fontSize: 20, fontWeight: "800", color: "#ffffff", marginBottom: 4 },
  userEmail:        { fontSize: 14, color: "#64748b", marginBottom: 12 },
  roleBadge:        { backgroundColor: "rgba(232,195,90,0.1)", borderWidth: 1, borderColor: "rgba(232,195,90,0.2)", paddingHorizontal: 14, paddingVertical: 5, borderRadius: 20 },
  roleText:         { color: "#e8c35a", fontSize: 12, fontWeight: "700", letterSpacing: 1 },

  section:          { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle:     { fontSize: 11, fontWeight: "700", color: "#64748b", letterSpacing: 2, marginBottom: 10 },

  menuCard:         { backgroundColor: "#161b26", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  menuItem:         { flexDirection: "row", alignItems: "center", paddingVertical: 14, paddingHorizontal: 16, gap: 14 },
  menuIcon:         { width: 38, height: 38, borderRadius: 10, backgroundColor: "rgba(255,255,255,0.05)", justifyContent: "center", alignItems: "center" },
  menuIconDanger:   { backgroundColor: "rgba(248,113,113,0.1)" },
  menuIconText:     { fontSize: 18 },
  menuText:         { flex: 1 },
  menuLabel:        { fontSize: 15, fontWeight: "600", color: "#ffffff", marginBottom: 1 },
  menuLabelDanger:  { color: "#f87171" },
  menuSublabel:     { fontSize: 12, color: "#64748b" },
  menuArrow:        { fontSize: 20, color: "#64748b" },
  menuDivider:      { height: 1, backgroundColor: "rgba(255,255,255,0.05)", marginHorizontal: 16 },

  footer:           { alignItems: "center", paddingTop: 24, paddingBottom: 8 },
  footerLogo:       { flexDirection: "row", alignItems: "center", gap: 8, marginBottom: 6 },
  footerEmoji:      { fontSize: 20 },
  footerText:       { fontSize: 16, fontWeight: "900", color: "#ffffff", letterSpacing: 2 },
  footerAccent:     { color: "#e8c35a" },
  footerSub:        { fontSize: 12, color: "#64748b" },
});