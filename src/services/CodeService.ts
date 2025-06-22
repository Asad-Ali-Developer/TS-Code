import type { Room } from "@/types";
import {
  addDoc,
  collection,
  doc,
  setDoc,
  Timestamp,
  getDoc,
  updateDoc,
  arrayUnion,
  onSnapshot,
  type Unsubscribe,
  type DocumentData,
  deleteDoc,
} from "firebase/firestore";
import { firebaseDB } from "./FirebaseService";
import { FirebaseFileSystemService } from "./FileSystemService";

class CodeService {
  constructor() {}

  async createRoom({ roomName, userId, roomPassword }: Room) {
    if (!roomName || !userId || !roomPassword) {
      throw new Error("All fields are required");
    }

    const roomData = {
      roomName,
      roomPassword, // optional: hash this
      ownerId: userId,
      createdAt: Timestamp.now(),
      members: [userId],
      files: [],
    };

    // First, create the document (auto-generates an ID)
    const docRef = await addDoc(
      collection(firebaseDB, "app_code_rooms"),
      roomData
    );

    // Then, update the document to save the roomId field
    await setDoc(
      doc(firebaseDB, "app_code_rooms", docRef.id),
      { roomId: docRef.id },
      { merge: true }
    );

    // Initialize the file system for this room
    const fileSystemService = FirebaseFileSystemService.getInstance();
    await fileSystemService.initializeRoomFileSystem(docRef.id);

    return {
      success: true,
      message: "Room created successfully",
      roomId: docRef.id,
      roomName,
      roomPassword,
    };
  }

  // Join a room by roomId and password (realtime: returns unsubscribe function)
  async joinRoomRealtime(
    roomId: string,
    userId: string,
    roomPassword: string,
    onRoomUpdate: (roomData: DocumentData | undefined) => void
  ): Promise<Unsubscribe> {
    if (!roomId || !userId || !roomPassword) {
      throw new Error("All fields are required");
    }

    const roomRef = doc(firebaseDB, "app_code_rooms", roomId);

    // Listen for realtime updates
    const unsubscribe = onSnapshot(roomRef, async (roomSnap) => {
      if (!roomSnap.exists()) {
        onRoomUpdate(undefined);
        return;
      }
      const roomData = roomSnap.data();
      if (roomData.roomPassword !== roomPassword) {
        onRoomUpdate(undefined);
        return;
      }

      // Add user to members array if not already present
      if (!roomData.members.includes(userId)) {
        await updateDoc(roomRef, {
          members: arrayUnion(userId),
        });
      }

      onRoomUpdate(roomData);
    });

    return unsubscribe;
  }

  /**
   * Listen to all joined users in a room in realtime.
   * @param roomId Room ID
   * @param callback Called with the array of user IDs whenever members change
   * @returns Unsubscribe function
   */
  listenToRoomMembers(
    roomId: string,
    callback: (members: string[]) => void
  ): Unsubscribe {
    const roomRef = doc(firebaseDB, "app_code_rooms", roomId);
    return onSnapshot(roomRef, (roomSnap) => {
      if (roomSnap.exists()) {
        const data = roomSnap.data();
        callback(Array.isArray(data.members) ? data.members : []);
      } else {
        callback([]);
      }
    });
  }

  /**
   * Get room details by ID
   */
  async getRoomDetails(roomId: string): Promise<DocumentData | null> {
    try {
      const roomRef = doc(firebaseDB, "app_code_rooms", roomId);
      const roomSnap = await getDoc(roomRef);

      if (roomSnap.exists()) {
        return roomSnap.data();
      }
      return null;
    } catch (error) {
      console.error("Error getting room details:", error);
      return null;
    }
  }

  /**
   * Removes a user from the members array of a room.
   * @param roomId ID of the room
   * @param userId ID of the user to remove
   */
  async removeUserFromRoom(roomId: string, userId: string): Promise<void> {
    const roomRef = doc(firebaseDB, "app_code_rooms", roomId);

    try {
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        throw new Error(`Room with ID ${roomId} does not exist`);
      }

      const data = roomSnap.data();
      const members = data.members || [];

      if (!Array.isArray(members)) {
        throw new Error("Members field is not an array");
      }

      // Filter out the user
      const updatedMembers = members.filter((id: string) => id !== userId);

      // Update the document
      await updateDoc(roomRef, {
        members: updatedMembers,
      });

      console.log(`User ${userId} removed from room ${roomId}`);
    } catch (error) {
      console.error("Error removing user from room:", error);
      throw error;
    }
  }

  /**
   * Deletes the room if the given user is the owner.
   *
   * @param roomId ID of the room
   * @param userId ID of the user trying to delete the room
   */
  async deleteRoomIfOwner(roomId: string, userId: string): Promise<void> {
    const roomRef = doc(firebaseDB, "app_code_rooms", roomId);

    try {
      const roomSnap = await getDoc(roomRef);

      if (!roomSnap.exists()) {
        throw new Error(`Room with ID ${roomId} does not exist`);
      }

      const data = roomSnap.data();

      // Only allow deletion if user is the owner
      if (data.ownerId === userId) {
        await deleteDoc(roomRef); // ✅ Make sure deleteDoc is imported
        console.log(`Room ${roomId} deleted by owner ${userId}`);
      } else {
        console.warn(
          `User ${userId} is not the owner of room ${roomId}. Deletion canceled.`
        );
        throw new Error("Only the room owner can delete the room.");
      }
    } catch (error) {
      console.error("Error deleting room:", error);
      throw error;
    }
  }
}

export default CodeService;
