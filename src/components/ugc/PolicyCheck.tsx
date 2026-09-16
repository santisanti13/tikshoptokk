import { AlertTriangle, ShieldAlert, ShieldCheck } from "lucide-react";
import { AIGC_DISCLOSURE_NOTE, type PolicyIssue } from "@/lib/ugcPolicy";

type Props = { issues: PolicyIssue[]; ready: boolean };

/**
 * Revisión de normas de TikTok Shop del guion.
 * En ámbar son avisos: el vídeo se genera igual y lo corregimos al escribir la escena.
 * En rojo solo lo que TikTok prohíbe de raíz (categorías vetadas, suplantar a alguien real).
 */
const PolicyCheck = ({ issues, ready }: Props) => {
  if (!ready) return null;

  if (issues.length === 0) {
    return (
      <div className="flex items-start gap-2 rounded-xl border border-emerald-400/25 bg-emerald-400/10 px-3 py-2">
        <ShieldCheck className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
        <p className="text-xs text-muted-foreground">
          Revisión de normas superada: no vemos promesas ni contenido que pueda tumbar el vídeo en TikTok Shop.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {issues.map((issue) => {
        const blocking = issue.level === "block";
        return (
          <div
            key={issue.id}
            className={`flex items-start gap-2 rounded-xl border px-3 py-2 ${
              blocking ? "border-destructive/40 bg-destructive/10" : "border-amber-400/30 bg-amber-400/10"
            }`}
          >
            {blocking ? (
              <ShieldAlert className="mt-0.5 h-4 w-4 shrink-0 text-destructive" />
            ) : (
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0 text-amber-400" />
            )}
            <div className="min-w-0">
              <p className="text-xs font-medium">
                {blocking ? "No permitido en TikTok Shop: " : "Lo suavizamos al generar: "}
                {issue.title}
              </p>
              <p className="mt-0.5 text-xs text-muted-foreground">{issue.fix}</p>
            </div>
          </div>
        );
      })}
      {!issues.some((i) => i.level === "block") && (
        <p className="studio-hint">
          Son avisos, no un bloqueo: el vídeo se genera igual y el guion sale ya corregido en esos puntos.
        </p>
      )}
    </div>
  );
};

export default PolicyCheck;
