import React, { useEffect } from "react";
import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  StatusBar,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

const LandingPage = () => {
  const navigation = useNavigation();

  useEffect(() => {
    navigation.setOptions({
      title: "LaborLink - Encuentra el Trabajo de tus Sueños",
    });
  }, [navigation]);

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <StatusBar barStyle="dark-content" backgroundColor="#ffffff" />

      {/* Navbar */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>LaborLink</Text>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("Login")}
        >
          <Text style={styles.loginButtonText}>Iniciar sesión</Text>
        </TouchableOpacity>
      </View>

      {/* Hero Section */}
      <View style={styles.heroContainer}>
        <Text style={styles.heroTitle}>Encuentra el Trabajo de tus Sueños</Text>
        <Text style={styles.heroSubtitle}>
          Conéctate con miles de empresas y profesionales en segundos. Da el
          siguiente paso en tu carrera profesional y transforma tu futuro.
        </Text>
        <TouchableOpacity
          style={styles.registerButton}
          onPress={() => navigation.navigate("Opciones")}
        >
          <Text style={styles.registerButtonText}>Regístrate</Text>
        </TouchableOpacity>
      </View>

      {/* Features Section */}
      <View style={styles.featuresContainer}>
        <Text style={styles.featuresTitle}>¿Por qué elegirnos?</Text>
        <View style={styles.featuresList}>
          {[
            {
              title: "Oportunidades Globales",
              description:
                "Accede a ofertas de trabajo en todo el mundo con un solo clic.",
            },
            {
              title: "Fácil y Rápido",
              description:
                "Aplica a empleos de forma sencilla y eficiente sin procesos complicados.",
            },
            {
              title: "Conéctate con Empresas",
              description:
                "Expande tu red profesional y aumenta tus posibilidades laborales.",
            },
          ].map((item, index) => (
            <View style={styles.featureCard} key={index}>
              <Text style={styles.featureTitle}>{item.title}</Text>
              <Text style={styles.featureDescription}>{item.description}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Creado por{" "}
          <Text style={styles.footerBold}>Francisco Matías Molina Jurado</Text>
        </Text>
        <Text style={styles.footerSmall}>Todos los derechos reservados © 2025</Text>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0fdfa", // Tailwind's teal-50
  },
  header: {
    backgroundColor: "#ffffff",
    paddingVertical: 16,
    paddingHorizontal: 24,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    elevation: 4,
    borderBottomWidth: 1,
    borderBottomColor: "#e0f2f1", // soft teal
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "900",
    color: "#0f766e", // teal-700
  },
  loginButton: {
    borderWidth: 2,
    borderColor: "#0f766e",
    paddingHorizontal: 20,
    paddingVertical: 6,
    borderRadius: 999,
  },
  loginButtonText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#0f766e",
  },
  heroContainer: {
    paddingHorizontal: 24,
    paddingVertical: 60,
    alignItems: "center",
    backgroundColor: "#ffffff",
  },
  heroTitle: {
    fontSize: 36,
    fontWeight: "900",
    textAlign: "center",
    color: "#0f766e",
    marginBottom: 16,
  },
  heroSubtitle: {
    fontSize: 18,
    textAlign: "center",
    color: "#0f766e",
    marginBottom: 30,
    maxWidth: 320,
  },
  registerButton: {
    backgroundColor: "#0f766e",
    paddingVertical: 14,
    paddingHorizontal: 36,
    borderRadius: 999,
    elevation: 4,
  },
  registerButtonText: {
    fontSize: 18,
    color: "#ffffff",
    fontWeight: "700",
  },
  featuresContainer: {
    backgroundColor: "#e6fffa", // Tailwind's teal-100
    paddingVertical: 40,
    paddingHorizontal: 20,
  },
  featuresTitle: {
    fontSize: 28,
    fontWeight: "800",
    color: "#0f766e",
    textAlign: "center",
    marginBottom: 30,
  },
  featuresList: {
    gap: 20,
  },
  featureCard: {
    backgroundColor: "#ffffff",
    borderRadius: 24,
    padding: 20,
    marginBottom: 20,
    elevation: 4,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  featureTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#0f766e",
    marginBottom: 8,
  },
  featureDescription: {
    fontSize: 16,
    color: "#115e59", // teal-800
  },
  footer: {
    backgroundColor: "#134e4a", // teal-900
    paddingVertical: 24,
    alignItems: "center",
  },
  footerText: {
    color: "#ffffff",
    fontSize: 16,
    fontWeight: "600",
  },
  footerBold: {
    fontWeight: "900",
  },
  footerSmall: {
    fontSize: 12,
    color: "#ffffff",
    opacity: 0.8,
    marginTop: 6,
  },
});

export default LandingPage;
