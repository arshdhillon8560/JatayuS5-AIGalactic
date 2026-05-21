import { Check } from "lucide-react";

export default function StepTracker({ steps, current }) {
  return (
    <div className="mb-8">
      <div className="flex items-center">
        {steps.map((step, i) => {
          const done = i < current;
          const active = i === current;
          return (
            <div key={i} className="flex items-center flex-1 last:flex-none">
              <div className="flex flex-col items-center">
                <div
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all
                  ${done ? "step-circle-done" : active ? "step-circle-active" : "step-circle-pending"}`}
                >
                  {done ? <Check size={16} /> : i + 1}
                </div>
                <span
                  className={`text-[11px] mt-2 text-center leading-tight max-w-[90px] font-medium
                  ${active ? "text-sky-600" : done ? "text-green-600" : "text-slate-400"}`}
                >
                  {step}
                </span>
              </div>
              {i < steps.length - 1 && (
                <div className="flex-1 relative h-[2px] mx-2 mb-4 bg-slate-200 rounded">
                  {done && (
                    <div className="absolute inset-0 bg-green-400 rounded" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {/* Progress bar */}
      <div className="prog-track mt-4">
        <div
          className="prog-fill"
          style={{ width: `${(current / (steps.length - 1)) * 100}%` }}
        />
      </div>
    </div>
  );
}
