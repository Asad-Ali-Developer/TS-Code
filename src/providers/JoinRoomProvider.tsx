"use client";

import {
  createContext,
  type FC,
  type ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface JoinedRoomContextType {
  newJoinedRoomId: string | null;
  setNewJoinedRoomId: (roomId: string | null) => void;
  roomDetails: any | null;
  setRoomDetails: (details: any | null) => void;
  roomMembers: string[];
  setRoomMembers: (members: string[]) => void;
}

const JoinedRoomContext = createContext<JoinedRoomContextType | undefined>(
  undefined
);

interface JoinedRoomProviderProps {
  children: ReactNode;
}

export const JoinedRoomProvider: FC<JoinedRoomProviderProps> = ({
  children,
}) => {
  const [newJoinedRoomId, setNewJoinedRoomIdState] = useState<string | null>(
    null
  );
  const [roomDetails, setRoomDetails] = useState<any | null>(null);
  const [roomMembers, setRoomMembers] = useState<string[]>([]);

  console.log("New Joined RoomId: ", newJoinedRoomId);
  console.log("Room Details: ", roomDetails);
  console.log("Room Members: ", roomMembers);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("newJoinedRoomId");
    if (stored) {
      try {
        const roomId = JSON.parse(stored);
        setNewJoinedRoomIdState(roomId);
      } catch {
        localStorage.removeItem("newJoinedRoomId");
      }
    }
  }, []);

  // Save to localStorage on change
  const setNewJoinedRoomId = (roomId: string | null) => {
    setNewJoinedRoomIdState(roomId);
    if (roomId) {
      localStorage.setItem("newJoinedRoomId", JSON.stringify(roomId));
    } else {
      localStorage.removeItem("newJoinedRoomId");
      // Clear related state when leaving room
      setRoomDetails(null);
      setRoomMembers([]);
    }
  };

  return (
    <JoinedRoomContext.Provider
      value={{
        newJoinedRoomId,
        setNewJoinedRoomId,
        roomDetails,
        setRoomDetails,
        roomMembers,
        setRoomMembers,
      }}
    >
      {children}
    </JoinedRoomContext.Provider>
  );
};

// Hook to consume context
export const useJoinedRoomId = (): JoinedRoomContextType => {
  const context = useContext(JoinedRoomContext);
  if (!context) {
    throw new Error("useJoinedRoomId must be used within a JoinedRoomProvider");
  }
  return context;
};
