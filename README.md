# DriveHub - Car Rental Mobile App

A React Native mobile app built with Expo and Expo Router for browsing and booking rental vehicles.

## Features

- Browse available vehicles with category filters and search
- User authentication (register & login)
- Vehicle booking flow
- Tab-based navigation with Cars, Bookings, and Profile screens

## Tech Stack

- **React Native** with **Expo** (SDK 55)
- **Expo Router** for file-based navigation
- **NativeWind** for utility styling
- **AsyncStorage** for local persistence
- **REST API** backend (ASP.NET Core)

## Project Structure

```
app/
  _layout.jsx          # Root layout
  index.jsx            # Entry / redirect
  auth/
    login.jsx          # Login screen
    register.jsx       # Register screen
  tabs/
    _layout.jsx        # Tab bar layout
    index.jsx          # Browse cars screen
    bookings.jsx       # Bookings screen
    profile.jsx        # Profile screen
  booking/
    [id].jsx           # Vehicle booking screen
api/
  config.js            # API base URL
  authApi.js           # Auth endpoints (login, register)
  vehichlesApi.js      # Vehicle endpoints
context/
  AuthContext.jsx      # Auth state provider
```

## Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/)
- [Expo CLI](https://docs.expo.dev/get-started/installation/)
- [Expo Go](https://expo.dev/client) app on your phone, or an Android/iOS emulator

### Installation

```bash
npm install
```

### Configuration

Update the API base URL in `api/config.js` to point to your backend:

```js
const API_BASE_URL = "http://<your-local-ip>:5193/api";
```

> Use your machine's local IP address (not `localhost`) so your phone can reach the backend.

### Running the App

```bash
npx expo start
```

Then press:
- `a` — open on Android emulator
- `i` — open on iOS simulator (Mac only)
- `w` — open in web browser
- Scan the QR code with Expo Go on your phone

## Backend

This app connects to an ASP.NET Core Web API. Make sure the backend is running and accessible on your local network before launching the app.
