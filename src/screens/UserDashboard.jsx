import React, { useEffect, useState } from "react";
import { View, Text, TextInput, Button, FlatList, TouchableOpacity, Alert } from "react-native";
import axios from "axios";
import JobOfferModal from "../jobs/JobOfferModal"; // Ajusta la importación del modal en React Native
import AsyncStorage from "@react-native-async-storage/async-storage";

const UserDashboard = () => {
  const BASE_URL = "https://franciscomolina.me:8082";
  const [name, setName] = useState("");
  const [jobs, setJobs] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedJob, setSelectedJob] = useState(null);
  const [favoriteJobs, setFavoriteJobs] = useState(new Set());

  const [token, setToken] = useState("");

  useEffect(() => {
    const getTokenFromStorage = async () => {
      const token = await AsyncStorage.getItem("token");
      setToken(token);
    };

    getTokenFromStorage();
  }, []);

  useEffect(() => {
  if (!token) {
    setLoading(false);
    return;
  }

  const getJobApplications = async () => {
    try {
      setError(null);
      const { data } = await axios.get(
        `${BASE_URL}/api/company/job-offers/getAllJobOffer`,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobs(data);
      setFilteredJobs(data);
    } catch (err) {
      setError("Hubo un error al cargar las ofertas de empleo.");
    } finally {
      setLoading(false);
    }
  };

  const getFavorites = async () => {
    try {
      const { data } = await axios.get(`${BASE_URL}/api/user/favorite-job`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (Array.isArray(data)) {
        // Aquí asumimos que data es un array de jobOffer directamente
        const favoritesSet = new Set(data.map((job) => job.id));
        setFavoriteJobs(favoritesSet);
      } else {
        setFavoriteJobs(new Set());
      }
    } catch (error) {
      console.error("Error al obtener favoritos", error.response?.data || error);
      setFavoriteJobs(new Set());
    }
  };

  getJobApplications();
  getFavorites();
}, [token]);


  const toggleFavorite = async (jobId) => {
    if (!jobId) {
      console.error("jobId es inválido");
      return;
    }

    const isFavorite = favoriteJobs.has(jobId);

    try {
      if (isFavorite) {
        await axios.delete(`${BASE_URL}/api/user/favorite-job/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setFavoriteJobs((prevFavorites) => {
          const updatedFavorites = new Set(prevFavorites);
          updatedFavorites.delete(jobId);
          return updatedFavorites;
        });
      } else {
        const response = await axios.post(
          `${BASE_URL}/api/user/favorite-job`,
          { jobOfferId: jobId },
          { headers: { Authorization: `Bearer ${token}` } }
        );
        setFavoriteJobs((prevFavorites) => {
          const updatedFavorites = new Set(prevFavorites);
          updatedFavorites.add(jobId);
          return updatedFavorites;
        });
      }
    } catch (err) {
      console.error("Error al actualizar favoritos", err.response?.data || err.message);
      Alert.alert("Error", `Error al actualizar favoritos: ${err.response?.data || err.message}`);
    }
  };

  useEffect(() => {
    const getNameFromStorage = async () => {
      const storedName = await AsyncStorage.getItem("name");
      if (storedName) setName(storedName);
    };

    getNameFromStorage();
  }, []);

  useEffect(() => {
    if (searchTerm) {
      setFilteredJobs(
        jobs.filter(
          (job) =>
            job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            job.location.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    } else {
      setFilteredJobs(jobs);
    }
  }, [searchTerm, jobs]);

  const openModal = async (job) => {
    setSelectedJob(job);

    try {
      await axios.put(
        `${BASE_URL}/api/company/jobOffers/${job.id}/incrementViews`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setJobs((prevJobs) =>
        prevJobs.map((prevJob) =>
          prevJob.id === job.id ? { ...prevJob, views: prevJob.views + 1 } : prevJob
        )
      );
    } catch (error) {
      console.error("Error incrementando vista:", error.response?.data || error);
    }
  };

  const closeModal = () => {
    setTimeout(() => setSelectedJob(null), 200);
  };

  return (
    <View style={{ flex: 1, backgroundColor: '#f0f8ff', padding: 20 }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', textAlign: 'center', marginTop: 40 }}>
        Encuentra tu próximo empleo
      </Text>

      <View style={{ backgroundColor: '#fff', padding: 16, borderRadius: 12, marginVertical: 20 }}>
        <Text style={{ fontSize: 16, color: '#555' }}>
          Busca ofertas de empleo y marca como favoritos para verlas rápidamente.
        </Text>
        <TextInput
          style={{
            marginTop: 16,
            padding: 10,
            borderWidth: 1,
            borderColor: '#ccc',
            borderRadius: 8,
          }}
          placeholder="Buscar por título o ciudad..."
          value={searchTerm}
          onChangeText={setSearchTerm}
        />
      </View>

      {error && (
        <View style={{ backgroundColor: 'red', padding: 10, borderRadius: 8, marginBottom: 20 }}>
          <Text style={{ color: 'white', textAlign: 'center' }}>{error}</Text>
        </View>
      )}

      {loading ? (
        <Text style={{ textAlign: 'center', color: '#555' }}>Cargando ofertas...</Text>
      ) : filteredJobs.length > 0 ? (
        <FlatList
          data={filteredJobs}
          keyExtractor={(item) => item.id.toString()}
          renderItem={({ item: job }) => (
            <TouchableOpacity
              style={{
                backgroundColor: '#fff',
                padding: 16,
                borderRadius: 12,
                marginVertical: 8,
                borderWidth: 1,
                borderColor: '#ddd',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              onPress={() => openModal(job)}
            >
              <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#007BFF' }}>{job.title}</Text>
                <Text style={{ color: '#777' }}>{job.description.substring(0, 100)}...</Text>
                <Text style={{color: '#777'}}> 🏢 Empresa : <Text style={{ fontWeight: 'bold' }}>{job.nameCompany}</Text></Text>
                <Text style={{ color: '#555' }}>💰 Salario: <Text style={{ fontWeight: 'bold' }}>{job.salary}</Text></Text>
                <Text style={{ color: '#555' }}>📍 Ubicación: <Text style={{ fontWeight: 'bold' }}>{job.location}</Text></Text>
              </View>
              <TouchableOpacity
                style={{
                  padding: 8,
                  backgroundColor: favoriteJobs.has(job.id) ? '#f44336' : '#ccc',
                  borderRadius: 50,
                }}
                onPress={(e) => {
                  e.stopPropagation();
                  toggleFavorite(job.id);
                }}
              >
                <Text style={{ color: '#fff' }}>{favoriteJobs.has(job.id) ? '❤️' : '🤍'}</Text>
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      ) : (
        <Text style={{ textAlign: 'center', color: '#555' }}>No hay ofertas de empleo disponibles.</Text>
      )}

      {selectedJob && <JobOfferModal jobOffer={selectedJob} onClose={closeModal} />}
    </View>
  );
};

export default UserDashboard;
