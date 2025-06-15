import React, { useEffect, useState } from 'react';
import { View, Text, Button, Modal, StyleSheet, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const JobOfferModal = ({ jobOffer, onClose }) => {
  const BASE_URL = 'https://franciscomolina.me:8082';
  const [isApplied, setIsApplied] = useState(false);
  const [userId, setUserId] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const fetchAuthData = async () => {
      try {
        const storedUserId = await AsyncStorage.getItem('userId');
        const storedToken = await AsyncStorage.getItem('token');
        setUserId(storedUserId);
        setToken(storedToken);
      } catch (error) {
        console.error('Error al cargar datos de autenticación:', error);
      }
    };
    fetchAuthData();
  }, []);

  useEffect(() => {
    if (userId && jobOffer) {
      checkIfApplied(jobOffer.id);
    }
  }, [userId, jobOffer]);

  const checkIfApplied = async (jobOfferId) => {
    try {
      if (!token) return;

      const response = await axios.get(`${BASE_URL}/api/user/job-applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const appliedOffers = response.data.map((job) => job.jobOffer.id);
      setIsApplied(appliedOffers.includes(jobOfferId));
      console.log('Applied offers:', appliedOffers);
    } catch (error) {
      Alert.alert('Error', 'Error al verificar si la oferta ha sido aplicada');
      console.error(error);
    }
  };

  const handleApply = async () => {
    try {
      if (!token || !userId) {
        Alert.alert('⚠️', 'Debes iniciar sesión para inscribirte.');
        return;
      }

      const applicationData = {
        jobOfferId: jobOffer.id,
        userId: userId,
      };

      const response = await axios.post(
        `${BASE_URL}/api/company/job-application`,
        applicationData,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      Alert.alert('🎉', 'Inscripción exitosa!');
      setIsApplied(true);
    } catch (error) {
      Alert.alert('❌', 'Error al inscribirse en la oferta.');
      console.error(error);
    }
  };

  if (!jobOffer) return null;

  return (
    <Modal transparent={true} visible={!!jobOffer} animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          <Text style={styles.title}>{jobOffer.title}</Text>
          <Text style={styles.description}>{jobOffer.description}</Text>
          <Text style={styles.salary}>💰 Salario: {jobOffer.salary} €</Text>
          <Text style={styles.location}>📍 Ubicación: {jobOffer.location}</Text>

          <View style={styles.buttonContainer}>
            <Button
              title={isApplied ? '✅ Ya inscrito' : '📩 Inscribirse'}
              onPress={handleApply}
              disabled={isApplied}
              color={isApplied ? 'gray' : 'green'}
            />
            <Button title="❌ Cerrar" onPress={onClose} color="blue" />
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    width: '100%',
    maxWidth: 400,
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    color: '#2b6cb0',
  },
  description: {
    color: '#4a5568',
    marginTop: 10,
  },
  salary: {
    color: '#2d3748',
    marginTop: 10,
  },
  location: {
    color: '#2d3748',
    marginTop: 5,
  },
  buttonContainer: {
    marginTop: 20,
    gap: 10,
  },
});

export default JobOfferModal;
