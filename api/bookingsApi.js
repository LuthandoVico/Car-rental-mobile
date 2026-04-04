import API_BASE_URL from "./config";
import AsyncStorage from "@react-native-async-storage/async-storage";

const authHeaders = async () => ({
  "Content-Type": "application/json",
  Authorization: `Bearer ${await AsyncStorage.getItem("token")}`,
});

// POST — create a new booking
export async function createBooking(vehicleId, startDate, endDate) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/Bookings`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      vehicleId,
      startDate,
      endDate,
    }),
  });

  const data = await res.json();
  if (!res.ok) throw new Error(data.message || data.title || "Failed to create booking");
  return data;
}

// GET — my bookings
export async function getMyBookings() {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/Bookings/my`, { headers });
  if (!res.ok) throw new Error("Failed to fetch bookings");
  return res.json();
}

// PATCH — cancel a booking
export async function cancelBooking(id) {
  const headers = await authHeaders();
  const res = await fetch(`${API_BASE_URL}/Bookings/${id}/cancel`, {
    method: "PATCH",
    headers,
  });
  if (!res.ok) throw new Error("Failed to cancel booking");
}