/**
 * App - root component with Telegram WebApp validation and routing.
 */

import { Route, Routes } from 'react-router-dom';
import { useTelegramInit } from './hooks/useTelegramInit';
import { ErrorMessage } from './components/ErrorMessage';
import Edit from './pages/Edit';
import Export from './pages/Export';

function App() {
  const route = window.location.pathname;
  const { isReady, isValid } = useTelegramInit(route);

  if (isReady === null) {
    // initData validation in progress
    return null;
  }

  if (!isValid) {
    return (
      <ErrorMessage
        message="Invalid WebApp initData."
        messageCn="請通過 /manage 指令打開WebApp."
        secondary="Please launch WebApp using /manage command."
      />
    );
  }

  return (
    <div className="App">
      <header className="App-header" />
      <Routes>
        <Route path="/webapp/edit" element={<Edit />} />
        <Route path="/webapp/export" element={<Export />} />
      </Routes>
    </div>
  );
}

export default App;
