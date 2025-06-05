import { useAuth, useJoinedRoomId } from "@/providers";
import { CodeService } from "@/services";
import { Dispatch, FC, FormEvent, SetStateAction, useState } from "react";
import { toast } from "react-toastify";

interface JoinRoomModalProps {
  setShowJoinModal: (value: SetStateAction<boolean>) => void;
  setRoomId: Dispatch<SetStateAction<string>>;
}

const JoinRoomModal: FC<JoinRoomModalProps> = ({
  setShowJoinModal,
  setRoomId,
}) => {
  const [roomIdInput, setRoomIdInput] = useState("");
  const [roomPasswordInput, setRoomPasswordInput] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);

  const codeService = new CodeService();
  const { userDetails } = useAuth();
  const { setNewJoinedRoomId } = useJoinedRoomId();

  // Handler for joining a room (now uses modal)
  const handleJoinRoom = async (e?: FormEvent) => {
    if (e) e.preventDefault();
    if (roomIdInput && roomPasswordInput && userDetails?.uid) {
      try {
        await codeService.joinRoomRealtime(
          roomIdInput,
          userDetails.uid,
          roomPasswordInput,
          () => {}
        );
        setRoomId(roomIdInput);
        setNewJoinedRoomId(roomIdInput);
        toast.success("Joined room successfully!");
        setShowJoinModal(false);
        setJoinError(null);
      } catch (err) {
        setJoinError("Failed to join room");
        toast.error("Failed to join room");
      } finally {
        setRoomIdInput("");
        setRoomPasswordInput("");
      }
    } else {
      setJoinError("Room ID and Password are required");
    }
  };

  return (
    <div>
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
        <form
          className="bg-zinc-900 rounded-lg shadow-lg p-6 w-full max-w-md"
          onSubmit={handleJoinRoom}
        >
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-lg font-semibold text-white">Join Room</h2>
            <button
              type="button"
              className="text-zinc-400 hover:text-zinc-100"
              onClick={() => {
                setShowJoinModal(false);
                setJoinError(null);
              }}
            >
              ✕
            </button>
          </div>
          <div className="mb-4">
            <label className="block text-zinc-300 mb-1" htmlFor="roomId">
              Room ID
            </label>
            <input
              id="roomId"
              type="text"
              className="w-full rounded bg-zinc-800 text-zinc-100 px-3 py-2 outline-none"
              value={roomIdInput}
              onChange={(e) => setRoomIdInput(e.target.value)}
              required
            />
          </div>
          <div className="mb-4">
            <label className="block text-zinc-300 mb-1" htmlFor="roomPassword">
              Room Password
            </label>
            <input
              id="roomPassword"
              type="password"
              className="w-full rounded bg-zinc-800 text-zinc-100 px-3 py-2 outline-none"
              value={roomPasswordInput}
              onChange={(e) => setRoomPasswordInput(e.target.value)}
              required
            />
          </div>
          {joinError && (
            <div className="mb-2 text-red-400 text-sm">{joinError}</div>
          )}
          <button
            type="submit"
            className="w-full rounded bg-blue-600 hover:bg-blue-700 text-white py-2 font-semibold mt-2"
          >
            Join
          </button>
        </form>
      </div>
    </div>
  );
};

export default JoinRoomModal;
