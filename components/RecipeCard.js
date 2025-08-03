import { View, Text, Image, TouchableOpacity } from 'react-native';
import { useRouter } from 'expo-router';

export default function RecipeCard({ recipe }) {
  const router = useRouter();

  return (
    <TouchableOpacity
      style={{ marginBottom: 15, backgroundColor: '#fff', borderRadius: 10, overflow: 'hidden', elevation: 2 }}
      onPress={() => router.push(`/recipe/${recipe._id}`)}
    >
      <Image source={{ uri: recipe.image }} style={{ width: '100%', height: 150 }} />
      <View style={{ padding: 10 }}>
        <Text style={{ fontSize: 18, fontWeight: 'bold' }}>{recipe.title}</Text>
      </View>
    </TouchableOpacity>
  );
}
