import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, StyleSheet, ScrollView, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import CardGetWorkExperience from './CardGetWorkExperience';

const CardsGetWorkExperience = () => {
  const BASE_URL = 'https://franciscomolina.me:8082';
  const [workExperienceData, setWorkExperienceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchWorkExperiences = async () => {
    try {
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('No hay un token válido.');
        setLoading(false);
        return;
      }

      const response = await axios.get(`${BASE_URL}/api/work-experience/get_work-experiences`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWorkExperienceData(response.data);
    } catch (error) {
      console.error('Error al cargar experiencias:', error);
      setError('Hubo un error al cargar las experiencias laborales');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchWorkExperiences();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchWorkExperiences();
  }, []);

  if (loading && !refreshing) {
    return <ActivityIndicator size="large" color="#4CAF50" style={styles.loading} />;
  }

  if (error) {
    return <Text style={styles.errorText}>{error}</Text>;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Experiencia laboral</Text>
      {workExperienceData && workExperienceData.workExperiences.length > 0 ? (
        <View style={styles.experienceContainer}>
          <Text style={styles.totalExperience}>
            Experiencia total: {workExperienceData.totalExperience}
          </Text>
          <ScrollView
            style={styles.scrollView}
            refreshControl={
              <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
            }
          >
            {workExperienceData.workExperiences.map((workExperience) => (
              <View key={workExperience.id} style={styles.cardWrapper}>
                <CardGetWorkExperience workExperience={workExperience} />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <Text style={styles.noDataText}>No hay experiencias laborales</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#F3F4F6',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 16,
    color: '#1F2937', // Gray-900
  },
  experienceContainer: {
    flex: 1,
    alignItems: 'center',
  },
  totalExperience: {
    fontSize: 18,
    fontWeight: '600',
    color: '#374151', // Gray-700
    marginBottom: 16,
  },
  scrollView: {
    width: '100%',
  },
  cardWrapper: {
    marginBottom: 16,
  },
  loading: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    height: '100%',
  },
  errorText: {
    color: '#DC2626', // Red-600
    textAlign: 'center',
    fontSize: 16,
  },
  noDataText: {
    color: '#6B7280', // Gray-500
    textAlign: 'center',
    fontSize: 16,
  },
});

export default CardsGetWorkExperience;
