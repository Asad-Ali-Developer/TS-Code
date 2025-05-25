interface User {
  id: string
  name: string
  color: string
}

interface UsersListProps {
  users: User[]
}

const UsersList = ({ users }: UsersListProps) => {
  return (
    <div className="flex items-center">
      <div className="flex -space-x-2">
        {users.slice(0, 5).map((user) => (
          <div
            key={user.id}
            className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-800 text-xs font-medium text-white"
            style={{ backgroundColor: user.color }}
            title={user.name}
          >
            {user.name.charAt(0).toUpperCase()}
          </div>
        ))}
        {users.length > 5 && (
          <div className="flex h-8 w-8 items-center justify-center rounded-full border-2 border-gray-800 bg-gray-700 text-xs font-medium text-white">
            +{users.length - 5}
          </div>
        )}
      </div>
      <div className="ml-2 text-sm text-gray-300">
        {users.length} {users.length === 1 ? "user" : "users"} online
      </div>
    </div>
  )
}

export default UsersList;