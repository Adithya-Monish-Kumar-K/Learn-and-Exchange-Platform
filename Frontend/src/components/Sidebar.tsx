type User = { _id: string; fullName: string; profilePic?: string };

type Props = {
  users: User[];
  selectedUserId?: string | null;
  onSelect: (u: User) => void;
  onRequest: () => void;
  isMobileOpen?: boolean;
  onClose?: () => void;
};

export default function Sidebar({
  users,
  selectedUserId,
  onSelect,
  onRequest,
  isMobileOpen = false,
  onClose,
}: Props) {
  return (
    <aside
      className={
        // hidden on mobile unless isMobileOpen, shown as overlay; on sm+ behaves as sidebar
        `${isMobileOpen ? 'fixed inset-0 z-50 bg-black/30 flex' : 'hidden'} sm:flex sm:w-80 bg-white border-r shadow-sm p-4 flex-col`
      }
    >
      <div
        className={`${isMobileOpen ? 'bg-white w-full max-w-xs rounded-lg shadow-lg m-auto' : 'flex-1'}`}
      >
        <div className="flex items-center justify-between mb-4 p-3">
          <h2 className="text-lg font-semibold text-sky-600">Contacts</h2>
          <div className="flex items-center gap-2">
            <button
              onClick={onRequest}
              className="px-2 py-1 text-sm rounded-md bg-emerald-500 text-white hover:bg-emerald-600"
            >
              + Request
            </button>
            {isMobileOpen && onClose && (
              <button
                onClick={onClose}
                className="ml-2 text-gray-600 px-2 py-1 rounded-md bg-gray-100"
              >
                Close
              </button>
            )}
          </div>
        </div>
        <div className="flex-1 overflow-auto space-y-2 p-3">
          {users.map((u) => {
            const active = selectedUserId === u._id;
            return (
              <button
                key={u._id}
                onClick={() => {
                  onSelect(u);
                  if (isMobileOpen && onClose) onClose();
                }}
                className={`w-full text-left p-3 rounded-lg flex items-center gap-3 transition-colors ${
                  active ? 'bg-sky-50 ring-1 ring-sky-200' : 'hover:bg-gray-50'
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-sky-100 text-sky-700 flex items-center justify-center font-semibold">
                  {u.fullName
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')}
                </div>
                <div className="flex-1">
                  <div className="font-medium text-gray-800">{u.fullName}</div>
                  <div className="text-xs text-gray-500">Tap to start</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </aside>
  );
}
