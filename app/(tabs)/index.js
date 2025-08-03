import {
  View,
  Text,
  ImageBackground,
  Dimensions,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import Swiper from 'react-native-swiper';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useState, useEffect } from 'react';
import api from '@services/api';

const { width } = Dimensions.get('window');

export default function Home() {
  const router = useRouter();
  const [topRecipes, setTopRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Banner images from assets
  const banners = [
    require('@assets/images/biryani.png'),
    require('@assets/images/jalebi.png'),
    require('@assets/images/laddoo.png'),
    require('@assets/images/tikka.png'),
  ];

  useEffect(() => {
    async function fetchTopRecipes() {
      try {
        const response = await api.get('/recipes/top'); // Your backend endpoint
        setTopRecipes(response.data);
      } catch (err) {
        setError('Failed to load recipes.');
      } finally {
        setLoading(false);
      }
    }
    fetchTopRecipes();
  }, []);

  // Get correct like count
  const getLikeCount = (item) => {
    if (item.likeCount !== undefined) return item.likeCount; // ✅ API field
    if (item.likes !== undefined) return item.likes;
    if (item.likedUsers) return item.likedUsers.length;
    return 0;
  };

  // Render single recipe card
  const renderRecipeCard = ({ item }) => (
    <TouchableOpacity
      style={styles.recipeCardGrid}
      onPress={() => router.push(`/recipes/${item._id}`)}
      activeOpacity={0.85}
    >
      <ImageBackground
        source={{ uri: item.image }}
        style={styles.recipeImageGrid}
        imageStyle={{ borderRadius: 16 }}
      >
        <View style={styles.gradientOverlay} />

        {/* Likes icon & count */}
        <View style={styles.likeContainer}>
          <Ionicons name="heart" size={16} color="#ff4d4d" />
          <Text style={styles.likeText}>{getLikeCount(item)}</Text>
        </View>

        <Text style={styles.recipeTitleGrid}>{item.title}</Text>
      </ImageBackground>
    </TouchableOpacity>
  );

  // Header: Banner + Welcome + Section Title
  const ListHeader = () => (
    <View>
      {/* Banner Carousel */}
      <View style={styles.bannerContainer}>
        <Swiper autoplay autoplayTimeout={3} showsPagination dotColor="#ccc" activeDotColor="#ff6347">
          {banners.map((image, index) => (
            <View key={index} style={styles.bannerSlide}>
              <ImageBackground source={image} style={styles.bannerImage} resizeMode="cover">
                <View style={styles.overlay} />
                <View style={styles.logoOverlay}>
                  <ImageBackground
                    source={require('@assets/images/Logo.png')}
                    style={styles.logoIcon}
                    resizeMode="contain"
                  />
                  <Text style={styles.brandName}>Savorly</Text>
                  <Text style={styles.tagline}>Where Every Dish Tells a Story</Text>
                </View>
              </ImageBackground>
            </View>
          ))}
        </Swiper>
      </View>

      {/* Welcome Section */}
      <View style={styles.section}>
        <Text style={styles.heading}>Welcome to Savorly! 🍳</Text>
        <Text style={styles.subText}>Discover delicious recipes right from your phone.</Text>
      </View>

      {/* Section Title */}
      <View style={styles.section}>
        <Text style={styles.heading}>🔥 Top Recipes</Text>
      </View>
    </View>
  );

  // Footer: Extra Sections + View All Button
  const ListFooter = () => (
    <View>
      {/* View All Recipes Button */}
      <View style={styles.buttonWrapper}>
        <TouchableOpacity style={styles.viewAllButton} onPress={() => router.push('/recipes')}>
          <Text style={styles.viewAllText}>View All Recipes →</Text>
        </TouchableOpacity>
      </View>

      {/* The Savorly Way */}
      <View style={styles.section}>
        <Text style={styles.heading}>🌟 The Savorly Way</Text>
        <Text style={styles.subText}>
          At Savorly, we believe cooking should be joyful and easy. Explore curated recipes, expert tips,
          and step-by-step guides to make every dish a success.
        </Text>
      </View>

      {/* What People Say */}
      <View style={styles.section}>
        <Text style={styles.heading}>💬 What People Say!!!</Text>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>
            "Savorly has changed the way I cook! The recipes are easy to follow and super delicious."  
            – Sarah J.
          </Text>
        </View>
        <View style={styles.testimonialCard}>
          <Text style={styles.testimonialText}>
            "I love the quick tips. Even as a beginner, I feel confident in the kitchen now!"  
            – David M.
          </Text>
        </View>
      </View>

      {/* Quick Tips */}
      <View style={styles.section}>
        <Text style={styles.heading}>⚡ Quick Tips to Cook Like a Pro</Text>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>🔥 Preheat your pan for perfect searing every time.</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>🌿 Add fresh herbs at the end for maximum flavor.</Text>
        </View>
        <View style={styles.tipCard}>
          <Text style={styles.tipText}>🍋 A splash of lemon can brighten up almost any dish.</Text>
        </View>
      </View>
    </View>
  );

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: 'red' }}>{error}</Text>
      </View>
    );
  }

  return (
    <FlatList
      data={topRecipes}
      keyExtractor={(item) => item._id}
      numColumns={2}
      columnWrapperStyle={styles.columnWrapper}
      contentContainerStyle={{ paddingBottom: 20 }}
      ListHeaderComponent={ListHeader}
      ListFooterComponent={ListFooter}
      renderItem={renderRecipeCard}
    />
  );
}

const styles = StyleSheet.create({
  bannerContainer: { height: 260 },
  bannerSlide: { flex: 1 },
  bannerImage: { width: width, height: 260, justifyContent: 'center', alignItems: 'center' },
  overlay: { ...StyleSheet.absoluteFillObject, backgroundColor: 'rgba(0, 0, 0, 0.35)' },
  logoOverlay: { alignItems: 'center' },
  logoIcon: { width: 80, height: 80, marginBottom: 6 },
  brandName: { fontSize: 28, fontWeight: 'bold', color: '#fff', marginBottom: 2 },
  tagline: { fontSize: 14, color: '#fff', fontWeight: '500' },
  section: { padding: 20 },
  heading: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  subText: { fontSize: 16, color: '#555', textAlign: 'center' },

  columnWrapper: { justifyContent: 'space-between', marginBottom: 16 },
  recipeCardGrid: {
    flex: 1,
    marginHorizontal: 4,
    borderRadius: 16,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    backgroundColor: '#fff',
  },
  recipeImageGrid: { width: '100%', height: 180, justifyContent: 'flex-end' },
  gradientOverlay: { ...StyleSheet.absoluteFillObject, borderRadius: 16, backgroundColor: 'rgba(0,0,0,0.25)' },
  recipeTitleGrid: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
    padding: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.5)',
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 3,
  },

  // Likes
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
  likeText: {
    marginLeft: 4,
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },

  // Testimonials & Tips
  testimonialCard: {
    backgroundColor: '#fff',
    padding: 16,
    marginBottom: 12,
    borderRadius: 12,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
  },
  testimonialText: { fontSize: 14, color: '#444', fontStyle: 'italic' },

  tipCard: {
    backgroundColor: '#ffefd5',
    padding: 12,
    marginBottom: 10,
    borderRadius: 8,
  },
  tipText: { fontSize: 14, color: '#333', fontWeight: '500' },

  // Button
  buttonWrapper: { alignItems: 'center', marginVertical: 20 },
  viewAllButton: {
    backgroundColor: '#ff6347',
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 25,
  },
  viewAllText: { color: '#fff', fontSize: 16, fontWeight: '600' },
});
