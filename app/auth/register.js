import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { getAuth, createUserWithEmailAndPassword, updateProfile } from 'firebase/auth';
import app from '@services/firebase'; // your firebase.js

export default function Register() {
  const router = useRouter();
  const auth = getAuth(app);

  const [name, setName] = useState('');
  const [photo, setPhoto] = useState('https://i.ibb.co/5hfH60nw/shutterstock-2480850611.jpg');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleRegister = async () => {
    if (!name || !email || !password) {
      Alert.alert('Error', 'Please fill all fields');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const result = await createUserWithEmailAndPassword(auth, email, password);
      const user = result.user;

      // ✅ Update display name and photo like web
      await updateProfile(user, {
        displayName: name,
        photoURL: photo,
      });

      Alert.alert('Success', 'Account created successfully!');
      router.replace('/profile'); // ✅ use replace to prevent going back to register
    } catch (err) {
      console.error(err.message);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container} keyboardShouldPersistTaps="handled">
      <Text style={styles.title}>Register Now!</Text>

      {/* Name */}
      <TextInput
        placeholder="Your Name"
        placeholderTextColor="#999"   // ✅ visible placeholder
        value={name}
        onChangeText={setName}
        style={styles.input}
      />

      {/* Photo */}
      <TextInput
        placeholder="Photo URL"
        placeholderTextColor="#999"
        value={photo}
        onChangeText={setPhoto}
        style={styles.input}
      />

      {/* Email */}
      <TextInput
        placeholder="Email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
        style={styles.input}
      />

      {/* Password */}
      <TextInput
        placeholder="Password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={styles.input}
      />

      {error ? <Text style={styles.errorText}>{error}</Text> : null}

      <TouchableOpacity
        style={[styles.button, loading && { opacity: 0.7 }]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Register</Text>
        )}
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push('/auth/login')}>
        <Text style={styles.switchText}>
          Already have an account? <Text style={{ color: '#ff6347', fontWeight: 'bold' }}>Login</Text>
        </Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
  },
  title: { fontSize: 28, fontWeight: 'bold', color: '#ff6347', marginBottom: 20 },
  input: {
    width: '100%',
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 12,
    paddingHorizontal: 15,
    paddingVertical: 12,
    fontSize: 16,
    marginBottom: 12,
    backgroundColor: '#f9f9f9',
    color: '#333',                 // ✅ typed text is visible
  },
  button: {
    width: '100%',
    backgroundColor: '#ff6347',
    paddingVertical: 14,
    borderRadius: 25,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: { color: '#fff', fontWeight: 'bold', fontSize: 18 },
  switchText: { marginTop: 15, fontSize: 14, color: '#333' },
  errorText: { color: 'red', marginBottom: 10, textAlign: 'center' },
});
