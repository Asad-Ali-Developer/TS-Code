import { Room } from "@/types";
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
  Unsubscribe,
  DocumentData,
} from "firebase/firestore";
import { firebaseDB } from "./FirebaseService";

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
}

export default CodeService;
