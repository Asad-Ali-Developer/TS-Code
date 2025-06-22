"use client";
import { useAuth, useJoinedRoomId } from "@/providers";
import { CodeService } from "@/services";
import { Code, Menu, UserPlus, X } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import CreateRoomButton from "./CreateRoomButton";
import JoinRoomModal from "./JoinRoomModal";
import JoinedRoomMembersModal from "./JoinedRoomMembersModal";
import { MdDeleteOutline } from "react-icons/md";

const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [showMembersModal, setShowMembersModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);
  const [deleteRoomLoading, setDeleteRoomLoading] = useState<boolean>(false);
  const [leaveRoomLoading, setLeaveRoomLoading] = useState<boolean>(false);

  const router = useRouter();
  const { userDetails } = useAuth();
  const { newJoinedRoomId, roomDetails, setRoomDetails, setNewJoinedRoomId } =
    useJoinedRoomId();
  const codeService = new CodeService();

  const isLoggedIn = !!userDetails?.uid;
  const ownerOfRoom = roomDetails?.ownerId === userDetails?.uid;

  const handleLeaveRoom = async () => {
    if (!userDetails?.uid || !newJoinedRoomId) return;
    try {
      setLeaveRoomLoading(true);
      await codeService.removeUserFromRoom(newJoinedRoomId, userDetails.uid);
      setNewJoinedRoomId(null);
      setRoomDetails(null);
      // router.refresh();
      localStorage.removeItem("newJoinedRoomId");
    } catch (error) {
      console.error("Failed to leave room:", error);
    } finally {
      setLeaveRoomLoading(false);
    }
  };

  const handleDeleteRoomIfOwner = async () => {
    if (!userDetails?.uid || !newJoinedRoomId) return;
    try {
      setDeleteRoomLoading(true);
      await codeService.deleteRoomIfOwner(newJoinedRoomId, userDetails.uid);
      setNewJoinedRoomId(null);
      setRoomDetails(null);
      // router.refresh();
      localStorage.removeItem("newJoinedRoomId");
    } catch (error) {
      console.error("Failed to delete room:", error);
    } finally {
      setDeleteRoomLoading(false);
    }
  };

  return (
    <header className="flex h-20 items-center justify-between bg-transparent px-4 md:px-8 lg:px-28">
      {/* Left Side */}
      <div className="flex items-center gap-2">
        {/* Mobile Menu Button */}
        <button
          type="button"
          className="p-1 text-zinc-300 hover:text-zinc-100 focus:outline-none md:hidden"
          onClick={() => setMobileMenuOpen((prev) => !prev)}
          aria-label="Open menu"
        >
          <Menu className="h-5 w-5" />
        </button>
        <div
          className="flex items-center gap-2 cursor-pointer"
          onClick={() => {
            router.push("/");
            setMobileMenuOpen(false);
          }}
        >
          <Code className="h-5 w-5 text-emerald-500" />
          <span className="text-lg font-semibold tracking-tight">CodeSync</span>
        </div>
      </div>

      {/* Desktop Right Side */}
      {isLoggedIn ? (
        <div className="hidden md:flex items-center gap-2">
          {!newJoinedRoomId && <CreateRoomButton />}
          {!newJoinedRoomId && (
            <button
              type="button"
              className="relative overflow-hidden rounded-full bg-gradient-to-r from-emerald-700 to-teal-500 py-1.5 px-5 font-medium text-white shadow-lg transition-all duration-300 hover:shadow-emerald-500/25"
              onClick={() => setShowJoinModal(true)}
            >
              Join Room
            </button>
          )}
          {newJoinedRoomId && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700 focus:outline-none"
              onClick={() => setShowMembersModal(true)}
            >
              <UserPlus className="h-4 w-4" />
              <span>See Members</span>
            </button>
          )}
          {newJoinedRoomId && !ownerOfRoom && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 focus:outline-none"
              onClick={handleLeaveRoom}
            >
              <MdDeleteOutline className="h-4 w-4" />
              <span>Leave Room</span>
            </button>
          )}

          {newJoinedRoomId && ownerOfRoom && (
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 focus:outline-none"
              onClick={handleDeleteRoomIfOwner}
            >
              <MdDeleteOutline className="h-4 w-4" />
              <span>Delete Room</span>
            </button>
          )}
        </div>
      ) : (
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => router.push("/signin")}
            className="block w-full px-4 py-2 text-left text-sm text-emerald-400 hover:text-emerald-500 font-semibold"
          >
            Signin
          </button>
          <button
            type="button"
            onClick={() => router.push("/signup")}
            className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 focus:outline-none transition-colors"
          >
            SignUp
          </button>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-40 flex md:hidden">
          {/* Overlay */}
          <div
            className="fixed inset-0 bg-black bg-opacity-40"
            onClick={() => setMobileMenuOpen(false)}
          />
          {/* Drawer */}
          <div className="relative ml-auto w-64 max-w-full bg-zinc-900 shadow-lg h-full flex flex-col p-4 gap-4">
            <div className="flex items-center justify-between mb-4">
              <div
                className="flex items-center gap-2 cursor-pointer"
                onClick={() => {
                  router.push("/");
                  setMobileMenuOpen(false);
                }}
              >
                <Code className="h-5 w-5 text-emerald-500" />
                <span className="text-lg font-semibold tracking-tight">
                  CodeSync
                </span>
              </div>
              <button
                className="p-1 text-zinc-300 hover:text-zinc-100"
                onClick={() => setMobileMenuOpen(false)}
                aria-label="Close menu"
              >
                <Menu className="h-5 w-5 rotate-90" />
              </button>
            </div>
            <div className="flex flex-col gap-2">
              {isLoggedIn ? (
                <>
                  {/* Join Room Button */}
                  {!newJoinedRoomId && (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-md bg-blue-600 px-3 py-1.5 text-sm text-white hover:bg-blue-700 focus:outline-none"
                      onClick={() => setShowJoinModal(true)}
                    >
                      Join Room
                    </button>
                  )}
                  {/* See Joined Members Button */}
                  {newJoinedRoomId && (
                    <button
                      className="flex items-center gap-1.5 rounded-md bg-purple-600 px-3 py-1.5 text-sm text-white hover:bg-purple-700 focus:outline-none"
                      onClick={() => setShowMembersModal(true)}
                    >
                      <UserPlus className="h-4 w-4" />
                      <span>See Members</span>
                    </button>
                  )}
                  {/* Leave Room Button */}
                  {newJoinedRoomId && (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-md bg-red-600 px-3 py-1.5 text-sm text-white hover:bg-red-700 focus:outline-none"
                      onClick={handleLeaveRoom}
                    >
                      <X className="h-4 w-4" />
                      <span>Leave Room</span>
                    </button>
                  )}
                  {/* Delete Room Button */}
                  {newJoinedRoomId && ownerOfRoom && (
                    <button
                      type="button"
                      className="flex items-center gap-1.5 rounded-md bg-rose-600 px-3 py-1.5 text-sm text-white hover:bg-rose-700 focus:outline-none"
                      onClick={handleDeleteRoomIfOwner}
                    >
                      <X className="h-4 w-4" />
                      <span>Delete Room</span>
                    </button>
                  )}
                </>
              ) : (
                <>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/signin");
                      setMobileMenuOpen(false);
                    }}
                    className="block w-full px-4 py-2 text-left text-sm text-emerald-400 hover:text-emerald-500 font-semibold"
                  >
                    Signin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      router.push("/signup");
                      setMobileMenuOpen(false);
                    }}
                    className="flex items-center gap-1.5 rounded-md bg-emerald-600 px-3 py-1.5 text-sm text-white hover:bg-emerald-700 focus:outline-none transition-colors"
                  >
                    SignUp
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Modals */}
      {showJoinModal && <JoinRoomModal setShowJoinModal={setShowJoinModal} />}
      {showMembersModal && newJoinedRoomId && (
        <JoinedRoomMembersModal
          key={newJoinedRoomId}
          showMembersModal={showMembersModal}
          setShowMembersModal={setShowMembersModal}
        />
      )}
    </header>
  );
};

export default Navbar;
