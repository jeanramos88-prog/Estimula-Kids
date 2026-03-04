export type Skill = 
  | "Coordenação motora ampla"
  | "Coordenação motora fina"
  | "Coordenação viso motora"
  | "Aumento de força muscular"
  | "Equilíbrio bipodal e unipodal"
  | "Planejamento motor"
  | "Noção espacial e temporal"
  | "Esquema corporal"
  | "Modulação de força"
  | "Brincar funcional"
  | "Brincar simbólico"
  | "Imitação"
  | "Bilateralidade"
  | "Amplitude de movimento"
  | "Controle de tronco"
  | "Reações de proteção"
  | "Atenção e concentração"
  | "Socialização"
  | "Cognição"
  | "Auto cuidados"
  | "Linguagem";

export type PlanType = "annual" | "monthly" | "both";

export interface ChildProfile {
  name: string;
  age: string;
  disabilities: string[];
  demand: string;
  description: string;
  selectedSkills: Skill[];
  planType: PlanType;
  activitiesPerMonth: number;
}

export interface GenerationResult {
  annualPlan?: string;
  monthlyPlan?: string;
}
