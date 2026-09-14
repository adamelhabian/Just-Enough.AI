import React, { useState } from 'react';
import { Sparkles, Sun, Calendar, Utensils, Zap, Award, ArrowRight } from 'lucide-react';
import './landing.css';

export const AiExplanation = () => {
  const [selectedProduct, setSelectedProduct] = useState('Chicken Burger');
  const [weatherCondition, setWeatherCondition] = useState('Sunny (75°F)');

  const productData = {
    'Chicken Burger': {
      units: 120,
      confidence: 92,
      trend: '+15% vs last Friday',
      rawIngredients: '18.2 kg Chicken, 120 Buns, 4.5 kg Cheddar',
      primaryDriver: 'Sunny weather + Friday lunch surge'
    },
    'Artisan Croissant': {
      units: 240,
      confidence: 96,
      trend: '+22% morning peak',
      rawIngredients: '14.0 kg Flour, 8.5 kg Butter, 2.0 kg Yeast',
      primaryDriver: 'Morning commuter pattern'
    },
    'Iced Caramel Latte': {
      units: 185,
      confidence: 94,
      trend: '+30% hot weather spike',
      rawIngredients: '4.5 kg Beans, 38 L Milk, 2.5 L Syrup',
      primaryDriver: 'Temperature elevation factor'
    }
  };

  const current = productData[selectedProduct];

  return (
    <section id="features" className="section-padding ai-explain-section reveal-on-scroll">
      <div className="container">
        <div className="section-header text-center">
          <span className="section-badge">Proprietary AI Core</span>
          <h2>Your demand has patterns. We find them.</h2>
          <p>Multi-variable intelligence parsing sales history, weather dynamics, and local calendar events.</p>
        </div>

        <div className="ai-interactive-demo-card">
          {/* Input Signals Panel */}
          <div className="demo-inputs-panel">
            <h4>INPUT SIGNALS</h4>
            <div className="signals-list">
              <div className="signal-item active-signal">
                <Calendar size={16} color="#E5B141" />
                <span>Historical Sales & Seasonality</span>
              </div>
              <div className="signal-item active-signal">
                <Sun size={16} color="#E5B141" />
                <span>Weather & Temperature: <strong>{weatherCondition}</strong></span>
              </div>
              <div className="signal-item active-signal">
                <Utensils size={16} color="#E5B141" />
                <span>Day of Week & Lunch Rush</span>
              </div>
              <div className="signal-item active-signal">
                <Zap size={16} color="#E5B141" />
                <span>Nearby Events & Holidays</span>
              </div>
            </div>

            <div className="interactive-controls">
              <label>Select Item Demo:</label>
              <div className="btn-group-sm">
                {Object.keys(productData).map((item) => (
                  <button
                    key={item}
                    type="button"
                    className={`demo-tab-btn ${selectedProduct === item ? 'active' : ''}`}
                    onClick={() => setSelectedProduct(item)}
                  >
                    {item}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Center Processing Model Badge */}
          <div className="demo-center-model">
            <div className="model-pulse-circle">
              <Sparkles size={32} color="#199B74" />
            </div>
            <span className="model-name">AI MODEL</span>
            <span className="model-sub">Neural Demand Engine</span>
          </div>

          {/* Output Prediction Panel */}
          <div className="demo-output-panel">
            <div className="output-header">
              <h4>DEMAND PREDICTION</h4>
              <span className="confidence-pill">
                <Award size={14} color="#199B74" />
                {current.confidence}% Confidence
              </span>
            </div>

            <div className="output-body">
              <span className="product-title">{selectedProduct}</span>
              <div className="prediction-big">
                <span className="unit-num">{current.units}</span>
                <span className="unit-label">units tomorrow</span>
              </div>
              <div className="trend-line text-emerald">{current.trend}</div>

              <div className="output-breakdown">
                <div className="breakdown-row">
                  <span className="label">Primary AI Driver:</span>
                  <span className="val">{current.primaryDriver}</span>
                </div>
                <div className="breakdown-row">
                  <span className="label">Required Ingredients:</span>
                  <span className="val highlight">{current.rawIngredients}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default AiExplanation;
