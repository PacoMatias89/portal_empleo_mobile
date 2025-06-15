import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const statusStyles = {
  INSCRITO: {
    backgroundColor: '#22c55e', // green
    emoji: '✔️',
    label: 'Postulación Recibida'
  },
  CV_LEIDO: {
    backgroundColor: '#3b82f6', // blue
    emoji: '📄',
    label: 'CV Leído'
  },
  EN_PROCESO_DE_SELECCION: {
    backgroundColor: '#facc15', // yellow
    emoji: '🕒',
    label: 'En Selección'
  },
  DESCARTADO: {
    backgroundColor: '#ef4444', // red
    emoji: '❌',
    label: 'Descartado'
  }
};

const CardJobApplication = ({ jobApplication }) => {
  if (!jobApplication) {
    return <Text style={styles.noData}>No hay datos de postulación</Text>;
  }

  const {
    jobOffer: { title, nameCompany, description, salary, requirements, location, createdAt } = {},
    status,
  } = jobApplication || {};

  const currentStatus = statusStyles[status] || {
    backgroundColor: '#6b7280', // gray
    emoji: '❓',
    label: 'Estado Desconocido'
  };

  return (
    <View style={styles.card}>
      <Text style={styles.title}>{title}</Text>
      <Text style={styles.description}>{description}</Text>

      <View style={styles.details}>
        <Text><Text style={styles.label}>💰 Salario:</Text> ${salary}</Text>
        <Text><Text style={styles.label}>📌 Ubicación:</Text> {location}</Text>
        <Text><Text style={styles.label}>🏢 Empresa:</Text> {nameCompany}</Text>
        <Text><Text style={styles.label}>📅 Fecha de publicación:</Text> {createdAt}</Text>
        <Text><Text style={styles.label}>📋 Requisitos:</Text> {requirements}</Text>
      </View>

      <View style={[styles.statusContainer, { backgroundColor: currentStatus.backgroundColor }]}>
        <Text style={styles.statusText}>
          {currentStatus.emoji} {currentStatus.label}
        </Text>
      </View>
    </View>
  );
};

export default CardJobApplication;

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#ffffff',
    padding: 20,
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 1 },
    shadowRadius: 6,
    marginBottom: 16
  },
  noData: {
    color: '#6b7280',
    fontStyle: 'italic',
    textAlign: 'center',
    padding: 10
  },
  title: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1d4ed8',
    marginBottom: 4
  },
  description: {
    color: '#4b5563',
    marginBottom: 12
  },
  details: {
    gap: 4
  },
  label: {
    fontWeight: 'bold',
    color: '#111827'
  },
  statusContainer: {
    marginTop: 16,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: 20,
    alignSelf: 'flex-start'
  },
  statusText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14
  }
});
