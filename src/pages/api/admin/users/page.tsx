export default function AdminUsersPage() {
  const exportUsers = () => window.open("/api/admin/users/export", "_blank");

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">User Management</h1>
      <button
        onClick={exportUsers}
        className="mb-6 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
      >
        Export Users (CSV)
      </button>
      {/* existing user/role table… */}
	  <div className="mb-6">
		<label className="block mb-2 font-medium">Import Users (CSV)</label>
        <input type="file" accept=".csv" onChange={onFileChange} />
        {status && <p className="mt-2 text-sm">{status}</p>}
      </div>
      {/* your existing user table… */}
    </div>
  );
}
