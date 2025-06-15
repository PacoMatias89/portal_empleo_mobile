import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform } from 'react-native';
import { useNavigation } from '@react-navigation/native'; // Import the hook

const OptionsScreen = () => {
  const navigation = useNavigation(); // Use the hook to get navigation

  return (
    <View style={styles.container}>
      <Text style={styles.title}>¿Eres Persona o Empresa?</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[styles.button, styles.personButton]}
          onPress={() => navigation.navigate('Registrar Usuario')}
        >
          <Text style={styles.buttonText}>Soy Persona que busca trabajo</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.button, styles.companyButton]}
          onPress={() => navigation.navigate('Registrar Empresa')}
        >
          <Text style={styles.buttonText}>Soy Empresa</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
    padding: 20,
    borderRadius: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#2e3a59',
    marginBottom: 30,
    textAlign: 'center',
    fontFamily: Platform.OS === 'ios' ? 'HelveticaNeue-Bold' : 'Roboto-Bold',
  },
  buttonContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  button: {
    width: '100%',
    padding: 18,
    borderRadius: 15,
    marginBottom: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 8,
  },
  personButton: {
    backgroundColor: '#4CAF50',
    borderWidth: 1,
    borderColor: '#388E3C',
  },
  companyButton: {
    backgroundColor: '#2196F3',
    borderWidth: 1,
    borderColor: '#1976D2',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    letterSpacing: 1,
  },
});

export default OptionsScreen;
