'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, CheckCircle2, Clock, AlertTriangle, XCircle, Send } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Call, User } from '@/types';

const statusFlow: Record<string, { role: string; next: string; label: string; icon: any }[]> = {
  Aberto: [
    { role: 'operator', next: 'Em atendimento', label: 'Iniciar Atendimento', icon: Clock },
  ],
  'Em atendimento': [
    { role: 'admin', next: 'Aguardando parecer', label: 'Solicitar Parecer', icon: Send },
    { role: 'admin', next: 'Concluído', label: 'Concluir Ocorrência', icon: CheckCircle2 },
  ],
  'Aguardando parecer': [
    { role: 'admin', next: 'Concluído', label: 'Concluir Ocorrência', icon: CheckCircle2 },
  ],
};

export default function CallDetailPage() {
  const params = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [call, setCall] = useState<Call | null>(null);
  const [opinion, setOpinion] = useState('');
  const [showOpinion, setShowOpinion] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('nise_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));

    const mockCalls: Call[] = [
      {
        id: 1, number: "NISE-250001", date: new Date(2025, 0, 15, 8, 30), schoolId: 1,
        school: { id: 1, name: "CEI Luiz Felipe", type: "CEI" },
        requester: "Maria Oliveira", phone: "(11) 94567-1122", type: "Vandalismo",
        priority: "Alta", description: "Pichação nas paredes externas e quebra de 3 vidros.",
        team: "Equipe Tática Alpha", status: "Em atendimento", responsible: "Supervisor Tático",
        createdAt: new Date(2025, 0, 15, 8, 30), updatedAt: new Date(2025, 0, 15, 8, 30),
      },
      {
        id: 2, number: "NISE-250002", date: new Date(2025, 0, 16, 14, 15), schoolId: 5,
        school: { id: 5, name: "CEM São Cristóvão", type: "CEM" },
        requester: "Prof. Carlos Mendes", phone: "(11) 99876-5544", type: "Invasão",
        priority: "Urgente", description: "Pessoa não autorizada foi vista dentro do pátio após o horário de aula.",
        team: "Equipe Bravo", status: "Aberto", createdAt: new Date(2025, 0, 16, 14, 15),
        updatedAt: new Date(2025, 0, 16, 14, 15),
      },
      {
        id: 3, number: "NISE-250003", date: new Date(2025, 0, 17, 9, 45), schoolId: 12,
        school: { id: 12, name: "EM Paulo Freire", type: "EM" },
        requester: "Diretora Ana Paula", phone: "(11) 97788-2233", type: "Furto",
        priority: "Média", description: "Roubados 2 notebooks da sala de informática durante o final de semana.",
        team: "Equipe Tática Alpha", status: "Concluído", closingDate: new Date(2025, 0, 18, 11, 0),
        closingResponsible: "Admin SME",
        opinion: "Equipe realizou perícia. Boletim de ocorrência registrado. Câmeras serão instaladas.",
        createdAt: new Date(2025, 0, 17, 9, 45), updatedAt: new Date(2025, 0, 18, 11, 0),
      },
      {
        id: 4, number: "NISE-250004", date: new Date(2025, 0, 18, 10, 20), schoolId: 3,
        school: { id: 3, name: "CEI Bruno Leonardo", type: "CEI" },
        requester: "Coordenador Pedro Lima", phone: "(11) 91234-5678", type: "Ameaça",
        priority: "Alta", description: "Recebemos ligação ameaçadora dizendo que havia uma bomba na escola.",
        team: "Equipe Delta", status: "Em análise", createdAt: new Date(2025, 0, 18, 10, 20),
        updatedAt: new Date(2025, 0, 18, 10, 20),
      },
    ];

    const found = mockCalls.find(c => c.id === Number(params.id));
    if (found) setCall(found);
  }, [params.id]);

  const handleTransition = (nextStatus: string) => {
    if (!call) return;
    const updated = { ...call, status: nextStatus as Call['status'], updatedAt: new Date() };
    if (nextStatus === 'Concluído' && opinion) {
      updated.opinion = opinion;
      updated.closingDate = new Date();
      updated.closingResponsible = user?.name;
    }
    setCall(updated);
    setShowOpinion(false);
    setOpinion('');
  };

  const getStatusBadge = (status: string) => {
    const colors: Record<string, string> = {
      'Aberto': 'bg-amber-100 text-amber-700',
      'Em análise': 'bg-purple-100 text-purple-700',
      'Encaminhado': 'bg-blue-100 text-blue-700',
      'Em atendimento': 'bg-indigo-100 text-indigo-700',
      'Aguardando parecer': 'bg-orange-100 text-orange-700',
      'Concluído': 'bg-emerald-100 text-emerald-700',
      'Cancelado': 'bg-red-100 text-red-700',
    };
    return colors[status] || 'bg-slate-100 text-slate-700';
  };

  const getPriorityBadge = (priority: string) => {
    const colors: Record<string, string> = {
      'Urgente': 'bg-red-100 text-red-700',
      'Alta': 'bg-orange-100 text-orange-700',
      'Média': 'bg-blue-100 text-blue-700',
      'Baixa': 'bg-slate-100 text-slate-700',
    };
    return colors[priority] || 'bg-slate-100 text-slate-700';
  };

  if (!call) return <div className="flex items-center justify-center min-h-screen">Carregando...</div>;

  const availableActions = statusFlow[call.status]?.filter(a => a.role === user?.role) || [];

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/calls" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>

        <div className="flex justify-between items-start mb-8">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-3xl font-semibold tracking-tight">{call.number}</h1>
              <span className={`text-xs px-3 py-1 rounded-full font-medium ${getStatusBadge(call.status)}`}>
                {call.status}
              </span>
              <span className={`text-xs px-3 py-1 rounded font-medium ${getPriorityBadge(call.priority)}`}>
                {call.priority}
              </span>
            </div>
            <p className="text-slate-500">{call.school?.name} • {call.type}</p>
          </div>
        </div>

        <div className="grid gap-6">
          {/* Details */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Detalhes da Ocorrência</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Solicitante</label>
                  <p className="font-medium mt-1">{call.requester}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Telefone</label>
                  <p className="font-medium mt-1">{call.phone || '—'}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Data</label>
                  <p className="font-medium mt-1">{format(call.date, "dd/MM/yyyy HH:mm", { locale: ptBR })}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Equipe</label>
                  <p className="font-medium mt-1">{call.team || '—'}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Responsável</label>
                  <p className="font-medium mt-1">{call.responsible || '—'}</p>
                </div>
                <div>
                  <label className="text-xs uppercase tracking-widest text-slate-500">Criado por</label>
                  <p className="font-medium mt-1">{call.createdBy ? 'Admin SME' : '—'}</p>
                </div>
                <div className="md:col-span-2">
                  <label className="text-xs uppercase tracking-widest text-slate-500">Descrição</label>
                  <p className="mt-1 text-slate-700 leading-relaxed">{call.description}</p>
                </div>
                {call.opinion && (
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Parecer</label>
                    <p className="mt-1 text-slate-700 leading-relaxed bg-slate-50 rounded-xl p-4 border">{call.opinion}</p>
                    {call.closingResponsible && (
                      <p className="text-xs text-slate-400 mt-2">
                        Concluído por {call.closingResponsible} em {call.closingDate && format(call.closingDate, "dd/MM/yyyy HH:mm", { locale: ptBR })}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Actions */}
          {availableActions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {availableActions.map((action) => (
                  <div key={action.next}>
                    {action.next === 'Concluído' && !showOpinion ? (
                      <Button onClick={() => setShowOpinion(true)} className="flex items-center gap-2">
                        <action.icon className="w-4 h-4" /> {action.label}
                      </Button>
                    ) : action.next === 'Concluído' && showOpinion ? (
                      <div className="space-y-3">
                        <textarea
                          placeholder="Descreva o parecer final..."
                          value={opinion}
                          onChange={(e) => setOpinion(e.target.value)}
                          className="w-full h-24 px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleTransition(action.next)} disabled={!opinion.trim()} className="flex items-center gap-2">
                            <CheckCircle2 className="w-4 h-4" /> Confirmar Conclusão
                          </Button>
                          <Button variant="outline" onClick={() => { setShowOpinion(false); setOpinion(''); }}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <Button onClick={() => handleTransition(action.next)} className="flex items-center gap-2">
                        <action.icon className="w-4 h-4" /> {action.label}
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          )}
        </div>

        <div className="text-xs text-center text-slate-400 mt-8">
          Desenvolvido pelo Departamento de Tecnologia da SME • NISE v1.0
        </div>
      </div>
    </div>
  );
}
