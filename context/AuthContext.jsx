//imports 
import {createContext, useContext, useState, useEffect} from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import {loginUser, registerUser} from '../api/authApi';

// create empty AuthContext to hold auth stae and functions
const AuthContext = createContext(null);

// this is where we will implement the provider component that wraps the app and provides authstate and functions to the rest of the app
export function AuthProvider({children}) {
    const [user, setUser] = useState(null);  //holds current user info , null if not loged in 
    const [loading, setLoading] = useState(true); 

    useEffect(() => {
        // chech if user was prev logged in by looking at token in async storage
        loadStoredUser();

    }, []);

    //function to load user from async storage on app start
    async function loadStoredUser() {
        try{
         const stored = await AsyncStorage.getItem("user");
         if(stored) {
            setUser(JSON.parse(stored));
         }

        }catch (err){
            console.log("Failed to get user from storage", err);

        }finally {
            setLoading(false);
        }

    }

   async function login(email, password) {
  const data = await loginUser(email, password);
  const userData = {
    email,
    token: data.token,
    name:  email, // backend doesn't return a name, use email
    role:  data.roles?.[0] ?? "Customer", // roles is an array, take first
  };
  setUser(userData);
  await AsyncStorage.setItem("user", JSON.stringify(userData));
  await AsyncStorage.setItem("token", data.token);
  return userData;
}

    async function register(email, password) {
  const data = await registerUser(email, password);
  return data;
}

    async function logout(){
        setUser(null); // clears user from memory
        await AsyncStorage.removeItem("user"); // deletes the saved session from the phone
        await AsyncStorage.removeItem("token");
    }

    return(
        <AuthContext.Provider value={{user, loading, login, register, logout}}>
            {children}
        </AuthContext.Provider>
    );

    
}
export function useAuth() {
        return useContext(AuthContext);
    }
