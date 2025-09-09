import UserProfileForm from './components/forms/UserProfileForm';

function App() {
  return (
    <div style={{ padding: 16, maxWidth: 1200, margin: '0 auto' }}>
      <h1 className="text-center font-bold text-5xl" style={{ marginBottom: 16 }}>Learn and Exchange</h1>

  <UserProfileForm onSubmit={(d) => console.log('profile submit', d)} onDeactivate={() => console.log('deactivate clicked')} />
    </div>
  );
}

export default App;