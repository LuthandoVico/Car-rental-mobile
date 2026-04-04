import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
  TextInput,
} from "react-native";
import { useState, useEffect } from "react";
import { router, useLocalSearchParams } from "expo-router";
import { createBooking } from "../../api/bookingsApi";
import { getAvailableVehicles } from "../../api/vehichlesApi";

// Format date for display
function fmtDisplay(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// Format date for API
function fmtISO(dateStr) {
  return new Date(dateStr).toISOString();
}

// Calculate number of days between two dates
function calcDays(start, end) {
  if (!start || !end) return 0;
  const diff = new Date(end) - new Date(start);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Simple date input row
function DateRow({ label, value, onChange }) {
  return (
    <View style={styles.dateRow}>
      <Text style={styles.dateLabel}>{label}</Text>
      <TextInput
        style={styles.dateInput}
        value={value}
        onChangeText={onChange}
        placeholder="YYYY-MM-DD"
        placeholderTextColor="#475569"
        keyboardType="numeric"
      />
    </View>
  );
}

export default function BookingScreen() {
  const { id } = useLocalSearchParams(); // get vehicle id from URL

  const [vehicle, setVehicle]   = useState(null);
  const [loading, setLoading]   = useState(true);
  const [booking, setBooking]   = useState(false);
  const [error, setError]       = useState("");
  const [success, setSuccess]   = useState(false);

  // Default dates — today and 3 days from now
  const today    = new Date().toISOString().slice(0, 10);
  const threeDays = new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10);

  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate]     = useState(threeDays);

  const days = calcDays(startDate, endDate);

  // Fetch vehicle details on mount
  useEffect(() => {
    fetchVehicle();
  }, []);

  async function fetchVehicle() {
    try {
      setLoading(true);
      // Fetch all available vehicles and find the one with matching id
      const start = new Date().toISOString();
      const end   = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
      const data  = await getAvailableVehicles(start, end);
      const found = data.find((v) => v.id === Number(id));
      if (found) {
        setVehicle(found);
      } else {
        setError("Vehicle not found or no longer available.");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleConfirmBooking() {
    // Validate dates
    if (!startDate || !endDate) {
      setError("Please select both dates.");
      return;
    }
    if (new Date(endDate) <= new Date(startDate)) {
      setError("End date must be after start date.");
      return;
    }
    if (new Date(startDate) < new Date(today)) {
      setError("Start date cannot be in the past.");
      return;
    }

    setBooking(true);
    setError("");
    try {
      await createBooking(
        Number(id),
        fmtISO(startDate),
        fmtISO(endDate),
      );
      setSuccess(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBooking(false);
    }
  }

  // Success screen
  if (success) {
    return (
      <View style={styles.successContainer}>
        <Text style={styles.successEmoji}>🎉</Text>
        <Text style={styles.successTitle}>Booking Confirmed!</Text>
        <Text style={styles.successSub}>
          Your {vehicle?.make} {vehicle?.model} is booked from{" "}
          {fmtDisplay(startDate)} to {fmtDisplay(endDate)}.
        </Text>
        <TouchableOpacity
          style={styles.successBtn}
          onPress={() => router.replace("/tabs/bookings")}>
          <Text style={styles.successBtnText}>View My Bookings →</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.backBtn}
          onPress={() => router.replace("/tabs")}>
          <Text style={styles.backBtnText}>Browse More Cars</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backArrow}>
          <Text style={styles.backArrowText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Book Vehicle</Text>
      </View>

      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#e8c35a" />
          <Text style={styles.loadingText}>Loading vehicle details...</Text>
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>

          {/* Vehicle card */}
          {vehicle && (
            <View style={styles.vehicleCard}>
              {/* Image placeholder */}
              <View style={styles.imagePlaceholder}>
                <Text style={styles.carEmoji}>🚗</Text>
                <View style={styles.categoryBadge}>
                  <Text style={styles.categoryBadgeText}>{vehicle.category}</Text>
                </View>
              </View>

              {/* Vehicle info */}
              <View style={styles.vehicleInfo}>
                <Text style={styles.vehicleName}>{vehicle.make} {vehicle.model}</Text>
                <Text style={styles.vehicleYear}>{vehicle.year}</Text>

                <View style={styles.specsRow}>
                  <View style={styles.spec}>
                    <Text style={styles.specIcon}>💺</Text>
                    <Text style={styles.specText}>{vehicle.seats} seats</Text>
                  </View>
                  <View style={styles.spec}>
                    <Text style={styles.specIcon}>🎨</Text>
                    <Text style={styles.specText}>{vehicle.color}</Text>
                  </View>
                  <View style={styles.spec}>
                    <Text style={styles.specIcon}>📍</Text>
                    <Text style={styles.specText}>{(vehicle.mileage ?? 0).toLocaleString()} km</Text>
                  </View>
                </View>
              </View>
            </View>
          )}

          {/* Date picker section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📅 Select Dates</Text>
            <Text style={styles.sectionSub}>Enter dates in YYYY-MM-DD format</Text>

            <DateRow
              label="Start Date"
              value={startDate}
              onChange={setStartDate}
            />
            <DateRow
              label="End Date"
              value={endDate}
              onChange={setEndDate}
            />
          </View>

          {/* Booking summary */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>📋 Booking Summary</Text>

            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Vehicle</Text>
                <Text style={styles.summaryValue}>
                  {vehicle?.make} {vehicle?.model}
                </Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Pick up</Text>
                <Text style={styles.summaryValue}>{fmtDisplay(startDate)}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Return</Text>
                <Text style={styles.summaryValue}>{fmtDisplay(endDate)}</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Duration</Text>
                <Text style={[styles.summaryValue, { color: "#e8c35a" }]}>
                  {days} day{days !== 1 ? "s" : ""}
                </Text>
              </View>
            </View>
          </View>

          {/* Error */}
          {error ? (
            <View style={styles.errorBox}>
              <Text style={styles.errorText}>⚠ {error}</Text>
            </View>
          ) : null}

          {/* Confirm button */}
          <TouchableOpacity
            style={[styles.confirmBtn, booking && styles.confirmBtnDisabled]}
            onPress={handleConfirmBooking}
            disabled={booking}
            activeOpacity={0.8}>
            {booking ? (
              <ActivityIndicator color="#0f1117" />
            ) : (
              <Text style={styles.confirmBtnText}>Confirm Booking →</Text>
            )}
          </TouchableOpacity>

          <View style={{ height: 40 }} />
        </ScrollView>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: "#0f1117" },
  header:             { paddingTop: 56, paddingHorizontal: 20, paddingBottom: 16, flexDirection: "row", alignItems: "center", gap: 16 },
  backArrow:          { paddingVertical: 6, paddingRight: 12 },
  backArrowText:      { color: "#e8c35a", fontSize: 15, fontWeight: "600" },
  headerTitle:        { fontSize: 20, fontWeight: "800", color: "#ffffff" },

  centered:           { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText:        { color: "#64748b", fontSize: 14 },

  scroll:             { paddingHorizontal: 20, paddingBottom: 32 },

  vehicleCard:        { backgroundColor: "#161b26", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", overflow: "hidden", marginBottom: 20 },
  imagePlaceholder:   { height: 160, backgroundColor: "#1e2535", justifyContent: "center", alignItems: "center", position: "relative" },
  carEmoji:           { fontSize: 64 },
  categoryBadge:      { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryBadgeText:  { color: "#e8c35a", fontSize: 11, fontWeight: "600" },
  vehicleInfo:        { padding: 16 },
  vehicleName:        { fontSize: 20, fontWeight: "800", color: "#ffffff", marginBottom: 2 },
  vehicleYear:        { fontSize: 13, color: "#64748b", marginBottom: 12 },
  specsRow:           { flexDirection: "row", gap: 16 },
  spec:               { flexDirection: "row", alignItems: "center", gap: 5 },
  specIcon:           { fontSize: 13 },
  specText:           { color: "#94a3b8", fontSize: 12 },

  section:            { marginBottom: 20 },
  sectionTitle:       { fontSize: 16, fontWeight: "700", color: "#ffffff", marginBottom: 4 },
  sectionSub:         { fontSize: 12, color: "#64748b", marginBottom: 14 },

  dateRow:            { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 12 },
  dateLabel:          { fontSize: 14, color: "#94a3b8", fontWeight: "500" },
  dateInput:          { backgroundColor: "#1e2535", borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", borderRadius: 12, paddingHorizontal: 14, paddingVertical: 10, color: "#ffffff", fontSize: 14, width: 150, textAlign: "center" },

  summaryCard:        { backgroundColor: "#161b26", borderRadius: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", padding: 16 },
  summaryRow:         { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingVertical: 8 },
  summaryLabel:       { fontSize: 13, color: "#64748b" },
  summaryValue:       { fontSize: 13, color: "#ffffff", fontWeight: "600" },
  divider:            { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginVertical: 4 },

  errorBox:           { backgroundColor: "rgba(248,113,113,0.1)", borderWidth: 1, borderColor: "rgba(248,113,113,0.2)", borderRadius: 12, padding: 14, marginBottom: 16 },
  errorText:          { color: "#f87171", fontSize: 13 },

  confirmBtn:         { backgroundColor: "#e8c35a", borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  confirmBtnDisabled: { opacity: 0.6 },
  confirmBtnText:     { color: "#0f1117", fontSize: 15, fontWeight: "800" },

  successContainer:   { flex: 1, backgroundColor: "#0f1117", justifyContent: "center", alignItems: "center", paddingHorizontal: 32 },
  successEmoji:       { fontSize: 64, marginBottom: 20 },
  successTitle:       { fontSize: 28, fontWeight: "800", color: "#ffffff", marginBottom: 12, textAlign: "center" },
  successSub:         { fontSize: 15, color: "#64748b", textAlign: "center", lineHeight: 22, marginBottom: 32 },
  successBtn:         { backgroundColor: "#e8c35a", borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, marginBottom: 12 },
  successBtnText:     { color: "#0f1117", fontSize: 15, fontWeight: "800" },
  backBtn:            { paddingVertical: 12 },
  backBtnText:        { color: "#64748b", fontSize: 14 },
});