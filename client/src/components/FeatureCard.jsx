import React from 'react';

export default function FeatureCard({ icon: Icon, title, description, colorBadge = 'indigo' }) {
  const badgeStyles = {
    indigo: 'bg-indigo-50 text-indigo-600 border-indigo-100 group-hover:bg-indigo-600 group-hover:text-white',
    emerald: 'bg-emerald-50 text-emerald-600 border-emerald-100 group-hover:bg-emerald-600 group-hover:text-white',
    amber: 'bg-amber-50 text-amber-600 border-amber-100 group-hover:bg-amber-600 group-hover:text-white',
    purple: 'bg-purple-50 text-purple-600 border-purple-100 group-hover:bg-purple-600 group-hover:text-white',
  };

  return (
    <div className="group p-8 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-indigo-100 transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-indigo-50/40 to-transparent rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform duration-300" />
      
      <div>
        <div className={`w-14 h-14 rounded-xl border flex items-center justify-center mb-6 transition-all duration-300 shadow-sm ${badgeStyles[colorBadge] || badgeStyles.indigo}`}>
          <Icon className="w-7 h-7" />
        </div>
        <h3 className="text-xl font-bold text-slate-900 mb-3 group-hover:text-indigo-600 transition-colors">
          {title}
        </h3>
        <p className="text-slate-600 text-sm leading-relaxed">
          {description}
        </p>
      </div>

      <div className="mt-6 pt-4 border-t border-slate-100/80 flex items-center text-xs font-semibold text-indigo-600 group-hover:translate-x-1 transition-transform duration-200">
        <span>Explore feature</span>
        <span className="ml-1">&rarr;</span>
      </div>
    </div>
  );
}
