import {
  client,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Habit } from "@/types/database.type";
import MaterialCommunityIcons from "@expo/vector-icons/MaterialCommunityIcons";
import { useFocusEffect } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import { ScrollView, StyleSheet, TouchableOpacity, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Card, IconButton, Surface, Text } from "react-native-paper";

export default function Index() {
  const { signOut, user } = useAuth();

  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch habits when screen comes into focus
  useFocusEffect(
    useCallback(() => {
      if (user) {
        fetchHabits();
      }
    }, [user])
  );

  useEffect(() => {
    if (user) {
      const channel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;

      const habitsSubscription = client.subscribe(
        channel,
        (response: RealtimeResponse) => {
          //console.log("Realtime event received:", response.events);
          
          // Handle create events
          if (
            response.events.includes(
              "databases.*.collections.*.documents.*.create"
            )
          ) {
            //console.log("New habit created, fetching habits...");
            fetchHabits();
          } 
          // Handle update events
          else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.update"
            )
          ) {
            //console.log("Habit updated, fetching habits...");
            fetchHabits();
          }
          // Handle delete events
          else if (
            response.events.includes(
              "databases.*.collections.*.documents.*.delete"
            )
          ) {
            //console.log("Habit deleted, fetching habits...");
            fetchHabits();
          }
        }
      );

      // Initial fetch
      fetchHabits();

      return () => {
        habitsSubscription();
      };
    }
  }, [user]);

  const fetchHabits = async () => {
    if (!user) return;
    
    try {
      setLoading(true);
      const response = await databases.listDocuments(
        DATABASE_ID!,
        HABITS_COLLECTION_ID!,
        [Query.equal("user_id", user.$id)]
      );
      //console.log("Fetched habits:", response.documents.length);
      setHabits(response.documents as Habit[]);
    } catch (error) {
      //console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const getFrequencyColor = (frequency: string) => {
    switch (frequency) {
      case "daily":
        return "#4caf50";
      case "weekly":
        return "#2196f3";
      case "monthly":
        return "#ff9800";
      default:
        return "#757575";
    }
  };

  const getStreakIcon = (streakCount: number) => {
    if (streakCount >= 30) return "trophy";
    if (streakCount >= 7) return "fire";
    if (streakCount >= 3) return "star";
    return "checkbox-marked-circle";
  };

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <View style={styles.headerContent}>
          <Text variant="headlineMedium" style={styles.headerTitle}>
            Today's Habits
          </Text>
          <IconButton
            icon="logout"
            iconColor="#6200ee"
            size={24}
            onPress={signOut}
            style={styles.signOutButton}
          />
        </View>
      </Surface>

      {/* Content */}
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {habits?.length === 0 && !loading ? (
          <View style={styles.emptyState}>
            <MaterialCommunityIcons
              name="format-list-checks"
              size={80}
              color="#e0e0e0"
            />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No Habits Yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptySubtitle}>
              Create your first habit to get started on your journey!
            </Text>
          </View>
        ) : loading ? (
          <View style={styles.loadingState}>
            <Text variant="bodyMedium" style={styles.loadingText}>
              Loading habits...
            </Text>
          </View>
        ) : (
          <View style={styles.habitsContainer}>
            {habits?.map((habit, key) => (
              <Card key={habit.$id || key} style={styles.habitCard} elevation={2}>
                <Card.Content style={styles.cardContent}>
                  <View style={styles.habitHeader}>
                    <Text variant="titleLarge" style={styles.habitTitle}>
                      {habit.title}
                    </Text>
                    <TouchableOpacity style={styles.completeButton}>
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={28}
                        color="#4caf50"
                      />
                    </TouchableOpacity>
                  </View>

                  <Text variant="bodyMedium" style={styles.habitDescription}>
                    {habit.description}
                  </Text>

                  <View style={styles.habitStats}>
                    <View style={styles.statItem}>
                      <MaterialCommunityIcons
                        name={getStreakIcon(habit.streak_count)}
                        size={20}
                        color="#ff9800"
                      />
                      <Text variant="bodySmall" style={styles.statText}>
                        {habit.streak_count} day streak
                      </Text>
                    </View>

                    <View
                      style={[
                        styles.frequencyBadge,
                        { backgroundColor: getFrequencyColor(habit.frequency) },
                      ]}
                    >
                      <Text variant="bodySmall" style={styles.frequencyText}>
                        {habit.frequency.charAt(0).toUpperCase() +
                          habit.frequency.slice(1)}
                      </Text>
                    </View>
                  </View>
                </Card.Content>
              </Card>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  header: {
    backgroundColor: "#ffffff",
    paddingTop: 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
  },
  headerContent: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  headerTitle: {
    color: "#1a1a1a",
    fontWeight: "600",
  },
  signOutButton: {
    backgroundColor: "#f3e5f5",
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    padding: 16,
    paddingBottom: 32,
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
    paddingHorizontal: 32,
  },
  emptyTitle: {
    color: "#757575",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
  },
  emptySubtitle: {
    color: "#9e9e9e",
    textAlign: "center",
    lineHeight: 20,
  },
  loadingState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingTop: 100,
  },
  loadingText: {
    color: "#757575",
    textAlign: "center",
  },
  habitsContainer: {
    gap: 16,
  },
  habitCard: {
    backgroundColor: "#ffffff",
    borderRadius: 12,
    marginBottom: 12,
  },
  cardContent: {
    padding: 16,
  },
  habitHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 8,
  },
  habitTitle: {
    flex: 1,
    color: "#1a1a1a",
    fontWeight: "600",
    marginRight: 12,
  },
  completeButton: {
    padding: 4,
  },
  habitDescription: {
    color: "#616161",
    lineHeight: 20,
    marginBottom: 16,
  },
  habitStats: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  statItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  statText: {
    color: "#757575",
    fontWeight: "500",
  },
  frequencyBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  frequencyText: {
    color: "#ffffff",
    fontWeight: "600",
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
});