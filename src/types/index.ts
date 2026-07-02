export type UserRole = "admin" | "supervisor" | "tatico" | "operador_cftv";

export const ROLE_LABELS: Record<UserRole, string> = {
  admin: "Administrador",
  supervisor: "Supervisor",
  tatico: "Tático",
  operador_cftv: "Operador de CFTV",
};

export interface User {
  id: number;
  name: string;
  username: string;
  role: UserRole;
  isActive: boolean;
}

export interface School {
  id: number;
  name: string;
  type: "CEI" | "CEM" | "EM" | "ERM" | "DEPARTMENT";
  address?: string;
  phone?: string;
}

export interface Call {
  id: number;
  number: string;
  date: Date;
  schoolId?: number;
  school?: School;
  requester: string;
  phone?: string;
  type: string;
  priority: "Baixa" | "Média" | "Alta" | "Urgente";
  description: string;
  team?: string;
  status: "Aberto" | "Em análise" | "Encaminhado" | "Em atendimento" | "Aguardando parecer" | "Concluído" | "Cancelado";
  responsible?: string;
  closingDate?: Date;
  closingResponsible?: string;
  report?: string;
  adminReport?: string;
  opinion?: string;
  createdBy?: number;
  createdAt: Date;
  updatedAt: Date;
  attachments?: Attachment[];
}

export interface Attachment {
  id: number;
  callId: number;
  filename: string;
  url: string;
  type: "image" | "document";
  createdAt: Date;
}

export interface CallHistory {
  id: number;
  callId: number;
  action: string;
  userId: number;
  notes?: string;
  createdAt: Date;
}

export const SCHOOLS_SEED: Omit<School, 'id'>[] = [
  { name: "CEI Luiz Felipe", type: "CEI" },
  { name: "CEI Arco Íris", type: "CEI" },
  { name: "CEI Bruno Leonardo", type: "CEI" },
  { name: "CEI Dom Franco", type: "CEI" },
  { name: "CEI Menino Jesus", type: "CEI" },
  { name: "CEI Nosso Lar", type: "CEI" },
  { name: "CEI Vasco Papa", type: "CEI" },
  { name: "CEI Criança Feliz", type: "CEI" },
  { name: "CEM São Cristóvão", type: "CEM" },
  { name: "CEM Guilherme", type: "CEM" },
  { name: "CEM Orlando Pereira", type: "CEM" },
  { name: "EM Maria Hilda", type: "EM" },
  { name: "EM Paulo Freire", type: "EM" },
  { name: "EM José Anchieta", type: "EM" },
  { name: "ERM Álvares de Azevedo", type: "ERM" },
  { name: "ERM Cora Coralina", type: "ERM" },
  { name: "ERM Euclides da Cunha", type: "ERM" },
  { name: "ERM Osvaldo Cruz", type: "ERM" },
  { name: "ERM Vinicius de Moraes", type: "ERM" },
  { name: "Merenda", type: "DEPARTMENT" },
  { name: "Logística", type: "DEPARTMENT" },
  { name: "Almoxarifado", type: "DEPARTMENT" },
  { name: "SME", type: "DEPARTMENT" },
];

export const OCCURRENCE_TYPES = [
  "Furto", "Roubo", "Arrombamento", "Vandalismo",
  "Invasão", "Ameaça", "Pessoa suspeita",
  "Portão", "Muro", "Iluminação", "Cerca", "Câmeras", "Alarmes",
  "Elétrica", "Hidráulica", "Internet", "Telefonia",
  "Transporte Escolar", "Merenda", "Outros"
] as const;

export const PRIORITIES = ["Baixa", "Média", "Alta", "Urgente"] as const;
export const STATUSES = ["Aberto", "Em análise", "Encaminhado", "Em atendimento", "Aguardando parecer", "Concluído", "Cancelado"] as const;
