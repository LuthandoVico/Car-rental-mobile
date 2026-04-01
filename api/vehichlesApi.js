import API_BASE_URL from "./config";

export async function getAvailableVehicles(startDate, endDate, category = null) {
  let url = `${API_BASE_URL}/Vehicles/available?start=${startDate}&end=${endDate}`;
  if (category) url += `&category=${category}`;

  const res = await fetch(url);
  if (!res.ok) throw new Error("Failed to fetch available vehicles");
  return res.json();
}