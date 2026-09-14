import React from 'react';
import { Boxes, TrendingUp, ChefHat, ShieldAlert, ArrowRight } from 'lucide-react';
import Card from '../common/Card';
import './inventory.css';

export const InventoryImpactFlow = () => {
  return (
    <Card className="impact-flow-card">
      <div className="impact-flow-header">
        <h3>Real-time Inventory Impact Pipeline</h3>
        <p>How current stock converts into upcoming shift requirements and risk metrics.</p>
      </div>

      <div className="flow-nodes-wrapper">
        <div className="impact-node">
          <div className="impact-icon-box bg-cream">
            <Boxes size={22} color="#56473A" />
          </div>
          <div className="impact-info">
            <span className="lbl">1. Current Inventory</span>
            <strong>42 Ingredients Tracked</strong>
            <span className="sub">Live POS & Audit Sync</span>
          </div>
        </div>

        <ArrowRight size={20} className="flow-connect-arrow" />

        <div className="impact-node">
          <div className="impact-icon-box bg-amber">
            <TrendingUp size={22} color="#E5B141" />
          </div>
          <div className="impact-info">
            <span className="lbl">2. Expected Demand</span>
            <strong>1,240 Menu Orders</strong>
            <span className="sub">+14% Weekend Peak</span>
          </div>
        </div>

        <ArrowRight size={20} className="flow-connect-arrow" />

        <div className="impact-node">
          <div className="impact-icon-box bg-terracotta">
            <ChefHat size={22} color="#B94419" />
          </div>
          <div className="impact-info">
            <span className="lbl">3. Required Ingredients</span>
            <strong>142.5 kg Raw Materials</strong>
            <span className="sub">Optimal Recipe Yield</span>
          </div>
        </div>

        <ArrowRight size={20} className="flow-connect-arrow" />

        <div className="impact-node highlight-impact">
          <div className="impact-icon-box bg-emerald">
            <ShieldAlert size={22} color="#199B74" />
          </div>
          <div className="impact-info">
            <span className="lbl">4. Potential Waste Risk</span>
            <strong className="text-emerald">2.1% Minimal Loss</strong>
            <span className="sub">$420 Saved this week</span>
          </div>
        </div>
      </div>
    </Card>
  );
};

export default InventoryImpactFlow;
