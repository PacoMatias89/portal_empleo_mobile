import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  Button,
  ActivityIndicator,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useNavigation, useRoute } from "@react-navigation/native";
import * as FileSystem from "expo-file-system";
import * as Sharing from "expo-sharing";

const WorkExperienceView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;
  const BASE_URL = "https://franciscomolina.me:8082";

  const [userWorkExperience, setUserWorkExperience] = useState([]);
  const [loadingExperience, setLoadingExperience] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);
  const [cvExists, setCvExists] = useState(false);
  const [loadingCv, setLoadingCv] = useState(true);

  useEffect(() => {
    const fetchToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        if (!storedToken) {
          navigation.navigate("LoginScreen");
          return;
        }
        setToken(storedToken);
      } catch (e) {
        Alert.alert("Error", "Error al cargar token");
      }
    };
    fetchToken();
  }, [navigation]);

  useEffect(() => {
    if (!userId || !token) return;

    const config = {
      headers: { Authorization: `Bearer ${token}` },
    };

    setLoadingExperience(true);
    setError(null);

    axios
      .get(`${BASE_URL}/api/work-experience/get_work-experiences?userId=${userId}`, config)
      .then((res) => {
        setUserWorkExperience(res.data.companyWorkExperiences || []);
        setLoadingExperience(false);
      })
      .catch((err) => {
        if (err.response?.status === 403) {
          Alert.alert("Acceso denegado", "Tu sesión expiró, por favor inicia sesión de nuevo.");
          AsyncStorage.removeItem("token");
          navigation.navigate("LoginScreen");
          return;
        }
        setError(err);
        setLoadingExperience(false);
      });

    setLoadingCv(true);
    axios
      .get(`${BASE_URL}/api/files/exists/${userId}`, config)
      .then((res) => {
        setCvExists(res.status === 200);
        setLoadingCv(false);
      })
      .catch(() => {
        setCvExists(false);
        setLoadingCv(false);
      });
  }, [userId, token]);

  const handleViewDetails = (expId) => {
    navigation.navigate("ViewWorkExperienceDetails", { expId });
  };

  const handleDownloadCV = async () => {
    if (!token) {
      Alert.alert("Error", "No estás autenticado");
      return;
    }

    try {
      const downloadUrl = `${BASE_URL}/api/files/download/${userId}`;
      const fileUri = FileSystem.documentDirectory + `cv_usuario_${userId}.pdf`;

      const response = await FileSystem.downloadAsync(downloadUrl, fileUri, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.status !== 200) {
        throw new Error("No se pudo descargar el archivo");
      }

      const isAvailable = await Sharing.isAvailableAsync();
      if (!isAvailable) {
        Alert.alert("Error", "No se puede compartir el archivo en este dispositivo");
        return;
      }

      await Sharing.shareAsync(response.uri);
    } catch (err) {
      console.error(err);
      Alert.alert("Error", "No se pudo descargar o abrir el CV.");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧳 Experiencia Laboral</Text>

      {!loadingCv && cvExists && (
        <View style={styles.downloadBtn}>
          <Button
            title="⬇️ Descargar CV"
            onPress={handleDownloadCV}
            color="#059669"
          />
        </View>
      )}

      {error && <Text style={styles.error}>❌ Error: {error.message}</Text>}

      {loadingExperience ? (
        <ActivityIndicator size="large" color="#1D4ED8" />
      ) : userWorkExperience.length === 0 ? (
        <Text style={styles.text}>No se encontró experiencia laboral.</Text>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {userWorkExperience.map((exp) => (
            <View key={exp.id} style={styles.card}>
              <View style={styles.cardHeader}>
                <Text style={styles.companyName}>{exp.companyName}</Text>
                <Text style={styles.dateRange}>
                  {exp.startDate} - {exp.endDate}
                </Text>
              </View>
              <Text style={styles.position}>
                <Text style={styles.bold}>Puesto:</Text> {exp.position}
              </Text>
              <Text style={styles.description}>{exp.description}</Text>
              <Text style={styles.experience}>{exp.experience}</Text>

              <Button
                title="Ver detalles"
                onPress={() => handleViewDetails(exp.id)}
                color="#1D4ED8"
              />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: "#f7f7f7" },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1D4ED8",
    textAlign: "center",
    marginBottom: 16,
  },
  error: { color: "red", textAlign: "center", marginBottom: 16 },
  text: { textAlign: "center", color: "#333" },
  scrollView: { paddingBottom: 16 },
  card: {
    backgroundColor: "white",
    padding: 16,
    borderRadius: 8,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  companyName: { fontSize: 18, fontWeight: "600", color: "#1D4ED8" },
  dateRange: { fontSize: 14, color: "#888" },
  position: { fontSize: 16, marginTop: 8 },
  description: { fontSize: 14, color: "#555", marginTop: 8 },
  experience: { fontSize: 14, color: "#555", marginTop: 8, marginBottom: 12 },
  bold: { fontWeight: "700" },
  downloadBtn: { marginBottom: 16 },
});

export default WorkExperienceView;
