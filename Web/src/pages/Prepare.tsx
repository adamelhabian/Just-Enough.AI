import React, { useState } from 'react';
import { ChefHat, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { StatusBadge } from '../components/StatusBadge';

export const Prepare: React.FC = () => {
  const [tasks, setTasks] = useState([
    { id: 'PREP-01', name: 'Prime Angus Burger Patties (150g)', qty: 80, unit: 'patties', station: 'Grill Prep', deadline: '11:00 AM', status: 'TODO', notes: 'Thaw under refrigeration. Portion to 150g exact with patty press.' },
    { id: 'PREP-02', name: 'House Truffle Aioli Batch', qty: 5, unit: 'liters', station: 'Sauce Station', deadline: '10:30 AM', status: 'IN_PROGRESS', notes: 'Blend pasteurized yolks, Italian white truffle oil, Dijon, roasted garlic.' },
    { id: 'PREP-03', name: 'Brioche Bun Buttering & Toast Prep', qty: 120, unit: 'buns', station: 'Bakery Station', deadline: '11:30 AM', status: 'TODO', notes: 'Split buns and apply clarified herb butter.' },
    { id: 'PREP-04', name: 'Crispy Shallots & Caramelized Onion Compote', qty: 4, unit: 'kg', station: 'Sauté Station', deadline: '10:45 AM', status: 'DONE', notes: 'Slow-cooked for 45 mins with aged balsamic.' },
  ]);

  const toggleTask = (id: string) => {
    setTasks(tasks.map(t => {
      if (t.id === id) {
        return { ...t, status: t.status === 'DONE' ? 'TODO' : 'DONE' };
      }
      return t;
    }));
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-800 text-xs font-bold uppercase tracking-wider mb-1">
            <ChefHat className="h-4 w-4 text-emerald-600" />
            Kitchen Production Schedule
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900 tracking-tight">
            Kitchen Preparation & Batching
          </h1>
          <p className="text-sm text-slate-600 mt-1">
            Real-time batch preparation requirements driven by today's cover forecast and historical daypart demand.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {tasks.map(task => (
          <div
            key={task.id}
            className={`bg-white rounded-2xl border p-5 transition-all shadow-xs ${
              task.status === 'DONE' ? 'border-emerald-200 bg-emerald-50/20' : 'border-slate-200 hover:border-slate-300'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">{task.station}</span>
                <h3 className="text-base font-bold text-slate-900 mt-0.5">{task.name}</h3>
              </div>
              <StatusBadge status={task.status === 'DONE' ? 'NORMAL' : 'PENDING'} />
            </div>

            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-2xl font-extrabold text-slate-900">{task.qty}</span>
              <span className="text-sm font-semibold text-slate-600">{task.unit}</span>
            </div>

            <div className="mt-2 text-xs text-slate-600 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
              <span className="font-semibold text-slate-800">SOP Note: </span>
              {task.notes}
            </div>

            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500">
                <Clock className="h-3.5 w-3.5 text-amber-500" />
                Ready by {task.deadline}
              </div>
              <button
                onClick={() => toggleTask(task.id)}
                className={`text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 ${
                  task.status === 'DONE'
                    ? 'bg-emerald-100 text-emerald-800 hover:bg-emerald-200'
                    : 'bg-slate-900 text-white hover:bg-slate-800'
                }`}
              >
                <CheckCircle2 className="h-3.5 w-3.5" />
                {task.status === 'DONE' ? 'Batch Completed' : 'Mark Batch Done'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
