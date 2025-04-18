export default function DashboardStats({ user }) {
    return (
      <div className="grid md:grid-cols-3 gap-4">
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-semibold">Total Carss</h3>
          <p className="text-xl">12</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-semibold">Bookkings</h3>
          <p className="text-xl">5</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-semibold">Messages</h3>
          <p className="text-xl">3</p>
        </div>
        <div className="p-4 bg-white shadow rounded-lg">
          <h3 className="text-lg font-semibold">username</h3>
          <p className="text-xl">{user?.firstName || 'User'}!</p>
        </div>
      </div>
    );
  }
  