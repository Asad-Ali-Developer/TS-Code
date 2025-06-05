import {
  createContext,
  FC,
  ReactNode,
  useContext,
  useEffect,
  useState,
} from "react";

export interface JoinedRoomContextType {
  newJoinedRoomId: string | null;
  setNewJoinedRoomId: (user: string | null) => void;
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

  console.log("New Joined RoomId: ", newJoinedRoomId);

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem("newJoinedRoomId");
    if (stored) {
      try {
        setNewJoinedRoomIdState(JSON.parse(stored));
      } catch {
        localStorage.removeItem("newJoinedRoomId");
      }
    }
  }, []);

  // Save to localStorage on change
  const setNewJoinedRoomId = (user: string | null) => {
    setNewJoinedRoomIdState(user);
    if (user) {
      localStorage.setItem("newJoinedRoomId", JSON.stringify(user));
    } else {
      localStorage.removeItem("newJoinedRoomId");
    }
  };

  return (
    <JoinedRoomContext.Provider value={{ newJoinedRoomId, setNewJoinedRoomId }}>
      {children}
    </JoinedRoomContext.Provider>
  );
};

// Hook to consume context
export const useJoinedRoomId = (): JoinedRoomContextType => {
  const context = useContext(JoinedRoomContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
