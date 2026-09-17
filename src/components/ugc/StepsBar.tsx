import { Check } from "lucide-react";

export type FlowStep = {
  id: string;
  n: number;
  title: string;
  hint: string;
  /** Resumen de lo ya elegido en ese paso. */
  summary: string | null;
  done: boolean;
};

type Props = {
  steps: FlowStep[];
  activeId: string;
  onStep: (id: string) => void;
};

/** Cabecera del flujo: producto → referencia e idea → avatar → pieza. */
const StepsBar = ({ steps, activeId, onStep }: Props) => (
  <ol className="grid gap-2 sm:grid-cols-2 xl:grid-cols-4">
    {steps.map((step) => {
      const active = step.id === activeId;
      return (
        <li key={step.id}>
          <button
            type="button"
            onClick={() => onStep(step.id)}
            aria-current={active ? "step" : undefined}
            className={`h-full w-full rounded-lg border p-3 text-left transition-colors ${
              active
                ? "border-primary/50 bg-primary/10"
                : "border-border bg-card/40 hover:border-primary/25 hover:bg-card/70"
            }`}
          >
            <span className="flex items-center gap-2">
              <span
                className={`grid h-5 w-5 shrink-0 place-items-center rounded-full text-[10px] font-bold tabular-nums ${
                  step.done ? "bg-primary text-primary-foreground" : active ? "bg-primary/25 text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {step.done ? <Check className="h-3 w-3" /> : step.n}
              </span>
              <span className="min-w-0 truncate text-sm font-medium text-foreground">{step.title}</span>
            </span>
            <span className="mt-1.5 block truncate text-[11px] leading-relaxed text-muted-foreground">
              {step.summary ?? step.hint}
            </span>
          </button>
        </li>
      );
    })}
  </ol>
);

export default StepsBar;
