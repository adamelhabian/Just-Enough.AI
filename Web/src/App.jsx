import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import DashboardPage from './features/dashboard/presentation/DashboardPage';
import ForecastPage from './features/forecast/presentation/ForecastPage';
import ProductionPlanPage from './features/production/presentation/ProductionPlanPage';

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-restaurant-background">
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/forecast" element={<ForecastPage />} />
          <Route path="/production" element={<ProductionPlanPage />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
