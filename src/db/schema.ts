import {
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  varchar,
  jsonb,
  boolean,
} from "drizzle-orm/pg-core";
import { relations } from "drizzle-orm";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: varchar("email", { length: 255 }).notNull().unique(),
  passwordHash: text("password_hash").notNull(),
  role: text("role", { enum: ["admin", "supervisor", "tatico", "operador_cftv"] }).notNull().default("operador_cftv"),
  isActive: boolean("is_active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const schools = pgTable("schools", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  type: text("type", { enum: ["CEI", "CEM", "EM", "ERM", "DEPARTMENT"] }).notNull(),
  address: text("address"),
  phone: varchar("phone", { length: 20 }),
  createdAt: timestamp("created_at").defaultNow(),
});

export const calls = pgTable("calls", {
  id: serial("id").primaryKey(),
  number: varchar("number", { length: 20 }).notNull().unique(),
  date: timestamp("date").notNull().defaultNow(),
  schoolId: integer("school_id").references(() => schools.id),
  requester: text("requester").notNull(),
  phone: varchar("phone", { length: 20 }),
  type: text("type", { 
    enum: ["Furto", "Roubo", "Arrombamento", "Vandalismo", "Invasão", "Ameaça", "Pessoa suspeita", "Portão", "Muro", "Iluminação", "Cerca", "Câmeras", "Alarmes", "Elétrica", "Hidráulica", "Internet", "Telefonia", "Transporte Escolar", "Merenda", "Outros"] 
  }).notNull(),
  priority: text("priority", { enum: ["Baixa", "Média", "Alta", "Urgente"] }).notNull().default("Média"),
  description: text("description").notNull(),
  team: text("team"),
  status: text("status", { 
    enum: ["Aberto", "Em análise", "Encaminhado", "Em atendimento", "Aguardando parecer", "Concluído", "Cancelado"] 
  }).notNull().default("Aberto"),
  responsible: text("responsible"),
  report: text("report"),
  adminReport: text("admin_report"),
  closingDate: timestamp("closing_date"),
  closingResponsible: text("closing_responsible"),
  opinion: text("opinion"),
  createdBy: integer("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const attachments = pgTable("attachments", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").references(() => calls.id),
  filename: text("filename").notNull(),
  url: text("url").notNull(),
  type: text("type", { enum: ["image", "document"] }).notNull(),
  uploadedBy: integer("uploaded_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
});

export const callHistory = pgTable("call_history", {
  id: serial("id").primaryKey(),
  callId: integer("call_id").references(() => calls.id),
  action: text("action").notNull(),
  userId: integer("user_id").references(() => users.id),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const usersRelations = relations(users, ({ many }) => ({
  createdCalls: many(calls),
  attachments: many(attachments),
  history: many(callHistory),
}));

export const schoolsRelations = relations(schools, ({ many }) => ({
  calls: many(calls),
}));

export const callsRelations = relations(calls, ({ one, many }) => ({
  school: one(schools, {
    fields: [calls.schoolId],
    references: [schools.id],
  }),
  creator: one(users, {
    fields: [calls.createdBy],
    references: [users.id],
  }),
  attachments: many(attachments),
  history: many(callHistory),
}));

export const attachmentsRelations = relations(attachments, ({ one }) => ({
  call: one(calls, {
    fields: [attachments.callId],
    references: [calls.id],
  }),
}));

export const callHistoryRelations = relations(callHistory, ({ one }) => ({
  call: one(calls, {
    fields: [callHistory.callId],
    references: [calls.id],
  }),
  user: one(users, {
    fields: [callHistory.userId],
    references: [users.id],
  }),
}));
