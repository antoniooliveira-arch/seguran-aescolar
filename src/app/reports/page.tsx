'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select } from '@/components/ui/select';
import { ArrowLeft, BarChart3, Download, FileText } from 'lucide-react';
import Link from 'next/link';

const reportTypes = [
  { value: 'general', label: 'Relatório Geral' },
  { value: 'by-school', label: 'Por Escola' },
  { value: 'by-type', label: 'Por Tipo de Ocorrência' },
  { value: 'by-period', label: 'Por Período' },
];

export default function ReportsPage() {
  const [selectedReport, setSelectedReport] = useState('general');

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
        </div>

        <div className="grid lg:grid-cols-3 gap-6">
          {/* Report Selection */}
          <div className="lg:col-span-1 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Tipo de Relatório</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Select value={selectedReport} onChange={(e) => setSelectedReport(e.target.value)}>
                  {reportTypes.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </Select>

                <div className="pt-4 space-y-3">
                  <label className="block text-sm font-medium text-slate-700">Período</label>
                  <div className="grid grid-cols-2 gap-2">
                    <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                    <input type="date" className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm" />
                  </div>
                </div>

                <Button className="w-full flex items-center gap-2 mt-4">
                  <Download className="w-4 h-4" /> Exportar PDF
                </Button>
                <Button variant="outline" className="w-full flex items-center gap-2">
                  <Download className="w-4 h-4" /> Exportar CSV
                </Button>
              </CardContent>
            </Card>
          </div>

          {/* Report Preview */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-base">
                  <BarChart3 className="w-5 h-5" /> Prévia do Relatório
                </CardTitle>
              </CardHeader>
              <CardContent className="min-h-[400px] flex items-center justify-center bg-slate-50 rounded-b-3xl">
                <div className="text-center">
                  <div className="mx-auto w-16 h-16 rounded-full bg-blue-100 flex items-center justify-center mb-4">
                    <FileText className="w-8 h-8 text-blue-600" />
                  </div>
                  <p className="text-slate-400">Selecione o tipo de relatório e período</p>
                  <p className="text-xs text-slate-500 mt-1">Os dados serão carregados do banco de dados</p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        <div className="text-xs text-center text-slate-400 mt-8">
          Desenvolvido pelo Departamento de Tecnologia da SME • NISE v1.0
        </div>
      </div>
    </div>
  );
}
