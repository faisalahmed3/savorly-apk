import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useState, useEffect, useCallback } from 'react';
import api from '@services/api';

export default function AllRecipes() {
  const router = useRouter();
  const [recipes, setRecipes] = useState([]);
  const [filteredRecipes, setFilteredRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');

  // Fetch recipes function
  const fetchRecipes = async () => {
    try {
      const response = await api.get('/recipes'); // Your backend endpoint
      setRecipes(response.data);
      setFilteredRecipes(response.data);
    } catch (err) {
      console.error('Failed to fetch recipes:', err.response?.data || err.message);
      setError('Failed to load recipes.');
    } finally {
      setLoading(false);
    }
  };

  // Initial fetch
  useEffect(() => {
    fetchRecipes();
  }, []);

  // Refetch recipes on focus (real-time like count)
  useFocusEffect(
    useCallback(() => {
      fetchRecipes();
    }, [])
  );

  // Helper to get correct like count
  const getLikeCount = (item) => {
    if (item.likeCount !== undefined) return item.likeCount;
    if (item.likes !== undefined) return item.likes;
    if (item.likedUsers) return item.likedUsers.length;
    return 0;
  };

  // Search filtering
  const handleSearch = (text) => {
    setSearchQuery(text);
    if (!text) {
      setFilteredRecipes(recipes);
    } else {
      const filtered = recipes.filter((recipe) =>
        recipe.title.toLowerCase().includes(text.toLowerCase())
      );
      setFilteredRecipes(filtered);
    }
  };

  // Render Recipe Card
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
        <View style={styles.gradientOverlay} />

        {/* Likes icon & count */}
        <View style={styles.likeContainer}>
          <Ionicons name="heart" size={16} color="#ff4d4d" />
          <Text style={styles.likeText}>{getLikeCount(item)}</Text>
        </View>

        <Text style={styles.recipeTitle}>{item.title}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );

  // Loading state
  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  // Error state
  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: '#f8f8f8' }}>
      {/* Custom Colored Header */}
      <View style={styles.customHeader}>
        <Text style={styles.customHeaderText}>All Recipes</Text>
      </View>

      {/* Search Bar */}
      <View style={styles.searchWrapper}>
        <Ionicons name="search" size={20} color="#888" style={{ marginHorizontal: 8 }} />
        <TextInput
          placeholder="Search recipes..."
          value={searchQuery}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      {/* Recipes Grid */}
      {filteredRecipes.length === 0 ? (
        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text style={{ color: '#666', fontSize: 16 }}>No recipes found</Text>
        </View>
      ) : (
        <FlatList
          data={filteredRecipes}
          keyExtractor={(item) => item._id}
          numColumns={2}
          columnWrapperStyle={styles.columnWrapper}
          contentContainerStyle={{ padding: 10, paddingBottom: 30 }}
          renderItem={renderRecipeCard}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  customHeader: {
    backgroundColor: '#ff6347',
    paddingVertical: 20,
    alignItems: 'center',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 10,
  },
  customHeaderText: {
    color: '#fff',
    fontSize: 22,
    fontWeight: 'bold',
  },

  searchWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    marginHorizontal: 16,
    marginBottom: 12,
    paddingHorizontal: 10,
    borderRadius: 12,
    elevation: 2,
  },
  searchInput: { flex: 1, paddingVertical: 8, fontSize: 14 },

  columnWrapper: { justifyContent: 'space-between', marginBottom: 12 },
  recipeCard: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  recipeImage: { width: '100%', height: 180, justifyContent: 'flex-end' },
  gradientOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0,0,0,0.25)',
    borderRadius: 16,
  },
  recipeTitle: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 10,
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
});
