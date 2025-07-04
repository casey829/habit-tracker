import {
  client,
  COMPLETIONS_COLLECTION_ID,
  DATABASE_ID,
  databases,
  HABITS_COLLECTION_ID,
  RealtimeResponse,
} from "@/lib/appwrite";
import { useAuth } from "@/lib/auth-context";
import { Completion, Habit } from "@/types/database.type";
import React, { useEffect, useState } from "react";
import { ScrollView, StyleSheet, Text, View } from "react-native";
import { Query } from "react-native-appwrite";
import { Card } from "react-native-paper";

const Streaks = () => {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [completedHabits, setCompletedHabits] = useState<Completion[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      //  Subscribe to both habits and completions collections
      const habitsChannel = `databases.${DATABASE_ID}.collections.${HABITS_COLLECTION_ID}.documents`;
      const completionsChannel = `databases.${DATABASE_ID}.collections.${COMPLETIONS_COLLECTION_ID}.documents`;

      // Separate subscription for habits with better event handling
      const habitsSubscription = client.subscribe(
        habitsChannel,
        (response: RealtimeResponse) => {
          //console.log("Habits realtime event received:", response.events);

          // Handle all habit events (create, update, delete)
          if (
            response.events.some(
              (event) =>
                event.includes(
                  "databases.*.collections.*.documents.*.create"
                ) ||
                event.includes(
                  "databases.*.collections.*.documents.*.update"
                ) ||
                event.includes("databases.*.collections.*.documents.*.delete")
            )
          ) {
            console.log("Habit changed, fetching habits...");
            fetchHabits();
          }
        }
      );

      // New subscription for completions to handle task completion in real-time
      const completionsSubscription = client.subscribe(
        completionsChannel,
        (response: RealtimeResponse) => {
          //console.log("Completions realtime event received:", response.events);

          // Handle all completion events (create, update, delete)
          if (
            response.events.some(
              (event) =>
                event.includes(
                  "databases.*.collections.*.documents.*.create"
                ) ||
                event.includes(
                  "databases.*.collections.*.documents.*.update"
                ) ||
                event.includes("databases.*.collections.*.documents.*.delete")
            )
          ) {
            //console.log("Completion changed, fetching completions...");
            fetchCompletions();
          }
        }
      );

      // Initial fetch
      fetchHabits();
      fetchCompletions();

      // Return cleanup function to prevent memory leaks and disconnections
      return () => {
        //console.log("Cleaning up realtime subscriptions...");
        habitsSubscription();
        completionsSubscription();
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
      console.error("Error fetching habits:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchCompletions = async () => {
    if (!user) return;

    try {
      const response = await databases.listDocuments(
        DATABASE_ID!,
        COMPLETIONS_COLLECTION_ID!,
        [Query.equal("user_id", user.$id)]
      );
      //console.log("Fetched completions:", response.documents.length);

      const habitCompletions = response.documents as Completion[];
      setCompletedHabits(habitCompletions);
    } catch (error) {
      console.error("Error fetching completions:", error);
    }
  };

  interface Streak {
    streak: number;
    bestStreak: number;
    total: number;
  }

  //  streak calculation logic
  const getStreak = (habitID: string): Streak => {
    const habitCompletions = completedHabits
      .filter((c) => c.habit_id === habitID)
      .sort(
        (a, b) =>
          new Date(a.completed_at).getTime() -
          new Date(b.completed_at).getTime()
      );

    if (habitCompletions?.length === 0) {
      return { streak: 0, bestStreak: 0, total: 0 };
    }

    let bestStreak = 0;
    let currentStreak = 0;
    let total = habitCompletions.length;

    // Group completions by date to handle multiple completions per day
    const completionsByDate = new Map<string, boolean>();
    habitCompletions.forEach((c) => {
      const dateStr = new Date(c.completed_at).toDateString();
      completionsByDate.set(dateStr, true);
    });

    const uniqueDates = Array.from(completionsByDate.keys())
      .map((dateStr) => new Date(dateStr))
      .sort((a, b) => a.getTime() - b.getTime());

    // Calculate streaks
    for (let i = 0; i < uniqueDates.length; i++) {
      if (i === 0) {
        currentStreak = 1;
      } else {
        const prevDate = uniqueDates[i - 1];
        const currentDate = uniqueDates[i];
        const diffInDays = Math.floor(
          (currentDate.getTime() - prevDate.getTime()) / (1000 * 60 * 60 * 24)
        );

        if (diffInDays === 1) {
          // Consecutive days
          currentStreak++;
        } else {
          // Streak broken, update best streak if current is better
          if (currentStreak > bestStreak) {
            bestStreak = currentStreak;
          }
          currentStreak = 1;
        }
      }
    }

    // Update best streak one final time
    if (currentStreak > bestStreak) {
      bestStreak = currentStreak;
    }

    // Check if current streak is still active (completed today or yesterday)
    const today = new Date();
    const lastCompletionDate = uniqueDates[uniqueDates.length - 1];
    const daysSinceLastCompletion = Math.floor(
      (today.getTime() - lastCompletionDate.getTime()) / (1000 * 60 * 60 * 24)
    );

    // If more than 1 day since last completion, current streak is 0
    const activeStreak = daysSinceLastCompletion > 1 ? 0 : currentStreak;

    return { streak: activeStreak, bestStreak, total };
  };

  const renderStreaks = habits.map((habit) => {
    const { streak, bestStreak, total } = getStreak(habit.$id);
    return { habit, streak, bestStreak, total };
  });

  // Sort by best streak descending (highest first)
  const rankedHabits = renderStreaks.sort(
    (a, b) => b.bestStreak - a.bestStreak
  );

  const badgeStyles = [styles.badge1, styles.badge2, styles.badge3];

  // Render the streaks
  return (
    <View style={styles.container}>
      <Text style={styles.title}> Habit Streaks</Text>
      {rankedHabits.length > 0 && (
        <View style={styles.rankingContainer}>
          <Text style={styles.rankingTitle}>🏅 Top Streaks</Text>
          {rankedHabits.slice(0, 3).map((item, key) => (
            <View key={key} style={styles.rankingRow}>
              <View style={[styles.rankingBadge, badgeStyles[key]]}>
                <Text style={styles.rankingBadgeText}>{key + 1} </Text>
              </View>
              <Text style={styles.rankingHabit}>{item.habit.title}</Text>
              <Text style={styles.rankingStreak}>{item.bestStreak}</Text>
            </View>
          ))}
        </View>
      )}
      {habits.length === 0 ? (
        <Text style={styles.noHabitsText}>
          No habits found. Please add some habits to see streaks.
        </Text>
      ) : (
        <ScrollView>
          {rankedHabits.map(({ habit, streak, bestStreak, total }, key) => (
            <Card key={key} style={styles.card}>
              <Card.Content>
                <Text style={styles.habitTitle}>{habit.title}</Text>
                <Text style={styles.habitDescription}>{habit.description}</Text>
                <View style={styles.statsContainer}>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>🔥 {streak}</Text>
                    <Text style={styles.statLabel}>Current</Text>
                  </View>
                  <View style={styles.statItem}>
                    <Text style={styles.statValue}>🏆 {bestStreak}</Text>
                    <Text style={styles.statLabel}>Best</Text>
                  </View>
                  <View>
                    <Text style={styles.statValue}>✅ {total}</Text>
                    <Text style={styles.statLabel}>Total</Text>
                  </View>
                </View>
              </Card.Content>
            </Card>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#f9f9f9",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    textAlign: "center",
    color: "#333",
  },
  noHabitsText: {
    fontSize: 16,
    textAlign: "center",
    color: "#666",
    fontStyle: "italic",
    marginTop: 20,
  },
  card: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
  },
  habitTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  habitDescription: {
    fontSize: 14,
    color: "#666",
    marginBottom: 15,
    lineHeight: 20,
  },
  statsContainer: {
    flexDirection: "row",
    justifyContent: "space-around",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eee",
  },
  statItem: {
    alignItems: "center",
    flex: 1,
  },
  statValue: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  statLabel: {
    fontSize: 12,
    color: "#666",
    textTransform: "uppercase",
    fontWeight: "500",
  },
  rankingContainer: {
    marginBottom: 15,
    borderRadius: 10,
    elevation: 3,
    backgroundColor: "#fff",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowRadius: 20,
    shadowColor: "#7c4dff",
    shadowOpacity: 0.08,
  },
  rankingTitle: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 12,
    color: "#7c4dff",
  },
  rankingRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    paddingBottom: 8,
  },
  rankingBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10,
    backgroundColor: "#e0e0e0",
  },
  badge1: {
    backgroundColor: "#ffd700", //gold
  },
  badge2: {
    backgroundColor: "#c0c0c0", //silver
  },
  badge3: {
    backgroundColor: "#cd7f32", //bronze
  },
  rankingBadgeText: {
    fontWeight: "bold",
    color: "#fff",
    fontSize: 15,
  },
  rankingHabit: {
    flex: 1,
    fontSize: 15,
    color: "#333",
    fontWeight: "600",
  },
  rankingStreak: {
    fontSize: 14,
    color: "#7c4dff",
    fontWeight: "bold",
  },
});

export default Streaks;
