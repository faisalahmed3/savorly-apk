import {
  View,
  Text,
  ImageBackground,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  TouchableOpacity,
  Animated,
} from 'react-native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState, useRef } from 'react';
import { WebView } from 'react-native-webview';
import api from '@services/api';

export default function RecipeDetails() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);

  // Animated collapsibles
  const ingredientsHeight = useRef(new Animated.Value(1)).current;
  const instructionsHeight = useRef(new Animated.Value(1)).current;
  const [showIngredients, setShowIngredients] = useState(true);
  const [showInstructions, setShowInstructions] = useState(true);

  // Fetch recipe
  const fetchRecipe = async () => {
    try {
      const response = await api.get(`/recipes/${id}`);
      console.log('Recipe Data:', response.data); // Debugging
      setRecipe(response.data);
      setLikeCount(response.data.likeCount || 0);
    } catch (err) {
      setError('Failed to load recipe.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRecipe();
  }, [id]);

  const toggleAnimatedSection = (section, setter, animatedValue) => {
    const newState = !section;
    setter(newState);

    Animated.timing(animatedValue, {
      toValue: newState ? 1 : 0,
      duration: 300,
      useNativeDriver: false,
    }).start();
  };

  const handleLike = async () => {
    if (liked) return; // only like once per session

    // Optimistic UI
    setLiked(true);
    setLikeCount((prev) => prev + 1);

    try {
      await api.patch(`/recipes/${id}/like`);

      // Refetch recipe to get real likeCount from DB
      const updatedRecipe = await api.get(`/recipes/${id}`);
      setLikeCount(updatedRecipe.data.likeCount || 0);
    } catch (err) {
      console.error('Failed to update like:', err.message);
      // revert UI if failed
      setLiked(false);
      setLikeCount((prev) => prev - 1);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  if (error || !recipe) {
    return (
      <View style={styles.centered}>
        <Text style={{ color: 'red' }}>{error || 'Recipe not found'}</Text>
      </View>
    );
  }

  const ingredientsMaxHeight = ingredientsHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 500],
  });
  const instructionsMaxHeight = instructionsHeight.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 800],
  });

  // Convert YouTube short URL to embed URL
  const getEmbedUrl = (url) => {
    if (!url) return null;
    return url.includes('youtu.be')
      ? url.replace('youtu.be/', 'www.youtube.com/embed/')
      : url.replace('watch?v=', 'embed/');
  };

  return (
    <ScrollView style={{ flex: 1, backgroundColor: '#fff' }}>
      {/* 🔹 Custom Header */}
      <View style={styles.customHeader}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#fff" />
        </TouchableOpacity>
        <Text style={styles.customHeaderTitle}>Recipe Details</Text>
      </View>

      {/* Video or Image */}
      <View style={styles.videoWrapper}>
        {recipe.video ? (
          <WebView
            style={styles.videoPlayer}
            javaScriptEnabled
            domStorageEnabled
            source={{ uri: getEmbedUrl(recipe.video) }}
          />
        ) : (
          <ImageBackground source={{ uri: recipe.image }} style={styles.videoPlayer}>
            <View style={styles.overlay} />
            <Text style={styles.headerTitle}>{recipe.title}</Text>
            <Text style={styles.noVideo}>No video available</Text>
          </ImageBackground>
        )}

        {/* Floating Like Button */}
        <TouchableOpacity
          style={[styles.likeButton, liked && { backgroundColor: '#ffe4e1' }]}
          onPress={handleLike}
          activeOpacity={0.7}
        >
          <Ionicons name={liked ? 'heart' : 'heart-outline'} size={28} color="#ff4d4d" />
          <Text style={styles.likeCount}>{likeCount}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {/* Ingredients */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() =>
            toggleAnimatedSection(showIngredients, setShowIngredients, ingredientsHeight)
          }
        >
          <Text style={styles.sectionTitle}>🛒 Ingredients</Text>
          <Ionicons
            name={showIngredients ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#333"
          />
        </TouchableOpacity>
        <Animated.View style={{ overflow: 'hidden', maxHeight: ingredientsMaxHeight }}>
          <View style={styles.sectionBox}>
            {recipe.ingredients?.split('\n').map((item, idx) => (
              <Text key={idx} style={styles.listItem}>
                • {item.trim()}
              </Text>
            ))}
          </View>
        </Animated.View>

        {/* Instructions */}
        <TouchableOpacity
          style={styles.sectionHeader}
          onPress={() =>
            toggleAnimatedSection(showInstructions, setShowInstructions, instructionsHeight)
          }
        >
          <Text style={styles.sectionTitle}>👨‍🍳 Instructions</Text>
          <Ionicons
            name={showInstructions ? 'chevron-up' : 'chevron-down'}
            size={20}
            color="#333"
          />
        </TouchableOpacity>
        <Animated.View style={{ overflow: 'hidden', maxHeight: instructionsMaxHeight }}>
          <View style={styles.sectionBox}>
            {recipe.instructions?.split('\n').map((step, idx) => (
              <Text key={idx} style={styles.listItem}>
                {idx + 1}. {step.trim()}
              </Text>
            ))}
          </View>
        </Animated.View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  // 🔹 Custom Header
  customHeader: {
    backgroundColor: '#ff6347',
    paddingTop: 50,
    paddingBottom: 15,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  backButton: { marginRight: 12 },
  customHeaderTitle: { color: '#fff', fontSize: 20, fontWeight: 'bold' },

  videoWrapper: { position: 'relative', width: '100%', height: 250 },
  videoPlayer: { width: '100%', height: 250 },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0,0,0,0.35)' },
  headerTitle: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    color: '#fff',
    fontSize: 24,
    fontWeight: 'bold',
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowOffset: { width: 0, height: 2 },
    textShadowRadius: 4,
  },
  noVideo: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    color: '#fff',
    fontSize: 14,
  },

  likeButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.9)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 25,
  },
  likeCount: { marginLeft: 6, fontWeight: 'bold', color: '#333', fontSize: 14 },

  content: { padding: 16 },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 20,
    marginBottom: 8,
  },
  sectionTitle: { fontSize: 20, fontWeight: 'bold' },
  sectionBox: {
    backgroundColor: '#f8f8f8',
    padding: 12,
    borderRadius: 12,
  },
  listItem: { fontSize: 14, color: '#333', marginBottom: 6 },
});
