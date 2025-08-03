import { Stack } from 'expo-router';

export default function RecipesLayout() {
  return (
    <Stack>
      <Stack.Screen
        name="index"
        options={{
          headerShown: false, // All Recipes custom header only
        }}
      />
      <Stack.Screen
        name="[id]"
        options={{
          headerShown: false, // 🔹 Hide default header for Recipe Details
        }}
      />
    </Stack>
  );
}
