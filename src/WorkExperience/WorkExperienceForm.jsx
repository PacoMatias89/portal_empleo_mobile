import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';
import * as DocumentPicker from 'expo-document-picker';
import DateTimePickerModal from 'react-native-modal-datetime-picker';

const WorkExperienceForm = ({ onSave, onCancel }) => {
  const BASE_URL = 'https://franciscomolina.me:8082';

  const [formData, setFormData] = useState({
    companyName: '',
    position: '',
    startDate: '',
    endDate: '',
    description: '',
  });

  const [file, setFile] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isDatePickerVisible, setDatePickerVisibility] = useState(false);
  const [dateFieldBeingEdited, setDateFieldBeingEdited] = useState('');

  const resetForm = () => {
    setFormData({
      companyName: '',
      position: '',
      startDate: '',
      endDate: '',
      description: '',
    });
    setFile(null);
    setMessage('');
  };

  const getUserIdFromStorage = async () => {
    try {
      const userId = await AsyncStorage.getItem('userId');
      return userId || null;
    } catch (error) {
      console.error('Error obteniendo userId:', error);
      return null;
    }
  };

  const getTokenFromStorage = async () => {
    try {
      return await AsyncStorage.getItem('token');
    } catch (error) {
      console.error('Error obteniendo token:', error);
      return null;
    }
  };

  const handleInputChange = (name, value) => {
    if (
      name === 'endDate' &&
      formData.startDate &&
      new Date(value) < new Date(formData.startDate)
    ) {
      setMessage('⚠️ La fecha de fin no puede ser anterior a la de inicio.');
      return;
    }
    if (
      name === 'startDate' &&
      formData.endDate &&
      new Date(formData.endDate) < new Date(value)
    ) {
      setMessage('⚠️ La fecha de inicio no puede ser posterior a la de fin.');
      return;
    }
    setMessage('');
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const openDatePicker = (field) => {
    setDateFieldBeingEdited(field);
    setDatePickerVisibility(true);
  };

  const handleConfirmDate = (date) => {
    const formattedDate = date.toISOString().split('T')[0];
    handleInputChange(dateFieldBeingEdited, formattedDate);
    setDatePickerVisibility(false);
  };

  const handleCancelDate = () => {
    setDatePickerVisibility(false);
  };

  const handleFileChange = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (result.canceled) return;

      const picked = result.assets[0];
      setFile({
        uri: picked.uri,
        name: picked.name,
        type: picked.mimeType || 'application/octet-stream',
      });
    } catch (error) {
      console.error('Error seleccionando archivo:', error);
      setMessage('❌ Error al seleccionar el archivo.');
    }
  };

  const handleSubmit = async () => {
    setLoading(true);
    setMessage('');

    const token = await getTokenFromStorage();
    const userId = await getUserIdFromStorage();

    if (!token || !userId) {
      setMessage('⚠️ Debes iniciar sesión para guardar la experiencia.');
      setLoading(false);
      return;
    }

    if (
      !formData.companyName.trim() ||
      !formData.position.trim() ||
      !formData.startDate ||
      !formData.endDate
    ) {
      setMessage('⚠️ Todos los campos obligatorios deben estar completos.');
      setLoading(false);
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/work-experience/create`,
        {
          ...formData,
          userId,
        },
        {
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (file) {
        const formDataFile = new FormData();
        formDataFile.append('file', {
          uri: file.uri,
          name: file.name,
          type: file.type,
        });
        formDataFile.append('userId', userId);

        await axios.post(`${BASE_URL}/api/files/upload`, formDataFile, {
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      setMessage('🎉 Experiencia laboral y archivo guardados correctamente.');
      resetForm();
      if (onSave) onSave();
    } catch (error) {
      console.error('Error al enviar:', error.response?.data || error.message);
      setMessage('❌ Error al guardar. Intenta nuevamente.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Agregar Experiencia Laboral</Text>

      <View style={styles.form}>
        <TextInput
          style={styles.input}
          placeholder="Empresa *"
          value={formData.companyName}
          onChangeText={(text) => handleInputChange('companyName', text)}
        />
        <TextInput
          style={styles.input}
          placeholder="Puesto *"
          value={formData.position}
          onChangeText={(text) => handleInputChange('position', text)}
        />

        <TouchableOpacity
          style={styles.input}
          onPress={() => openDatePicker('startDate')}
        >
          <Text style={{ color: formData.startDate ? '#000' : '#9CA3AF' }}>
            {formData.startDate || 'Selecciona fecha de inicio *'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.input}
          onPress={() => openDatePicker('endDate')}
        >
          <Text style={{ color: formData.endDate ? '#000' : '#9CA3AF' }}>
            {formData.endDate || 'Selecciona fecha de finalización *'}
          </Text>
        </TouchableOpacity>

        <DateTimePickerModal
          isVisible={isDatePickerVisible}
          mode="date"
          onConfirm={handleConfirmDate}
          onCancel={handleCancelDate}
        />

        <TextInput
          style={styles.textarea}
          placeholder="Descripción (opcional)"
          value={formData.description}
          onChangeText={(text) =>
            handleInputChange('description', text)
          }
          multiline
          numberOfLines={4}
        />

        <TouchableOpacity style={styles.buttonSecondary} onPress={handleFileChange}>
          <Text style={styles.buttonText}>
            {file ? `📄 ${file.name}` : 'Seleccionar Archivo (opcional)'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.buttonPrimary, loading && { opacity: 0.7 }]}
          onPress={handleSubmit}
          disabled={loading}
        >
          {loading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.buttonText}>Guardar</Text>
          )}
        </TouchableOpacity>

        {!!message && <Text style={styles.message}>{message}</Text>}

        <TouchableOpacity style={styles.buttonCancel} onPress={onCancel}>
          <Text style={styles.buttonText}>Cancelar</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#F8FAFC',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    textAlign: 'center',
    marginVertical: 30,
    color: '#1E293B',
  },
  form: {
    gap: 15,
  },
  input: {
    height: 50,
    justifyContent: 'center',
    borderColor: '#CBD5E1',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
  },
  textarea: {
    borderColor: '#CBD5E1',
    borderWidth: 1,
    paddingHorizontal: 15,
    borderRadius: 12,
    backgroundColor: '#fff',
    minHeight: 100,
    textAlignVertical: 'top',
  },
  buttonPrimary: {
    backgroundColor: '#3B82F6',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonSecondary: {
    backgroundColor: '#22C55E',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonCancel: {
    backgroundColor: '#EF4444',
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#ffffff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  message: {
    textAlign: 'center',
    color: '#DC2626',
    marginVertical: 10,
    fontSize: 14,
  },
});

export default WorkExperienceForm;
