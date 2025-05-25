import { useAuth } from "@/providers";
import { AuthService } from "@/services";
import Link from "next/link";
import { useRouter } from "next/router";

const DashboardHeader = () => {
  const authService = new AuthService();
  const { userDetails, setUserDetails } = useAuth();
  const router = useRouter();

  const handleLogoutUser = async () => {
    try {
      await authService.logout();
      setUserDetails(null);
      localStorage.removeItem("userDetails");
      router.push("/");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-8 w-8 text-emerald-600"
            >
              <path d="m18 16 4-4-4-4" />
              <path d="m6 8-4 4 4 4" />
              <path d="m14.5 4-5 16" />
            </svg>
            <span className="ml-2 text-xl font-bold text-gray-900">
              CodeCollab
            </span>
          </Link>
        </div>
        <div className="flex items-center">
          <span className="mr-4 text-sm text-gray-700">
            {userDetails?.name}
          </span>
          <form action={handleLogoutUser}>
            <button
              type="submit"
              className="rounded-md bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
            >
              Sign out
            </button>
          </form>
        </div>
      </div>
    </header>
  );
};

export default DashboardHeader;
