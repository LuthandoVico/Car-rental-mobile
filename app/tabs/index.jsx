import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  TextInput,
  ScrollView,
} from "react-native";
import { useState, useEffect } from "react";
import { router } from "expo-router";
import { getAvailableVehicles } from "../../api/vehichlesApi";

const CATEGORIES = ["All", "Sedan", "SUV", "Hatchback", "Truck", "Van", "Convertible"];

// Get today and 7 days from now as default dates
function getDefaultDates() {
  const start = new Date();
  const end   = new Date();
  end.setDate(end.getDate() + 7);
  return {
    start: start.toISOString(),
    end:   end.toISOString(),
  };
}

// Color dot for vehicle color
function ColorDot({ color }) {
  const colorMap = {
    white:  "#f1f5f9",
    black:  "#1e293b",
    silver: "#94a3b8",
    red:    "#ef4444",
    blue:   "#3b82f6",
    grey:   "#6b7280",
    gray:   "#6b7280",
    green:  "#22c55e",
    orange: "#f97316",
  };
  const bg = colorMap[color?.toLowerCase()] ?? "#64748b";
  return (
    <View style={[styles.colorDot, { backgroundColor: bg, borderWidth: color?.toLowerCase() === "white" ? 1 : 0, borderColor: "#334155" }]} />
  );
}

// Single vehicle card
function VehicleCard({ vehicle, onBook }) {
  return (
    <TouchableOpacity style={styles.card} onPress={() => onBook(vehicle)} activeOpacity={0.85}>

      {/* Image placeholder */}
      <View style={styles.imagePlaceholder}>
        <Text style={styles.carEmoji}>🚗</Text>
        <View style={styles.categoryBadge}>
          <Text style={styles.categoryBadgeText}>{vehicle.category}</Text>
        </View>
      </View>

      {/* Card content */}
      <View style={styles.cardBody}>
        <View style={styles.cardHeader}>
          <Text style={styles.carName}>{vehicle.make} {vehicle.model}</Text>
          <View style={styles.yearBadge}>
            <Text style={styles.yearText}>{vehicle.year}</Text>
          </View>
        </View>

        {/* Details row */}
        <View style={styles.detailsRow}>
          <View style={styles.detail}>
            <Text style={styles.detailIcon}>💺</Text>
            <Text style={styles.detailText}>{vehicle.seats} seats</Text>
          </View>
          <View style={styles.detail}>
            <Text style={styles.detailIcon}>📍</Text>
            <Text style={styles.detailText}>{(vehicle.mileage ?? 0).toLocaleString()} km</Text>
          </View>
          <View style={styles.detail}>
            <ColorDot color={vehicle.color} />
            <Text style={styles.detailText}>{vehicle.color}</Text>
          </View>
        </View>

        {/* Book button */}
        <TouchableOpacity style={styles.bookBtn} onPress={() => onBook(vehicle)} activeOpacity={0.8}>
          <Text style={styles.bookBtnText}>Book Now →</Text>
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

// Main screen
export default function BrowseCars() {
  const [vehicles, setVehicles]   = useState([]);
  const [loading, setLoading]     = useState(true);
  const [error, setError]         = useState("");
  const [category, setCategory]   = useState("All");
  const [search, setSearch]       = useState("");

  const dates = getDefaultDates();

  useEffect(() => {
    fetchVehicles();
  }, [category]);

  async function fetchVehicles() {
    try {
      setLoading(true);
      setError("");
      const cat  = category === "All" ? null : category;
      const data = await getAvailableVehicles(dates.start, dates.end, cat);
      setVehicles(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  function handleBook(vehicle) {
    // Navigate to booking screen with vehicle id
    router.push(`/booking/${vehicle.id}`);
  }

  // Filter by search text
  const filtered = vehicles.filter((v) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      v.make?.toLowerCase().includes(q)  ||
      v.model?.toLowerCase().includes(q) ||
      v.color?.toLowerCase().includes(q)
    );
  });

  return (
    <View style={styles.container}>

      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Available Cars</Text>
        <Text style={styles.headerSub}>
          {filtered.length} car{filtered.length !== 1 ? "s" : ""} available
        </Text>
      </View>

      {/* Search */}
      <View style={styles.searchWrap}>
        <Text style={styles.searchIcon}>🔍</Text>
        <TextInput
          style={styles.searchInput}
          placeholder="Search make, model, color..."
          placeholderTextColor="#475569"
          value={search}
          onChangeText={setSearch}
          autoCorrect={false}
        />
      </View>

      {/* Category filter */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.filterScroll}
        contentContainerStyle={styles.filterRow}>
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat}
            onPress={() => setCategory(cat)}
            style={[styles.filterChip, category === cat && styles.filterChipActive]}>
            <Text style={[styles.filterChipText, category === cat && styles.filterChipTextActive]}>
              {cat}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Error */}
      {error ? (
        <View style={styles.errorBox}>
          <Text style={styles.errorText}>⚠ {error}</Text>
        </View>
      ) : null}

      {/* Loading */}
      {loading ? (
        <View style={styles.centered}>
          <ActivityIndicator size="large" color="#e8c35a" />
          <Text style={styles.loadingText}>Finding available cars...</Text>
        </View>
      ) : filtered.length === 0 ? (
        <View style={styles.centered}>
          <Text style={styles.emptyEmoji}>🚗</Text>
          <Text style={styles.emptyTitle}>No cars found</Text>
          <Text style={styles.emptySub}>
            {search ? `No results for "${search}"` : "No cars available for selected dates."}
          </Text>
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item }) => (
            <VehicleCard vehicle={item} onBook={handleBook} />
          )}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container:           { flex: 1, backgroundColor: "#0f1117" },
  header:              { paddingHorizontal: 20, paddingTop: 56, paddingBottom: 16 },
  headerTitle:         { fontSize: 28, fontWeight: "800", color: "#ffffff", marginBottom: 2 },
  headerSub:           { fontSize: 13, color: "#64748b" },

  searchWrap:          { flexDirection: "row", alignItems: "center", marginHorizontal: 20, marginBottom: 14, backgroundColor: "#1e2535", borderRadius: 14, paddingHorizontal: 14, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)" },
  searchIcon:          { fontSize: 16, marginRight: 8 },
  searchInput:         { flex: 1, color: "#ffffff", fontSize: 14, paddingVertical: 12 },

  filterScroll:        { maxHeight: 48, marginBottom: 16 },
  filterRow:           { paddingHorizontal: 20, gap: 8, alignItems: "center" },
  filterChip:          { paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: "rgba(255,255,255,0.1)", backgroundColor: "transparent" },
  filterChipActive:    { backgroundColor: "rgba(232,195,90,0.1)", borderColor: "#e8c35a" },
  filterChipText:      { fontSize: 13, color: "#64748b", fontWeight: "500" },
  filterChipTextActive:{ color: "#e8c35a" },

  errorBox:            { marginHorizontal: 20, backgroundColor: "rgba(248,113,113,0.1)", borderWidth: 1, borderColor: "rgba(248,113,113,0.2)", borderRadius: 12, padding: 14, marginBottom: 12 },
  errorText:           { color: "#f87171", fontSize: 13 },

  centered:            { flex: 1, justifyContent: "center", alignItems: "center", gap: 12 },
  loadingText:         { color: "#64748b", fontSize: 14, marginTop: 12 },
  emptyEmoji:          { fontSize: 48, opacity: 0.4 },
  emptyTitle:          { fontSize: 16, fontWeight: "700", color: "#ffffff" },
  emptySub:            { fontSize: 13, color: "#64748b", textAlign: "center", paddingHorizontal: 40 },

  list:                { paddingHorizontal: 20, paddingBottom: 32, gap: 16 },

  card:                { backgroundColor: "#161b26", borderRadius: 18, borderWidth: 1, borderColor: "rgba(255,255,255,0.07)", overflow: "hidden" },
  imagePlaceholder:    { height: 160, backgroundColor: "#1e2535", justifyContent: "center", alignItems: "center", position: "relative" },
  carEmoji:            { fontSize: 64 },
  categoryBadge:       { position: "absolute", top: 12, right: 12, backgroundColor: "rgba(0,0,0,0.5)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  categoryBadgeText:   { color: "#e8c35a", fontSize: 11, fontWeight: "600" },

  cardBody:            { padding: 16 },
  cardHeader:          { flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 },
  carName:             { fontSize: 17, fontWeight: "800", color: "#ffffff", flex: 1 },
  yearBadge:           { backgroundColor: "rgba(232,195,90,0.1)", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 8, borderWidth: 1, borderColor: "rgba(232,195,90,0.2)" },
  yearText:            { color: "#e8c35a", fontSize: 12, fontWeight: "600" },

  detailsRow:          { flexDirection: "row", gap: 16, marginBottom: 14 },
  detail:              { flexDirection: "row", alignItems: "center", gap: 5 },
  detailIcon:          { fontSize: 13 },
  detailText:          { color: "#94a3b8", fontSize: 12 },
  colorDot:            { width: 12, height: 12, borderRadius: 6 },

  bookBtn:             { backgroundColor: "#e8c35a", borderRadius: 12, paddingVertical: 12, alignItems: "center" },
  bookBtnText:         { color: "#0f1117", fontSize: 14, fontWeight: "800" },
});