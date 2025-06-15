import React from "react";
import { View, Text, StyleSheet } from "react-native";

const CardMyJobOfferCompany = ({ jobOffer }) => {
  if (!jobOffer) {
    return <Text style={styles.noDataText}>No hay datos de la oferta</Text>;
  }

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{jobOffer.title}</Text>
      <Text style={styles.description}>{jobOffer.description}</Text>

      <View style={styles.details}>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>💰 Salario:</Text> {jobOffer.salary} €
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>📌 Ubicación:</Text> {jobOffer.location}
        </Text>
        <Text style={styles.detailText}>
          <Text style={styles.bold}>📅 Fecha de publicación:</Text> {jobOffer.createdAt}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderWidth: 1,
    borderColor: "#E5E7EB",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    marginBottom: 16,
    width: "100%",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1D4ED8",
    textAlign: "center",
    marginBottom: 8,
  },
  description: {
    fontSize: 14,
    color: "#4B5563",
    marginBottom: 12,
    textAlign: "justify",
  },
  details: {
    marginTop: 8,
  },
  detailText: {
    fontSize: 14,
    color: "#374151",
    marginBottom: 4,
  },
  bold: {
    fontWeight: "bold",
    color: "#111827",
  },
  noDataText: {
    fontSize: 14,
    color: "#6B7280",
    fontStyle: "italic",
    textAlign: "center",
    marginVertical: 16,
  },
});

export default CardMyJobOfferCompany;