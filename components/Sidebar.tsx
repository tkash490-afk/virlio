export default function Sidebar() {
  return (
    <aside className="w-64 bg-black text-white h-screen p-6">
      <h1 className="text-2xl font-bold mb-10">🎬 Virlio</h1>

      <nav className="space-y-4">
        <p className="cursor-pointer hover:text-gray-300">
          Dashboard
        </p>

        <p className="cursor-pointer hover:text-gray-300">
          Projects
        </p>

        <p className="cursor-pointer hover:text-gray-300">
          Uploads
        </p>

        <p className="cursor-pointer hover:text-gray-300">
          Billing
        </p>

        <p className="cursor-pointer hover:text-gray-300">
          Settings
        </p>

        <p className="cursor-pointer hover:text-red-400">
          Logout
        </p>
      </nav>
    </aside>
  );
}