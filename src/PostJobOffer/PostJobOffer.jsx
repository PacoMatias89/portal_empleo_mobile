import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  View,
  Text,
  TextInput,
  Button,
  StyleSheet,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

const BASE_URL = "https://franciscomolina.me:8082";

const PostJobOffer = () => {
  const initialFormState = {
    title: "",
    description: "",
    requirements: "",
    salary: "",
    location: "",
    companyId: null,
  };

  const [formData, setFormData] = useState(initialFormState);
  const [suggestions, setSuggestions] = useState([]);

  useEffect(() => {
    const loadCompanyId = async () => {
      const companyId = await AsyncStorage.getItem("companyId");
      setFormData((prev) => ({
        ...prev,
        companyId: companyId ? Number(companyId) : null,
      }));
    };
    loadCompanyId();
  }, []);

  const handleInputChange = async (name, value) => {
    setFormData((prevState) => ({ ...prevState, [name]: value }));

    if (name === "location" && value.length > 2) {
      try {
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${value}`,
          {
            headers: {
              "User-Agent": "ReactNativeApp/1.0 (contacto@ejemplo.com)",
              "Accept-Language": "es",
            },
          }
        );
        const data = await response.json();
        setSuggestions(data);
      } catch (error) {
        console.error("Error fetching location suggestions:", error);
      }
    } else {
      setSuggestions([]);
    }
  };

  const handleSelectSuggestion = (address) => {
    setFormData((prevState) => ({ ...prevState, location: address }));
    setSuggestions([]);
  };

  const resetForm = () => {
    setFormData((prev) => ({
      ...initialFormState,
      companyId: prev.companyId, // mantener companyId
    }));
    setSuggestions([]);
  };

  const handleSubmit = async () => {
    try {
      const token = await AsyncStorage.getItem("token");

      const payload = {
        ...formData,
        salary: parseFloat(formData.salary),
      };

      const response = await axios.post(
        `${BASE_URL}/api/company/job-offers`,
        payload,
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      Alert.alert("✅ Oferta creada", response.data.message || "La oferta fue publicada exitosamente.");
      resetForm();
    } catch (error) {
      console.error("Error en la solicitud:", error.response?.data || error.message);
      Alert.alert("❌ Error", "No se pudo crear la oferta.");
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
        <Text style={styles.header}>📝 Publicar Oferta de Trabajo</Text>

        <TextInput
          style={styles.input}
          placeholder="Título"
          value={formData.title}
          onChangeText={(text) => handleInputChange("title", text)}
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Descripción"
          value={formData.description}
          onChangeText={(text) => handleInputChange("description", text)}
          multiline
        />

        <TextInput
          style={[styles.input, styles.textArea]}
          placeholder="Requisitos"
          value={formData.requirements}
          onChangeText={(text) => handleInputChange("requirements", text)}
          multiline
        />

        <TextInput
          style={styles.input}
          placeholder="Salario"
          keyboardType="numeric"
          value={formData.salary}
          onChangeText={(text) => handleInputChange("salary", text)}
        />

        <TextInput
          style={styles.input}
          placeholder="Ubicación"
          value={formData.location}
          onChangeText={(text) => handleInputChange("location", text)}
        />

        {suggestions.length > 0 && (
          <View style={styles.suggestionContainer}>
            {suggestions.map((item) => (
              <TouchableOpacity
                key={item.place_id}
                onPress={() => handleSelectSuggestion(item.display_name)}
              >
                <View style={styles.suggestionItem}>
                  <Text style={styles.suggestionText}>{item.display_name}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </View>
        )}

        <View style={styles.buttonRow}>
          <Button title="✅ Crear Oferta" onPress={handleSubmit} color="#34D399" />
          <View style={{ width: 10 }} />
          <Button title="❌ Cancelar" onPress={resetForm} color="#F87171" />
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    backgroundColor: "#f7f7f7",
  },
  header: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#16A34A",
    textAlign: "center",
    marginBottom: 20,
  },
  input: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingLeft: 10,
    marginBottom: 10,
    fontSize: 14,
    backgroundColor: "#fff",
  },
  textArea: {
    height: 80,
    textAlignVertical: "top",
  },
  suggestionContainer: {
    marginBottom: 10,
    backgroundColor: "#fff",
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ccc",
    overflow: "hidden",
  },
  suggestionItem: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  suggestionText: {
    fontSize: 14,
    color: "#333",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 10,
    gap: 10,
  },
});

export default PostJobOffer;
