import React from 'react';
import { View, Text, StyleSheet } from 'react-native';

const CardGetWorkExperience = ({ workExperience }) => {
  if (!workExperience) {
    return <Text style={styles.noDataText}>No hay datos de experiencia</Text>;
  }

  return (
    <View style={styles.cardContainer}>
      <Text style={styles.position}>{workExperience.position}</Text>
      <Text style={styles.companyName}>{workExperience.companyName}</Text>
      <Text style={styles.dates}>
        {workExperience.startDate} - {workExperience.endDate || 'Actualidad'}
      </Text>
      <Text style={styles.description}>{workExperience.description}</Text>
      <Text style={styles.experience}>{workExperience.experience}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  cardContainer: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    width: '100%',
    minHeight: 192,
    flexDirection: 'column',
    justifyContent: 'space-between',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  position: {
    fontSize: 18,
    fontWeight: '600',
    color: '#1D4ED8', // Blue-700
  },
  companyName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#4B5563', // Gray-600
  },
  dates: {
    fontSize: 14,
    color: '#6B7280', // Gray-500
  },
  description: {
    marginTop: 8,
    fontSize: 14,
    color: '#374151', // Gray-700
    lineHeight: 20,
  },
  experience: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: '600',
    color: '#2563EB', // Blue-600
  },
  noDataText: {
    textAlign: 'center',
    fontStyle: 'italic',
    color: '#6B7280', // Gray-500
  },
});

export default CardGetWorkExperience;
