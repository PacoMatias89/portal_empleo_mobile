import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator, ScrollView, StyleSheet } from 'react-native';
import axios from 'axios';
import { useRoute } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const ViewWorkExperienceDetails = () => {
  const route = useRoute();
  const { expId } = route.params; // Recibido desde WorkExperienceView
  const BASE_URL = 'https://franciscomolina.me:8082';

  const [workExperience, setWorkExperience] = useState(null);
  const [loadingExperience, setLoadingExperience] = useState(false);
  const [error, setError] = useState(null);

  const [token, setToken] = useState(null);

  useEffect(() => {
    const getTokenFromStorage = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('token');
        if (storedToken) {
          setToken(storedToken);
        } else {
          setError({ message: 'No se encontró el token.' });
        }
      } catch (err) {
        console.error("Error al obtener el token:", err);
        setError({ message: 'Error al obtener el token.' });
      }
    };

    getTokenFromStorage();
  }, []);

  useEffect(() => {
    if (!token || !expId) return;

    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };

    setLoadingExperience(true);

    axios
      .get(`${BASE_URL}/api/work-experience/get_work-experiences/${expId}`, config)
      .then((response) => {
        setWorkExperience(response.data || {});
        setLoadingExperience(false);
      })
      .catch((err) => {
        setError(err);
        setLoadingExperience(false);
      });
  }, [token, expId]);

  return (
    <View style={styles.container}>
      <Text style={styles.header}>🧳 Detalles de la Experiencia Laboral</Text>

      {error && <Text style={styles.error}>❌ Error: {error.message}</Text>}

      {loadingExperience ? (
        <ActivityIndicator size="large" color="#1D4ED8" />
      ) : (
        <ScrollView style={styles.content}>
          {workExperience && (
            <View style={styles.card}>
              <Text style={styles.subHeader}>📋 Detalles</Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>Nombre de la Empresa:</Text> {workExperience.companyName}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>Puesto:</Text> {workExperience.position}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>Fecha de Inicio:</Text> {workExperience.startDate}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>Fecha de Fin:</Text> {workExperience.endDate}
              </Text>
              <Text style={styles.text}>
                <Text style={styles.bold}>Descripción:</Text> {workExperience.description}
              </Text>
            </View>
          )}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#f7f7f7',
  },
  header: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1D4ED8',
    textAlign: 'center',
    marginBottom: 16,
  },
  error: {
    color: 'red',
    textAlign: 'center',
    marginBottom: 16,
  },
  content: {
    marginTop: 16,
  },
  card: {
    backgroundColor: 'white',
    padding: 16,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#1D4ED8',
    marginBottom: 12,
  },
  text: {
    fontSize: 16,
    color: '#333',
    marginBottom: 8,
  },
  bold: {
    fontWeight: 'bold',
  },
});

export default ViewWorkExperienceDetails;
