import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  ActivityIndicator,
  TouchableOpacity,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect } from 'react';
import api from '@services/api';
import { auth } from '@services/firebase'; // ✅ Use initialized auth
import { onAuthStateChanged } from 'firebase/auth';

export default function MyRecipes() {
  const router = useRouter();

  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // 🔹 Fetch user's recipes safely
  const fetchMyRecipes = async (email) => {
    try {
      const response = await api.get(
        `/my-recipes?email=${encodeURIComponent(email)}`
      );
      console.log("Fetched Recipes:", response.data);

      if (Array.isArray(response.data)) {
        setRecipes(response.data);
        setError(null);
      } else {
        setRecipes([]);
        setError("No recipes found.");
      }
    } catch (err) {
      console.error("Fetch error:", err.message);
      setError("Failed to load your recipes.");
      setRecipes([]);
    } finally {
      setLoading(false);
    }
  };

  // 🔹 Listen to auth state changes to handle release builds
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user && user.email) {
        setLoading(true);
        fetchMyRecipes(user.email);
      } else {
        console.log("User not logged in");
        setError("Please login to view your recipes.");
        setRecipes([]);
        setLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  // 🔹 Render each recipe card
  const renderRecipeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCard}
      onPress={() => {
        if (item._id) router.push(`/recipes/${item._id}`);
      }}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={
          item.image
            ? { uri: item.image }
            : require('../../assets/placeholder.png') // ✅ fallback image
        }
        style={styles.recipeImage}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.overlay} />
        <View style={styles.likeContainer}>
          <Ionicons name="heart" size={16} color="#ff4d4d" />
          <Text style={styles.likeText}>{item.likeCount || 0}</Text>
        </View>
        <Text style={styles.recipeTitle}>{item.title || 'Untitled'}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );

  // 🔹 Loading State
  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  // 🔹 Error State
  if (error) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red', textAlign: 'center', paddingHorizontal: 20 }}>
          {error}
        </Text>
      </View>
    );
  }

  // 🔹 Main UI
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
          keyExtractor={(item, index) => item._id || index.toString()}
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
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
  },
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
