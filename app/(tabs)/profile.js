import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  ActivityIndicator,
  ScrollView,
} from "react-native";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import api from "@services/api";
import { auth } from "@services/firebase"; // ✅ Use the initialized auth
import { signOut } from "firebase/auth";

export default function Profile() {
  const router = useRouter();

  const [loading, setLoading] = useState(true);
  const [userData, setUserData] = useState(null);

  useEffect(() => {
    async function fetchProfileData() {
      try {
        const user = auth.currentUser;
        let myRecipesCount = 0;
        let totalRecipeCount = 0;

        if (user?.email) {
          // Fetch user's recipes
          const myRecipesRes = await api.get(`/my-recipes?email=${encodeURIComponent(user.email)}`);
          myRecipesCount = myRecipesRes.data?.length || 0;

          // Fetch total recipes count
          const allRecipesRes = await api.get("/recipes");
          totalRecipeCount = allRecipesRes.data?.length || 0;
        }

        setUserData({
          name: user?.displayName || "Chef",
          email: user?.email || "Not Logged In",
          avatar:
            user?.photoURL ||
            "https://i.ibb.co/2gJp5Z2/default-avatar.png",
          myRecipes: myRecipesCount,
          totalRecipes: totalRecipeCount,
        });
      } catch (err) {
        console.error("Failed to fetch profile data:", err.message);
        setUserData({
          name: "Guest",
          email: "Not Logged In",
          avatar: "https://i.ibb.co/2gJp5Z2/default-avatar.png",
          myRecipes: 0,
          totalRecipes: 0,
        });
      } finally {
        setLoading(false);
      }
    }

    fetchProfileData();
  }, [auth.currentUser]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setUserData(null);
      router.replace("/auth/login");
    } catch (err) {
      console.error("Logout failed", err.message);
    }
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#ff6347" />
      </View>
    );
  }

  return (
    <ScrollView style={{ flex: 1, backgroundColor: "#f8f8f8" }}>
      {/* Profile Header */}
      <View style={styles.header}>
        <Image source={{ uri: userData?.avatar }} style={styles.avatar} />
        <Text style={styles.name}>{userData?.name}</Text>
        <Text style={styles.email}>{userData?.email}</Text>
      </View>

      {/* Dashboard Stats */}
      <View style={styles.statsContainer}>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userData?.myRecipes}</Text>
          <Text style={styles.statLabel}>My Recipes</Text>
        </View>
        <View style={styles.statCard}>
          <Text style={styles.statValue}>{userData?.totalRecipes}</Text>
          <Text style={styles.statLabel}>Total Recipes</Text>
        </View>
      </View>

      {/* Dashboard Options */}
      <View style={styles.dashboard}>
        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => router.push("/myRecipes")}
        >
          <Text style={styles.dashboardText}>📖 View My Recipes</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.dashboardButton}
          onPress={() => router.push("/recipes")}
        >
          <Text style={styles.dashboardText}>🍽 Browse All Recipes</Text>
        </TouchableOpacity>
      </View>

      {/* Auth Buttons */}
      <View style={styles.authButtons}>
        {auth.currentUser ? (
          <TouchableOpacity
            style={[styles.authButton, { backgroundColor: "#ff6347" }]}
            onPress={handleLogout}
          >
            <Text style={styles.authText}>Logout</Text>
          </TouchableOpacity>
        ) : (
          <>
            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: "#ff6347" }]}
              onPress={() => router.push("/auth/login")}
            >
              <Text style={styles.authText}>Login</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.authButton, { backgroundColor: "#555" }]}
              onPress={() => router.push("/auth/register")}
            >
              <Text style={styles.authText}>Register</Text>
            </TouchableOpacity>
          </>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },

  header: {
    alignItems: "center",
    paddingVertical: 30,
    backgroundColor: "#ff6347",
    borderBottomLeftRadius: 30,
    borderBottomRightRadius: 30,
    marginBottom: 20,
  },
  avatar: { width: 100, height: 100, borderRadius: 50, marginBottom: 12 },
  name: { color: "#fff", fontSize: 22, fontWeight: "bold" },
  email: { color: "#fff", fontSize: 14, marginTop: 4 },

  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 20,
  },
  statCard: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 16,
    alignItems: "center",
    width: "40%",
    elevation: 3,
  },
  statValue: { fontSize: 20, fontWeight: "bold", color: "#ff6347" },
  statLabel: { fontSize: 14, color: "#555", marginTop: 6 },

  dashboard: { paddingHorizontal: 20 },
  dashboardButton: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    elevation: 2,
  },
  dashboardText: { fontSize: 16, fontWeight: "600", color: "#333" },

  authButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 30,
    marginBottom: 40,
  },
  authButton: {
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 25,
  },
  authText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
