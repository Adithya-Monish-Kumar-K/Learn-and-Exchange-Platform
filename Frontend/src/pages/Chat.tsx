import React from 'react';
import { z } from 'zod';
import Sidebar from '../components/Sidebar';
import RequestForm from '../components/RequestForm';

type User = { _id: string; fullName: string; profilePic?: string };
type Task = { _id: string; title: string };

type State = {
  users: User[];
  tasks: Task[];
  selectedUser: User | null;
  showModal: boolean;
  showSidebarMobile: boolean;
};

const schema = z.object({
  user: z.string().min(1, 'Select a user'),
  task: z.string().optional(),
  title: z.string().min(1, 'Title required'),
  description: z.string().min(1, 'Description required'),
});

export default class Chat extends React.Component<{}, State> {
  state: State = {
    users: [
      { _id: 'u1', fullName: 'Alice Johnson' },
      { _id: 'u2', fullName: 'Bob Smith' },
      { _id: 'u3', fullName: 'Clara Lee' },
    ],
    tasks: [
      { _id: 't1', title: 'Design Logo' },
      { _id: 't2', title: 'Build API' },
    ],
    selectedUser: null,
    showModal: false,
    showSidebarMobile: false,
  };

  selectUser = (u: User) => {
    this.setState({ selectedUser: u, showSidebarMobile: false });
  };

  openModal = () => this.setState({ showModal: true });
  closeModal = () => this.setState({ showModal: false });

  toggleSidebarMobile = () =>
    this.setState((s) => ({ showSidebarMobile: !s.showSidebarMobile }));

  renderHeader() {
    const { selectedUser } = this.state;
    return (
      <div className="flex items-center justify-between border-b pb-4 mb-4">
        <div className="flex items-center gap-4">
          <button
            className="sm:hidden p-2 rounded-md bg-gray-100"
            onClick={this.toggleSidebarMobile}
          >
            ☰
          </button>
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-sky-400 to-indigo-500 text-white flex items-center justify-center text-lg font-semibold">
            {selectedUser
              ? selectedUser.fullName
                  .split(' ')
                  .map((n) => n[0])
                  .slice(0, 2)
                  .join('')
              : 'SE'}
          </div>
          <div>
            <div className="font-semibold text-gray-800">
              {selectedUser ? selectedUser.fullName : 'Skill exchange'}
            </div>
            <div className="text-sm text-gray-500">
              {selectedUser ? 'Active now' : 'Connect and learn skills'}
            </div>
          </div>
        </div>
      </div>
    );
  }

  render() {
    const { users, selectedUser, showModal, showSidebarMobile } = this.state;
    return (
      <div className="h-screen bg-gray-50 p-4 sm:p-6">
        <div className="max-w-6xl mx-auto bg-white rounded-lg shadow-md h-[86vh] overflow-hidden flex flex-col sm:flex-row">
          <Sidebar
            users={users}
            selectedUserId={selectedUser?._id ?? null}
            onSelect={this.selectUser}
            onRequest={this.openModal}
            isMobileOpen={showSidebarMobile}
            onClose={() => this.setState({ showSidebarMobile: false })}
          />
          <main className="flex-1 p-4 sm:p-6 flex flex-col">
            {this.renderHeader()}
            {!selectedUser ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center">
                  <h1 className="text-3xl sm:text-4xl font-bold text-indigo-600">
                    Skill exchange
                  </h1>
                  <p className="mt-2 text-gray-500">
                    Select a contact to start a conversation
                  </p>
                </div>
              </div>
            ) : (
              <div className="h-full flex flex-col">
                <div className="flex-1 bg-gradient-to-b from-white to-gray-50 rounded-lg p-3 sm:p-4 overflow-auto">
                  <div className="h-full flex items-end justify-center text-gray-400">
                    Conversation area (mock)
                  </div>
                </div>
                <div className="mt-3 sm:mt-4">
                  <div className="flex gap-2">
                    <input
                      className="flex-1 p-3 border rounded-md"
                      placeholder="Type a message..."
                    />
                    <button className="px-4 py-2 rounded-md bg-indigo-600 text-white">
                      Send
                    </button>
                  </div>
                </div>
              </div>
            )}
          </main>
        </div>
        {showModal && (
          <RequestForm
            users={users.map((u) => ({ _id: u._id, label: u.fullName }))}
            tasks={this.state.tasks.map((t) => ({
              _id: t._id,
              label: t.title,
            }))}
            onClose={this.closeModal}
            onSubmit={(values) => {
              console.log('request values', values);
            }}
          />
        )}
      </div>
    );
  }
}
