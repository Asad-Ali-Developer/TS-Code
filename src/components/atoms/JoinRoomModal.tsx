"use client";

import { useAuth, useJoinedRoomId } from "@/providers";
import { CodeService } from "@/services";
import { X } from "lucide-react";
import {
  type FC,
  type FormEvent,
  type SetStateAction,
  useState
} from "react";
import { toast } from "react-toastify";

interface JoinRoomModalProps {
  setShowJoinModal: (value: SetStateAction<boolean>) => void;
}

const JoinRoomModal: FC<JoinRoomModalProps> = ({ setShowJoinModal }) => {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomPasswordInput, setRoomPasswordInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [isJoining, setIsJoining] = useState(false);

  const codeService = new CodeService();
  const { userDetails } = useAuth();
  const { setNewJoinedRoomId } = useJoinedRoomId();

  // Handler for joining a room
  const handleJoinRoom = async (e?: FormEvent) => {
    if (e) e.preventDefault();

    if (!roomIdInput.trim() || !roomPasswordInput.trim()) {
      setJoinError("Room ID and Password are required");
      return;
    }

    if (!userDetails?.uid) {
      setJoinError("User authentication required");
      return;
    }

    setIsJoining(true);
    setJoinError(null);

    try {
      console.log(`🚪 Attempting to join room: ${roomIdInput}`);

      const roomDetails = await codeService.getRoomDetails(roomIdInput);

      if (!roomDetails) {
        throw new Error("Room not found");
      }

      if (roomDetails.roomPassword !== roomPasswordInput) {
        throw new Error("Invalid room password");
      }

      console.log(`✅ Room verified, joining room: ${roomIdInput}`);
      setNewJoinedRoomId(roomIdInput);

      console.log(`🎉 Successfully joined room: ${roomIdInput}`);
      toast.success(`Joined room "${roomDetails.roomName}" successfully!`);

      setShowJoinModal(false);
      setJoinError(null);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      console.error("❌ Error joining room:", err);
      const errorMessage = err.message || "Failed to join room";
      setJoinError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setIsJoining(false);
      setRoomIdInput("");
      setRoomPasswordInput("");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Overlay */}
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm"
        onClick={() => setShowJoinModal(false)}
      />

      {/* Modal Card */}
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-b from-gray-900 to-black p-6 shadow-2xl animate-fade-in">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-teal-500/10 pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Join Room
            </h2>
            <button
              onClick={() => {
                setShowJoinModal(false);
                setJoinError(null);
                setRoomIdInput("");
                setRoomPasswordInput("");
              }}
              className="rounded-full p-2 hover:bg-white/5 transition-colors"
              aria-label="Close modal"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-white" />
            </button>
          </div>

          {/* Form */}
          <form onSubmit={handleJoinRoom}>
            {/* Room ID Field */}
            <div className="mb-4">
              <label
                htmlFor="roomId"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Room ID
              </label>
              <input
                id="roomId"
                type="text"
                value={roomIdInput}
                onChange={(e) => setRoomIdInput(e.target.value)}
                placeholder="Enter room ID..."
                disabled={isJoining}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Password Field */}
            <div className="mb-4">
              <label
                htmlFor="roomPassword"
                className="block text-sm font-medium text-gray-300 mb-1"
              >
                Room Password
              </label>
              <input
                id="roomPassword"
                type="password"
                value={roomPasswordInput}
                onChange={(e) => setRoomPasswordInput(e.target.value)}
                placeholder="Enter room password..."
                disabled={isJoining}
                className="w-full rounded-lg bg-white/5 border border-white/10 px-4 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              />
            </div>

            {/* Error Message */}
            {joinError && (
              <div className="mb-4 p-3 rounded-lg bg-red-900/50 border border-red-500 text-red-200 text-sm">
                {joinError}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={
                isJoining || !roomIdInput.trim() || !roomPasswordInput.trim()
              }
              className="w-full mt-2 flex items-center justify-center gap-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 disabled:bg-gray-600 disabled:cursor-not-allowed px-4 py-2 text-white font-medium transition-colors duration-200"
            >
              {isJoining ? (
                <>
                  <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Joining...</span>
                </>
              ) : (
                "Join Room"
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JoinRoomModal;
