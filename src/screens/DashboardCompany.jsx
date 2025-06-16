import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  ScrollView,
  StyleSheet,
  Dimensions,
  ActivityIndicator,
} from "react-native";
import { BarChart } from "react-native-chart-kit";
import AsyncStorage from "@react-native-async-storage/async-storage";

const screenWidth = Dimensions.get("window").width;
const BASE_URL = "https://franciscomolina.me:8082";

// Función para decodificar JWT sin librerías externas
function parseJwt(token) {
  try {
    const base64Url = token.split(".")[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (e) {
    return null;
  }
}

const CompanyDashboard = () => {
  const [stats, setStats] = useState({
    jobOffersCount: 0,
    totalViews: 0,
    applications: 0,
  });
  const [chartData, setChartData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchStats = async () => {
      setLoading(true);
      setError("");

      try {
        const token = (await AsyncStorage.getItem("token"))?.trim();
        if (!token) throw new Error("Token no encontrado");

        // Obtener rol guardado o del token JWT
        let role = (await AsyncStorage.getItem("userRole"))?.trim();
        if (!role) {
          const decoded = parseJwt(token);
          role = decoded?.roles || decoded?.role || "";
          console.log("DEBUG - role from token:", role);
        } else {
          console.log("DEBUG - role from AsyncStorage:", role);
        }

        role = role.toUpperCase();
        if (role !== "ROLE_COMPANY" && role !== "COMPANY") {
          throw new Error("Usuario no autorizado");
        }

        const headers = {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        };

        const [
          jobOffersRes,
          viewsRes,
          applicationsRes,
          jobOffersCountRes,
        ] = await Promise.all([
          fetch(`${BASE_URL}/api/company/jobOffers`, { headers }),
          fetch(`${BASE_URL}/api/company/totalViews`, { headers }),
          fetch(`${BASE_URL}/api/company/applications`, { headers }),
          fetch(`${BASE_URL}/api/company/jobOffersCount`, { headers }),
        ]);

        if (
          !jobOffersRes.ok ||
          !viewsRes.ok ||
          !applicationsRes.ok ||
          !jobOffersCountRes.ok
        ) {
          throw new Error("Error al obtener los datos del servidor");
        }

        const jobOffersArray = await jobOffersRes.json();
        const totalViewsText = await viewsRes.text();
        const applicationsText = await applicationsRes.text();
        const jobOffersCountText = await jobOffersCountRes.text();

        // Preparar datos para gráfico
        const offersByMonth = {};
        jobOffersArray.forEach(({ createdAt }) => {
          if (createdAt) {
            const date = new Date(createdAt);
            const month = date.toLocaleString("default", { month: "short" });
            const year = date.getFullYear();
            const key = `${month} ${year}`;
            offersByMonth[key] = (offersByMonth[key] || 0) + 1;
          }
        });

        const chartDataArray = Object.entries(offersByMonth).map(
          ([month, count]) => ({ month, count })
        );

        setChartData(chartDataArray);

        setStats({
          jobOffersCount: parseInt(jobOffersCountText, 10) || 0,
          totalViews: parseInt(totalViewsText, 10) || 0,
          applications: parseInt(applicationsText, 10) || 0,
        });

      } catch (err) {
        console.error(err);
        setError(err.message || "Error cargando estadísticas");
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  const barData = {
    labels: chartData.map((item) => item.month),
    datasets: [{ data: chartData.map((item) => item.count) }],
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>🏢 Dashboard de Empresa</Text>
      <Text style={styles.subtitle}>
        Gestiona y publica tus ofertas de empleo de manera eficiente.
      </Text>

      {loading ? (
        <ActivityIndicator size="large" color="#34D399" />
      ) : error ? (
        <Text style={styles.errorText}>{error}</Text>
      ) : (
        <>
          <View style={styles.cardsContainer}>
            {[
              {
                label: "Ofertas publicadas",
                value: stats.jobOffersCount,
                icon: "📌",
                bg: "#D1FAE5",
              },
              {
                label: "Visitas totales",
                value: stats.totalViews,
                icon: "👀",
                bg: "#DBEAFE",
              },
              {
                label: "Postulaciones",
                value: stats.applications,
                icon: "📥",
                bg: "#FEF3C7",
              },
            ].map(({ label, value, icon, bg }) => (
              <View key={label} style={[styles.card, { backgroundColor: bg }]}>
                <Text style={styles.cardTitle}>
                  {icon} {label}
                </Text>
                <Text style={styles.cardValue}>{value}</Text>
              </View>
            ))}
          </View>

          <Text style={styles.chartTitle}>Ofertas por Mes</Text>

          {chartData.length > 0 ? (
            <BarChart
              data={barData}
              width={screenWidth - 40}
              height={300}
              fromZero
              chartConfig={{
                backgroundGradientFrom: "#ffffff",
                backgroundGradientTo: "#ffffff",
                decimalPlaces: 0,
                color: () => `rgb(34, 34, 28)`, // barra totalmente opaca
                labelColor: () => `rgb(34, 34, 28)`,
                style: {
                  borderRadius: 16,
                },
              }}
              style={{
                marginVertical: 8,
                borderRadius: 16,
              }}
            />

          ) : (
            <Text style={styles.noDataText}>No hay datos disponibles</Text>
          )}
        </>
      )}
    </ScrollView>
  );
};

export default CompanyDashboard;

const styles = StyleSheet.create({
  container: {
    padding: 20,
    paddingBottom: 100,
  },
  title: {
    fontSize: 26,
    fontWeight: "bold",
    color: "#065F46",
    textAlign: "center",
    marginTop: 40,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#6B7280",
    textAlign: "center",
    marginBottom: 20,
  },
  cardsContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    marginBottom: 24,
  },
  card: {
    flexBasis: "48%",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 6,
    color: "#374151",
  },
  cardValue: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#111827",
  },
  chartTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#1F2937",
    textAlign: "center",
    marginVertical: 12,
  },
  noDataText: {
    textAlign: "center",
    color: "#6B7280",
  },
  errorText: {
    color: "red",
    textAlign: "center",
    fontWeight: "600",
    marginVertical: 10,
  },
});
