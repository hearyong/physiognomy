'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Scan, 
  Users, 
  UserCheck, 
  Activity, 
  Brain, 
  Sparkles,
  RefreshCw,
  AlertCircle,
  FolderHeart
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { CameraCapture } from '@/components/CameraCapture';

// Firebase Database & Auth
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

interface SubjectResult {
  id: number;
  mindImage: string;
  health: {
    currentCondition: string;
    potentialRisks: string[];
    improvements: string[];
  };
  personality: {
    mbti: string;
    enneagram: string;
    rationale: string;
  };
}

interface RelationshipResult {
  synergyScore: number | null;
  compatibilityText: string | null;
  cautions: string[];
}

interface AnalysisReport {
  isRelationship: boolean;
  mode: 'single' | 'relationship' | 'self';
  subjects: SubjectResult[];
  relationship?: RelationshipResult;
}

export default function FacialAnalysisPage() {
  const [step, setStep] = useState<'setup' | 'loading' | 'result'>('setup');
  const [mode, setMode] = useState<'single' | 'relationship' | 'self'>('single');
  
  // Image buffers
  const [image1, setImage1] = useState<string>('');
  const [image2, setImage2] = useState<string>('');
  
  // Loading state simulation
  const [loadingProgress, setLoadingProgress] = useState(0);
  const [loadingText, setLoadingText] = useState('시스템 통신 링크 연결 중...');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Completed report
  const [report, setReport] = useState<AnalysisReport | null>(null);
  const [savingStatus, setSavingStatus] = useState<'idle' | 'saving' | 'saved' | 'failed'>('idle');

  // Loading text sequences
  useEffect(() => {
    if (step !== 'loading') return;

    const timer = setInterval(() => {
      setLoadingProgress(prev => {
        const next = prev + 1;
        if (next >= 100) {
          clearInterval(timer);
          return 99; // Hold at 99% until API responds
        }
        
        // Progress status updates
        if (next === 15) setLoadingText('안면 생리학적 특징점 디코딩 중...');
        if (next === 35) setLoadingText('피부톤 및 혈액 순환 안색 판독 중...');
        if (next === 55) setLoadingText('안면 행동학적 MBTI / 에니어그램 정밀 추론 중...');
        if (next === 75) setLoadingText('잠재적 건강 인프라 리스크 취합 중...');
        if (next === 90) setLoadingText('종합 사이버네틱 HUD 보고서 패키지 조립 중...');
        
        return next;
      });
    }, 180);

    return () => clearInterval(timer);
  }, [step]);

  // Execute AI Scan handler
  const handleExecuteScan = async () => {
    setErrorMessage(null);
    setLoadingProgress(0);
    setLoadingText('시스템 분석 코어 점화 중...');
    setStep('loading');

    const imagesToAnalyze = mode === 'single' ? [image1] : [image1, image2];

    try {
      const response = await fetch('/api/analyze-face', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          images: imagesToAnalyze,
          mode: mode
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '분석 중 원격 API 연결 오류가 발생했습니다.');
      }

      setReport(data);
      setLoadingProgress(100);
      setLoadingText('보고서 생성 성공.');
      setStep('result');
      
      // Auto-save history if logged in
      if (auth && auth.currentUser) {
        saveReportToFirestore(data, imagesToAnalyze);
      }
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || '알 수 없는 시스템 인터페이스 장애입니다.');
      setStep('setup');
    }
  };

  // Firestore save history
  const saveReportToFirestore = async (reportData: AnalysisReport, images: string[]) => {
    if (!auth || !db) return;
    setSavingStatus('saving');
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const historyRef = collection(db, 'users', currentUser.uid, 'facial_analysis_history');
      await addDoc(historyRef, {
        mode: reportData.mode,
        isRelationship: reportData.isRelationship,
        report: reportData,
        images: images, // Saved as base64 or you might crop in production
        timestamp: serverTimestamp()
      });
      setSavingStatus('saved');
    } catch (error) {
      console.error('Firestore save failed:', error);
      setSavingStatus('failed');
    }
  };

  const handleReset = () => {
    setImage1('');
    setImage2('');
    setReport(null);
    setErrorMessage(null);
    setSavingStatus('idle');
    setStep('setup');
  };

  const isFormValid = () => {
    if (mode === 'single') return !!image1;
    return !!image1 && !!image2;
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto relative z-10 flex flex-col justify-between font-mono">
      {/* Top Header Navigation */}
      <div className="flex items-center justify-between border-b border-cyber-blue/15 pb-4 mb-6">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-cyber-blue transition-colors text-xs">
          <ArrowLeft className="w-4 h-4" />
          BACK TO CENTRAL TERMINAL
        </Link>
        <span className="text-[10px] text-slate-500 font-mono">
          SECURE CONNECTION // OP_HEARHIM_FACIAL
        </span>
      </div>

      {/* Main Container */}
      <div className="grow flex flex-col justify-center">
        {errorMessage && (
          <div className="mb-6 border border-red-500/30 bg-red-950/20 p-4 rounded-[3px] text-red-400 text-xs flex items-center gap-3">
            <AlertCircle className="w-5 h-5 shrink-0 text-red-500" />
            <div>
              <span className="font-bold">분석 엔진 에러 발생:</span> {errorMessage}
            </div>
          </div>
        )}

        {/* STEP 1: SETUP PANEL */}
        {step === 'setup' && (
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
            {/* Mode selection sidebar */}
            <div className="lg:col-span-1 space-y-4">
              <h2 className="text-xs text-cyber-blue uppercase font-bold tracking-wider select-none">
                // SCAN_MODE_SELECT
              </h2>
              
              <div className="flex flex-col gap-2">
                <Button 
                  variant={mode === 'single' ? 'primary' : 'ghost'} 
                  glow={mode === 'single'}
                  onClick={() => { setMode('single'); setImage2(''); }}
                  className="justify-start gap-2.5"
                >
                  <Scan className="w-4 h-4" />
                  단일 심상 분석
                </Button>
                <Button 
                  variant={mode === 'relationship' ? 'secondary' : 'ghost'} 
                  glow={mode === 'relationship'}
                  onClick={() => setMode('relationship')}
                  className="justify-start gap-2.5"
                >
                  <Users className="w-4 h-4" />
                  관계 오버랩 분석
                </Button>
                <Button 
                  variant={mode === 'self' ? 'secondary' : 'ghost'} 
                  glow={mode === 'self'}
                  onClick={() => setMode('self')}
                  className="justify-start gap-2.5"
                >
                  <UserCheck className="w-4 h-4" />
                  자기 이해 모드
                </Button>
              </div>

              <div className="border border-cyber-blue/10 bg-slate-950/50 p-4 rounded-[3px] text-[10px] text-slate-500 space-y-2">
                <span className="text-cyber-blue font-bold text-[11px] block select-none">
                  [!] 운명론 배제 지침
                </span>
                <p className="leading-relaxed">
                  헤아림 프로토콜은 관습적인 사주학/운명학 대신 안면 생리학을 기초로 근육 톤, 신경 발달에 따른 비례, 색상 스펙트럼에서 심리 기질 및 현재 누적 피로 컨디션을 도출합니다.
                </p>
              </div>
            </div>

            {/* Camera frames upload */}
            <div className="lg:col-span-3 space-y-6">
              <Card 
                header={`ANALYTICS INITIALIZER // ${mode.toUpperCase()} SCAN`}
                footer={<span>READY TO CAPTURE DATA</span>}
              >
                <div className={`grid grid-cols-1 ${mode === 'single' ? 'max-w-md mx-auto' : 'md:grid-cols-2'} gap-6`}>
                  <div>
                    <div className="text-xs text-cyber-blue font-semibold mb-2 select-none">
                      {mode === 'single' ? 'TARGET SOURCE' : 'PRIMARY TARGET (A)'}
                    </div>
                    <CameraCapture onCapture={setImage1} label="TARGET A" />
                  </div>

                  {mode !== 'single' && (
                    <div>
                      <div className="text-xs text-electric-teal font-semibold mb-2 select-none">
                        {mode === 'relationship' ? 'SECONDARY TARGET (B)' : 'INNER REFLECTION (B)'}
                      </div>
                      <CameraCapture onCapture={setImage2} label="TARGET B" />
                    </div>
                  )}
                </div>

                <div className="mt-6 flex justify-end">
                  <Button 
                    variant={mode === 'single' ? 'primary' : 'secondary'} 
                    glow 
                    disabled={!isFormValid()}
                    onClick={handleExecuteScan}
                    className="w-full md:w-auto"
                  >
                    RUN HEARHIM PROTOCOL // 분석 개시
                  </Button>
                </div>
              </Card>
            </div>
          </div>
        )}

        {/* STEP 2: SCANNING/LOADING SCREEN */}
        {step === 'loading' && (
          <div className="max-w-xl mx-auto w-full text-center py-12 space-y-8">
            <div className="relative w-24 h-24 mx-auto flex items-center justify-center border border-cyber-blue/30 rounded-full">
              <span className="absolute inset-2 border-[2px] border-dashed border-cyber-blue/20 rounded-full animate-spin" style={{ animationDuration: '8s' }} />
              <Scan className="w-10 h-10 text-cyber-blue animate-pulse" />
              <div className="absolute inset-0 bg-cyber-blue/5 rounded-full filter blur-md animate-pulse" />
            </div>

            <div className="space-y-3">
              <h3 className="text-sm font-bold text-slate-200">
                헤아림 AI 연산 모델 작동 중
              </h3>
              <p className="text-xs text-cyber-blue font-bold tracking-widest cyber-pulse select-none">
                {loadingText}
              </p>
            </div>

            {/* Neon loading bar */}
            <div className="space-y-1">
              <div className="w-full h-1.5 bg-slate-950 border border-cyber-blue/20 rounded-full overflow-hidden relative">
                <div 
                  className="h-full bg-gradient-to-r from-cyber-blue to-electric-teal shadow-[0_0_8px_rgba(0,240,255,0.8)] transition-all duration-300"
                  style={{ width: `${loadingProgress}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>PROGRESS: {loadingProgress}%</span>
                <span>DATASTREAMING...</span>
              </div>
            </div>
          </div>
        )}

        {/* STEP 3: RESULT PRESENTATION */}
        {step === 'result' && report && (
          <div className="space-y-6">
            
            {/* Core Synergy / Relationship compatibility section */}
            {report.isRelationship && report.relationship && (
              <Card 
                header={`RELATIONSHIP COMPATIBILITY REPORT // ${report.mode.toUpperCase()}`}
                glow
                scanline
                footer={
                  <div className="flex justify-between w-full">
                    <span>SYNERGY ENGINE: ACTIVE</span>
                    {savingStatus === 'saved' && <span className="text-electric-teal">HIST_LOGGED // 기록 저장 완료</span>}
                    {savingStatus === 'saving' && <span className="text-cyber-blue animate-pulse">LOGGING_TO_FIRESTORE...</span>}
                  </div>
                }
              >
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-center">
                  
                  {/* Gauge */}
                  <div className="col-span-1 flex flex-col items-center justify-center border-b md:border-b-0 md:border-r border-cyber-blue/10 pb-6 md:pb-0">
                    <div className="relative w-32 h-32 flex items-center justify-center">
                      {/* SVG Circle Gauge */}
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle cx="50" cy="50" r="42" stroke="rgba(0,240,255,0.06)" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="50" 
                          cy="50" 
                          r="42" 
                          stroke="var(--cyber-blue)" 
                          strokeWidth="6" 
                          fill="transparent"
                          strokeDasharray={263.8}
                          strokeDashoffset={263.8 - (263.8 * (report.relationship.synergyScore || 0)) / 100}
                          className="transition-all duration-1000 ease-out"
                        />
                      </svg>
                      <div className="absolute text-center">
                        <span className="text-3xl font-extrabold text-white tracking-tighter">
                          {report.relationship.synergyScore}
                        </span>
                        <span className="text-[10px] text-slate-500 block">SYNERGY %</span>
                      </div>
                    </div>
                  </div>

                  {/* Compatibility Text details */}
                  <div className="col-span-1 md:col-span-3 space-y-4 font-mono text-xs">
                    <div>
                      <h4 className="text-sm font-bold text-slate-100 mb-1 flex items-center gap-1.5 select-none font-serif">
                        <Sparkles className="w-4 h-4 text-cyber-blue" />
                        상호 연동 역학 및 통합적 궁합
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-justify font-sans">
                        {report.relationship.compatibilityText}
                      </p>
                    </div>
                    
                    {report.relationship.cautions && report.relationship.cautions.length > 0 && (
                      <div className="bg-amber-500/5 border border-amber-500/15 p-3 rounded-[3px]">
                        <span className="text-[11px] text-amber-400 font-bold block mb-1 select-none">
                          [!] 상호 보완 및 갈등 제어 주의점:
                        </span>
                        <ul className="list-disc pl-4 space-y-1 text-[11px] text-slate-400 font-sans">
                          {report.relationship.cautions.map((caution, i) => (
                            <li key={i}>{caution}</li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>

                </div>
              </Card>
            )}

            {/* Individual Profiles detail */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {report.subjects.map((subj) => (
                <Card 
                  key={subj.id}
                  header={`SUBJECT TARGET PROFILE #${subj.id}`}
                  footer={<span>ANALYSED // OK</span>}
                >
                  <div className="space-y-5 text-xs">
                    
                    {/* MindImage */}
                    <div>
                      <h4 className="text-xs text-cyber-blue font-bold tracking-wider mb-1 flex items-center gap-1 select-none">
                        <Brain className="w-3.5 h-3.5" />
                        심상(心象) 및 기질 특징
                      </h4>
                      <p className="text-slate-300 leading-relaxed text-justify font-sans">
                        {subj.mindImage}
                      </p>
                    </div>

                    {/* Personality (MBTI / Enneagram) */}
                    <div className="border-t border-slate-900 pt-3">
                      <h4 className="text-xs text-electric-teal font-bold tracking-wider mb-2 flex items-center gap-1 select-none">
                        <Activity className="w-3.5 h-3.5" />
                        기질적 성격 유형 예측
                      </h4>
                      <div className="flex gap-2 mb-2 font-mono">
                        <div className="bg-cyber-blue/10 border border-cyber-blue/30 text-cyber-blue px-2.5 py-1 rounded-[3px] font-bold">
                          MBTI: {subj.personality.mbti}
                        </div>
                        <div className="bg-electric-teal/10 border border-electric-teal/30 text-electric-teal px-2.5 py-1 rounded-[3px] font-bold">
                          에니어그램: {subj.personality.enneagram}
                        </div>
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed text-justify font-sans">
                        <span className="text-slate-300 font-bold block mb-0.5 font-mono select-none">유형 판단 근거:</span>
                        {subj.personality.rationale}
                      </p>
                    </div>

                    {/* Health Indicators */}
                    <div className="border-t border-slate-900 pt-3 space-y-2">
                      <h4 className="text-xs text-red-400 font-bold tracking-wider flex items-center gap-1 select-none">
                        <Activity className="w-3.5 h-3.5" />
                        3단계 건강 컨디션 계측
                      </h4>
                      
                      <div className="space-y-1">
                        <div className="bg-slate-950/60 p-2 border border-slate-800 rounded-[3px] font-sans">
                          <span className="text-[11px] text-slate-500 font-mono block select-none">1. 안색 기반 현재 피로/에너지 상태</span>
                          <span className="text-slate-300 text-[11px]">{subj.health.currentCondition}</span>
                        </div>
                        
                        <div className="bg-slate-950/60 p-2 border border-slate-800 rounded-[3px] font-sans">
                          <span className="text-[11px] text-slate-500 font-mono block select-none">2. 생리 반응적 잠재 경고 리스크</span>
                          <ul className="list-disc pl-4 mt-1 text-[10px] text-red-300/80 space-y-0.5">
                            {subj.health.potentialRisks.map((risk, i) => (
                              <li key={i}>{risk}</li>
                            ))}
                          </ul>
                        </div>

                        <div className="bg-slate-950/60 p-2 border border-slate-800 rounded-[3px] font-sans">
                          <span className="text-[11px] text-slate-500 font-mono block select-none">3. 추천 습관 개선 가이드라인</span>
                          <ul className="list-disc pl-4 mt-1 text-[10px] text-emerald-300/80 space-y-0.5">
                            {subj.health.improvements.map((imp, i) => (
                              <li key={i}>{imp}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                  </div>
                </Card>
              ))}
            </div>

            {/* Back action */}
            <div className="pt-6 flex justify-end gap-3">
              <Button variant="ghost" onClick={handleReset}>
                RESET ANALYSIS // 리셋
              </Button>
              <Button variant="primary" glow onClick={handleReset} className="flex items-center gap-1.5">
                <RefreshCw className="w-3.5 h-3.5" />
                NEW SCAN // 새 대상 분석
              </Button>
            </div>

          </div>
        )}

      </div>

      {/* Bottom Footer Status */}
      <div className="mt-8 border-t border-cyber-blue/15 pt-4 text-center text-[10px] text-slate-500 flex justify-between select-none">
        <span>DEVICE: HEARHIM_SCAN_V1 // AUTO_ALIGN: ON</span>
        <span>STATUS: PORT_STABLE // 200_OK</span>
      </div>
    </main>
  );
}
