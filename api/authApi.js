import API_BASE_URL from "./config";

/// Register — backend only needs email, password and optional role
export async function registerUser(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/Auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email,
        password,
        role: "Customer",
      }),
    });

    console.log("✅ Status:", res.status);

    const data = await res.json();
    console.log("📦 Response:", data);

    if (!res.ok) {
      throw new Error(data.message || "Registration failed");
    }

    return data;

  } catch (error) {
    console.log("❌ API error occurred", error);
    throw error; // ✅ REQUIRED
  }
}

// Login
export async function loginUser(email, password) {
  try {
    const res = await fetch(`${API_BASE_URL}/Auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || "Login failed");
    }

    return data;

  } catch (error) {
    console.log("❌ Login API error:", error);
    throw error; // 🔥 same fix
  }
}