import AsyncStorage from '@react-native-async-storage/async-storage';

export const saveFavorite = async (recipeId) => {
  const favorites = JSON.parse(await AsyncStorage.getItem('favorites')) || [];
  if (!favorites.includes(recipeId)) {
    favorites.push(recipeId);
    await AsyncStorage.setItem('favorites', JSON.stringify(favorites));
  }
};

export const getFavorites = async () => {
  return JSON.parse(await AsyncStorage.getItem('favorites')) || [];
};
