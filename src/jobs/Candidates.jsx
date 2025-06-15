import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { Picker } from "@react-native-picker/picker";
import AsyncStorage from "@react-native-async-storage/async-storage";
import axios from "axios";
import { useNavigation } from "@react-navigation/native";

const Candidates = ({ route }) => {
  const { jobOfferId } = route.params;
  const BASE_URL = "https://franciscomolina.me:8082";
  const [candidates, setCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const JobApplicationStatus = {
    INSCRITO: { label: "Inscrito", color: "#4A90E2" },
    CV_LEIDO: { label: "CV Leído", color: "#F5A623" },
    EN_PROCESO_DE_SELECCION: { label: "En Proceso de Selección", color: "#F8E71C" },
    RECHAZADO: { label: "Rechazado", color: "#D0021B" },
    ACEPTADO: { label: "Aceptado", color: "#7ED321" },
    DESCARTADO: { label: "Descartado", color: "#B8B8B8" },
  };

  const fetchCandidates = async () => {
    try {
      const token = await AsyncStorage.getItem("token");
      const res = await axios.get(`${BASE_URL}/api/company/job-application/job-offer/${jobOfferId}/applications`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCandidates(res.data);
    } catch (err) {
      console.error("❌ Error al obtener candidatos:", err.response || err);
      Alert.alert("Error", "No se pudieron obtener los candidatos.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (candidate, newStatus) => {
    const token = await AsyncStorage.getItem("token");
    const candidateId = candidate.id;
    const userId = candidate.user.id;
    try {
      const response = await axios.put(
        `${BASE_URL}/api/company/job-application/updateJobApplicationStatus/${jobOfferId}/${userId}`,
        { candidateId, status: newStatus },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );
      const label = JobApplicationStatus[newStatus]?.label || newStatus;
      Alert.alert("✅ Estado actualizado", `Nuevo estado: ${label}`);
      fetchCandidates(); // Refrescar lista
    } catch (err) {
      console.error("Error al actualizar estado:", err.response?.data || err);
      Alert.alert("Error", "No se pudo actualizar el estado.");
    }
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  if (loading) {
    return <ActivityIndicator size="large" style={styles.loader} />;
  }

  return (
    <ScrollView style={styles.container}>
      {candidates.length === 0 ? (
        <Text style={styles.noCandidatesText}>No hay candidatos disponibles.</Text>
      ) : (
        candidates.map((candidate) => (
          <View style={styles.card} key={candidate.id}>
            <Text style={styles.name}>
              👤 {candidate?.user?.name} {candidate?.user?.lastnames}
            </Text>
            <Text style={styles.email}>
              📧 <Text style={styles.bold}>Email:</Text> {candidate?.user?.email}
            </Text>

            <TouchableOpacity
              onPress={() => {
                // Pasar userId a WorkExperienceView para cargar experiencia laboral del candidato
                navigation.navigate("WorkExperienceView", { userId: candidate.user.id });
              }}
            >
              <Text style={styles.link}>Ver experiencia laboral</Text>
            </TouchableOpacity>

            <View style={[styles.statusContainer, { backgroundColor: JobApplicationStatus[candidate.status]?.color }]}>
              <Text style={styles.statusText}>{JobApplicationStatus[candidate.status]?.label}</Text>
            </View>

            <View style={styles.pickerContainer}>
              <Text style={styles.label}>Actualizar estado:</Text>
              <Picker
                selectedValue={candidate.status}
                onValueChange={(newStatus) => handleStatusChange(candidate, newStatus)}
                style={styles.picker}
              >
                <Picker.Item label="Seleccionar estado" value="" />
                {Object.keys(JobApplicationStatus).map((statusOption) => (
                  <Picker.Item
                    key={`${candidate.id}-${statusOption}`}
                    label={JobApplicationStatus[statusOption].label}
                    value={statusOption}
                  />
                ))}
              </Picker>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#F7F8FA",
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 16,
    padding: 20,
    marginBottom: 20,
    borderColor: "#E1E8F0",
    borderWidth: 1,
    shadowColor: "#000000",
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 5,
  },
  name: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3C4B72",
    marginBottom: 8,
  },
  email: {
    fontSize: 16,
    color: "#5F6D7E",
    marginBottom: 12,
  },
  bold: {
    fontWeight: "700",
  },
  link: {
    fontSize: 15,
    color: "#4A90E2",
    fontWeight: "600",
    marginBottom: 16,
    textDecorationLine: "underline",
  },
  statusContainer: {
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    marginTop: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  statusText: {
    color: "#FFFFFF",
    fontWeight: "600",
  },
  pickerContainer: {
    marginTop: 20,
    borderColor: "#D1D5DB",
    borderWidth: 1,
    borderRadius: 10,
    overflow: "hidden",
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    color: "#4A5568",
    marginBottom: 10,
    marginLeft: 12,
  },
  picker: {
    height: 50,
    backgroundColor: "#FFFFFF",
  },
  noCandidatesText: {
    fontSize: 18,
    color: "#B0BEC5",
    textAlign: "center",
    marginTop: 40,
  },
  loader: {
    marginTop: 32,
  },
});

export default Candidates;
