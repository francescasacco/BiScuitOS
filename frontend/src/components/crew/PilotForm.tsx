import { useState, useRef, useEffect } from "react";
import type { PilotFormData } from "@/types/pilot";
import { CLASSI_PILOTA } from "@/types/pilot";
import { pilotService } from "@/services/pilotService";
import { useOSStore } from "@/store/useOSStore";
import { CustomSelect } from "@/components/ui/CustomSelect";
import { MechItemList } from "@/components/crew/MechItemList";
import {
  EMPTY_FORM,
  STEPS,
  STEP_FIELDS,
  validateField,
} from "@/components/crew/pilotFormValidation";
import { Check, ChevronLeft, ChevronRight, AlertTriangle } from "lucide-react";

interface PilotFormProps {
  onClose: () => void;
}

export function PilotForm({ onClose }: PilotFormProps) {
  const addPilot = useOSStore((s) => s.addPilot);
  const addJournalEntry = useOSStore((s) => s.addJournalEntry);
  const [step, setStep] = useState(0);
  const [form, setForm] = useState<PilotFormData>(EMPTY_FORM);
  const [sistemi, setSistemi] = useState<string[]>([]);
  const [moduli, setModuli] = useState<string[]>([]);
  const [abilita, setAbilita] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [registering, setRegistering] = useState(false);
  const [errors, setErrors] = useState<
    Partial<Record<keyof PilotFormData, string>>
  >({});
  const [touched, setTouched] = useState<
    Partial<Record<keyof PilotFormData, boolean>>
  >({});
  const tabsRef = useRef<HTMLDivElement>(null);
  const activeTabRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (tabsRef.current && activeTabRef.current) {
      activeTabRef.current.scrollIntoView({
        behavior: "smooth",
        block: "nearest",
        inline: "center",
      });
    }
  }, [step]);
  const update = (field: keyof PilotFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (touched[field])
      setErrors((e) => ({ ...e, [field]: validateField(field, value) }));
  };

  const touch = (field: keyof PilotFormData) => {
    setTouched((t) => ({ ...t, [field]: true }));
    setErrors((e) => ({
      ...e,
      [field]: validateField(field, (form[field] as string) ?? ""),
    }));
  };

  const validateStep = (stepIndex: number): boolean => {
    const fields = STEP_FIELDS[stepIndex];
    const newTouched = { ...touched };
    const newErrors = { ...errors };
    let valid = true;
    for (const f of fields) {
      newTouched[f] = true;
      const err = validateField(f, (form[f] as string) ?? "");
      newErrors[f] = err;
      if (err) valid = false;
    }
    setTouched(newTouched);
    setErrors(newErrors);
    return valid;
  };

  const inputClass = (field: keyof PilotFormData) =>
    `bc-input${touched[field] && errors[field] ? " border-bc-red focus:border-bc-red" : ""}`;

  const textareaClass = (field: keyof PilotFormData) =>
    `bc-textarea${touched[field] && errors[field] ? " border-bc-red focus:border-bc-red" : ""}`;

  const FieldError = ({ field }: { field: keyof PilotFormData }) =>
    touched[field] && errors[field] ? (
      <p className="font-mono text-xs text-bc-red mt-1 italic">
        {errors[field]}
      </p>
    ) : null;

  const updateSistemi = (items: string[]) => {
    setSistemi(items);
    setForm((p) => ({ ...p, mech_sistemi: items.join("\n") }));
  };

  const updateModuli = (items: string[]) => {
    setModuli(items);
    setForm((p) => ({ ...p, mech_moduli: items.join("\n") }));
  };

  const updateAbilita = (items: string[]) => {
    setAbilita(items);
    setForm((p) => ({ ...p, abilita: items.join("\n") }));
  };

  const isStepAccessible = (targetStep: number): boolean => {
    for (let i = 0; i < targetStep; i++) {
      const valid = STEP_FIELDS[i].every(
        (f) => !validateField(f, (form[f] as string) ?? ""),
      );
      if (!valid) return false;
    }
    return true;
  };

  const handleTabClick = (i: number) => {
    if (i === step) return;
    if (isStepAccessible(i)) setStep(i);
  };

  const handleNext = () => {
    if (validateStep(step)) setStep(step + 1);
  };

  const handleSubmit = async () => {
    setLoading(true);
    setRegistering(true);
    try {
      const pilot = await pilotService.create(form);
      addPilot(pilot);
      addJournalEntry({
        id: crypto.randomUUID(),
        title: `REGISTRAZIONE PILOTA // ${form.identificativo}`,
        content: `Nuovo nodo pilota iniettato nella rete.`,
        type: "pilot_registration",
        author: "SISTEMA",
        created_at: new Date().toISOString(),
      });
      setTimeout(() => onClose(), 1500);
    } catch (err) {
      console.error("[CRAWLER//OS] Registrazione pilota fallita:", err);
      setRegistering(false);
    } finally {
      setLoading(false);
    }
  };

  if (registering && !loading) {
    return (
      <div className="flex flex-col items-center justify-center py-16 space-y-3 font-mono text-sm">
        <div className="text-bc-green text-glow animate-pulse flex items-center gap-1.5">
          <ChevronRight size={12} /> Registrazione pilota nel nodo sistema...
        </div>
        <div className="text-bc-green flex items-center gap-1.5">
          <ChevronRight size={12} /> Sincronizzazione con il database Crawler...
        </div>
        <div className="text-bc-green flex items-center gap-1.5">
          <ChevronRight size={12} /> Evento REGISTRAZIONE PILOTA inviato.
        </div>
        <div className="text-bc-amber mt-4">
          Sincronizzazione nodo completata.
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-xl mx-auto">
      <div
        ref={tabsRef}
        className="flex items-center sm:justify-center px-3 py-2 border-b border-bc-border mb-6 gap-1 overflow-x-auto scroll-smooth"
        style={{ scrollbarWidth: "none" }}
      >
        {STEPS.map((s, i) => {
          const accessible = isStepAccessible(i);
          return (
            <button
              key={s}
              ref={i === step ? activeTabRef : undefined}
              onClick={() => handleTabClick(i)}
              disabled={!accessible}
              className={`font-mono text-[10px] px-2.5 py-1 rounded shrink-0 transition-colors ${
                i === step
                  ? "bg-bc-green/20 text-bc-green border border-bc-green/40"
                  : accessible
                    ? "text-bc-muted/60 hover:text-bc-muted border border-transparent cursor-pointer"
                    : "text-bc-muted/30 border border-transparent cursor-not-allowed opacity-50"
              }`}
            >
              <span className="flex items-center gap-1">
                {i < step && accessible && <Check size={9} strokeWidth={2.5} />}
                {s}
              </span>
            </button>
          );
        })}
      </div>

      {step === 0 && (
        <div className="space-y-4 animate-boot-in">
          <div className="bc-section-header">// IDENTITÀ PILOTA</div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              IDENTIFICATIVO *
            </label>
            <input
              className={inputClass("identificativo")}
              placeholder="es. IRON-7, Ghost, Mantis..."
              value={form.identificativo}
              onChange={(e) => update("identificativo", e.target.value)}
              onBlur={() => touch("identificativo")}
            />
            <FieldError field="identificativo" />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              CLASSE *
            </label>
            <CustomSelect
              value={form.classe}
              onChange={(v) => {
                update("classe", v);
                setTouched((t) => ({ ...t, classe: true }));
                setErrors((e) => ({ ...e, classe: "" }));
              }}
              options={CLASSI_PILOTA}
              placeholder="SELEZIONA CLASSE..."
              hasError={!!(touched.classe && errors.classe)}
            />
            <FieldError field="classe" />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              SESSO
            </label>
            <CustomSelect
              value={form.sesso ?? ""}
              onChange={(v) => update("sesso" as keyof PilotFormData, v)}
              options={["M", "F"] as const}
              placeholder="SELEZIONA..."
              getLabel={(v) => (v === "M" ? "Maschio" : "Femmina")}
            />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              MOTTO
            </label>
            <input
              className={inputClass("motto_attivato")}
              placeholder="La frase del tuo pilota..."
              value={form.motto_attivato ?? ""}
              onChange={(e) => update("motto_attivato", e.target.value)}
              onBlur={() => touch("motto_attivato")}
            />
            <FieldError field="motto_attivato" />
          </div>
        </div>
      )}

      {step === 1 && (
        <div className="space-y-4 animate-boot-in">
          <div className="bc-section-header">// PROFILO PILOTA</div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              ASPETTO
            </label>
            <textarea
              className={textareaClass("aspetto")}
              rows={3}
              placeholder="Descrivi l'aspetto fisico del pilota..."
              value={form.aspetto ?? ""}
              onChange={(e) => update("aspetto", e.target.value)}
              onBlur={() => touch("aspetto")}
            />
            <FieldError field="aspetto" />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              BACKGROUND
            </label>
            <textarea
              className={textareaClass("background")}
              rows={3}
              placeholder="Storia del pilota, da dove viene..."
              value={form.background ?? ""}
              onChange={(e) => update("background", e.target.value)}
              onBlur={() => touch("background")}
            />
            <FieldError field="background" />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              CIMELIO
            </label>
            <input
              className={inputClass("cimelio")}
              placeholder="Oggetto personale importante..."
              value={form.cimelio ?? ""}
              onChange={(e) => update("cimelio", e.target.value)}
              onBlur={() => touch("cimelio")}
            />
            <FieldError field="cimelio" />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              ABILITÀ <span className="text-bc-muted/50">(opzionale)</span>
            </label>
            <MechItemList
              items={abilita}
              onChange={updateAbilita}
              placeholder="es. Hacking, Primo soccorso..."
            />
          </div>
        </div>
      )}

      {step === 2 && (
        <div className="space-y-4 animate-boot-in">
          <div className="bc-section-header">// REGISTRAZIONE UNITÀ MECH</div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">
                TELAIO *
              </label>
              <input
                className={inputClass("mech_telaio")}
                placeholder="es. Hussair, Mazona..."
                value={form.mech_telaio ?? ""}
                onChange={(e) => update("mech_telaio", e.target.value)}
                onBlur={() => touch("mech_telaio")}
              />
              <FieldError field="mech_telaio" />
            </div>
            <div>
              <label className="font-mono text-xs text-bc-muted block mb-1">
                MODELLO *
              </label>
              <input
                className={inputClass("mech_modello")}
                placeholder="es. Settler..."
                value={form.mech_modello ?? ""}
                onChange={(e) => update("mech_modello", e.target.value)}
                onBlur={() => touch("mech_modello")}
              />
              <FieldError field="mech_modello" />
            </div>
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              NOME MECH <span className="text-bc-muted/50">(opzionale)</span>
            </label>
            <input
              className={inputClass("mech_nome")}
              placeholder="Designazione personale dell'unità..."
              value={form.mech_nome ?? ""}
              onChange={(e) => update("mech_nome", e.target.value)}
              onBlur={() => touch("mech_nome")}
            />
            <FieldError field="mech_nome" />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              SISTEMI
            </label>
            <MechItemList
              items={sistemi}
              onChange={updateSistemi}
              placeholder="es. Radar, Scudo energetico..."
            />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              MODULI
            </label>
            <MechItemList
              items={moduli}
              onChange={updateModuli}
              placeholder="es. Modulo comunicazioni..."
            />
          </div>
          <div>
            <label className="font-mono text-xs text-bc-muted block mb-1">
              NOTE
            </label>
            <textarea
              className={textareaClass("mech_info")}
              rows={2}
              placeholder="Descrizione, storia, particolarità del mech..."
              value={form.mech_info ?? ""}
              onChange={(e) => update("mech_info", e.target.value)}
              onBlur={() => touch("mech_info")}
            />
            <FieldError field="mech_info" />
          </div>
        </div>
      )}

      {step === 3 && (
        <div className="space-y-4 animate-boot-in">
          <div className="bc-section-header">
            // CONFERMA // REGISTRAZIONE PILOTA
          </div>
          <div className="bc-panel border border-bc-border p-4 font-mono text-xs space-y-2">
            <div className="text-bc-muted">
              IDENTIFICATIVO:{" "}
              <span className="text-bc-green">{form.identificativo}</span>
            </div>
            <div className="text-bc-muted">
              CLASSE: <span className="text-bc-green">{form.classe}</span>
            </div>
            {(form.mech_telaio || form.mech_modello) && (
              <div className="text-bc-muted">
                MECH:{" "}
                <span className="text-bc-blue">
                  {[form.mech_telaio, form.mech_modello]
                    .filter(Boolean)
                    .join(" / ")}
                  {form.mech_nome ? ` — ${form.mech_nome}` : ""}
                </span>
              </div>
            )}
            <div className="mt-3 pt-3 border-t border-bc-border text-bc-amber flex items-center gap-1.5">
              <AlertTriangle size={12} strokeWidth={2} /> CONFERMA INSERZIONE
              PILOTA NELLA RETE?
            </div>
          </div>
        </div>
      )}

      <div className="flex justify-between mt-6">
        <button
          className={
            step === 0
              ? "bc-btn border-bc-muted text-bc-muted"
              : "bc-btn border-bc-muted text-bc-muted flex items-center gap-1"
          }
          onClick={step === 0 ? onClose : () => setStep(step - 1)}
        >
          {step === 0 ? (
            "ANNULLA"
          ) : (
            <>
              <ChevronLeft size={13} /> INDIETRO
            </>
          )}
        </button>
        <button
          className={`flex items-center gap-1 ${step === STEPS.length - 1 ? "bc-btn-amber" : "bc-btn-green"}`}
          onClick={step === STEPS.length - 1 ? handleSubmit : handleNext}
          disabled={loading}
        >
          {step === STEPS.length - 1 ? (
            loading ? (
              "INSERZIONE..."
            ) : (
              "CONFERMA REGISTRAZIONE"
            )
          ) : (
            <>
              AVANTI <ChevronRight size={13} />
            </>
          )}
        </button>
      </div>
    </div>
  );
}
