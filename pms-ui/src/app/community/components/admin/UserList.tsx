import { UserBasicInfo } from '../../types/auth';
import { UserNameDisplay } from '../common/UserNameDisplay';

export function UserList({ users }: { users: UserBasicInfo[] }) {
  return (
    <div className="space-y-4">
      {users.map(user => (
        <div key={user._id} className="flex items-center justify-between p-4 bg-white dark:bg-gray-800">
          <UserNameDisplay 
            userInfo={user}
            className="text-gray-900 dark:text-white"
          />
          {/* ...admin actions... */}
        </div>
      ))}
    </div>
  );
}