'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Camera, Save } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { SCHOOLS_SEED } from '@/types';
import toast from 'react-hot-toast';

type SchoolInfo = {
  address: string;
  cameras: string;
};

const STORAGE_KEY = 'nise_school_info';

const typeLabels: Record<string, string> = {
  CEI: 'CEI',
  CEM: 'CEM',
  EM: 'EM',
  ERM: 'ERM',
  DEPARTMENT: 'Departamento',
};

export default function SchoolsPage() {
  const [schoolInfo, setSchoolInfo] = useState<Record<string, SchoolInfo>>({});

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored) {
      setSchoolInfo(JSON.parse(stored));
    }
  }, []);

  const updateSchoolInfo = (schoolName: string, field: keyof SchoolInfo, value: string) => {
    setSchoolInfo(prev => ({
      ...prev,
      [schoolName]: {
        address: prev[schoolName]?.address || '',
        cameras: prev[schoolName]?.cameras || '',
        [field]: value,
      },
    }));
  };

  const saveSchoolInfo = () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(schoolInfo));
    toast.success('Informações das escolas salvas.');
  };

  const totalCameras = Object.values(schoolInfo).reduce((total, item) => {
    const cameras = Number(item.cameras || 0);
    return total + (Number.isFinite(cameras) ? cameras : 0);
  }, 0);

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex items-center gap-4 mb-2">
          <Link href="/dashboard" className="flex items-center gap-1 text-sm text-slate-500 hover:text-slate-700 transition-colors">
            <ArrowLeft className="w-4 h-4" /> Voltar
          </Link>
        </div>

        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-8">
          <div>
            <h1 className="text-4xl font-semibold tracking-tight">Escolas e Departamentos</h1>
            <p className="text-slate-500">Cadastro de endereço e quantidade de câmeras instaladas por unidade.</p>
          </div>
          <Button onClick={saveSchoolInfo} className="flex items-center gap-2">
            <Save className="w-4 h-4" /> Salvar informações
          </Button>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-6">
          <Card>
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-widest text-slate-500">Unidades</div>
              <div className="text-3xl font-semibold text-slate-900 mt-1">{SCHOOLS_SEED.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-widest text-slate-500">Câmeras instaladas</div>
              <div className="text-3xl font-semibold text-blue-700 mt-1 flex items-center gap-2">
                <Camera className="w-6 h-6" /> {totalCameras}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-5">
              <div className="text-xs uppercase tracking-widest text-slate-500">Com endereço informado</div>
              <div className="text-3xl font-semibold text-emerald-700 mt-1">
                {Object.values(schoolInfo).filter(item => item.address.trim()).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">Tabela de unidades</CardTitle>
          </CardHeader>
          <CardContent className="p-0 overflow-x-auto">
            <table className="w-full min-w-[900px]">
              <thead>
                <tr className="border-b bg-slate-50">
                  <th className="text-left py-4 px-6 font-medium text-xs uppercase tracking-widest text-slate-500">Escola / Departamento</th>
                  <th className="text-left py-4 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Tipo</th>
                  <th className="text-left py-4 px-4 font-medium text-xs uppercase tracking-widest text-slate-500">Endereço</th>
                  <th className="text-left py-4 px-6 font-medium text-xs uppercase tracking-widest text-slate-500">Câmeras instaladas</th>
                </tr>
              </thead>
              <tbody>
                {SCHOOLS_SEED.map((school) => (
                  <tr key={school.name} className="border-b last:border-none hover:bg-slate-50 transition-colors">
                    <td className="py-4 px-6 text-sm font-medium text-slate-900">{school.name}</td>
                    <td className="py-4 px-4 text-sm text-slate-600">{typeLabels[school.type]}</td>
                    <td className="py-4 px-4">
                      <Input
                        value={schoolInfo[school.name]?.address || ''}
                        onChange={(event) => updateSchoolInfo(school.name, 'address', event.target.value)}
                        placeholder="Informe o endereço"
                      />
                    </td>
                    <td className="py-4 px-6">
                      <Input
                        type="number"
                        min="0"
                        value={schoolInfo[school.name]?.cameras || ''}
                        onChange={(event) => updateSchoolInfo(school.name, 'cameras', event.target.value)}
                        placeholder="0"
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
