import { PlusIcon } from "lucide-react";
import { FormEvent, useState } from "react";
import { CodeService } from "@/services";
import { useAuth, useJoinedRoomId } from "@/providers";
import { toast } from "react-toastify";

const CreateRoomButton = () => {
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [roomName, setRoomName] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [roomDetails, setRoomDetails] = useState<{
    roomId: string;
    roomName: string;
    roomPassword: string;
  } | null>(null);
  const { setNewJoinedRoomId } = useJoinedRoomId();

  const { userDetails } = useAuth();
  const userId = userDetails?.uid;
  const codeService = new CodeService();

  async function handleCreateRoom(e: FormEvent) {
    e.preventDefault();
    if (!roomName.trim() || !userId || !roomPassword) return;

    setIsLoading(true);
    try {
      const response = await codeService.createRoom({
        roomName,
        userId,
        roomPassword,
      });

      if (response) {
        setNewJoinedRoomId(response.roomId);
        const createdRoom = {
          roomId: response.roomId,
          roomName: response.roomName,
          roomPassword: response.roomPassword,
        };
        setRoomDetails(createdRoom);
        setIsCreateDialogOpen(false);
        setIsSuccessDialogOpen(true);
        setRoomName("");
        setRoomPassword("");
      }
    } catch (error) {
      console.error("Failed to create room:", error);
      toast.error("Failed to create room");
    } finally {
      setIsLoading(false);
    }
  }

  const handleShareRoom = () => {
    if (!roomDetails) return;

    const shareText = `Join my room!\n\nRoom Name: ${roomDetails.roomName}\nRoom ID: ${roomDetails.roomId}\nPassword: ${roomDetails.roomPassword}`;
    const urlToShare = `${window.location.origin}/rooms/${roomDetails.roomId}`;

    if (navigator.share) {
      navigator
        .share({
          title: "Join My Room",
          text: shareText,
          url: urlToShare,
        })
        .catch(console.error);
    } else {
      navigator.clipboard.writeText(shareText).then(() => {
        toast.success("Room details copied to clipboard!");
      });
    }
  };

  return (
    <>
      <button
        type="button"
        onClick={() => setIsCreateDialogOpen(true)}
        className="group relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-500 to-teal-500 p-px font-medium text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/25"
      >
        <span className="absolute inset-0 w-full h-full bg-gradient-to-r from-emerald-500 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        <span className="relative flex items-center gap-2 px-4 py-2 bg-black/90 rounded-full text-sm group-hover:bg-black/80 transition-colors">
          <PlusIcon className="w-4 h-4 transition-transform duration-300 group-hover:rotate-90" />
          New Room
        </span>
      </button>

      {/* Create Room Dialog */}
      {isCreateDialogOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsCreateDialogOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-white/10 p-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-teal-500/10 pointer-events-none" />

            <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
              Create a new room
            </h2>
            <p className="mt-1 text-sm text-gray-400">
              Set up a collaborative coding space for your team
            </p>

            <form onSubmit={handleCreateRoom} className="mt-6 space-y-4">
              <div className="space-y-2">
                <label
                  htmlFor="room-name"
                  className="block text-sm font-medium text-gray-200"
                >
                  Room name
                </label>
                <input
                  type="text"
                  id="room-name"
                  value={roomName}
                  onChange={(e) => setRoomName(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="My Awesome Project"
                  required
                />
              </div>

              <div className="space-y-2">
                <label
                  htmlFor="room-password"
                  className="block text-sm font-medium text-gray-200"
                >
                  Room password
                </label>
                <input
                  type="text"
                  id="room-password"
                  value={roomPassword}
                  onChange={(e) => setRoomPassword(e.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-black/50 px-3 py-2 text-white placeholder-gray-500 focus:border-emerald-500/50 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  placeholder="Password"
                  required
                />
              </div>

              <div className="mt-6 flex gap-3 justify-end">
                <button
                  type="button"
                  onClick={() => setIsCreateDialogOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="relative overflow-hidden rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/25 disabled:opacity-50"
                >
                  {isLoading ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4\"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25\"
                          cx="12\"
                          cy="12\"
                          r="10\"
                          stroke="currentColor\"
                          strokeWidth="4\"
                          fill="none"
                        />
                        <path
                          className="opacity-75\"
                          fill="currentColor\"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Creating...
                    </span>
                  ) : (
                    "Create Room"
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Success Dialog */}
      {isSuccessDialogOpen && roomDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="fixed inset-0 bg-black/80 backdrop-blur-sm"
            onClick={() => setIsSuccessDialogOpen(false)}
          />
          <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-white/10 p-6 shadow-2xl">
            <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-teal-500/10 pointer-events-none" />

            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-500">
                <svg
                  className="h-5 w-5"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M5 13l4 4L19 7"
                  />
                </svg>
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Room Created Successfully!
                </h2>
                <p className="text-sm text-gray-400">
                  Share these details with others to invite them
                </p>
              </div>
            </div>

            <div className="mt-6 rounded-lg border border-white/10 bg-black/50 p-4">
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-500">Room Name</p>
                  <p className="font-medium text-white">
                    {roomDetails.roomName}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Room ID</p>
                  <p className="font-mono text-sm bg-white/5 p-1.5 rounded text-emerald-400">
                    {roomDetails.roomId}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-gray-500">Password</p>
                  <p className="font-mono text-sm bg-white/5 p-1.5 rounded text-emerald-400">
                    {roomDetails.roomPassword}
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 flex gap-3">
              <button
                type="button"
                onClick={handleShareRoom}
                className="flex-1 rounded-lg border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-sm font-medium text-emerald-500 hover:bg-emerald-500/20 transition-colors"
              >
                Share Room
              </button>
              <button
                type="button"
                onClick={() => {
                  setIsSuccessDialogOpen(false);
                  setNewJoinedRoomId(roomDetails.roomId);
                }}
                className="flex-1 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-500 px-4 py-2 text-sm font-medium text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/25"
              >
                Enter Room
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default CreateRoomButton;
