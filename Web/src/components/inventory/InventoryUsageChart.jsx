import React, { useState } from 'react';
import ChartCard from '../common/ChartCard';
import { mockUsageData } from '../../data/mockData';
import './inventory.css';

export const InventoryUsageChart = () => {
  const [activeIngredient, setActiveIngredient] = useState('Chicken');
  const data = mockUsageData[activeIngredient] || mockUsageData.Chicken;

  // Compute max for chart scaling
  const maxValue = Math.max(...data.map(d => Math.max(d.actual || 0, d.predicted || 0))) * 1.25;

  return (
    <ChartCard
      title="Ingredient Usage & AI Demand Forecast"
      subtitle="Historical daily consumption vs next 48-hour predicted demand"
      headerActions={
        <div className="chart-switcher-pills">
          {Object.keys(mockUsageData).map((ing) => (
            <button
              key={ing}
              type="button"
              className={`chart-pill ${activeIngredient === ing ? 'active' : ''}`}
              onClick={() => setActiveIngredient(ing)}
            >
              {ing}
            </button>
          ))}
        </div>
      }
    >
      <div className="custom-chart-wrapper">
        <div className="chart-legend">
          <div className="legend-item">
            <span className="legend-box actual-bar"></span>
            <span>Actual Consumption (kg)</span>
          </div>
          <div className="legend-item">
            <span className="legend-box predicted-bar"></span>
            <span>AI Predicted Demand (kg)</span>
          </div>
        </div>

        <div className="chart-bars-container">
          {data.map((item, idx) => {
            const actualHeight = item.actual ? (item.actual / maxValue) * 100 : 0;
            const predictedHeight = item.predicted ? (item.predicted / maxValue) * 100 : 0;
            const isForecast = item.day.includes('(F)');

            return (
              <div key={idx} className="chart-column">
                <div className="bars-group">
                  {item.actual !== null && (
                    <div
                      className="bar-single bar-actual"
                      style={{ height: `${actualHeight}%` }}
                      title={`Actual: ${item.actual} kg`}
                    >
                      <span className="bar-val">{item.actual}</span>
                    </div>
                  )}
                  {item.predicted !== null && (
                    <div
                      className={`bar-single bar-predicted ${isForecast ? 'bar-forecast-future' : ''}`}
                      style={{ height: `${predictedHeight}%` }}
                      title={`Predicted: ${item.predicted} kg`}
                    >
                      <span className="bar-val">{item.predicted}</span>
                    </div>
                  )}
                </div>
                <span className={`day-label ${isForecast ? 'text-emerald font-bold' : ''}`}>
                  {item.day}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </ChartCard>
  );
};

export default InventoryUsageChart;
