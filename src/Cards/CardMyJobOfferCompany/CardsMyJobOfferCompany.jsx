import React, { useEffect, useState, useCallback } from 'react';
import { View, Text, ScrollView, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import axios from 'axios';
import CardMyJobOfferCompany from './CardMyJobOfferCompany';
import AsyncStorage from '@react-native-async-storage/async-storage';

const CardsMyJobOfferCompany = () => {
  const BASE_URL = 'https://franciscomolina.me:8082';
  const [jobOfferData, setJobOfferData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchJobOffers = useCallback(async () => {
    setError(null);
    try {
      const storedCompanyId = await AsyncStorage.getItem('userId');
      const token = await AsyncStorage.getItem('token');
      if (!token) {
        setError('No hay un token válido.');
        setLoading(false);
        setRefreshing(false);
        return;
      }
      const response = await axios.get(`${BASE_URL}/api/company/job-offers/getJobOfferByIdCompany/${storedCompanyId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setJobOfferData(response.data);
    } catch (error) {
      console.error('Error al obtener las ofertas de trabajo:', error);
      setError('Error al obtener las ofertas de trabajo');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [BASE_URL]);

  useEffect(() => {
    fetchJobOffers();
  }, [fetchJobOffers]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchJobOffers();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#4CAF50" />
        <Text style={styles.loadingText}>Cargando ofertas de trabajo...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <ScrollView
      contentContainerStyle={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={['#4CAF50']} />
      }
    >
      <Text style={styles.title}>Mis ofertas publicadas</Text>
      {jobOfferData.length > 0 ? (
        <View style={styles.grid}>
          {jobOfferData.map((jobOffer) => (
            <CardMyJobOfferCompany key={jobOffer.id} jobOffer={jobOffer} />
          ))}
        </View>
      ) : (
        <Text style={styles.noOffersText}>No hay ofertas publicadas</Text>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: '#F5F5DC', // Beige claro
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F5F5DC',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#4CAF50',
  },
  errorText: {
    fontSize: 16,
    color: 'red',
    textAlign: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2E7D32', // Verde oscuro
    textAlign: 'center',
    marginTop: 40,
    marginBottom: 16,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  noOffersText: {
    fontSize: 16,
    color: '#757575',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default CardsMyJobOfferCompany;
