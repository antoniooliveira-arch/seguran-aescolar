'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ArrowLeft, Upload, X, Camera } from 'lucide-react';
import Link from 'next/link';
import { generateCallNumber } from '@/lib/utils';
import { SCHOOLS_SEED, OCCURRENCE_TYPES, PRIORITIES, User } from '@/types';
import toast from 'react-hot-toast';

export default function NewCallPage() {
  const [formData, setFormData] = useState({
    schoolId: '',
    requester: 'Supervisor',
    phone: '',
    type: '',
    priority: 'Média',
    description: '',
    team: 'Equipe Tatica Campo',
  });
  const [attachments, setAttachments] = useState<File[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [callNumber, setCallNumber] = useState('');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    const storedUser = localStorage.getItem('nise_user');
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
    setCallNumber(generateCallNumber());
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const storedUser = localStorage.getItem('nise_user');
      const user = storedUser ? JSON.parse(storedUser) : null;

      const res = await fetch('/api/calls', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          schoolId: formData.schoolId ? Number(formData.schoolId) : null,
          responsible: user?.name || null,
          createdBy: user?.id || null,
        }),
      });

      const data = await res.json();

      if (data.success) {
        toast.success('Ocorrência registrada com sucesso! Número: ' + data.call.number);

        setFormData({
          schoolId: '',
          requester: 'Supervisor',
          phone: '',
          type: '',
          priority: 'Média',
          description: '',
          team: 'Equipe Tatica Campo',
        });
        setAttachments([]);
        setCallNumber(generateCallNumber());

        setTimeout(() => {
          window.location.href = '/calls';
        }, 1500);
      } else {
        toast.error('Erro ao registrar ocorrência.');
      }
    } catch (error) {
      console.error('Error:', error);
      toast.error('Erro ao conectar com o servidor.');
    }

    setIsSubmitting(false);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const newFiles = Array.from(e.target.files);
      setAttachments(prev => [...prev, ...newFiles].slice(0, 6)); // max 6 files
    }
  };

  const removeAttachment = (index: number) => {
    setAttachments(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <div className="min-h-screen bg-slate-100">
      <div className="max-w-4xl mx-auto py-10 px-6">
        <div className="flex items-center gap-4 mb-8">
          <Link href={user?.role === 'tatico' || user?.role === 'operador_cftv' ? '/calls' : '/dashboard'} className="flex items-center gap-2 text-slate-500 hover:text-slate-700">
            <ArrowLeft className="w-5 h-5" /> Voltar
          </Link>
          <div className="h-5 w-px bg-slate-300" />
          <div>
            <div className="uppercase text-blue-600 text-xs font-semibold tracking-[1px]">NOVA OCORRÊNCIA</div>
            <h1 className="text-3xl font-semibold text-slate-900">Registrar Chamado</h1>
          </div>
          <div className="ml-auto font-mono text-xs bg-white px-4 py-2 rounded-3xl border text-slate-400">#{callNumber}</div>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="border-b">
            <CardTitle className="text-xl">Detalhes da Ocorrência</CardTitle>
          </CardHeader>
          <CardContent className="pt-8">
            <form onSubmit={handleSubmit} className="space-y-8">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Unidade Escolar / Departamento</label>
                  <Select 
                    value={formData.schoolId} 
                    onChange={(e) => setFormData({ ...formData, schoolId: e.target.value })}
                    required
                  >
                    <option value="">Selecione uma unidade...</option>
                    {SCHOOLS_SEED.map((school, index) => (
                      <option key={index} value={index + 1}>
                        {school.name}
                      </option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Solicitante</label>
                  <Input 
                    value={formData.requester}
                    onChange={(e) => setFormData({ ...formData, requester: e.target.value })}
                    className="bg-slate-50"
                    required
                  />
                </div>



                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Tipo de Ocorrência</label>
                  <Select 
                    value={formData.type} 
                    onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                    required
                  >
                    <option value="">Selecione o tipo...</option>
                    {OCCURRENCE_TYPES.map(type => (
                      <option key={type} value={type}>{type}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Prioridade</label>
                  <Select 
                    value={formData.priority} 
                    onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })}
                  >
                    {PRIORITIES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-slate-700">Equipe Responsável</label>
                  <Input 
                    value={formData.team}
                    className="bg-slate-50"
                    readOnly
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-700">Descrição da Ocorrência</label>
                <textarea 
                  className="w-full h-32 resize-y border border-slate-200 focus:border-blue-600 rounded-2xl px-4 py-3 text-sm"
                  placeholder="Descreva com detalhes o que aconteceu..."
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>

              {/* Attachments */}
              <div>
                <label className="text-sm font-medium text-slate-700 mb-3 block">Anexos (Fotos e Documentos)</label>
                
                <div className="border-2 border-dashed border-slate-300 hover:border-blue-300 rounded-3xl p-8 transition-colors text-center">
                  <div className="mx-auto w-12 h-12 bg-blue-50 rounded-2xl flex items-center justify-center mb-4">
                    <Upload className="w-6 h-6 text-blue-600" />
                  </div>
                  <p className="font-medium">Arraste arquivos ou clique para selecionar</p>
                  <p className="text-xs text-slate-500 mt-1">PNG, JPG, PDF até 15MB. Máximo 6 arquivos.</p>
                  
                  <input 
                    type="file" 
                    id="file-upload"
                    multiple 
                    accept="image/*,.pdf" 
                    className="hidden" 
                    onChange={handleFileChange}
                  />
                  <label 
                    htmlFor="file-upload"
                    className="mt-6 inline-flex items-center px-5 py-2.5 bg-white border text-sm rounded-2xl cursor-pointer hover:bg-slate-50 active:bg-slate-100"
                  >
                    Escolher arquivos
                  </label>
                </div>

                {attachments.length > 0 && (
                  <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-3">
                    {attachments.map((file, index) => (
                      <div key={index} className="bg-white border rounded-2xl p-3 flex items-center gap-3 group relative">
                        <div className="text-blue-500">
                          {file.type.startsWith('image') ? <Camera className="w-5 h-5" /> : '📄'}
                        </div>
                        <div className="text-xs truncate flex-1">
                          {file.name}
                        </div>
                        <button 
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="opacity-0 group-hover:opacity-100 absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-1 shadow"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  className="flex-1 h-12" 
                  onClick={() => window.history.back()}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="flex-1 h-12" 
                  disabled={isSubmitting || !formData.schoolId || !formData.requester || !formData.type || !formData.description}
                >
                  {isSubmitting ? 'Registrando Chamado...' : 'Registrar Ocorrência'}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>

        <div className="text-center text-xs text-slate-400 mt-8">
          Desenvolvido pelo Departamento de Tecnologia da SME • NISE v1.0
        </div>
      </div>
    </div>
  );
}
