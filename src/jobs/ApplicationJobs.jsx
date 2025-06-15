import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  Button,
  StyleSheet,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
} from "react-native";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const JobApplications = () => {
  const BASE_URL = "https://franciscomolina.me:8082";
  const [token, setToken] = useState(null);
  const [jobApplications, setJobApplications] = useState([]);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true); // para el spinner inicial
  const navigation = useNavigation();

  useEffect(() => {
    const getToken = async () => {
      try {
        const storedToken = await AsyncStorage.getItem("token");
        setToken(storedToken);
      } catch (err) {
        console.error("❌ Error al obtener token:", err);
        setError("Error al obtener el token de sesión");
      }
    };
    getToken();
  }, []);

  const isTokenExpired = (token) => {
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const exp = payload.exp * 1000;
      return Date.now() > exp;
    } catch (err) {
      console.error("❌ Error al verificar el token:", err);
      return true;
    }
  };

  const getAuthHeaders = useCallback(() => {
    if (!token || isTokenExpired(token)) {
      setError("El token ha expirado. Por favor, inicia sesión de nuevo.");
      AsyncStorage.removeItem("token");
      navigation.navigate("Login");
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, [token, navigation]);

  const fetchJobApplications = useCallback(async () => {
    const headers = getAuthHeaders();
    if (!headers) return;

    try {
      const response = await axios.get(
        `${BASE_URL}/api/company/job-application/job-offers-with-applicants`,
        { headers }
      );
      setJobApplications(response.data);
      setError(null);
    } catch (err) {
      console.error("❌ Error obteniendo postulaciones:", err.response || err);
      setError(`Error: ${err.response?.data || 'Error desconocido'}`);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    const loadData = async () => {
      if (token) {
        await fetchJobApplications();
        setLoading(false);
      }
    };
    loadData();
  }, [token, fetchJobApplications]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchJobApplications();
    setRefreshing(false);
  }, [fetchJobApplications]);

  const updateStatus = (candidateId, newStatus, jobOfferId) => {
    console.log(`📌 Actualizando estado del candidato ${candidateId} a ${newStatus} en la oferta ${jobOfferId}`);
  };

  const updateCandidate = (candidateId) => {
    console.log(`🛠️ Actualizar candidato con ID: ${candidateId}`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>📋 Postulaciones</Text>
      {error && <Text style={styles.error}>{error}</Text>}

      {loading ? (
        <ActivityIndicator size="large" color="#3b82f6" style={{ marginTop: 20 }} />
      ) : jobApplications.length === 0 ? (
        <Text style={styles.noApplications}>No hay postulaciones disponibles.</Text>
      ) : (
        <ScrollView
          style={styles.applicationsList}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        >
          {jobApplications.map((application) => (
            <View key={application.id} style={styles.applicationCard}>
              <Text style={styles.applicationTitle}>
                🔹 <Text style={styles.bold}>Oferta:</Text> {application.title}
              </Text>
              <Text style={styles.applicationText}>
                👥 <Text style={styles.bold}>Candidatos inscritos:</Text> {application.totalApplicants || 0}
              </Text>
              <Text style={styles.applicationText}>
                📅 <Text style={styles.bold}>Fecha de publicación:</Text>{" "}
                {new Date(application.createdAt).toLocaleDateString()}
              </Text>
              <Button
                title="Ver candidatos"
                onPress={() => {
                  navigation.navigate("Candidates", {
                    candidates: application.candidates || [],
                    jobOfferId: application.id,
                  });
                }}
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
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#3b82f6',
    marginTop: 40,
    marginBottom: 16,
  },
  error: {
    color: 'red',
    marginBottom: 16,
  },
  noApplications: {
    color: '#4b5563',
  },
  applicationsList: {
    marginTop: 16,
  },
  applicationCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 16,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e5e7eb',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  applicationTitle: {
    fontSize: 18,
    fontWeight: '600',
  },
  applicationText: {
    fontSize: 16,
    color: '#4b5563',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default JobApplications;
