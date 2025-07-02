import { Account, Client } from "react-native-appwrite";

export const client = new Client()
  .setEndpoint(process.env.EXPO_PUBLIC_APPWRITE_ENDPOINT!) // Your Appwrite Endpoint
  .setProject(process.env.EXPO_PUBLIC_APPWRITE_PROJECT_ID!) //Your Appwrite Project ID
  .setPlatform(process.env.EXPO_PUBLIC_APPWRITE_PLATFORM!); // Your Appwrite Platform (optional, defaults to 'web');


export const account = new Account(client);
