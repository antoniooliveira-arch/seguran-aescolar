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
    { role: 'operador_cftv', next: 'Em atendimento', label: 'Iniciar Atendimento', icon: Clock },
    { role: 'tatico', next: 'Em atendimento', label: 'Atender Ocorrência', icon: Clock },
  ],
  'Em atendimento': [
    { role: 'tatico', next: 'Aguardando parecer', label: 'Solicitar Parecer', icon: Send },
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
  const [report, setReport] = useState('');
  const [showReport, setShowReport] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem('nise_user');
    if (!storedUser) {
      window.location.href = '/';
      return;
    }
    setUser(JSON.parse(storedUser));

    fetch('/api/calls')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const found = data.find((c: any) => c.id === Number(params.id));
          if (found) {
            setCall({ ...found, date: new Date(found.date), createdAt: new Date(found.createdAt), updatedAt: new Date(found.updatedAt), closingDate: found.closingDate ? new Date(found.closingDate) : undefined });
          }
        }
      })
      .catch(err => console.error('Error fetching call:', err));
  }, [params.id]);

  const handleTransition = async (nextStatus: string) => {
    if (!call) return;

    const body: Record<string, any> = { status: nextStatus };
    if (nextStatus === 'Concluído' && opinion) {
      body.opinion = opinion;
      body.closingDate = new Date().toISOString();
      body.closingResponsible = user?.name;
    }
    if ((nextStatus === 'Em atendimento' || nextStatus === 'Aguardando parecer') && report) {
      body.report = report;
    }

    try {
      const res = await fetch(`/api/calls/${call.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });

      const data = await res.json();
      if (data.success) {
        setCall(data.call);
      }
    } catch (error) {
      console.error('Error updating call:', error);
    }

    setShowOpinion(false);
    setOpinion('');
    setShowReport(false);
    setReport('');
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
                {call.report && (
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Relato da Equipe</label>
                    <p className="mt-1 text-slate-700 leading-relaxed bg-blue-50 rounded-xl p-4 border border-blue-100">{call.report}</p>
                  </div>
                )}
                {call.opinion && (
                  <div className="md:col-span-2">
                    <label className="text-xs uppercase tracking-widest text-slate-500">Parecer Final</label>
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
                    {(action.next === 'Em atendimento' || action.next === 'Aguardando parecer') && !showReport ? (
                      <Button onClick={() => setShowReport(true)} className="flex items-center gap-2">
                        <Send className="w-4 h-4" /> {action.next === 'Em atendimento' ? 'Registrar Ocorrido' : 'Solicitar Parecer'}
                      </Button>
                    ) : (action.next === 'Em atendimento' || action.next === 'Aguardando parecer') && showReport ? (
                      <div className="space-y-3">
                        <textarea
                          placeholder="Descreva o que foi feito e o que foi constatado..."
                          value={report}
                          onChange={(e) => setReport(e.target.value)}
                          className="w-full h-24 px-4 py-3 border border-slate-200 rounded-xl text-sm resize-none"
                        />
                        <div className="flex gap-2">
                          <Button onClick={() => handleTransition(action.next)} disabled={!report.trim()} className="flex items-center gap-2">
                            <Send className="w-4 h-4" /> {action.label}
                          </Button>
                          <Button variant="outline" onClick={() => { setShowReport(false); setReport(''); }}>
                            Cancelar
                          </Button>
                        </div>
                      </div>
                    ) : action.next === 'Concluído' && !showOpinion ? (
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
