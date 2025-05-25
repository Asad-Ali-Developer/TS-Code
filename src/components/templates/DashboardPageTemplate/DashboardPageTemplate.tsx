"use client";

// import { useRouter } from "next/router";
import { useAuth } from "@/providers";
import { CreateRoomButton, DashboardHeader } from "@/components/atoms";
import { RoomsList } from "@/components/molecules";
import { Room } from "@/types";

const DashboardPageTemplate = () => {
  const { userDetails } = useAuth();
  // const router = useRouter();

  // if (!userDetails?.uid) {
  //   router.push("/");
  // }

  // const rooms = await getRoomsForUser(userDetails?.uid);
  const rooms = [] as Room[];

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      <DashboardHeader />

      <main className="flex-1">
        <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">Your Rooms</h1>
            <CreateRoomButton userId={userDetails?.uid} />
          </div>

          <div className="mt-6">
            <RoomsList rooms={rooms} />
          </div>
        </div>
      </main>
    </div>
  );
};

export default DashboardPageTemplate;
