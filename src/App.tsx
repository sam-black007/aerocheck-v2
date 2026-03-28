import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import Calculator from './pages/Calculator';
import Simulator from './pages/Simulator';
import Weather from './pages/Weather';
import Flights from './pages/Flights';
import Models from './pages/Models';
import Analytics from './pages/Analytics';
import Compare from './pages/Compare';
import Settings from './pages/Settings';

function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/calculator" element={<Calculator />} />
        <Route path="/simulator" element={<Simulator />} />
        <Route path="/weather" element={<Weather />} />
        <Route path="/flights" element={<Flights />} />
        <Route path="/models" element={<Models />} />
        <Route path="/analytics" element={<Analytics />} />
        <Route path="/compare" element={<Compare />} />
        <Route path="/settings" element={<Settings />} />
      </Routes>
    </Layout>
  );
}

export default App;
