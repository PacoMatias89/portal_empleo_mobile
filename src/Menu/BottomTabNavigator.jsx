import React, { useState, useEffect } from "react";
import { createDrawerNavigator } from "@react-navigation/drawer";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { NavigationContainer } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// Importar pantallas
import LandingPage from "./src/screens/LandingPage";
import LoginScreen from "./src/screens/LoginScreen";
import OptionsScreen from "./src/screens/OptionsScreen";
import RegisterScreenCompany from "./src/screens/RegisterScreenCompany";
import RegisterScreenUser from "./src/screens/RegisterScreenUser";
import UserDashboard from "./src/screens/UserDashboard";
import CompanyDashboard from "./src/screens/CompanyDashboard";
import CompanyProfile from "./src/screens/CompanyProfile"; // Asegúrate de tener esta pantalla

const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator();

// Componente para manejar los tabs según el rol
function BottomTabNavigator() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRoleFromStorage = async () => {
      const userRole = await AsyncStorage.getItem("role");
      setRole(userRole);
      setLoading(false);
    };
    getRoleFromStorage();
  }, []);

  if (loading) return null; // o un spinner si deseas

  return (
    <Tab.Navigator>
      {role === "USER" ? (
        <>
          <Tab.Screen name="Inicio" component={UserDashboard} />
          <Tab.Screen name="Opciones" component={OptionsScreen} />
          <Tab.Screen name="Mi Perfil" component={RegisterScreenUser} />
        </>
      ) : (
        <>
          <Tab.Screen name="Inicio" component={CompanyDashboard} />
          <Tab.Screen name="Opciones" component={OptionsScreen} />
          <Tab.Screen name="Mi Perfil" component={RegisterScreenCompany} />
        </>
      )}
    </Tab.Navigator>
  );
}

// Componente para manejar el Drawer Navigator según el rol
function DrawerNavigator() {
  const [role, setRole] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const getRoleFromStorage = async () => {
      const userRole = await AsyncStorage.getItem("role");
      setRole(userRole);
      setLoading(false);
    };
    getRoleFromStorage();
  }, []);

  if (loading) return null; // o un spinner si deseas

  return (
    <Drawer.Navigator initialRouteName="LandingPage">
      <Drawer.Screen name="Inicio" component={LandingPage} />
      {!role ? (
        <>
          <Drawer.Screen name="Iniciar Sesión" component={LoginScreen} />
          <Drawer.Screen name="Registrarse" component={OptionsScreen} />
        </>
      ) : role === "USER" ? (
        <>
          <Drawer.Screen name="Buscar Empleo" component={UserDashboard} />
          <Drawer.Screen name="Mi Perfil" component={RegisterScreenUser} />
          <Drawer.Screen name="Agregar Experiencia" component={RegisterScreenUser} />
          <Drawer.Screen name="Ver Experiencia" component={UserDashboard} />
          <Drawer.Screen name="Ver Inscripciones" component={UserDashboard} />
          <Drawer.Screen name="Favoritos" component={UserDashboard} />
        </>
      ) : (
        <>
          <Drawer.Screen name="Panel de Empresa" component={CompanyDashboard} />
          <Drawer.Screen name="Mi Perfil" component={CompanyProfile} />
          <Drawer.Screen name="Mis Ofertas" component={CompanyDashboard} />
          <Drawer.Screen name="Publicar Oferta" component={CompanyDashboard} />
          <Drawer.Screen name="Ver Postulaciones" component={CompanyDashboard} />
        </>
      )}
    </Drawer.Navigator>
  );
}

// Si vas a usar NavigationContainer aquí, exporta esto:
export default function AppNavigator() {
  return (
    <NavigationContainer>
      <DrawerNavigator />
    </NavigationContainer>
  );
}
