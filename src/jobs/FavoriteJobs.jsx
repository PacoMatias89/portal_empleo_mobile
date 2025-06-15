import React, { useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "@react-navigation/native";
import axios from "axios";

const FavoriteJobsScreen = () => {
  const BASE_URL = "https://franciscomolina.me:8082";
  const [favoriteJobs, setFavoriteJobs] = useState([]);
  const [appliedJobs, setAppliedJobs] = useState(new Set());
  const [userId, setUserId] = useState(null);

  // Cargar userId desde AsyncStorage
  useFocusEffect(
    useCallback(() => {
      const loadUserId = async () => {
        const storedUserId = await AsyncStorage.getItem("userId");
        if (storedUserId) {
          setUserId(parseInt(storedUserId));
        }
      };
      loadUserId();
    }, [])
  );

  // Cargar trabajos favoritos y aplicados cuando la pantalla tiene el foco
  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const token = await AsyncStorage.getItem("token");
        if (!token) {
          Alert.alert("⚠️", "Debes iniciar sesión para acceder a tus favoritos.");
          setFavoriteJobs([]);
          return;
        }

        try {
          const [favoritesRes, applicationsRes] = await Promise.all([
            axios.get(`${BASE_URL}/api/user/favorite-job`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
            axios.get(`${BASE_URL}/api/user/job-applications`, {
              headers: { Authorization: `Bearer ${token}` },
            }),
          ]);

          const extractedJobs = favoritesRes.data?.filter((job) => job) || [];
          setFavoriteJobs(extractedJobs);

          if (extractedJobs.length === 0) {
            console.log("⚠️ No tienes trabajos favoritos.");
          }

          const appliedSet = new Set(
            applicationsRes.data.map((app) => app.jobOffer.id)
          );
          setAppliedJobs(appliedSet);
        } catch (error) {
          console.error("Error al cargar trabajos:", error.response || error);
        }
      };

      fetchData();
    }, [userId])
  );

  const handleApply = async (jobOfferId) => {
    if (!userId) {
      Alert.alert("⚠️", "Debes iniciar sesión para inscribirte.");
      return;
    }

    if (appliedJobs.has(jobOfferId)) {
      Alert.alert("✅", "Ya estás inscrito en esta oferta.");
      return;
    }

    const token = await AsyncStorage.getItem("token");
    if (!token) {
      Alert.alert("⚠️", "Debes iniciar sesión para aplicar.");
      return;
    }

    try {
      const response = await axios.post(
        `${BASE_URL}/api/company/job-application`,
        { jobOfferId, userId },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.status === 200) {
        setAppliedJobs((prev) => new Set([...prev, jobOfferId]));
        Alert.alert("🎉", "Te has inscrito correctamente.");
      }
    } catch (error) {
      Alert.alert("❌", "Error al inscribirse. Inténtalo de nuevo.");
    }
  };

  const renderJobItem = ({ item }) => {
    return (
      <View style={styles.card}>
        <Text style={styles.title}>{item.title || "Sin título"}</Text>
        <Text style={styles.description}>{item.description}</Text>
        <Text style={styles.info}>
          💰 <Text style={styles.bold}>{item.salary} €</Text>
        </Text>
        <Text style={styles.info}>
          📍 <Text style={styles.bold}>{item.location}</Text>
        </Text>
        <TouchableOpacity
          style={[
            styles.button,
            appliedJobs.has(item.id) && styles.buttonDisabled,
          ]}
          onPress={() => handleApply(item.id)}
          disabled={appliedJobs.has(item.id)}
        >
          <Text style={styles.buttonText}>
            {appliedJobs.has(item.id) ? "Ya inscrito" : "Inscribirse"}
          </Text>
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>Ofertas Favoritas ❤️</Text>
      {favoriteJobs.length > 0 ? (
        <FlatList
          data={favoriteJobs}
          keyExtractor={(item) => item.id?.toString()}
          renderItem={renderJobItem}
          contentContainerStyle={styles.list}
        />
      ) : (
        <Text style={styles.emptyText}>No hay trabajos en favoritos.</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f0f4ff",
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  header: {
    fontSize: 26,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 35,
    marginBottom: 20,
    color: "#1e3a8a",
  },
  list: {
    paddingBottom: 20,
  },
  card: {
    backgroundColor: "white",
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1e40af",
    marginBottom: 6,
  },
  description: {
    fontSize: 14,
    color: "#4b5563",
    marginBottom: 8,
  },
  info: {
    fontSize: 14,
    color: "#6b7280",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
  },
  button: {
    backgroundColor: "#2563eb",
    paddingVertical: 10,
    borderRadius: 8,
    marginTop: 10,
  },
  buttonDisabled: {
    backgroundColor: "#9ca3af",
  },
  buttonText: {
    color: "white",
    textAlign: "center",
    fontWeight: "600",
  },
  emptyText: {
    fontSize: 16,
    color: "#6b7280",
    textAlign: "center",
    marginTop: 20,
  },
});

export default FavoriteJobsScreen;
