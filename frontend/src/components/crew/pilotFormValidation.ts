import type { PilotFormData } from "@/types/pilot";

export const RULES: Partial<
  Record<
    keyof PilotFormData,
    {
      required?: boolean;
      requiredMsg?: string;
      min?: number;
      max?: number;
      label: string;
    }
  >
> = {
  identificativo: {
    required: true,
    requiredMsg: "Ogni pilota ha bisogno di un nome.",
    min: 2,
    max: 30,
    label: "Identificativo",
  },
  classe: {
    required: true,
    requiredMsg: "Seleziona una classe per procedere.",
    label: "Classe",
  },
  motto_attivato: { max: 100, label: "Motto" },
  aspetto: { max: 500, label: "Aspetto" },
  background: { max: 800, label: "Background" },
  cimelio: { max: 100, label: "Cimelio" },
  mech_telaio: { required: true, requiredMsg: 'Il telaio del mech è obbligatorio.', max: 50, label: 'Telaio' },
  mech_modello: { required: true, requiredMsg: 'Il modello del mech è obbligatorio.', max: 50, label: 'Modello' },
  mech_nome: { max: 60, label: "Nome mech" },
  mech_info: { max: 500, label: "Note" },
};

export const STEP_FIELDS: (keyof PilotFormData)[][] = [
  ["identificativo", "classe", "motto_attivato"],
  ["aspetto", "background", "cimelio"],
  ["mech_telaio", "mech_modello", "mech_nome", "mech_info"],
  [],
];

export const STEPS = ["IDENTITÀ", "PROFILO", "UNITÀ MECH", "CONFERMA"];

export const EMPTY_FORM: PilotFormData = {
  identificativo: "",
  classe: "",
  aspetto: "",
  background: "",
  cimelio: "",
  mech_nome: "",
  mech_telaio: "",
  mech_modello: "",
  mech_info: "",
  mech_sistemi: "",
  mech_moduli: "",
  mech_status: "OPERATIVO",
  motto_attivato: "",
  abilita: "",
  equipaggiamento: "",
  sesso: undefined,
  access_key: '',
};

export function validateField(
  field: keyof PilotFormData,
  value: string,
): string {
  const rule = RULES[field];
  if (!rule) return "";
  if (rule.required && !value.trim())
    return rule.requiredMsg ?? `${rule.label} è obbligatorio.`;
  if (rule.min && value.trim().length < rule.min)
    return `Troppo corto — servono almeno ${rule.min} caratteri.`;
  if (rule.max && value.length > rule.max)
    return `Hai superato il limite di ${rule.max} caratteri.`;
  return "";
}
