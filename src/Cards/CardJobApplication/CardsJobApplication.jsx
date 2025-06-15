import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import axios from 'axios';
import CardJobApplication from './CardJobApplication';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CardsJobApplication = () => {
  const BASE_URL = 'https://franciscomolina.me:8082';
  const [jobApplications, setJobApplications] = useState([]);
  const [loading, setLoading] = useState(true); // carga inicial
  const [refreshing, setRefreshing] = useState(false); // pull to refresh
  const [error, setError] = useState(null);
  const navigation = useNavigation();

  // Obtener headers con token
  const getAuthHeaders = useCallback(async () => {
    const token = await AsyncStorage.getItem('token');
    if (!token) {
      setError('No hay un token válido. Por favor, inicia sesión.');
      navigation.navigate('Login');
      return null;
    }
    return { Authorization: `Bearer ${token}` };
  }, [navigation]);

  // Obtener postulaciones
  const fetchJobApplications = useCallback(async () => {
    const headers = await getAuthHeaders();
    if (!headers) return;

    try {
      const response = await axios.get(`${BASE_URL}/api/user/job-applications`, { headers });
      setJobApplications(response.data);
      setError(null);
    } catch (error) {
      console.error('❌ Error obteniendo solicitudes de empleo:', error);
      setError('Hubo un error al cargar las solicitudes de empleo. Intenta de nuevo más tarde.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [getAuthHeaders]);

  useEffect(() => {
    fetchJobApplications();
  }, [fetchJobApplications]);

  // Función para pull to refresh
  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchJobApplications();
  }, [fetchJobApplications]);

  // Indicador de carga inicial
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Cargando solicitudes de empleo...</Text>
      </View>
    );
  }

  // Error
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <Text style={styles.title}>Solicitudes de Empleo</Text>
      {jobApplications.length > 0 ? (
        <View style={styles.gridContainer}>
          {jobApplications.map((jobApplication) => (
            <CardJobApplication key={jobApplication.id} jobApplication={jobApplication} />
          ))}
        </View>
      ) : (
        <Text style={styles.noDataText}>No hay solicitudes de empleo</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    minHeight: '100%',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1F2937',
    textAlign: 'center',
    marginBottom: 16,
  },
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  loadingText: {
    marginTop: 10,
    color: '#6B7280',
    fontStyle: 'italic',
  },
  errorText: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
  },
  noDataText: {
    textAlign: 'center',
    color: '#6B7280',
    fontStyle: 'italic',
  },
});

export default CardsJobApplication;
