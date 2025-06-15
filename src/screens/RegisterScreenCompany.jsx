import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert
} from "react-native";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Picker } from '@react-native-picker/picker';

const RegisterScreenCompany = ({ navigation }) => {
  const BASE_URL = "https://franciscomolina.me:8082";

  const [name, setName] = useState("");
  const [lastname, setLastname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPasswordCompany, setConfirmPasswordCompany] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [phoneContact, setPhoneContact] = useState("");
  const [cifCompany, setCifCompany] = useState("");
  const [isEtt, setIsEtt] = useState(false); // boolean desde el inicio
  const [description, setDescription] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const validateFields = () => {
    if (!name || !lastname || !email || !password || !confirmPasswordCompany || !companyName || !phoneContact || !cifCompany || !description) {
      setError("Todos los campos son obligatorios.");
      return false;
    }
    if (password !== confirmPasswordCompany) {
      setError("Las contraseñas no coinciden.");
      return false;
    }
    if (!email.includes("@")) {
      setError("Email no válido.");
      return false;
    }
    return true;
  };

const handleRegister = async () => {
  setError("");
  setLoading(true);

  const formData = {
    name,
    lastname,
    email,
    password,
    confirmPasswordCompany,
    companyName,
    phoneContact,
    cifCompany,
    isEtt,
    description,
  };

  try {
    const response = await axios.post(
      `${BASE_URL}/api/authentication-company/sign-up`,
      formData
    );

    const { token, companyId, companyName, phoneContact, cifCompany, isEtt, email } = response.data;

    /*await AsyncStorage.setItem("token", token);
    await AsyncStorage.setItem("companyName", companyName);
    await AsyncStorage.setItem("phoneContact", phoneContact);
    await AsyncStorage.setItem("cifCompany", cifCompany);
    await AsyncStorage.setItem("isEtt", isEtt.toString());
    await AsyncStorage.setItem("email", email);
    await AsyncStorage.setItem("companyId", companyId);
    await AsyncStorage.setItem("role", "COMPANY");  // rol guardado aquí*/

    // Navega reseteando la pila para mostrar menú
    if (response.data.token) {
        await AsyncStorage.setItem('token', response.data.token);
        await AsyncStorage.setItem('role', response.data.role);
        console.log("Token guardado:", response.data.token);
        // Navega al TabNavigator
        navigation.reset({
          index: 0,
          routes: [{ name: 'TabNavigator' }],
        });
      }

  } catch (error) {
    setError("Error al registrar la empresa. Por favor, intenta de nuevo.");
  } finally {
    setLoading(false);
  }
};


  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.formContainer}>
        <Text style={styles.title}>Registrar Empresa</Text>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre:</Text>
          <TextInput
            style={styles.input}
            value={name}
            onChangeText={setName}
            placeholder="Nombre Responsable"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Apellidos:</Text>
          <TextInput
            style={styles.input}
            value={lastname}
            onChangeText={setLastname}
            placeholder="Apellidos"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Email:</Text>
          <TextInput
            style={styles.input}
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            keyboardType="email-address"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Contraseña:</Text>
          <TextInput
            style={styles.input}
            value={password}
            onChangeText={setPassword}
            placeholder="Contraseña"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Confirmar Contraseña:</Text>
          <TextInput
            style={styles.input}
            value={confirmPasswordCompany}
            onChangeText={setConfirmPasswordCompany}
            placeholder="Confirmar Contraseña"
            secureTextEntry
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Nombre Empresa:</Text>
          <TextInput
            style={styles.input}
            value={companyName}
            onChangeText={setCompanyName}
            placeholder="Nombre de la Empresa"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Teléfono de Contacto:</Text>
          <TextInput
            style={styles.input}
            value={phoneContact}
            onChangeText={setPhoneContact}
            placeholder="Teléfono de Contacto"
            keyboardType="phone-pad"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>CIF Empresa:</Text>
          <TextInput
            style={styles.input}
            value={cifCompany}
            onChangeText={setCifCompany}
            placeholder="CIF de la Empresa"
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>Descripción:</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            value={description}
            onChangeText={setDescription}
            placeholder="Descripción breve de la empresa"
            multiline
            numberOfLines={4}
          />
        </View>

        <View style={styles.inputGroup}>
          <Text style={styles.label}>¿Es ETT?</Text>
          <Picker
            selectedValue={isEtt}
            onValueChange={(itemValue) => setIsEtt(itemValue)}
            style={styles.input}
          >
            <Picker.Item label="Sí" value={true} />
            <Picker.Item label="No" value={false} />
          </Picker>
        </View>

        <TouchableOpacity
          style={[styles.button, loading && styles.loadingButton]}
          onPress={handleRegister}
          disabled={loading}
        >
          <Text style={styles.buttonText}>
            {loading ? "Registrando..." : "Registrar Empresa"}
          </Text>
        </TouchableOpacity>

        {error && <Text style={styles.error}>{error}</Text>}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: "center",
    padding: 20,
    backgroundColor: "#f7f7f7",
  },
  formContainer: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 10,
    width: "100%",
    maxWidth: 500,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 20,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 15,
  },
  label: {
    fontSize: 16,
    color: "#333",
    marginBottom: 8,
  },
  input: {
    height: 50,
    borderColor: "#ddd",
    borderWidth: 1,
    borderRadius: 10,
    paddingHorizontal: 15,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  error: {
    color: "red",
    textAlign: "center",
    marginTop: 15,
    fontSize: 16,
  },
  button: {
    backgroundColor: "#2196F3",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  loadingButton: {
    backgroundColor: "#B0BEC5",
  },
  buttonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "600",
  },
});

export default RegisterScreenCompany;
