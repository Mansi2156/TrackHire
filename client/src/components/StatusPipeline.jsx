import { HiCheck, HiX } from "react-icons/hi";
import { PIPELINE_STATUSES, TERMINAL_STATUSES } from "../constants";

// Renders the on-track pipeline (Applied -> ... -> Accepted) as a vertical
// stepper. If the application is in a terminal state (Rejected/Withdrawn/
// Closed), the steps completed before exiting are shown as done, and the
// exit itself is called out separately rather than forced into the pipeline.
export default function StatusPipeline({ status }) {
  const isTerminal = TERMINAL_STATUSES.includes(status);
  const currentIndex = PIPELINE_STATUSES.indexOf(status);

  return (
    <div>
      {PIPELINE_STATUSES.map((step, i) => {
        const done = isTerminal ? true : i < currentIndex;
        const active = !isTerminal && i === currentIndex;
        const isLast = i === PIPELINE_STATUSES.length - 1 && !isTerminal;

        return (
          <div key={step} className="flex gap-4">
            <div className="flex flex-col items-center">
              <div
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 transition-smooth ${
                  done
                    ? "border-brand-600 bg-brand-600"
                    : active
                    ? "border-brand-400 bg-white ring-4 ring-brand-50"
                    : "border-slate-200 bg-white"
                }`}
              >
                {done && <HiCheck className="h-3.5 w-3.5 text-white" strokeWidth={2.5} />}
                {active && <div className="h-2 w-2 rounded-full bg-brand-400" />}
              </div>
              {!isLast && (
                <div className={`mt-1 h-8 w-0.5 ${done ? "bg-brand-200" : "bg-slate-100"}`} />
              )}
            </div>
            <div className={isLast ? "pb-0" : "pb-6"}>
              <p
                className={`pt-1 text-sm font-medium ${
                  done ? "text-brand-700" : active ? "text-slate-900" : "text-slate-400"
                }`}
              >
                {step}
              </p>
              {done && <p className="mt-0.5 text-xs text-slate-400">Completed</p>}
              {active && <p className="mt-0.5 text-xs font-medium text-brand-500">In progress</p>}
            </div>
          </div>
        );
      })}

      {isTerminal && (
        <div className="flex gap-4">
          <div className="flex flex-col items-center">
            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full border-2 border-red-400 bg-red-50">
              <HiX className="h-3.5 w-3.5 text-red-500" strokeWidth={2.5} />
            </div>
          </div>
          <div>
            <p className="pt-1 text-sm font-medium text-red-600">{status}</p>
            <p className="mt-0.5 text-xs text-slate-400">This application is no longer active</p>
          </div>
        </div>
      )}
    </div>
  );
}
