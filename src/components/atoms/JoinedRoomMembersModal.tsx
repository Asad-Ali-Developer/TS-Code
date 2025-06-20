import { useJoinedRoomId } from "@/providers";
import { CodeService } from "@/services";
import { FC, SetStateAction, useEffect, useState } from "react";
import { Users, X, UserPlus } from "lucide-react";

interface JoinedRoomMembersModalProps {
  setShowMembersModal: (value: SetStateAction<boolean>) => void;
  showMembersModal: boolean;
}

const JoinedRoomMembersModal: FC<JoinedRoomMembersModalProps> = ({
  setShowMembersModal,
  showMembersModal,
}) => {
  const codeService = new CodeService();
  const [joinedMembers, setJoinedMembers] = useState<string[]>([]);
  const { newJoinedRoomId } = useJoinedRoomId();

  useEffect(() => {
    let unsubscribe: (() => void) | undefined;
    if (showMembersModal && newJoinedRoomId) {
      unsubscribe = codeService.listenToRoomMembers(
        newJoinedRoomId,
        setJoinedMembers
      );
    }
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [showMembersModal, newJoinedRoomId]);

  if (!showMembersModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="fixed inset-0 bg-black/80 backdrop-blur-sm transition-opacity"
        onClick={() => setShowMembersModal(false)}
      />

      <div className="relative w-full max-w-md overflow-hidden rounded-2xl bg-gradient-to-b from-gray-900 to-black border border-white/10 p-6 shadow-2xl animate-fade-in">
        <div className="absolute inset-0 bg-gradient-to-b from-emerald-500/10 to-teal-500/10 pointer-events-none" />

        <div className="relative">
          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <Users className="h-5 w-5 text-emerald-500" />
              </div>
              <div>
                <h2 className="text-xl font-semibold bg-gradient-to-r from-emerald-400 to-teal-400 bg-clip-text text-transparent">
                  Room Members
                </h2>
                <p className="text-sm text-gray-400">
                  {joinedMembers.length} member
                  {joinedMembers.length !== 1 ? "s" : ""} online
                </p>
              </div>
            </div>
            <button
              onClick={() => setShowMembersModal(false)}
              className="rounded-full p-2 hover:bg-white/5 transition-colors"
            >
              <X className="h-5 w-5 text-gray-400 hover:text-white transition-colors" />
            </button>
          </div>

          {/* Members List */}
          <div className="space-y-4">
            {joinedMembers.length === 0 ? (
              <div className="text-center py-8">
                <div className="h-12 w-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-3">
                  <UserPlus className="h-6 w-6 text-emerald-500/70" />
                </div>
                <p className="text-gray-400">Waiting for members to join...</p>
              </div>
            ) : (
              <div className="space-y-2">
                {joinedMembers.map((member, idx) => (
                  <div
                    key={member + idx}
                    className="group flex items-center gap-3 p-3 rounded-lg border border-white/5 bg-white/5 hover:bg-white/10 transition-all duration-200"
                  >
                    <div className="h-8 w-8 rounded-full bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center text-white font-medium">
                      {member[0].toUpperCase()}
                    </div>
                    <span className="text-gray-200 group-hover:text-white transition-colors">
                      {member}
                    </span>
                    <div className="ml-auto h-2 w-2 rounded-full bg-emerald-500" />
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JoinedRoomMembersModal;
