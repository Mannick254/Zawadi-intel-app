import { useState, useEffect } from 'react';
import LoginForm from './components/LoginForm';
import ArticleList from './components/ArticleList';
import NewsFeed from './components/NewsFeed';
import { checkAuth, logoutUser } from './api/auth';

export default function App() {
  const [session, setSession] = useState(null);

  useEffect(() => {
    checkAuth().then(setSession);
  }, []);

  return (
    <div>
      <h1>Zawadi Intel News</h1>
      {session ? (
        <>
          <p>Welcome, {session.username}</p>
          <button onClick={() => { logoutUser(); setSession(null); }}>Logout</button>
          <ArticleList />
          <NewsFeed />
        </>
      ) : (
        <LoginForm onLogin={setSession} />
      )}
    </div>
  );
}
