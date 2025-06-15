import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  Platform,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import DateTimePicker from '@react-native-community/datetimepicker';

const BASE_URL = 'https://franciscomolina.me:8082';

const UserProfile = () => {
  const [user, setUser] = useState({
    name: '',
    lastnames: '',
    email: '',
    birthdate: '',
    password: '',
    confirmPassword: ''
  });
  const [userId, setUserId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserData = async () => {
      try {
        const [name, lastnames, email, birthdate, userIdStorage] = await Promise.all([
          AsyncStorage.getItem('name'),
          AsyncStorage.getItem('lastnames'),
          AsyncStorage.getItem('email'),
          AsyncStorage.getItem('birthdate'),
          AsyncStorage.getItem('userId')
        ]);

        setUser({
          name: name || '',
          lastnames: lastnames || '',
          email: email || '',
          birthdate: birthdate || '',
          password: '',
          confirmPassword: ''
        });

        setUserId(userIdStorage);
      } catch (error) {
        console.error('Error leyendo AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const getFieldLabel = (key) => {
    switch (key) {
      case 'name': return 'Nombre';
      case 'lastnames': return 'Apellidos';
      case 'email': return 'Correo Electrónico';
      case 'birthdate': return 'Fecha de Nacimiento';
      case 'password': return 'Contraseña';
      default: return key;
    }
  };

  const confirmDialog = (message) => {
    return new Promise(resolve => {
      Alert.alert('Confirmar', message, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Aceptar', onPress: () => resolve(true) }
      ]);
    });
  };

  const handleChange = (key, value) => {
    setUser(prev => ({ ...prev, [key]: value }));
  };

  const updateField = async (field) => {
    const value = user[field]?.trim();

    if (!userId) {
      Alert.alert('❌ Error', 'No se encontró el ID del usuario.');
      return;
    }

    if (!value) {
      Alert.alert('❌ Error', `El campo "${getFieldLabel(field)}" no puede estar vacío.`);
      return;
    }

    if (field === 'password') {
      if (value !== user.confirmPassword?.trim()) {
        Alert.alert('❌ Error', 'Las contraseñas no coinciden.');
        return;
      }

      const confirm = await confirmDialog('¿Estás seguro de que deseas cambiar tu contraseña?');
      if (!confirm) return;
    } else {
      const confirm = await confirmDialog(
        `¿Deseas actualizar "${getFieldLabel(field)}" con el valor:\n"${value}"?`
      );
      if (!confirm) return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const payload =
        field === 'password'
          ? {
              password: value,
              confirmPassword: user.confirmPassword?.trim()
            }
          : { [field]: value };

      const response = await axios.patch(
        `${BASE_URL}/api/user/update/${userId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        Alert.alert('✅ Éxito', 'Campo actualizado correctamente');

        if (field === 'password') {
          setUser(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } else {
          setUser(prev => ({ ...prev, [field]: value }));
          await AsyncStorage.setItem(field, value);
        }
      }
    } catch (error) {
      console.error('Error al actualizar:', error.response?.data || error.message);
      Alert.alert('❌ Error', error.response?.data?.message || error.message);
    }
  };

  if (loading) {
    return (
      <View style={[styles.container, { justifyContent: 'center', flex: 1 }]}>
        <ActivityIndicator size="large" color="#4f46e5" />
        <Text>Cargando datos...</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Perfil de Usuario</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>{user.name.charAt(0).toUpperCase() || '?'}</Text>
      </View>

      <Text style={styles.subtitle}>{user.name} {user.lastnames}</Text>
      <Text style={styles.email}>{user.email}</Text>

      <View style={styles.inputContainer}>
        {[
          { label: 'Nombre', key: 'name' },
          { label: 'Apellidos', key: 'lastnames' },
          { label: 'Correo Electrónico', key: 'email' }
        ].map(({ label, key }) => (
          <View key={key} style={styles.fieldBlock}>
            <Text style={styles.label}>{label}:</Text>
            <View style={styles.row}>
              <TextInput
                value={user[key]}
                onChangeText={text => handleChange(key, text)}
                style={[styles.input, { flex: 1 }]}
              />
              <TouchableOpacity
                style={styles.saveButton}
                onPress={() => updateField(key)}
              >
                <Text style={{ color: 'white' }}>Guardar</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}

        <Text style={styles.label}>Fecha de Nacimiento:</Text>
        <TouchableOpacity
          style={styles.input}
          onPress={() => setShowDatePicker(true)}
        >
          <Text style={{ color: user.birthdate ? '#000' : '#aaa' }}>
            {user.birthdate || 'Seleccionar fecha'}
          </Text>
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={user.birthdate ? new Date(user.birthdate) : new Date()}
            mode="date"
            display={Platform.OS === 'ios' ? 'spinner' : 'default'}
            maximumDate={new Date()}
            onChange={async (event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) {
                const today = new Date();
                const age = today.getFullYear() - selectedDate.getFullYear();
                const m = today.getMonth() - selectedDate.getMonth();
                const d = today.getDate() - selectedDate.getDate();
                const is18OrOlder = age > 18 || (age === 18 && (m > 0 || (m === 0 && d >= 0)));

                if (!is18OrOlder) {
                  Alert.alert('❌ Edad inválida', 'Debes tener al menos 18 años.');
                  return;
                }

                const isoDate = selectedDate.toISOString().split('T')[0];
                handleChange('birthdate', isoDate);
                await updateField('birthdate');
              }
            }}
          />
        )}

        <Text style={styles.label}>Nueva contraseña:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            value={user.password}
            onChangeText={text => handleChange('password', text)}
            style={[styles.input, { flex: 1 }]}
            secureTextEntry={!showPassword}
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={{ marginLeft: 8 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar contraseña:</Text>
        <View style={styles.row}>
          <TextInput
            value={user.confirmPassword}
            onChangeText={text => handleChange('confirmPassword', text)}
            style={[styles.input, { flex: 1 }]}
            secureTextEntry
            autoCapitalize="none"
            autoCorrect={false}
          />
          <TouchableOpacity
            style={styles.saveButton}
            onPress={() => updateField('password')}
          >
            <Text style={{ color: 'white' }}>Guardar</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScrollView>
  );
};

export default UserProfile;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center'
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginTop: 40,
    marginBottom: 20,
    color: '#333'
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: '#4f46e5',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 10
  },
  avatarText: {
    color: 'white',
    fontSize: 36,
    fontWeight: 'bold'
  },
  subtitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#444'
  },
  email: {
    fontSize: 14,
    color: '#777',
    marginBottom: 20
  },
  inputContainer: {
    width: '100%',
    gap: 10
  },
  fieldBlock: {
    marginBottom: 10
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff'
  },
  saveButton: {
    backgroundColor: '#3b82f6',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 6
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  }
});
