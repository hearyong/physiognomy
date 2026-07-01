'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { 
  ArrowLeft, 
  Terminal as TerminalIcon, 
  Camera, 
  Send, 
  AlertTriangle, 
  Clock, 
  ShieldAlert,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { CameraCapture } from '@/components/CameraCapture';

// Firebase db logging if user is auth
import { auth, db } from '@/lib/firebase';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

export default function ImmediateDocumentationPage() {
  const [image, setImage] = useState<string>('');
  const [prompt, setPrompt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Quick Preset Prompt Buttons
  const presets = [
    { title: '피로도 계측', text: '현재 안면 톤과 눈가의 그늘, 미세 표정을 기반으로 신체 누적 피로 등급(A~F)을 분석하고 솔루션을 제공해줘.' },
    { title: '표정/심리 판독', text: '얼굴 근육의 수축 상태 및 안면 대칭성을 정밀 진단하여 현재 표정 속 무의식적인 스트레스나 감정 지표를 읽어내줘.' },
    { title: '집중도 상태', text: '눈동자의 시선 포커스, 턱관절 긴장 상태를 스캔하여 현재 업무 집중도를 측정하고 개선할 피드백을 도출해줘.' },
    { title: '거북목/자세', text: '화면 비율 상 어깨선 대비 턱과 목의 전방 돌출도를 대략 계측하여 경추 정렬 리스크를 스캔하고 스트레칭 팁을 제안해줘.' },
  ];

  const handlePresetClick = (presetText: string) => {
    setPrompt(presetText);
  };

  const handleAnalyze = async () => {
    if (!image) {
      alert('스캔할 타겟 이미지를 먼저 캡처하거나 업로드해야 합니다.');
      return;
    }
    if (!prompt.trim()) {
      alert('AI에게 전달할 지시 프롬프트를 작성해 주세요.');
      return;
    }

    setIsLoading(true);
    setAnswer(null);
    setErrorMessage(null);

    // Timeout control using AbortController (45 seconds)
    const controller = new AbortController();
    const timeoutId = setTimeout(() => {
      controller.abort();
    }, 45000); // 45s timeout limit

    try {
      const response = await fetch('/api/analyze-media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          image: image,
          prompt: prompt
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || '원격 미디어 연산 장비의 반환값이 올바르지 않습니다.');
      }

      setAnswer(data.answer);
      
      // Save log entry to Firestore if user log is active
      if (auth && auth.currentUser) {
        saveLogToFirestore(prompt, data.answer);
      }
    } catch (err: any) {
      clearTimeout(timeoutId);
      console.error(err);
      if (err.name === 'AbortError') {
        setErrorMessage('AI 분석 요청 시간이 초과되었습니다 (제한 시간 45초). 원격 트래픽 과부하 상태이거나 네트워크 연결이 원활하지 않습니다. 다시 시도해 주세요.');
      } else {
        setErrorMessage(err.message || '실시간 미디어 스펙트럼 디코딩 과정 중 시스템 고장이 발생했습니다.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const saveLogToFirestore = async (question: string, reply: string) => {
    if (!auth || !db) return;
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;

      const mediaLogsRef = collection(db, 'users', currentUser.uid, 'media_documentation_logs');
      await addDoc(mediaLogsRef, {
        prompt: question,
        response: reply,
        timestamp: serverTimestamp()
      });
    } catch (error) {
      console.error('Failed to log media document:', error);
    }
  };

  const handleReset = () => {
    setImage('');
    setPrompt('');
    setAnswer(null);
    setErrorMessage(null);
  };

  return (
    <main className="min-h-screen p-4 md:p-8 max-w-6xl mx-auto relative z-10 flex flex-col justify-between font-mono">
      {/* Navigation Top */}
      <div className="flex items-center justify-between border-b border-cyber-blue/15 pb-4 mb-6">
        <Link href="/" className="flex items-center gap-2 text-slate-400 hover:text-cyber-blue transition-colors text-xs">
          <ArrowLeft className="w-4 h-4" />
          BACK TO CENTRAL TERMINAL
        </Link>
        <span className="text-[10px] text-slate-500 font-mono">
          SECURE STREAM // OP_HEARHIM_IMMEDIATE
        </span>
      </div>

      {/* Content Area */}
      <div className="grow grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Left Control Column (Camera & Presets) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          <Card 
            header="STREAMING FEED SOURCE // 카메라 프레임"
            footer={<span>CAPTURE BUFFER: {image ? 'FILLED' : 'EMPTY'}</span>}
          >
            <CameraCapture onCapture={setImage} label="MEDIA FEED" />
          </Card>

          {/* Quick presets */}
          <Card header="PROMPT PRESETS // 빠른 명령어">
            <div className="grid grid-cols-2 gap-2">
              {presets.map((preset, index) => (
                <Button 
                  key={index} 
                  variant="ghost" 
                  onClick={() => handlePresetClick(preset.text)}
                  className="!text-[10px] border-slate-800 bg-slate-950/40 hover:border-cyber-blue/40 text-left justify-start"
                >
                  &gt; {preset.title}
                </Button>
              ))}
            </div>
            <div className="mt-3 flex items-start gap-1.5 text-[9px] text-slate-500 leading-normal">
              <Info className="w-3.5 h-3.5 text-cyber-blue shrink-0 mt-0.5" />
              <span>원하는 프리셋 진단을 마우스로 누르면 프롬프트 인풋이 구성에 맞게 자동 정렬됩니다.</span>
            </div>
          </Card>
        </div>

        {/* Right Console Output Column */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          <Card 
            header="ANALYTIC COMMANDER // 인풋 및 분석 터미널"
            className="grow flex flex-col justify-between"
            footer={<span>TIMEOUT BUFFER: 45S // HARD_LIMIT</span>}
          >
            <div className="space-y-4 grow flex flex-col justify-between">
              
              {/* Output log */}
              <div className="grow min-h-[250px] bg-black/90 p-4 border border-cyber-blue/10 rounded-[3px] overflow-y-auto text-xs space-y-3 font-mono scanline-static relative">
                {isLoading ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center bg-black/85 backdrop-blur-sm gap-3 z-20">
                    <Clock className="w-8 h-8 text-cyber-blue animate-spin" style={{ animationDuration: '3s' }} />
                    <span className="text-[10px] text-cyber-blue font-bold tracking-widest animate-pulse">
                      WAIT_FOR_REMOTE_RESPONSE // 연산 중...
                    </span>
                  </div>
                ) : null}

                {errorMessage ? (
                  <div className="border border-red-500/30 bg-red-950/20 p-3 rounded-[3px] text-red-400 space-y-1.5">
                    <div className="flex items-center gap-1.5 font-bold">
                      <ShieldAlert className="w-4 h-4 text-red-500" />
                      연산 통신 예외 발생 [TIMEOUT_OR_DENIED]
                    </div>
                    <p className="text-[10px] text-slate-400 leading-normal">
                      {errorMessage}
                    </p>
                  </div>
                ) : answer ? (
                  <div className="text-slate-300 leading-relaxed space-y-2 whitespace-pre-wrap font-sans text-xs">
                    <div className="font-mono text-[9px] text-emerald-400 mb-2 border-b border-emerald-950 pb-1">
                      SYS_RESPONSE // DECANTED_DATA // REPORT_SUCCESS
                    </div>
                    {answer}
                  </div>
                ) : (
                  <div className="text-slate-600 flex flex-col items-center justify-center h-full text-center p-6 gap-2 select-none">
                    <TerminalIcon className="w-8 h-8 text-slate-800" />
                    <span className="text-[10px] leading-normal">
                      시스템 피드가 로드되면 하단 쉘 인풋에 질문을 작성한 뒤<br />
                      <b>[RUN STREAM ANALYSIS]</b>를 송출하여 AI 보고서를 획득하세요.
                    </span>
                  </div>
                )}
              </div>

              {/* Input console */}
              <div className="space-y-3">
                <div className="flex gap-2">
                  <Input 
                    type="text" 
                    value={prompt} 
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="AI 코어 분석기에 내릴 한국어 명령어를 입력하십시오..."
                    disabled={isLoading}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && !isLoading) handleAnalyze();
                    }}
                  />
                  <Button 
                    variant="primary" 
                    glow 
                    disabled={isLoading || !image || !prompt.trim()}
                    onClick={handleAnalyze}
                    className="shrink-0 flex items-center gap-1.5"
                  >
                    <Send className="w-3.5 h-3.5" />
                    SEND
                  </Button>
                </div>

                <div className="flex justify-between items-center text-[10px]">
                  <span className="text-slate-500">PROMPT_LEN: {prompt.length} chars</span>
                  {answer && (
                    <button 
                      onClick={handleReset} 
                      className="text-red-400 hover:text-red-300 transition-colors flex items-center gap-1 cursor-pointer"
                    >
                      [RESET_CONSOLE]
                    </button>
                  )}
                </div>
              </div>

            </div>
          </Card>
        </div>

      </div>

      {/* Footer */}
      <div className="mt-8 border-t border-cyber-blue/15 pt-4 text-center text-[10px] text-slate-500 flex justify-between select-none">
        <span>STREAMING CORE: OPEN_LINK // GEMINI_MULTIMODAL</span>
        <span>STATUS: SECURE_DATA // PORT_443_SSL</span>
      </div>
    </main>
  );
}
