import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  RefreshControl,
} from "react-native";
import { Picker } from "@react-native-picker/picker";

const JobApplicationStatus = {
  INSCRITO: { label: "Inscrito", color: "#3B82F6", icon: "📄" },
  CV_LEIDO: { label: "CV Leído", color: "#F59E0B", icon: "📄" },
  EN_PROCESO_DE_SELECCION: {
    label: "En Proceso de Selección",
    color: "#FB923C",
    icon: "⏸️",
  },
  RECHAZADO: { label: "Rechazado", color: "#EF4444", icon: "❌" },
  ACEPTADO: { label: "Aceptado", color: "#10B981", icon: "✅" },
  DESCARTADO: { label: "Descartado", color: "#9CA3AF", icon: "❌" },
};

const CandidateCard = ({
  candidate,
  status,
  onStatusChange,
  onUpdate,
  navigation,
}) => {
  const [selectedStatus, setSelectedStatus] = useState(status);

  useEffect(() => {
    setSelectedStatus(status);
  }, [status]);

  const handleStatusChange = (newStatus) => {
    setSelectedStatus(newStatus);
    onStatusChange(candidate.id, newStatus);
  };

  return (
    <View style={styles.card}>
      <Text style={styles.name}>
        👤 {candidate.user?.name} {candidate.user?.lastnames}
      </Text>
      <Text style={styles.info}>
        📧 <Text style={styles.label}>Email:</Text> {candidate.user?.email}
      </Text>

      <TouchableOpacity
        onPress={() =>
          navigation.navigate("WorkExperience", { userId: candidate.user?.id })
        }
      >
        <Text style={styles.link}>Ver experiencia laboral</Text>
      </TouchableOpacity>

      <View
        style={[
          styles.statusBox,
          { backgroundColor: JobApplicationStatus[selectedStatus]?.color },
        ]}
      >
        <Text style={styles.statusText}>
          {JobApplicationStatus[selectedStatus]?.icon}{" "}
          {JobApplicationStatus[selectedStatus]?.label}
        </Text>
      </View>

      <Text style={styles.label}>Actualizar estado:</Text>
      <View style={styles.pickerWrapper}>
        <Picker selectedValue={selectedStatus} onValueChange={handleStatusChange}>
          <Picker.Item style={styles.pickerWrapper} label="Seleccionar estado" value="" />
          {Object.keys(JobApplicationStatus).map((statusOption) => (
            <Picker.Item
              key={`${candidate.id}-${statusOption}`}
              label={JobApplicationStatus[statusOption].label}
              value={statusOption}
            />
          ))}
        </Picker>
      </View>

      <TouchableOpacity style={styles.button} onPress={() => onUpdate(candidate.id)}>
        <Text style={styles.buttonText}>📝 Actualizar estado</Text>
      </TouchableOpacity>
    </View>
  );
};

// Componente principal que contiene la lista y el refresh control
const CandidatesListScreen = ({ navigation }) => {
  const [candidates, setCandidates] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // Simulación de fetch de datos (reemplaza con tu llamada real)
  const fetchCandidates = async () => {
    // Simula espera para la demo:
    await new Promise((res) => setTimeout(res, 1000));

    // Datos dummy ejemplo, reemplaza con API real:
    const dummyData = [
      {
        id: 1,
        user: {
          id: 101,
          name: "Juan",
          lastnames: "Pérez",
          email: "juan.perez@example.com",
        },
        status: "INSCRITO",
      },
      {
        id: 2,
        user: {
          id: 102,
          name: "María",
          lastnames: "González",
          email: "maria.gonzalez@example.com",
        },
        status: "CV_LEIDO",
      },
    ];
    setCandidates(dummyData);
  };

  useEffect(() => {
    fetchCandidates();
  }, []);

  const onRefresh = useCallback(() => {
    setRefreshing(true);
    fetchCandidates().finally(() => setRefreshing(false));
  }, []);

  const handleStatusChange = (candidateId, newStatus) => {
    setCandidates((prev) =>
      prev.map((c) =>
        c.id === candidateId
          ? {
              ...c,
              status: newStatus,
            }
          : c
      )
    );
  };

  const handleUpdate = (candidateId) => {
    // Aquí iría la llamada para guardar el nuevo estado en backend
    alert(`Estado actualizado para candidato con id ${candidateId}`);
  };

  return (
    <FlatList
      data={candidates}
      keyExtractor={(item) => item.id.toString()}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      renderItem={({ item }) => (
        <CandidateCard
          candidate={item}
          status={item.status}
          onStatusChange={handleStatusChange}
          onUpdate={handleUpdate}
          navigation={navigation}
        />
      )}
      contentContainerStyle={{ padding: 16 }}
      ListEmptyComponent={
        !refreshing && (
          <View style={{ marginTop: 40, alignItems: "center" }}>
            <Text>No hay candidatos disponibles.</Text>
          </View>
        )
      }
    />
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    borderWidth: 1,
    borderColor: "#e5e7eb",
  },
  name: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
  },
  info: {
    color: "#374151",
    marginTop: 8,
  },
  label: {
    fontWeight: "bold",
    color: "#111827",
  },
  link: {
    color: "#3B82F6",
    marginTop: 10,
    fontWeight: "bold",
  },
  statusBox: {
    marginTop: 16,
    padding: 12,
    borderRadius: 8,
  },
  statusText: {
    color: "#fff",
    fontWeight: "bold",
  },
  pickerWrapper: {
    borderWidth: 1,
    borderColor: "#d1d5db",
    borderRadius: 8,
    marginVertical: 12,
    overflow: "hidden", // importante para Android
    height: 50, // o el alto que quieras
    justifyContent: "center",
  },
  button: {
    backgroundColor: "#10B981",
    padding: 12,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
});

export default CandidatesListScreen;
