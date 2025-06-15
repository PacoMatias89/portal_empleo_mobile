import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  StyleSheet,
  ActivityIndicator
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const BASE_URL = 'https://franciscomolina.me:8082';

const CompanyProfile = () => {
  const [company, setCompany] = useState({
    companyName: '',
    email: '',
    phoneContact: '',
    cifCompany: '',
    password: '',
    confirmPassword: ''
  });

  const [companyId, setCompanyId] = useState(null);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadCompanyData = async () => {
      try {
        const [companyName, email, phoneContact, cifCompany, companyIdStorage] = await Promise.all([
          AsyncStorage.getItem('companyName'),
          AsyncStorage.getItem('email'),
          AsyncStorage.getItem('phoneContact'),
          AsyncStorage.getItem('cifCompany'),
          AsyncStorage.getItem('userId')
        ]);

        setCompany({
          companyName: companyName || '',
          email: email || '',
          phoneContact: phoneContact || '',
          cifCompany: cifCompany || '',
          password: '',
          confirmPassword: ''
        });

        setCompanyId(companyIdStorage);
      } catch (error) {
        console.error('Error leyendo AsyncStorage:', error);
      } finally {
        setLoading(false);
      }
    };

    loadCompanyData();
  }, []);

  const handleChange = (key, value) => {
    setCompany(prev => ({ ...prev, [key]: value }));
  };

  const updateField = async (field) => {
    const value = company[field].trim();

    if (!companyId) {
      Alert.alert('❌ Error', 'No se encontró el ID de la empresa.');
      return;
    }

    if (!value) {
      Alert.alert('❌ Error', `El campo "${getFieldLabel(field)}" no puede estar vacío.`);
      return;
    }

    if (field === 'password') {
      if (value !== company.confirmPassword.trim()) {
        Alert.alert('❌ Error', 'Las contraseñas no coinciden.');
        return;
      }

      const confirm = await confirmDialog('¿Estás seguro de que deseas cambiar la contraseña?');
      if (!confirm) return;
    } else {
      const label = getFieldLabel(field);
      const confirm = await confirmDialog(`¿Estás seguro de que deseas actualizar el campo "${label}" con el valor:\n"${value}"?`);
      if (!confirm) return;
    }

    try {
      const token = await AsyncStorage.getItem('token');
      const payload =
        field === 'password'
          ? {
              password: value,
              confirmPasswordCompany: company.confirmPassword.trim()
            }
          : { [field]: value };

      const response = await axios.patch(
        `${BASE_URL}/api/company/update/${companyId}`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
          }
        }
      );

      if (response.status === 200) {
        Alert.alert('✅ Éxito', 'El dato ha sido actualizado correctamente.');

        if (field === 'password') {
          setCompany(prev => ({ ...prev, password: '', confirmPassword: '' }));
        } else {
          setCompany(prev => ({ ...prev, [field]: value }));
          await AsyncStorage.setItem(field, value);
        }
      }
    } catch (error) {
      console.error('Error al actualizar:', error.response?.data || error.message);
      Alert.alert('❌ Error', error.response?.data?.message || error.message);
    }
  };

  const confirmDialog = (message) => {
    return new Promise(resolve => {
      Alert.alert('Confirmación', message, [
        { text: 'Cancelar', style: 'cancel', onPress: () => resolve(false) },
        { text: 'Confirmar', onPress: () => resolve(true) }
      ]);
    });
  };

  const getFieldLabel = (field) => {
    switch (field) {
      case 'companyName': return 'Nombre de la empresa';
      case 'email': return 'Correo electrónico';
      case 'phoneContact': return 'Teléfono de contacto';
      case 'cifCompany': return 'CIF de la empresa';
      case 'password': return 'Contraseña';
      default: return field;
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
      <Text style={styles.title}>Perfil de Empresa</Text>

      <View style={styles.avatar}>
        <Text style={styles.avatarText}>
          {company.companyName ? company.companyName.charAt(0).toUpperCase() : '?'}
        </Text>
      </View>

      <Text style={styles.subtitle}>{company.companyName}</Text>
      <Text style={styles.email}>{company.email}</Text>

      <View style={styles.inputContainer}>
        {[
          { label: 'Nombre de la empresa', key: 'companyName' },
          { label: 'Correo electrónico', key: 'email' },
          { label: 'Teléfono de contacto', key: 'phoneContact' },
          { label: 'CIF de la empresa', key: 'cifCompany' }
        ].map(({ label, key }) => (
          <View key={key} style={styles.fieldBlock}>
            <Text style={styles.label}>{label}</Text>
            <View style={styles.row}>
              <TextInput
                value={company[key]}
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

        <Text style={styles.label}>Nueva contraseña:</Text>
        <View style={styles.passwordContainer}>
          <TextInput
            value={company.password}
            onChangeText={text => handleChange('password', text)}
            style={[styles.input, { flex: 1 }]}
            secureTextEntry={!showPassword}
          />
          <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
            <Text style={{ marginLeft: 8 }}>{showPassword ? '🙈' : '👁️'}</Text>
          </TouchableOpacity>
        </View>

        <Text style={styles.label}>Confirmar contraseña:</Text>
        <TextInput
          value={company.confirmPassword}
          onChangeText={text => handleChange('confirmPassword', text)}
          style={styles.input}
          secureTextEntry
        />

        <TouchableOpacity onPress={() => updateField('password')} style={styles.passwordSaveButton}>
          <Text style={styles.buttonText}>Cambiar contraseña</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

export default CompanyProfile;

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
    marginBottom: 12
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  label: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
    marginBottom: 4
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 6,
    padding: 10,
    backgroundColor: '#fff'
  },
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  saveButton: {
    backgroundColor: '#4f46e5',
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 6
  },
  passwordSaveButton: {
    backgroundColor: '#10b981',
    paddingVertical: 12,
    borderRadius: 8,
    marginTop: 10,
    alignItems: 'center'
  },
  buttonText: {
    color: 'white',
    fontWeight: '600'
  }
});
