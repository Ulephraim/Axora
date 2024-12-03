/** @format */

import {
  Account,
  Avatars,
  Client,
  Databases,
  ID,
  Query,
  Storage,
} from 'react-native-appwrite';

export const config = {
  endpoint: 'https://cloud.appwrite.io/v1',
  platform: 'com.ephraim.axora',
  projectId: '673bd967001bccddb34a',
  databaseId: '673bdae6002316b6dc99',
  userCollectionId: '673bdb1c002730925ab8',
  videCollectionId: '673bdb5600128a3a0225',
  storageId: '673bdd71002184e834f5',
};

const {
  endpoint,
  platform,
  projectId,
  databaseId,
  userCollectionId,
  videCollectionId,
  storageId,
} = config;

// Init your React Native SDK
const client = new Client();

client
  .setEndpoint(config.endpoint) // Your Appwrite Endpoint
  .setProject(config.projectId) // Your project ID
  .setPlatform(config.platform); // Your application ID or bundle ID.

const account = new Account(client);
const avatars = new Avatars(client);
const databases = new Databases(client);
const storage = new Storage(client);

export const createUser = async (email, password, username) => {
  try {
    // Create a new user
    const newAccount = await account.create(
      ID.unique(),
      email,
      password,
      username
    );

    if (!newAccount) throw new Error('User creation failed');

    // Generate an avatar URL (optional)
    const avatarUrl = avatars.getInitials(username);

    // Log in the user (if needed)
    await signIn(email, password);

    // Create a new document in the database for the user
    const newUser = await databases.createDocument(
      config.databaseId,
      config.userCollectionId,
      ID.unique(),
      { accountId: newAccount.$id, email, username, avatar: avatarUrl }
    );

    return newUser;
  } catch (error) {
    console.error('Error creating user:', error.message);
    throw error;
  }
};

// export async function signIn(email, password) {
//   try {
//     const session = await account.createEmailPasswordSession(email, password);

//     return session;
//   } catch (error) {
//     throw new Error(error);
//   }
// }

export const signIn = async (email, password) => {
  try {
    // Check if there is an active session
    const currentUser = await account.get();
    console.log('User is already signed in:', currentUser);
    return currentUser; // Return the existing session
  } catch {
    // If no session exists, create a new one
    const session = await account.createEmailPasswordSession(email, password);
    return session;
  }
};

// export const getCurrentUser = async () => {
//   try {
//     const currentAccount = await account.get();
//     if (!currentAccount) throw Error;

//     const currentUser = await databases.listDocuments(
//       config.databaseId,
//       config.userCollectionId,
//       [Query.equal('accountId', currentAccount.$id)]
//     );
//     if (!currentUser) throw Error;
//     return currentUser.documents[0];
//   } catch (error) {
//     console.log(error);
//   }
// };

export const getCurrentUser = async () => {
  try {
    const currentAccount = await account.get();
    if (!currentAccount) throw new Error('No current account');

    const currentUser = await databases.listDocuments(
      config.databaseId,
      config.userCollectionId,
      [Query.equal('accountId', currentAccount.$id)]
    );
    if (!currentUser || currentUser.documents.length === 0) {
      throw new Error('No user found in the database');
    }

    return currentUser.documents[0];
  } catch (error) {
    console.error('Error fetching current user:', error.message);
    throw error; // Ensure the error propagates to `.catch`
  }
};

export const getAllPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videCollectionId, [
      Query.orderDesc('$createdAt'),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getLatestPosts = async () => {
  try {
    const posts = await databases.listDocuments(databaseId, videCollectionId, [
      Query.orderDesc('$createdAt', Query.limit(7)),
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const searchPosts = async (query) => {
  try {
    const posts = await databases.listDocuments(databaseId, videCollectionId, [
      [Query.search('title', query)],
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const getUserPosts = async (userId) => {
  try {
    const posts = await databases.listDocuments(databaseId, videCollectionId, [
      [Query.equal('creator', userId), Query.orderDesc('$createdAt')],
    ]);
    return posts.documents;
  } catch (error) {
    throw new Error(error);
  }
};

export const signOut = async () => {
  try {
    const session = await account.deleteSession('current');
    console.log('Session found:', session);
    return session;
  } catch (error) {
    console.log('No active session. User is a guest.');
    throw Error(error);
  }
};

export const getFilePreview = async (fileId, type) => {
  let fileUrl;
  try {
    if (type === 'video') {
      fileUrl = storage.getFileView(storageId, fileId);
    } else if (type === 'image') {
      fileUrl = storage.getFilePreview(
        storageId,
        fileId,
        2000,
        2000,
        'top',
        100
      );
    } else {
      throw new Error('Invalid file type');
    }
    if (!fileUrl) throw Error;
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const uploadFile = async (file, type) => {
  const asset = {
    name: file.fileName,
    type: file.mimeType,
    size: file.filesize,
    uri: file.uri,
  };

  try {
    const uploadedFile = await storage.createFile(
      storageId,
      ID.unique(),
      asset
    );

    const fileUrl = await getFilePreview(uploadedFile.$id, type);
    return fileUrl;
  } catch (error) {
    throw new Error(error);
  }
};

export const createVideo = async (form) => {
  try {
    const [thumbnailUrl, videoUrl] = await Promise.all([
      uploadFile(form.thumbnail, 'image'),
      uploadFile(form.video, 'video'),
    ]);

    const newPost = await databases.createDocument(
      databaseId,
      videCollectionId,
      ID.unique(),
      {
        title: form.title,
        thumbnail: thumbnailUrl,
        video: videoUrl,
        prompt: form.prompt,
        creator: form.userId,
      }
    );

    return newPost;
  } catch (error) {
    throw new Error(error);
  }
};
