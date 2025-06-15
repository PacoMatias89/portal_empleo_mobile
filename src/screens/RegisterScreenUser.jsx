import axios from 'axios';
import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import AsyncStorage from '@react-native-async-storage/async-storage';

const RegisterScreenUser = ({ navigation }) => {
  const BASE_URL = 'https://franciscomolina.me:8082';
  const [name, setName] = useState('');
  const [lastnames, setLastnames] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPicker, setShowPicker] = useState(false);

  const registerData = { name, lastnames, birthdate, email, password, confirmPassword };

  // Función para validar si la fecha de nacimiento es mayor de 18 años
  const isAdult = (dateString) => {
    if (!dateString) return false;
    const birthDate = new Date(dateString);
    const today = new Date();
    const adultDate = new Date(birthDate);
    adultDate.setFullYear(adultDate.getFullYear() + 18);
    return adultDate <= today;
  };

  const handleRegister = async () => {
    setError('');

    if (!isAdult(birthdate)) {
      setError('Debes ser mayor de edad (18 años o más)');
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden');
      return;
    }

    setLoading(true);
   try {
      let response = await axios.post(`${BASE_URL}/api/authentication/sign-up`, registerData);
      console.log('Respuesta del servidor:', response.data);

      const {
        token,
        role,
        name,
        lastnames,
        birthdate,
        email,
        id
      } = response.data;

      if (!token) {
        setError('No se recibió token de autenticación');
        setLoading(false);
        return;
      }

      // Guarda en AsyncStorage solo datos útiles y seguros
      await AsyncStorage.setItem('token', token);
      await AsyncStorage.setItem('role', role);
      await AsyncStorage.setItem('name', name);
      await AsyncStorage.setItem('lastnames', lastnames);
      await AsyncStorage.setItem('birthdate', birthdate);
      await AsyncStorage.setItem('email', email);
      await AsyncStorage.setItem('userId', id.toString());

      navigation.reset({
        index: 0,
        routes: [{ name: 'TabNavigator' }],
      });
    } catch (error) {
      console.log('Error en registro:', error.response?.data || error.message || error);
      setError('Error al registrar el usuario');
    } finally {
      setLoading(false);
    }

  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Crear Cuenta</Text>
      <View style={styles.formContainer}>
        <TextInput
          style={styles.input}
          placeholder="Nombre"
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Apellidos"
          value={lastnames}
          onChangeText={setLastnames}
        />
        
        <TouchableOpacity onPress={() => setShowPicker(true)} style={styles.input}>
          <Text style={{ color: birthdate ? '#000' : '#888' }}>
            {birthdate ? birthdate : 'Seleccionar Fecha de Nacimiento'}
          </Text>
        </TouchableOpacity>

        {showPicker && (
          <DateTimePicker
            value={birthdate ? new Date(birthdate) : new Date()}
            mode="date"
            display="default"
            onChange={(event, selectedDate) => {
              setShowPicker(false);
              if (selectedDate) {
                const formattedDate = selectedDate.toISOString().split('T')[0];
                setBirthdate(formattedDate);
              }
            }}
            maximumDate={new Date()}
            minimumDate={new Date(1900, 0, 1)}
          />
        )}

        <TextInput
          style={styles.input}
          placeholder="Correo Electrónico"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        <TextInput
          style={styles.input}
          placeholder="Confirmar Contraseña"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        {error ? <Text style={styles.error}>{error}</Text> : null}
        <TouchableOpacity
          style={[styles.button, loading && styles.loadingButton]}
          onPress={handleRegister}
          disabled={loading}
        >
          {loading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.buttonText}>Registrar</Text>}
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
    backgroundColor: '#F7F7F7',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
    marginBottom: 20,
  },
  formContainer: {
    width: '100%',
    maxWidth: 400,
    backgroundColor: 'white',
    padding: 20,
    borderRadius: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 5,
  },
  input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fafafa',
    fontSize: 16,
    justifyContent: 'center',
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  loadingButton: {
    backgroundColor: '#B0BEC5',
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  error: {
    color: 'red',
    fontSize: 16,
    textAlign: 'center',
    marginBottom: 15,
  },
});

export default RegisterScreenUser;
