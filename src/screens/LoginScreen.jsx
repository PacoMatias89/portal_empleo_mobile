import axios from 'axios';
import React, { useState } from 'react';
import { View, Text, TextInput, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = () => {
  const BASE_URL = 'https://franciscomolina.me:8082'; // Asegúrate de que este endpoint sea accesible desde tu dispositivo
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('USER'); // Usuario por defecto
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigation = useNavigation();

  const loginData = { email, password };

  const handleLogin = async () => {
  setError('');
  setLoading(true);

  try {
    let response;

    if (role === 'USER') {
      response = await axios.post(`${BASE_URL}/api/authentication/sign-in`, loginData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Extraemos los datos para USER
      const { token, name, role: userRole, lastnames, email, birthdate, id, phoneContact } = response.data;

      await AsyncStorage.setItem('token', token ?? '');
      await AsyncStorage.setItem('userId', String(id ?? ''));
      await AsyncStorage.setItem('role', userRole ?? '');
      await AsyncStorage.setItem('name', name ?? '');
      await AsyncStorage.setItem('lastnames', lastnames ?? '');
      await AsyncStorage.setItem('email', email ?? '');
      await AsyncStorage.setItem('birthdate', birthdate ?? '');
      await AsyncStorage.setItem('phoneContact', phoneContact ?? '');

      console.log('Datos guardados para USER:', {
        token,
        userId: id,
        role: userRole,
        name,
        lastnames,
        email,
        birthdate,
        phoneContact,
      });

    } else if (role === 'COMPANY') {
      response = await axios.post(`${BASE_URL}/api/authentication-company/sign-in`, loginData, {
        headers: { 'Content-Type': 'application/json' },
      });

      // Extraemos los datos para COMPANY
      const { token, name, cifCompany, role: userRole, companyName, lastnames, email, birthdate, id, phoneContact } = response.data;

      await AsyncStorage.setItem('token', token ?? '');
      await AsyncStorage.setItem('userId', String(id ?? ''));
      await AsyncStorage.setItem('role', userRole ?? '');
      await AsyncStorage.setItem('name', name ?? '');
      await AsyncStorage.setItem('companyName', companyName ?? '');
      await AsyncStorage.setItem('phoneContact', phoneContact ?? '');

      // Guardar cifCompany solo si no es null/undefined
      if (cifCompany !== null && cifCompany !== undefined) {
        await AsyncStorage.setItem('cifCompany', cifCompany);
      } else {
        await AsyncStorage.removeItem('cifCompany');
      }

      await AsyncStorage.setItem('lastnames', lastnames ?? '');
      await AsyncStorage.setItem('email', email ?? '');
      await AsyncStorage.setItem('birthdate', birthdate ?? '');

      console.log('Datos guardados para COMPANY:', {
        token,
        userId: id,
        role: userRole,
        name,
        companyName,
        cifCompany,
        phoneContact,
        lastnames,
        email,
        birthdate,
      });
    }

    if (response.data.role === 'USER' || response.data.role === 'COMPANY') {
      navigation.reset({
        index: 0,
        routes: [{ name: 'TabNavigator' }],
      });
    } else {
      setError('Rol no válido');
    }
  } catch (err) {
    console.log(err);
    setError('Usuario o contraseña incorrectos');
  } finally {
    setLoading(false);
  }
};

  
  

  return (
    <View style={styles.container}>
      <View style={styles.form}>
        <Text style={styles.header}>Iniciar Sesión</Text>
        <TextInput
          style={styles.input}
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
        />
        <TextInput
          style={styles.input}
          placeholder="Contraseña"
          secureTextEntry
          value={password}
          onChangeText={setPassword}
        />
        <View style={styles.selectContainer}>
          <Text style={styles.label}>Tipo de usuario</Text>
          <Picker
            selectedValue={role}
            onValueChange={(itemValue) => setRole(itemValue)}
            style={styles.picker}
          >
            <Picker.Item label="Usuario" value="USER" />
            <Picker.Item label="Compañía" value="COMPANY" />
          </Picker>
        </View>
        <Button
          title="Iniciar sesión"
          onPress={handleLogin}
          color="#4C6EF5"
        />
        <Text style={styles.text}>¿No tienes cuenta?</Text>
        <TouchableOpacity onPress={() => navigation.navigate('OptionsScreen')}>
          <Text style={styles.link}>Regístrate aquí</Text>
        </TouchableOpacity>
      </View>
      {error && <Text style={styles.error}>{error}</Text>}
      {loading && <Text>Cargando...</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#F4F6F9',
  },
  form: {
    width: '90%',
    maxWidth: 420,
    padding: 25,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 5,
    marginBottom: 30,
  },
  header: {
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 20,
    color: '#1A3E72',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    height: 50,
    paddingLeft: 15,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 20,
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F9FAFB',
  },
  selectContainer: {
    marginBottom: 20,
    width: '100%',
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#555555',
  },
  picker: {
    height: 50,
    borderColor: '#E0E0E0',
    borderWidth: 1,
    borderRadius: 10,
    width: '100%',
    fontSize: 16,
    color: '#333333',
    backgroundColor: '#F9FAFB',
  },
  button: {
    backgroundColor: '#28A745',
    height: 50,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10,
    marginBottom: 20,
  },
  buttonText: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  text: {
    textAlign: 'center',
    fontSize: 14,
    color: '#555555',
  },
  link: {
    textAlign: 'center',
    color: '#007BFF',
    fontWeight: '600',
    fontSize: 16,
  },
  error: {
    color: '#DC3545',
    textAlign: 'center',
    marginTop: 16,
    fontSize: 16,
  },
  loading: {
    fontSize: 16,
    color: '#888888',
    textAlign: 'center',
    marginTop: 20,
  },
});

export default LoginScreen;
