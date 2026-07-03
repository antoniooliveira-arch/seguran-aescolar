'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { ArrowLeft, BarChart3, Download, FileText, Printer } from 'lucide-react';
import Link from 'next/link';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { Call, User, ROLE_LABELS } from '@/types';

export default function ReportsPage() {
  const [user, setUser] = useState<User | null>(null);
  const [calls, setCalls] = useState<any[]>([]);
  const [filteredCalls, setFilteredCalls] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [schoolFilter, setSchoolFilter] = useState('all');
  const [roleFilter, setRoleFilter] = useState('all');
  const reportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('nise_user');
    if (!storedUser) { window.location.href = '/'; return; }
    const parsedUser = JSON.parse(storedUser);
    if (parsedUser.role !== 'admin' && parsedUser.role !== 'supervisor') {
      window.location.href = '/dashboard';
      return;
    }
    setUser(parsedUser);
  }, []);

  useEffect(() => {
    fetch('/api/calls')
      .then(res => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setCalls(data);
          setFilteredCalls(data);
        }
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    let result = [...calls];
    if (dateStart) {
      result = result.filter(c => new Date(c.date) >= new Date(dateStart));
    }
    if (dateEnd) {
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59, 999);
      result = result.filter(c => new Date(c.date) <= end);
    }
    if (statusFilter !== 'all') {
      result = result.filter(c => c.status === statusFilter);
    }
    if (schoolFilter !== 'all') {
      result = result.filter(c => c.school?.name === schoolFilter);
    }
    if (roleFilter === 'tatico_admin') {
      result = result.filter(c => c.creator?.role === 'tatico' || c.creator?.role === 'admin');
    } else if (roleFilter !== 'all') {
      result = result.filter(c => c.creator?.role === roleFilter);
    }
    setFilteredCalls(result);
  }, [dateStart, dateEnd, statusFilter, schoolFilter, roleFilter, calls]);

  const schools = [...new Set(calls.map(c => c.school?.name).filter(Boolean))] as string[];

  const handlePrint = () => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    const content = reportRef.current?.innerHTML || '';
    const statusText = statusFilter === 'all' ? 'Todos' : statusFilter;
    const periodText = dateStart && dateEnd
      ? `${format(new Date(dateStart), 'dd/MM/yyyy')} a ${format(new Date(dateEnd), 'dd/MM/yyyy')}`
      : dateStart
        ? `A partir de ${format(new Date(dateStart), 'dd/MM/yyyy')}`
        : dateEnd
          ? `Até ${format(new Date(dateEnd), 'dd/MM/yyyy')}`
          : 'Todo o período';

    printWindow.document.write(`
      <html>
      <head>
        <title>Relatório NISE</title>
        <style>
          @page { margin: 20mm; }
          * { box-sizing: border-box; }
          body { font-family: Arial, sans-serif; font-size: 12px; color: #222; padding: 0; margin: 0; }
          .header { text-align: center; border-bottom: 2px solid #1e40af; padding-bottom: 16px; margin-bottom: 24px; }
          .header h1 { font-size: 20px; margin: 0; color: #1e40af; }
          .header p { font-size: 11px; color: #666; margin: 4px 0 0; }
          .filters { font-size: 11px; color: #555; margin-bottom: 16px; }
          .filters strong { color: #333; }
          table { width: 100%; border-collapse: collapse; margin-top: 8px; }
          th { background: #1e40af; color: white; padding: 8px 10px; text-align: left; font-size: 10px; text-transform: uppercase; }
          td { padding: 7px 10px; border-bottom: 1px solid #ddd; font-size: 11px; vertical-align: top; }
          .notes { white-space: pre-wrap; line-height: 1.4; }
          tr:nth-child(even) { background: #f8fafc; }
          .footer { text-align: center; font-size: 10px; color: #999; margin-top: 32px; border-top: 1px solid #ddd; padding-top: 12px; }
          .badge { display: inline-block; padding: 2px 8px; border-radius: 10px; font-size: 10px; }
          .summary { display: flex; gap: 16px; margin-bottom: 20px; flex-wrap: wrap; }
          .summary-card { flex: 1; min-width: 120px; border: 1px solid #ddd; border-radius: 8px; padding: 12px; text-align: center; }
          .summary-card .num { font-size: 22px; font-weight: bold; color: #1e40af; }
          .summary-card .label { font-size: 10px; color: #666; text-transform: uppercase; }
          @media print {
            .no-print { display: none; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            th { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .summary-card { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>NISE - Núcleo Integrado de Segurança Escolar</h1>
          <p>Relatório de Ocorrências • ${periodText}</p>
          <p>Gerado em ${format(new Date(), "dd/MM/yyyy 'às' HH:mm")}</p>
        </div>
        <div class="filters">
          <strong>Status:</strong> ${statusText} |
          <strong>Período:</strong> ${periodText} |
          <strong>Total de registros:</strong> ${filteredCalls.length}
        </div>
        ${content}
        <div class="footer">
          Desenvolvido pelo Departamento de Tecnologia da SME • NISE v1.0
        </div>
        <script>window.print(); window.close();</script>
      </body>
      </html>
    `);
    printWindow.document.close();
  };

  const statusColors: Record<string, string> = {
    'Aberto': 'bg-amber-100 text-amber-700',
    'Em análise': 'bg-purple-100 text-purple-700',
    'Encaminhado': 'bg-blue-100 text-blue-700',
    'Em atendimento': 'bg-indigo-100 text-indigo-700',
    'Aguardando parecer': 'bg-orange-100 text-orange-700',
    'Concluído': 'bg-emerald-100 text-emerald-700',
    'Cancelado': 'bg-red-100 text-red-700',
  };

  const roleColors: Record<string, string> = {
    admin: 'bg-red-100 text-red-700',
    supervisor: 'bg-blue-100 text-blue-700',
    tatico: 'bg-purple-100 text-purple-700',
    operador_cftv: 'bg-emerald-100 text-emerald-700',
  };

  const periodCalls = calls.filter(c => {
    if (dateStart && new Date(c.date) < new Date(dateStart)) return false;
    if (dateEnd) {
      const end = new Date(dateEnd);
      end.setHours(23, 59, 59, 999);
      if (new Date(c.date) > end) return false;
    }
    if (schoolFilter !== 'all' && c.school?.name !== schoolFilter) return false;
    return true;
  });

  const total = periodCalls.length;
  const abertos = periodCalls.filter(c => c.status === 'Aberto').length;
  const emAtendimento = periodCalls.filter(c => c.status === 'Em atendimento').length;
  const concluidos = periodCalls.filter(c => c.status === 'Concluído').length;
  const totalOperador = periodCalls.filter(c => c.creator?.role === 'operador_cftv').length;
  const totalTatico = periodCalls.filter(c => c.creator?.role === 'tatico').length;
  const totalAdmin = periodCalls.filter(c => c.creator?.role === 'admin').length;

  const applySummaryFilter = (status: string, role: string = 'all') => {
    setStatusFilter(status);
    setRoleFilter(role);
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>

        <div className="flex justify-between items-end mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Relatórios</h1>
            <p className="text-slate-500">Geração e exportação de relatórios do NISE</p>
          </div>
          <Button onClick={handlePrint} className="flex items-center gap-2">
            <Printer className="w-4 h-4" /> Gerar PDF
          </Button>
        </div>

        <div className="grid lg:grid-cols-5 gap-4 mb-6">
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Data Início</label>
            <input type="date" value={dateStart} onChange={e => setDateStart(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Data Fim</label>
            <input type="date" value={dateEnd} onChange={e => setDateEnd(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Status</label>
            <Select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="Aberto">Aberto</option>
              <option value="Em atendimento">Em atendimento</option>
              <option value="Aguardando parecer">Aguardando parecer</option>
              <option value="Concluído">Concluído</option>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Escola</label>
            <Select value={schoolFilter} onChange={e => setSchoolFilter(e.target.value)}>
              <option value="all">Todas</option>
              {schools.map(s => <option key={s} value={s}>{s}</option>)}
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-xs font-medium text-slate-600">Registrado por</label>
            <Select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
              <option value="all">Todos</option>
              <option value="operador_cftv">Operador de CFTV</option>
              <option value="tatico">Tático</option>
              <option value="admin">Administrador</option>
              <option value="tatico_admin">Tático + Admin</option>
            </Select>
          </div>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-6 gap-4 mb-6">
          <Card onClick={() => applySummaryFilter('all')} className="cursor-pointer hover:shadow-md transition-shadow"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-blue-700">{total}</div>
            <div className="text-xs text-slate-500 uppercase">Total</div>
          </CardContent></Card>
          <Card onClick={() => applySummaryFilter('Aberto')} className="cursor-pointer hover:shadow-md transition-shadow"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{abertos}</div>
            <div className="text-xs text-slate-500 uppercase">Abertos</div>
          </CardContent></Card>
          <Card onClick={() => applySummaryFilter('Em atendimento')} className="cursor-pointer hover:shadow-md transition-shadow"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-indigo-600">{emAtendimento}</div>
            <div className="text-xs text-slate-500 uppercase">Atendimento</div>
          </CardContent></Card>
          <Card onClick={() => applySummaryFilter('Concluído')} className="cursor-pointer hover:shadow-md transition-shadow"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-600">{concluidos}</div>
            <div className="text-xs text-slate-500 uppercase">Concluídos</div>
          </CardContent></Card>
          <Card onClick={() => applySummaryFilter('all', 'operador_cftv')} className="cursor-pointer hover:shadow-md transition-shadow"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-emerald-700">{totalOperador}</div>
            <div className="text-xs text-slate-500 uppercase">CFTV</div>
          </CardContent></Card>
          <Card onClick={() => applySummaryFilter('all', 'tatico_admin')} className="cursor-pointer hover:shadow-md transition-shadow"><CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-purple-700">{totalTatico + totalAdmin}</div>
            <div className="text-xs text-slate-500 uppercase">Tático + Admin</div>
          </CardContent></Card>
        </div>

        {/* Report Table */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <FileText className="w-5 h-5" /> Relatório de Ocorrências
              <span className="text-xs font-normal text-slate-400 ml-auto">{filteredCalls.length} registro(s)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div ref={reportRef}>
              <table className="w-full">
                <thead>
                  <tr className="border-b bg-slate-50">
                    <th className="text-left py-4 px-6 font-medium text-xs uppercase tracking-widest text-slate-500">Nº</th>
                    <th className="text-left py-4 px-3 font-medium text-xs uppercase tracking-widest text-slate-500">Data</th>
                    <th className="text-left py-4 px-3 font-medium text-xs uppercase tracking-widest text-slate-500">Escola</th>
                    <th className="text-left py-4 px-3 font-medium text-xs uppercase tracking-widest text-slate-500">Tipo</th>
                    <th className="text-left py-4 px-3 font-medium text-xs uppercase tracking-widest text-slate-500">Status</th>
                    <th className="text-left py-4 px-3 font-medium text-xs uppercase tracking-widest text-slate-500">Registrado por</th>
                    <th className="text-left py-4 px-3 font-medium text-xs uppercase tracking-widest text-slate-500">Descrição OP. CFTV</th>
                    <th className="text-left py-4 px-3 font-medium text-xs uppercase tracking-widest text-slate-500">Descrição Tático</th>
                    <th className="text-right py-4 px-6 font-medium text-xs uppercase tracking-widest text-slate-500">Equipe</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr><td colSpan={9} className="p-20 text-center text-slate-400">Carregando...</td></tr>
                  ) : filteredCalls.length === 0 ? (
                    <tr><td colSpan={9} className="p-20 text-center text-slate-400">Nenhum registro encontrado.</td></tr>
                  ) : (
                    filteredCalls.map((call) => (
                      <tr key={call.id} className="border-b last:border-none hover:bg-slate-50 transition-colors">
                        <td className="py-4 px-6 font-medium text-sm">{call.number}</td>
                        <td className="py-4 px-3 text-sm text-slate-600">{format(call.date, "dd/MM/yyyy", { locale: ptBR })}</td>
                        <td className="py-4 px-3 text-sm">{call.school?.name || '—'}</td>
                        <td className="py-4 px-3 text-sm">{call.type}</td>
                        <td className="py-4 px-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${statusColors[call.status] || 'bg-slate-100 text-slate-700'}`}>
                            {call.status}
                          </span>
                        </td>
                        <td className="py-4 px-3">
                          <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${roleColors[call.creator?.role] || 'bg-slate-100'}`}>
                            {ROLE_LABELS[call.creator?.role as keyof typeof ROLE_LABELS] || call.creator?.name || '—'}
                          </span>
                        </td>
                        <td className="py-4 px-3 text-sm text-slate-600 whitespace-pre-wrap max-w-[240px]">{call.description || '—'}</td>
                        <td className="py-4 px-3 text-sm text-slate-600 whitespace-pre-wrap max-w-[240px]">{call.report || '—'}</td>
                        <td className="py-4 px-6 text-sm text-right">{call.team || '—'}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>

        <div className="text-xs text-center text-slate-400 mt-8">
          Desenvolvido pelo Departamento de Tecnologia da SME • NISE v1.0
        </div>
      </div>
    </div>
  );
}
