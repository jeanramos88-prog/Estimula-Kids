import React, { useState } from 'react';
import { GoogleGenAI } from "@google/genai";
import ReactMarkdown from 'react-markdown';
import { 
  Baby, 
  Brain, 
  ChevronRight, 
  ClipboardList, 
  Download,
  FileText, 
  Heart, 
  Loader2, 
  Plus, 
  Printer,
  Sparkles, 
  User, 
  X 
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Skill, ChildProfile, GenerationResult } from './types';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const SKILLS: Skill[] = [
  "Coordenação motora ampla",
  "Coordenação motora fina",
  "Coordenação viso motora",
  "Aumento de força muscular",
  "Equilíbrio bipodal e unipodal",
  "Planejamento motor",
  "Noção espacial e temporal",
  "Esquema corporal",
  "Modulação de força",
  "Brincar funcional",
  "Brincar simbólico",
  "Imitação",
  "Bilateralidade",
  "Amplitude de movimento",
  "Controle de tronco",
  "Reações de proteção",
  "Atenção e concentração",
  "Socialização",
  "Cognição",
  "Auto cuidados",
  "Linguagem"
];

const COMMON_DISABILITIES = [
  "TEA (Transtorno do Espectro Autista)",
  "TDAH",
  "Síndrome de Down",
  "Paralisia Cerebral",
  "Atraso no Desenvolvimento Neuropsicomotor",
  "Deficiência Intelectual",
  "Deficiência Física",
  "Deficiência Visual",
  "Deficiência Auditiva"
];

export default function App() {
  const [profile, setProfile] = useState<ChildProfile>({
    name: '',
    age: '',
    disabilities: [],
    demand: '',
    description: '',
    selectedSkills: [],
    planType: 'both',
    activitiesPerMonth: 8
  });

  const [customDisability, setCustomDisability] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [result, setResult] = useState<GenerationResult | null>(null);
  const [activeTab, setActiveTab] = useState<'annual' | 'monthly'>('annual');

  const toggleSkill = (skill: Skill) => {
    setProfile(prev => ({
      ...prev,
      selectedSkills: prev.selectedSkills.includes(skill)
        ? prev.selectedSkills.filter(s => s !== skill)
        : [...prev.selectedSkills, skill]
    }));
  };

  const toggleDisability = (disability: string) => {
    setProfile(prev => ({
      ...prev,
      disabilities: prev.disabilities.includes(disability)
        ? prev.disabilities.filter(d => d !== disability)
        : [...prev.disabilities, disability]
    }));
  };

  const addCustomDisability = () => {
    if (customDisability.trim() && !profile.disabilities.includes(customDisability.trim())) {
      setProfile(prev => ({
        ...prev,
        disabilities: [...prev.disabilities, customDisability.trim()]
      }));
      setCustomDisability('');
    }
  };

  const generatePlans = async () => {
    setIsGenerating(true);
    setResult(null);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) {
        throw new Error("API Key não encontrada. Verifique as configurações.");
      }
      const ai = new GoogleGenAI({ apiKey });
      
      let planRequest = "";
      if (profile.planType === 'annual') {
        planRequest = "Crie APENAS um plano de desenvolvimento ANUAL.";
      } else if (profile.planType === 'monthly') {
        planRequest = `Crie APENAS um plano de desenvolvimento MENSAL contendo exatamente ${profile.activitiesPerMonth} atividades práticas.`;
      } else {
        planRequest = `Crie um plano de desenvolvimento ANUAL e um plano MENSAL detalhado contendo exatamente ${profile.activitiesPerMonth} atividades práticas.`;
      }

      const prompt = `
        Você é um especialista em Educação Física Adaptada e Estimulação Precoce.
        ${planRequest}
        
        Perfil da criança:
        Nome: ${profile.name || 'Criança'}
        Idade: ${profile.age}
        Deficiências: ${profile.disabilities.join(', ')}
        Demanda Principal: ${profile.demand}
        Descrição Adicional: ${profile.description}
        Habilidades a serem trabalhadas: ${profile.selectedSkills.join(', ')}

        O plano deve ser estruturado em Markdown.
        O plano ANUAL (se solicitado) deve conter objetivos gerais para cada trimestre.
        O plano MENSAL (se solicitado) deve conter as ${profile.activitiesPerMonth} atividades práticas específicas, com materiais necessários e adaptações sugeridas.
        Use um tom profissional, encorajador e focado na inclusão e no desenvolvimento motor.
        
        Retorne no formato JSON com as chaves "annualPlan" (string ou null) e "monthlyPlan" (string ou null).
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json"
        }
      });

      let text = response.text || '{}';
      // Remove markdown code blocks if the model accidentally included them
      text = text.replace(/```json\n?|```/g, '').trim();
      
      const data = JSON.parse(text);
      setResult(data);
      
      // Set active tab based on what was generated
      if (profile.planType === 'monthly') {
        setActiveTab('monthly');
      } else {
        setActiveTab('annual');
      }
    } catch (error) {
      console.error("Erro ao gerar planos:", error);
      alert("Ocorreu um erro ao gerar os planos. Verifique sua conexão e tente novamente.");
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#fdfcf8] text-[#3a3a30] font-serif selection:bg-[#e6e2d3]">
      {/* Header */}
      <header className="border-b border-[#e6e2d3] bg-white/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-[#5A5A40] rounded-full flex items-center justify-center text-white">
              <Sparkles size={20} />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-[#5A5A40]">EstimulaKids</h1>
          </div>
          <p className="text-sm italic opacity-70 hidden sm:block">Educação Física e Estimulação Precoce</p>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Form Section */}
          <div className="lg:col-span-5 space-y-8">
            <section className="space-y-6">
              <div className="flex items-center gap-2 text-[#5A5A40]">
                <User size={20} />
                <h2 className="text-xl font-semibold">Perfil da Criança</h2>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-1.5 opacity-60">Nome (Opcional)</label>
                  <input 
                    type="text" 
                    value={profile.name}
                    onChange={e => setProfile(p => ({...p, name: e.target.value}))}
                    placeholder="Ex: João Silva"
                    className="w-full bg-white border border-[#e6e2d3] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all font-sans"
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold mb-1.5 opacity-60">Idade</label>
                    <input 
                      type="text" 
                      value={profile.age}
                      onChange={e => setProfile(p => ({...p, age: e.target.value}))}
                      placeholder="Ex: 3 anos"
                      className="w-full bg-white border border-[#e6e2d3] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all font-sans"
                    />
                  </div>
                  <div>
                    <label className="block text-xs uppercase tracking-widest font-bold mb-1.5 opacity-60">Demanda</label>
                    <input 
                      type="text" 
                      value={profile.demand}
                      onChange={e => setProfile(p => ({...p, demand: e.target.value}))}
                      placeholder="Ex: Marcha"
                      className="w-full bg-white border border-[#e6e2d3] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all font-sans"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-1.5 opacity-60">Deficiências</label>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {COMMON_DISABILITIES.map(d => (
                      <button
                        key={d}
                        onClick={() => toggleDisability(d)}
                        className={cn(
                          "px-3 py-1.5 rounded-full text-xs font-sans transition-all border",
                          profile.disabilities.includes(d) 
                            ? "bg-[#5A5A40] text-white border-[#5A5A40]" 
                            : "bg-white text-[#5A5A40] border-[#e6e2d3] hover:border-[#5A5A40]"
                        )}
                      >
                        {d}
                      </button>
                    ))}
                  </div>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      value={customDisability}
                      onChange={e => setCustomDisability(e.target.value)}
                      placeholder="Outra deficiência..."
                      className="flex-1 bg-white border border-[#e6e2d3] rounded-2xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all font-sans"
                    />
                    <button 
                      onClick={addCustomDisability}
                      className="p-2 bg-[#e6e2d3] text-[#5A5A40] rounded-2xl hover:bg-[#dcd8c8] transition-all"
                    >
                      <Plus size={20} />
                    </button>
                  </div>
                  {profile.disabilities.filter(d => !COMMON_DISABILITIES.includes(d)).length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-3">
                      {profile.disabilities.filter(d => !COMMON_DISABILITIES.includes(d)).map(d => (
                        <span key={d} className="inline-flex items-center gap-1 px-3 py-1 bg-[#f0eee4] rounded-full text-xs font-sans border border-[#e6e2d3]">
                          {d}
                          <button onClick={() => toggleDisability(d)} className="hover:text-red-500"><X size={12} /></button>
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="block text-xs uppercase tracking-widest font-bold mb-1.5 opacity-60">Descrição / Observações</label>
                  <textarea 
                    value={profile.description}
                    onChange={e => setProfile(p => ({...p, description: e.target.value}))}
                    placeholder="Descreva um pouco sobre a criança, suas preferências, limitações e contexto..."
                    rows={4}
                    className="w-full bg-white border border-[#e6e2d3] rounded-2xl px-4 py-3 focus:outline-none focus:ring-2 focus:ring-[#5A5A40]/20 transition-all font-sans resize-none"
                  />
                </div>

                <div className="pt-4 border-t border-[#e6e2d3] space-y-4">
                  <div className="flex items-center gap-2 text-[#5A5A40]">
                    <ClipboardList size={18} />
                    <h3 className="font-bold text-sm uppercase tracking-wider">Configurações do Plano</h3>
                  </div>
                  
                  <div className="grid grid-cols-1 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest font-bold mb-1.5 opacity-60">Tipo de Plano</label>
                      <div className="flex p-1 bg-[#f5f5f0] rounded-2xl border border-[#e6e2d3]">
                        {(['annual', 'monthly', 'both'] as const).map((type) => (
                          <button
                            key={type}
                            onClick={() => setProfile(p => ({ ...p, planType: type }))}
                            className={cn(
                              "flex-1 py-2 text-xs font-bold rounded-xl transition-all",
                              profile.planType === type 
                                ? "bg-white text-[#5A5A40] shadow-sm" 
                                : "text-[#a09c8a] hover:text-[#5A5A40]"
                            )}
                          >
                            {type === 'annual' ? 'Anual' : type === 'monthly' ? 'Mensal' : 'Ambos'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {profile.planType !== 'annual' && (
                      <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        className="space-y-2"
                      >
                        <label className="block text-xs uppercase tracking-widest font-bold mb-1.5 opacity-60">
                          Atividades no Mês: <span className="text-[#5A5A40]">{profile.activitiesPerMonth}</span>
                        </label>
                        <input 
                          type="range"
                          min="4"
                          max="20"
                          step="1"
                          value={profile.activitiesPerMonth}
                          onChange={e => setProfile(p => ({ ...p, activitiesPerMonth: parseInt(e.target.value) }))}
                          className="w-full accent-[#5A5A40] cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-[#a09c8a] font-bold uppercase tracking-tighter">
                          <span>4 Ativ.</span>
                          <span>12 Ativ.</span>
                          <span>20 Ativ.</span>
                        </div>
                      </motion.div>
                    )}
                  </div>
                </div>
              </div>
            </section>

            <section className="space-y-6">
              <div className="flex items-center gap-2 text-[#5A5A40]">
                <Brain size={20} />
                <h2 className="text-xl font-semibold">Habilidades Alvo</h2>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SKILLS.map(skill => (
                  <label 
                    key={skill}
                    className={cn(
                      "flex items-center gap-3 p-3 rounded-2xl border cursor-pointer transition-all",
                      profile.selectedSkills.includes(skill)
                        ? "bg-[#f5f5f0] border-[#5A5A40] shadow-sm"
                        : "bg-white border-[#e6e2d3] hover:border-[#5A5A40]/50"
                    )}
                  >
                    <input 
                      type="checkbox"
                      checked={profile.selectedSkills.includes(skill)}
                      onChange={() => toggleSkill(skill)}
                      className="hidden"
                    />
                    <div className={cn(
                      "w-5 h-5 rounded-md border flex items-center justify-center transition-all",
                      profile.selectedSkills.includes(skill) ? "bg-[#5A5A40] border-[#5A5A40]" : "border-[#e6e2d3]"
                    )}>
                      {profile.selectedSkills.includes(skill) && <Sparkles size={12} className="text-white" />}
                    </div>
                    <span className="text-sm font-sans">{skill}</span>
                  </label>
                ))}
              </div>
            </section>

            <button
              onClick={generatePlans}
              disabled={isGenerating || !profile.age || profile.selectedSkills.length === 0}
              className={cn(
                "w-full py-4 rounded-full font-bold text-lg flex items-center justify-center gap-3 transition-all shadow-lg",
                isGenerating || !profile.age || profile.selectedSkills.length === 0
                  ? "bg-[#e6e2d3] text-[#a09c8a] cursor-not-allowed"
                  : "bg-[#5A5A40] text-white hover:bg-[#4a4a35] active:scale-95"
              )}
            >
              {isGenerating ? (
                <>
                  <Loader2 className="animate-spin" size={24} />
                  <span>Criando Planos...</span>
                </>
              ) : (
                <>
                  <Sparkles size={24} />
                  <span>Gerar Planos de Desenvolvimento</span>
                </>
              )}
            </button>
          </div>

          {/* Result Section */}
          <div className="lg:col-span-7">
            <AnimatePresence mode="wait">
              {!result && !isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="h-full flex flex-col items-center justify-center text-center p-12 border-2 border-dashed border-[#e6e2d3] rounded-[32px] bg-white/50"
                >
                  <div className="w-20 h-20 bg-[#f5f5f0] rounded-full flex items-center justify-center text-[#5A5A40] mb-6">
                    <ClipboardList size={40} />
                  </div>
                  <h3 className="text-2xl font-bold text-[#5A5A40] mb-2">Pronto para começar?</h3>
                  <p className="text-[#7a7a6a] max-w-sm">
                    Preencha os dados da criança e selecione as habilidades para gerar um plano personalizado de educação física adaptada.
                  </p>
                </motion.div>
              ) : isGenerating ? (
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="h-full flex flex-col items-center justify-center p-12 space-y-8"
                >
                  <div className="relative">
                    <Loader2 className="animate-spin text-[#5A5A40]" size={64} />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-[#5A5A40]/50" size={32} />
                  </div>
                  <div className="text-center space-y-2">
                    <h3 className="text-2xl font-bold text-[#5A5A40]">A mágica está acontecendo...</h3>
                    <p className="text-[#7a7a6a] italic">Consultando diretrizes de estimulação precoce e adaptando atividades...</p>
                  </div>
                </motion.div>
              ) : (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="bg-white border border-[#e6e2d3] rounded-[32px] shadow-xl overflow-hidden flex flex-col h-full min-h-[600px]"
                >
                  {/* Tabs */}
                  <div className="flex border-b border-[#e6e2d3]">
                    {(profile.planType === 'annual' || profile.planType === 'both') && (
                      <button 
                        onClick={() => setActiveTab('annual')}
                        className={cn(
                          "flex-1 py-6 text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          activeTab === 'annual' ? "bg-[#fdfcf8] text-[#5A5A40] border-b-2 border-[#5A5A40]" : "text-[#a09c8a] hover:bg-[#fdfcf8]"
                        )}
                      >
                        <FileText size={18} />
                        Plano Anual
                      </button>
                    )}
                    {(profile.planType === 'monthly' || profile.planType === 'both') && (
                      <button 
                        onClick={() => setActiveTab('monthly')}
                        className={cn(
                          "flex-1 py-6 text-sm font-bold uppercase tracking-widest transition-all flex items-center justify-center gap-2",
                          activeTab === 'monthly' ? "bg-[#fdfcf8] text-[#5A5A40] border-b-2 border-[#5A5A40]" : "text-[#a09c8a] hover:bg-[#fdfcf8]"
                        )}
                      >
                        <ClipboardList size={18} />
                        Plano Mensal
                      </button>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 overflow-y-auto p-8 sm:p-12 prose prose-stone max-w-none prose-headings:text-[#5A5A40] prose-headings:font-serif prose-p:font-sans prose-li:font-sans">
                    <div className="print-only mb-8 border-b-2 border-[#5A5A40] pb-4">
                      <h1 className="text-3xl font-bold text-[#5A5A40] mb-1">EstimulaKids</h1>
                      <p className="text-sm italic text-[#7a7a6a]">Plano de Desenvolvimento Motor Personalizado</p>
                      <div className="mt-4 grid grid-cols-2 gap-4 text-sm font-sans">
                        <div><strong>Criança:</strong> {profile.name || 'Não informado'}</div>
                        <div><strong>Idade:</strong> {profile.age}</div>
                        <div><strong>Data:</strong> {new Date().toLocaleDateString('pt-BR')}</div>
                        <div><strong>Tipo:</strong> {activeTab === 'annual' ? 'Plano Anual' : 'Plano Mensal'}</div>
                      </div>
                    </div>
                    <ReactMarkdown>
                      {activeTab === 'annual' ? result?.annualPlan || '' : result?.monthlyPlan || ''}
                    </ReactMarkdown>
                  </div>

                  {/* Footer Action */}
                  <div className="p-6 bg-[#fdfcf8] border-t border-[#e6e2d3] flex flex-col sm:flex-row justify-between items-center gap-4 no-print">
                    <div className="flex items-center gap-2 text-xs text-[#7a7a6a] font-sans italic">
                      <Heart size={14} className="text-red-400" />
                      Desenvolvido para transformar vidas através do movimento
                    </div>
                    <div className="flex items-center gap-3">
                      <button 
                        onClick={() => window.print()}
                        className="bg-white border border-[#e6e2d3] text-[#5A5A40] px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#f5f5f0] transition-all"
                      >
                        <Printer size={16} />
                        Imprimir
                      </button>
                      <button 
                        onClick={() => window.print()}
                        className="bg-[#5A5A40] text-white px-4 py-2 rounded-xl text-sm font-bold flex items-center gap-2 hover:bg-[#4a4a35] transition-all shadow-md"
                      >
                        <Download size={16} />
                        Salvar PDF
                      </button>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Background Elements */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute -top-24 -right-24 w-96 h-96 bg-[#5A5A40]/5 rounded-full blur-3xl" />
        <div className="absolute -bottom-24 -left-24 w-96 h-96 bg-[#e6e2d3]/20 rounded-full blur-3xl" />
      </div>
    </div>
  );
}
