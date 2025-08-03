import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useCallback } from 'react';
import api from '@services/api';
import { getAuth } from 'firebase/auth';

export default function MyRecipes() {
  const router = useRouter();
  const auth = getAuth();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchMyRecipes = async () => {
    try {
      const user = auth.currentUser;

      if (!user?.email) {
        setError("Please login to view your recipes.");
        setLoading(false);
        return;
      }

      const response = await api.get(`/my-recipes?email=${user.email}`);
      setRecipes(response.data);
    } catch (err) {
      setError("Failed to load your recipes.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      setLoading(true);
      fetchMyRecipes();
    }, [])
  );

  const renderRecipeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => router.push(`/recipes/${item._id}`)}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.recipeImage}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.overlay} />
        <View style={styles.likeContainer}>
          <Ionicons name="heart" size={16} color="#ff4d4d" />
          <Text style={styles.likeText}>{item.likeCount || 0}</Text>
        </View>
        <Text style={styles.recipeTitle}>{item.title}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Recipes</Text>
      </View>

      {recipes.length === 0 ? (
        <View style={styles.centered}>
          <Text style={{ color: '#333', fontSize: 16 }}>
            You haven't added any recipes yet.
          </Text>
        </View>
      ) : (
        <FlatList
          data={recipes}
          keyExtractor={(item) => item._id}
          renderItem={renderRecipeCard}
          contentContainerStyle={{ padding: 10, paddingBottom: 80 }}
        />
      )}

      {/* Floating Add Recipe Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={() => router.push('/AddRecipe')}
      >
        <Ionicons name="add" size={32} color="#fff" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  header: {
    backgroundColor: '#ff6347',
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  headerTitle: { color: '#fff', fontSize: 22, fontWeight: 'bold' },

  recipeCard: {
    marginBottom: 15,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  recipeImage: { width: '100%', height: 200, justifyContent: 'flex-end' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.25)', borderRadius: 16 },
  recipeTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 18,
    padding: 12,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  likeContainer: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  likeText: { marginLeft: 4, fontSize: 12, fontWeight: '600', color: '#333' },

  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    backgroundColor: '#ff6347',
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 5,
    shadowColor: '#000',
    shadowOpacity: 0.2,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
  },
});
