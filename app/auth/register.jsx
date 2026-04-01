import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { useState } from "react";
import { router } from "expo-router";
import { useAuth } from "../../context/AuthContext";

export default function Register() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm]   = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);

  const { register } = useAuth();

  async function handleRegister() {
    if (!email || !password || !confirm) {
      setError("Please fill in all fields.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    setLoading(true);
    setError("");
    try {
      await register(email, password);
      router.replace("/auth/login");
    } catch (err) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === "ios" ? "padding" : "height"}>
      <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">

        {/* Logo */}
        <View style={styles.logoRow}>
          <View style={styles.logoIcon}>
            <Text style={styles.logoEmoji}>🚘</Text>
          </View>
          <Text style={styles.logoText}>
            DRIVE<Text style={styles.logoAccent}>HUB</Text>
          </Text>
        </View>

        <Text style={styles.heading}>Create account</Text>
        <Text style={styles.subheading}>Join DriveHub today</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Text style={styles.errorText}>⚠ {error}</Text>
          </View>
        ) : null}

        {/* Email */}
        <Text style={styles.label}>EMAIL ADDRESS</Text>
        <TextInput
          style={styles.input}
          placeholder="you@example.com"
          placeholderTextColor="#475569"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
        />

        {/* Password */}
        <Text style={styles.label}>PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="Min. 6 characters"
          placeholderTextColor="#475569"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />

        {/* Confirm Password */}
        <Text style={styles.label}>CONFIRM PASSWORD</Text>
        <TextInput
          style={styles.input}
          placeholder="Repeat your password"
          placeholderTextColor="#475569"
          value={confirm}
          onChangeText={setConfirm}
          secureTextEntry
        />

        {/* Button */}
        <TouchableOpacity
          style={[styles.button, loading && styles.buttonDisabled]}
          onPress={handleRegister}
          disabled={loading}
          activeOpacity={0.8}>
          {loading ? (
            <ActivityIndicator color="#0f1117" />
          ) : (
            <Text style={styles.buttonText}>Create Account →</Text>
          )}
        </TouchableOpacity>

        {/* Login Link */}
        <TouchableOpacity
          style={styles.linkRow}
          onPress={() => router.push("/auth/login")}>
          <Text style={styles.linkText}>
            Already have an account?{" "}
            <Text style={styles.linkAccent}>Sign In</Text>
          </Text>
        </TouchableOpacity>

      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container:      { flex: 1, backgroundColor: "#0f1117" },
  scroll:         { flexGrow: 1, justifyContent: "center", paddingHorizontal: 24, paddingVertical: 48 },
  logoRow:        { flexDirection: "row", alignItems: "center", marginBottom: 40, gap: 12 },
  logoIcon:       { width: 44, height: 44, backgroundColor: "#e8c35a", borderRadius: 12, justifyContent: "center", alignItems: "center" },
  logoEmoji:      { fontSize: 22 },
  logoText:       { fontSize: 22, fontWeight: "900", color: "#ffffff", letterSpacing: 2 },
  logoAccent:     { color: "#e8c35a" },
  heading:        { fontSize: 32, fontWeight: "800", color: "#ffffff", marginBottom: 6 },
  subheading:     { fontSize: 15, color: "#64748b", marginBottom: 32 },
  errorBox:       { backgroundColor: "rgba(248,113,113,0.1)", borderWidth: 1, borderColor: "rgba(248,113,113,0.2)", borderRadius: 12, padding: 14, marginBottom: 20 },
  errorText:      { color: "#f87171", fontSize: 13 },
  label:          { fontSize: 11, fontWeight: "600", color: "#64748b", letterSpacing: 2, marginBottom: 8, marginTop: 4 },
  input:          { backgroundColor: "#1e2535", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 14, paddingHorizontal: 16, paddingVertical: 14, color: "#ffffff", fontSize: 15, marginBottom: 16 },
  button:         { backgroundColor: "#e8c35a", borderRadius: 14, paddingVertical: 16, alignItems: "center", marginTop: 8, marginBottom: 24 },
  buttonDisabled: { opacity: 0.6 },
  buttonText:     { color: "#0f1117", fontSize: 15, fontWeight: "800", letterSpacing: 0.5 },
  linkRow:        { alignItems: "center" },
  linkText:       { color: "#64748b", fontSize: 14 },
  linkAccent:     { color: "#e8c35a", fontWeight: "600" },
});