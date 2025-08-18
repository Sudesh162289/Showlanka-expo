import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, View, StatusBar, ActivityIndicator, TouchableOpacity, FlatList, Image, Alert } from 'react-native';

const events = [
  {
    id: '1',
    title: 'Vesak Festival',
    date: 'April 24, 2024',
    time: '7:00 PM',
    location: 'Colombo',
    image: 'https://i.imgur.com/0XJY1eE.png',
  },
  {
    id: '2',
    title: 'DJ Night',
    date: 'April 27, 2024',
    time: '9:00 PM',
    location: 'Kandy',
    image: 'https://i.imgur.com/7EwKcLC.png',
  },
  {
    id: '3',
    title: 'Traditional Music Concert',
    date: 'May 2, 2024',
    time: '6:30 PM',
    location: 'Galle',
    image: 'https://i.imgur.com/8nUeWkZ.png',
  },
  {
    id: '4',
    title: 'Live Band',
    date: 'May 5, 2024',
    time: '8:00 PM',
    location: 'Negombo',
    image: 'https://i.imgur.com/3g7nmJC.png',
  },
];

export default function App() {
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setLoading(false), 2000);
    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <View style={styles.splashContainer}>
        <StatusBar barStyle="light-content" backgroundColor="#6200EE" />
        <Text style={styles.splashText}>ShowLanka 🎉</Text>
        <ActivityIndicator size="large" color="#fff" />
      </View>
    );
  }

  const handleAddEvent = () => {
    Alert.alert('Add Event', 'Please login to add an event.');
  };

  const renderEvent = ({ item }) => (
    <View style={styles.card}>
      <Image source={{ uri: item.image }} style={styles.cardImage} />
      <View style={styles.cardContent}>
        <Text style={styles.cardTitle}>{item.title}</Text>
        <Text style={styles.cardText}>{item.date}</Text>
        <Text style={styles.cardText}>{item.time}</Text>
        <Text style={styles.cardText}>{item.location}</Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor="#121212" />
      <Text style={styles.title}>Welcome to ShowLanka!</Text>

      <TouchableOpacity style={styles.addButton} onPress={handleAddEvent}>
        <Text style={styles.addButtonText}>+ Add Event</Text>
      </TouchableOpacity>

      <FlatList
        data={events}
        renderItem={renderEvent}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  splashContainer: {
    flex: 1,
    backgroundColor: '#121212',
    alignItems: 'center',
    justifyContent: 'center',
  },
  splashText: {
    color: '#fff',
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  container: {
    flex: 1,
    backgroundColor: '#121212',
    padding: 15,
  },
  title: {
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  addButton: {
    backgroundColor: '#6200EE',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center',
    marginBottom: 15,
  },
  addButtonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  card: {
    backgroundColor: '#1f1f1f',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 15,
  },
  cardImage: {
    width: '100%',
    height: 180,
  },
  cardContent: {
    padding: 12,
  },
  cardTitle: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  cardText: {
    color: '#ccc',
    fontSize: 14,
  },
});