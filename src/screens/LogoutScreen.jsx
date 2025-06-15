// src/screens/LogoutScreen.js
import React, { useEffect } from "react";
import { View, Text, ActivityIndicator } from "react-native";

const LogoutScreen = ({ onLogout }) => {
  useEffect(() => {
    onLogout();
  }, [onLogout]);

  return (
    <View style={{ flex: 1, justifyContent: "center", alignItems: "center" }}>
      <ActivityIndicator size="large" color="red" />
      <Text style={{ marginTop: 10 }}>Cerrando sesión...</Text>
    </View>
  );
};

export default LogoutScreen;
