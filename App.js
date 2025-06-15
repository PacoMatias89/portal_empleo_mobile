import React, { useState, useEffect, useCallback } from "react";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { createStackNavigator } from "@react-navigation/stack";
import { NavigationContainer, useFocusEffect } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Text, View } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Buffer } from "buffer"; // ✅ Necesario en React Native

// ✅ Decodificador JWT para React Native
function parseJwt(token) {
  try {
    const payload = token.split(".")[1];
    const decoded = Buffer.from(payload, "base64").toString("utf8");
    return JSON.parse(decoded);
  } catch (e) {
    console.error("Error al decodificar JWT:", e);
    return null;
  }
}

// ✅ Importar pantallas
import LandingPage from "./src/screens/LandingPage";
import LoginScreen from "./src/screens/LoginScreen";
import RegisterScreenCompany from "./src/screens/RegisterScreenCompany";
import RegisterScreenUser from "./src/screens/RegisterScreenUser";
import UserDashboard from "./src/screens/UserDashboard";
import JobApplications from "./src/jobs/ApplicationJobs";
import FavoriteJobs from "./src/jobs/FavoriteJobs";
import UserProfile from "./src/jobs/UserProfile";
import WorkExperienceForm from "./src/WorkExperience/WorkExperienceForm";
import CardsJobApplication from "./src/Cards/CardJobApplication/CardsJobApplication";
import CardsMyJobOfferCompany from "./src/Cards/CardMyJobOfferCompany/CardsMyJobOfferCompany";
import PostJobOffer from "./src/PostJobOffer/PostJobOffer";
import CardsGetWorkExperience from "./src/Cards/CardWorExperience/CardsGetWorkExperience";
import CompanyDashboard from "./src/screens/DashboardCompany";
import LogoutScreen from "./src/screens/LogoutScreen";
import OptionScreen from "./src/screens/OptionsScreen";
import { navigationRef } from "./src/context/navigationRef";
import Candidates from "./src/jobs/Candidates";
import ViewWorkExperienceDetails from "./src/jobs/ViewWorkExperienceDetails";
import WorkExperienceView from "./src/jobs/WorkExperienceView";
import CompanyProfile from "./src/jobs/CompanyProfile";

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// ✅ Bottom Tab Navigator
function TabNavigator({ onLogout }) {
  const [userRole, setUserRole] = useState(null);

  useFocusEffect(
    useCallback(() => {
      const getUserRole = async () => {
        const role = await AsyncStorage.getItem("role");
        console.log("TabNavigator - role:", role);
        setUserRole(role);
      };
      getUserRole();
    }, [])
  );

  const userMenu = (
    <>
      <Tab.Screen name="Buscar Empleo" component={UserDashboard} />
      <Tab.Screen name="Mi Perfil" component={UserProfile} />
      <Tab.Screen name="Agregar Experiencia" component={WorkExperienceForm} />
      <Tab.Screen name="Experiencia" component={CardsGetWorkExperience} />
      <Tab.Screen name="Inscripciones" component={CardsJobApplication} />
      <Tab.Screen name="Favoritos" component={FavoriteJobs} />
      <Tab.Screen
        name="Cerrar Sesión"
        children={() => <LogoutScreen onLogout={onLogout} />}
      />
    </>
  );

  const companyMenu = (
    <>
      <Tab.Screen name="Inicio" component={CompanyDashboard} />
      <Tab.Screen name="Mi Perfil" component={CompanyProfile} />
      <Tab.Screen name="Mis Ofertas" component={CardsMyJobOfferCompany} />
      <Tab.Screen name="Oferta" component={PostJobOffer} />
      <Tab.Screen name="Postulaciones" component={JobApplications} />
      <Tab.Screen
        name="Cerrar Sesión"
        children={() => <LogoutScreen onLogout={onLogout} />}
      />
    </>
  );

  // Evitar renderizar el TabNavigator hasta tener el rol cargado
  if (!userRole) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando menú...</Text>
      </View>
    );
  }

  return (
    <Tab.Navigator
      initialRouteName={userRole === "USER" ? "Buscar Empleo" : "Inicio"}
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;
          if (route.name === "Buscar Empleo") {
            iconName = "search-outline";
          } else if (route.name === "Mi Perfil") {
            iconName = "person-outline";
          } else if (route.name === "Agregar Experiencia") {
            iconName = "add-circle-outline";
          } else if (route.name === "Experiencia") {
            iconName = "briefcase-outline";
          } else if (route.name === "Inscripciones") {
            iconName = "document-text-outline";
          } else if (route.name === "Favoritos") {
            iconName = "heart-outline";
          } else if (route.name === "Inicio") {
            iconName = "home-outline";
          } else if (route.name === "Mis Ofertas") {
            iconName = "list-outline";
          } else if (route.name === "Oferta") {
            iconName = "add-outline";
          } else if (route.name === "Postulaciones") {
            iconName = "people-outline";
          } else if (route.name === "Cerrar Sesión") {
            iconName = "exit-outline";
          }

          return (
            <Ionicons name={iconName} size={focused ? 28 : 24} color={color} />
          );
        },
        tabBarLabel: ({ focused, color }) => (
          <Text
            style={{
              fontSize: focused ? 12 : 11,
              fontWeight: focused ? "bold" : "normal",
              color,
              marginBottom: 6,
              textTransform: "capitalize",
            }}
          >
            {route.name}
          </Text>
        ),
        tabBarActiveTintColor: "#1E90FF",
        tabBarInactiveTintColor: "#8e8e93",
        tabBarStyle: {
          backgroundColor: "#ffffff",
          borderTopWidth: 1,
          borderTopColor: "#e2e2e2",
          height: 70,
          paddingBottom: 8,
          paddingTop: 4,
          elevation: 10,
          shadowColor: "#000",
          shadowOffset: { width: 0, height: -3 },
          shadowOpacity: 0.1,
          shadowRadius: 5,
        },
        tabBarIconStyle: {
          marginTop: 2,
        },
        tabBarItemStyle: {
          justifyContent: "center",
          alignItems: "center",
        },
        headerShown: false,
      })}
    >
      {userRole === "USER" ? userMenu : companyMenu}
    </Tab.Navigator>
  );
}

// ✅ Stack Navigator principal
function MainStackNavigator() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  const checkLoginStatus = useCallback(async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      if (token) {
        const decoded = parseJwt(token);
        const now = Date.now() / 1000;
        if (decoded?.exp > now) {
          setIsLoggedIn(true);
        }
      }
    } catch (error) {
      console.error("Error al verificar sesión:", error);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    checkLoginStatus();
  }, []);

  const handleLogout = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove([
        "token",
        "role",
        "userId",
        "name",
        "companyname",
        "lastnames",
        "email",
        "birthdate",
      ]);
      setIsLoggedIn(false);
      navigationRef.current?.reset({
        index: 0,
        routes: [{ name: "LandingPage" }],
      });
    } catch (error) {
      console.error("Error al cerrar sesión", error);
    }
  }, []);

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
        <Text>Cargando...</Text>
      </View>
    );
  }

  return (
    <Stack.Navigator
      initialRouteName={isLoggedIn ? "TabNavigator" : "LandingPage"}
      screenOptions={{ headerShown: false }}
    >
      <Stack.Screen name="LandingPage" component={LandingPage} />
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="Registrar Usuario" component={RegisterScreenUser} />
      <Stack.Screen
        name="Registrar Empresa"
        component={RegisterScreenCompany}
      />
      <Stack.Screen name="DashboardUser" component={UserDashboard} />
      <Stack.Screen name="DashboardCompany" component={CompanyDashboard} />
      <Stack.Screen name="Opciones" component={OptionScreen} />
      <Stack.Screen name="Candidates" component={Candidates} />
      <Stack.Screen
        name="ViewWorkExperienceDetails"
        component={ViewWorkExperienceDetails}
      />
      <Stack.Screen name="WorkExperienceView" component={WorkExperienceView} />
      <Stack.Screen name="TabNavigator">
        {() => <TabNavigator onLogout={handleLogout} />}
      </Stack.Screen>
    </Stack.Navigator>
  );
}

// ✅ App principal
export default function App() {
  return (
    <NavigationContainer ref={navigationRef}>
      <MainStackNavigator />
    </NavigationContainer>
  );
}
