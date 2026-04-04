import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useState, useEffect, useCallback } from "react";
import { useFocusEffect } from "expo-router";
import { getMyBookings, cancelBooking } from "../../api/bookingsApi";
import { useAuth } from "../../context/AuthContext";

// Format date for display
function fmt(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString("en-ZA", {
    day: "numeric", month: "short", year: "numeric",
  });
}

// Calculate days
function calcDays(start, end) {
  if (!start || !end) return 0;
  const diff = new Date(end) - new Date(start);
  return Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)));
}

// Status badge styles
function statusStyle(status) {
  switch ((status || "").toLowerCase()) {
    case "active":    return { bg: "rgba(96,165,250,0.1)",  text: "#60a5fa", dot: "#60a5fa"  };
    case "completed": return { bg: "rgba(74,222,128,0.1)",  text: "#4ade80", dot: "#4ade80"  };
    case "cancelled": return { bg: "rgba(248,113,113,0.1)", text: "#f87171", dot: "#f87171"  };
    default:          return { bg: "rgba(232,195,90,0.1)",  text: "#e8c35a", dot: "#e8c35a"  };
  }
}

// Single booking card
function BookingCard({ booking, onCancel }) {
  const days   = calcDays(booking.startDate, booking.endDate);
  const status = statusStyle(booking.status);
  const canCancel = !["cancelled", "completed"].includes((booking.status || "").toLowerCase());

  return (
    <View style={styles.card}>

      {/* Card header */}
      <View style={styles.cardHeader}>
        <View>
          <Text style={styles.vehicleName}>
            {booking.vehicle?.make} {booking.vehicle?.model}
          </Text>
          <Text style={styles.vehicleYear}>
            {booking.vehicle?.year} · {booking.vehicle?.color} · {booking.vehicle?.category}
          </Text>
        </View>
        {/* Status badge */}
        <View style={[styles.statusBadge, { backgroundColor: status.bg }]}>
          <View style={[styles.statusDot, { backgroundColor: status.dot }]} />
          <Text style={[styles.statusText, { color: status.text }]}>
            {(booking.status || "Pending")}
          </Text>
        </View>
      </View>

      <View style={styles.divider} />

      {/* Dates */}
      <View style={styles.datesRow}>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>PICK UP</Text>
          <Text style={styles.dateValue}>{fmt(booking.startDate)}</Text>
        </View>
        <View style={styles.dateArrow}>
          <Text style={styles.dateArrowText}>→</Text>
        </View>
        <View style={styles.dateBlock}>
          <Text style={styles.dateLabel}>RETURN</Text>
          <Text style={styles.dateValue}>{fmt(booking.endDate)}</Text>
        </View>
        <View style={styles.daysBlock}>
          <Text style={styles.daysValue}>{days}</Text>
          <Text style={styles.daysLabel}>day{days !== 1 ? "s" : ""}</Text>
        </View>
      </View>

      {/* Cancel button — only show for active/pending */}
      {canCancel && (
        <TouchableOpacity
          style={styles.cancelBtn}
          onPress={() => onCancel(booking)}
          activeOpacity={0.8}>
          <Text style={styles.cancelBtnText}>Cancel Booking</Text>
        </TouchableOpacity>
      )}
    </View>
  );
}

// Main screen
export default function MyBookings() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading]   = useState(true);
  const [error, setError]       = useState("");
  const [cancelling, setCancelling] = useState(false);
  const [filter, setFilter]     = useState("all");

  const { user } = useAuth();

  // Refresh when tab is focused
  useFocusEffect(
    useCallback(() => {
      fetchBookings();
    }, [])
  );

  async function fetchBookings() {
    try {
      setLoading(true);
      setError("");
      const data = await getMyBookings();
      // data.bookings is the array
      setBookings(data.bookings ?? []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleCancel(booking) {
    Alert.alert(
      "Cancel Booking",
      `Cancel your booking for ${booking.vehicle?.make} ${booking.vehicle?.model}?`,
      [
        { text: "Keep Booking", style: "cancel" },
        {
          text: "Yes, Cancel",
          style: "destructive",
          onPress: async () => {
            setCancelling(true);
            try {
              await cancelBooking(booking.id);
              await fetchBookings(); // refresh list
            } catch (err) {
              setError(err.message);
            } finally {
              setCancelling(false);
            }
          },
        },
      ]
    );
  }

  // Filter tabs
  const tabs = ["all", "active", "completed", "cancelled"];

  const filtered = filter === "all"
    ? bookings
    : bookings.filter((b) => (b.status || "").toLowerCase() === filter);

  // Stats
  const active    = bookings.filter((b) => b.status?.toLowerCase() === "active").length;
  const completed = bookings.filter((b) => b.status?.toLowerCase() === "completed").length;
  const cancelled = bookings.filter((b) => b.status?.toLowerCase() === "cancelled").length;

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Bookings</Text>
        <Text style={styles.headerSub}>{user?.email}</Text>
      </View>

      {/* Stats row */}
      <View style={styles.statsRow}>
        {[
          { label: "Total",     value: bookings.length, color: "#e8c35a" },
          { label: "Active",    value: active,          color: "#60a5fa" },
          { label: "Completed", value: completed,       color: "#4ade80" },
          { label: "Cancelled", value: cancelled,       color: "#f87171" },
        ].map((s) => (
          <View key={s.label} style={styles.statCard}>
            <Text style={[styles.statValue, { color: s.color }]}>{s.value}</Text>
            <Text style={styles.statLabel}>{s.label}</Text>
          </View>
        ))}
      </View>

      {/* Filter tabs */}
      <View style={styles.filterRow}>
        {tabs.map((tab) => (
          <TouchableOpacity
            key={tab}
            onPress={() => setFilter(tab)}
            style={[styles.filterTab, filter === tab && styles.filterTabActive]}>
            <Text style={[styles.filterTabText, filter === tab && styles.filterTabTextActive]}>
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      ) : null}

      {/* Cancelling overlay */}
      {cancelling && (
        <View style={styles.cancellingOverlay}>
          <ActivityIndicator color="#e8c35a" />
          <Text style={styles.cancellingText}>Cancelling...</Text>
        </View>
      )}

      {/* Loading */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#e8c35a" />
          <Text style={styles.loadingText}>Loading your bookings...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>📋</Text>
          <Text style={styles.emptyTitle}>
            {filter === "all" ? "No bookings yet" : `No ${filter} bookings`}
          </Text>
          <Text style={styles.emptySub}>
            {filter === "all"
              ? "Book a car to get started!"
              : `You have no ${filter} bookings.`}
          </Text>
          {filter === "all" && (
            <TouchableOpacity
              style={styles.browseBtn}
              onPress={() => router.replace("/tabs")}>
              <Text style={styles.browseBtnText}>Browse Cars →</Text>
            </TouchableOpacity>
          )}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <BookingCard booking={item} onCancel={handleCancel} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          onRefresh={fetchBookings}
          refreshing={loading}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:          { flex: 1, backgroundColor: "#0f1117" },
  header:             { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle:        { fontSize: 28, fontWeight: "800", color: "#ffffff", marginBottom: 2 },
  headerSub:          { fontSize: 13, color: "#64748b" },

  statsRow:           { flexDirection: "row", paddingHorizontal: 20, gap: 10, marginBottom: 16 },
  statCard:           { flex: 1, backgroundColor: "#161b26", borderRadius: 12, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", padding: 12, alignItems: "center" },
  statValue:          { fontSize: 22, fontWeight: "800", marginBottom: 2 },
  statLabel:          { fontSize: 10, color: "#64748b", fontWeight: "600", textTransform: "uppercase", letterSpacing: 1 },

  filterRow:          { flexDirection: "row", paddingHorizontal: 20, gap: 8, marginBottom: 16 },
  filterTab:          { flex: 1, paddingVertical: 8, borderRadius: 10, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", alignItems: "center" },
  filterTabActive:    { backgroundColor: "rgba(232,195,90,0.1)", borderColor: "#e8c35a" },
  filterTabText:      { fontSize: 11, color: "#64748b", fontWeight: "600" },
  filterTabTextActive:{ color: "#e8c35a" },

  errorBox:           { marginHorizontal: 20, backgroundColor: "rgba(248,113,113,0.1)", borderWidth: 1, borderColor: "rgba(248,113,113,0.2)", borderRadius: 12, padding: 14, marginBottom: 12 },
  errorText:          { color: "#f87171", fontSize: 13 },

  cancellingOverlay:  { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, paddingVertical: 10, backgroundColor: "rgba(232,195,90,0.08)", marginHorizontal: 20, borderRadius: 10, marginBottom: 12 },
  cancellingText:     { color: "#e8c35a", fontSize: 13 },

  centered:           { flex: 1, justifyContent: "center", alignItems: "center", gap: 12, paddingHorizontal: 32 },
  loadingText:        { color: "#64748b", fontSize: 14 },
  emptyEmoji:         { fontSize: 48, opacity: 0.4 },
  emptyTitle:         { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  emptySub:           { fontSize: 13, color: "#64748b", textAlign: "center" },
  browseBtn:          { backgroundColor: "#e8c35a", borderRadius: 12, paddingVertical: 12, paddingHorizontal: 24, marginTop: 8 },
  browseBtnText:      { color: "#0f1117", fontSize: 14, fontWeight: "800" },

  list:               { paddingHorizontal: 20, paddingBottom: 32, gap: 14 },

  card:               { backgroundColor: "#161b26", borderRadius: 16, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", padding: 16 },
  cardHeader:         { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 },
  vehicleName:        { fontSize: 16, fontWeight: "800", color: "#ffffff", marginBottom: 2 },
  vehicleYear:        { fontSize: 12, color: "#64748b" },
  statusBadge:        { flexDirection: "row", alignItems: "center", gap: 5, paddingHorizontal: 10, paddingVertical: 5, borderRadius: 20 },
  statusDot:          { width: 6, height: 6, borderRadius: 3 },
  statusText:         { fontSize: 11, fontWeight: "600" },

  divider:            { height: 1, backgroundColor: "rgba(255,255,255,0.06)", marginBottom: 12 },

  datesRow:           { flexDirection: "row", alignItems: "center", marginBottom: 14 },
  dateBlock:          { flex: 1 },
  dateLabel:          { fontSize: 9, color: "#64748b", fontWeight: "600", letterSpacing: 1.5, marginBottom: 4 },
  dateValue:          { fontSize: 13, color: "#ffffff", fontWeight: "600" },
  dateArrow:          { paddingHorizontal: 8 },
  dateArrowText:      { color: "#64748b", fontSize: 16 },
  daysBlock:          { alignItems: "center", backgroundColor: "rgba(232,195,90,0.08)", borderRadius: 10, paddingHorizontal: 12, paddingVertical: 6, borderWidth: 1, borderColor: "rgba(232,195,90,0.15)" },
  daysValue:          { fontSize: 18, fontWeight: "800", color: "#e8c35a" },
  daysLabel:          { fontSize: 9, color: "#e8c35a", fontWeight: "600" },

  cancelBtn:          { backgroundColor: "rgba(248,113,113,0.1)", borderWidth: 1, borderColor: "rgba(248,113,113,0.2)", borderRadius: 10, paddingVertical: 10, alignItems: "center" },
  cancelBtnText:      { color: "#f87171", fontSize: 13, fontWeight: "600" },
});