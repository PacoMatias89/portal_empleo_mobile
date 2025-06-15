import React, { useState, useEffect } from "react";
import { View, Text, Button, ActivityIndicator, StyleSheet, ScrollView, Linking, Alert } from "react-native";
import axios from "axios";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation, useRoute } from "@react-navigation/native";

const WorkExperienceView = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { userId } = route.params;
  const BASE_URL = "https://franciscomolina.me:8082";

  const [userWorkExperience, setUserWorkExperience] = useState([]);
  const [loadingExperience, setLoadingExperience] = useState(false);
  const [error, setError] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        } else {
          navigation.navigate('LoginScreen');
        }
      } catch (error) {
        console.error('Error retrieving token:', error);
      }
    };
    getToken();
  }, [navigation]);

  useEffect(() => {
    if (userId && token) {
      setLoadingExperience(true);
      const config = {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      };
      axios
        .get(`${BASE_URL}/api/work-experience/get_work-experiences?userId=${userId}`, config)
        .then((response) => {
          setUserWorkExperience(response.data.companyWorkExperiences || []);
          setLoadingExperience(false);
        })
        .catch((error) => {
          setError(error);
          setLoadingExperience(false);
        });
    }
  }, [userId, token]);

  const handleViewDetails = (expId) => {
    navigation.navigate("ViewWorkExperienceDetails", { expId });
  };

  const handleDownloadCV = () => {
    if (!token) {
      Alert.alert('Error', 'No hay token disponible para la descarga');
      return;
    }

    // URL para descargar el CV — puede que necesites pasar el token en headers, 
    // pero Linking no soporta headers, así que el endpoint debería aceptar token en query o estar público.
    // Aquí asumimos URL pública o con token en query (ajustar según backend).
    const cvUrl = `${BASE_URL}/api/user/cv/download?userId=${userId}&token=${token}`;

    Linking.openURL(cvUrl).catch(() => {
      Alert.alert('Error', 'No se pudo abrir el enlace para descargar el CV.');
    });
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧳 Experiencia Laboral</Text>

      <Button 
        title="⬇️ Descargar CV" 
        onPress={handleDownloadCV} 
        color="#1D4ED8"
      />

      {error && <Text style={styles.error}>❌ Error: {error.message}</Text>}

      {loadingExperience ? (
        <ActivityIndicator size="large" color="#0000ff" />
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

              <Text style={styles.position}><Text style={styles.bold}>Puesto:</Text> {exp.position}</Text>
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
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#1D4ED8",
    textAlign: "center",
    marginBottom: 16,
  },
  error: {
    color: "red",
    textAlign: "center",
    marginBottom: 16,
  },
  text: {
    textAlign: "center",
    color: "#333",
  },
  scrollView: {
    paddingBottom: 16,
  },
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
  companyName: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1D4ED8",
  },
  dateRange: {
    fontSize: 14,
    color: "#888",
  },
  position: {
    fontSize: 16,
    marginTop: 8,
  },
  description: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
  },
  experience: {
    fontSize: 14,
    color: "#555",
    marginTop: 8,
    marginBottom: 12,
  },
  bold: {
    fontWeight: "700",
  },
});

export default WorkExperienceView;
