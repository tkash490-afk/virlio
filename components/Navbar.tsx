export default function Navbar() {
  return (
    <header className="bg-white shadow px-6 py-4 flex justify-between items-center">
      <h2 className="text-2xl font-semibold">
        Dashboard
      </h2>

      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          Welcome 👋
        </span>

        <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center">
          U
        </div>
      </div>
    </header>
  );
}