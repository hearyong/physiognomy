'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { 
  Scan, 
  Terminal as TerminalIcon, 
  Cpu, 
  User, 
  LogOut, 
  LogIn, 
  Heart, 
  Download, 
  RefreshCw, 
  Smartphone,
  Info
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card } from '@/components/ui/Card';
import { DonationModal } from '@/components/DonationModal';
import { PwaInstallGuide } from '@/components/PwaInstallGuide';
import { UpdateInfoModal } from '@/components/UpdateInfoModal';

// Firebase import safe for client-side try/catch
import { auth } from '@/lib/firebase';
import { signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged, User as FirebaseUser } from 'firebase/auth';

export default function Home() {
  const router = useRouter();
  const [user, setUser] = useState<FirebaseUser | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [localTime, setLocalTime] = useState<string>('00:00:00');
  
  // Modal states
  const [isDonationOpen, setIsDonationOpen] = useState(false);
  const [isPwaOpen, setIsPwaOpen] = useState(false);
  const [isUpdateOpen, setIsUpdateOpen] = useState(false);
  
  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Time ticker
  useEffect(() => {
    setLocalTime(new Date().toLocaleTimeString());
    const timer = setInterval(() => {
      setLocalTime(new Date().toLocaleTimeString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // System Log Simulator
  useEffect(() => {
    const mockLogs = [
      'SYS_INIT // HEARHIM PROTOCOL BOOTING...',
      'CORE_LOAD // 안면 생리학 데이터베이스 로드 성공',
      'AI_CONN // Google Gemini-1.5 Core 가동 대기 중',
      'FIREBASE_CONN // 클라이언트 데이터 서버 동기화 완료',
      'NETWORK_ON // 궤도 통신망 활성화 (Port: 443)',
      'SYS_READY // 프로토콜 초기화 완료. 스캐너 대기 중.',
    ];
    
    let index = 0;
    const addLog = () => {
      if (index < mockLogs.length) {
        setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${mockLogs[index]}`]);
        index++;
      } else {
        // Add random scanning log periodic
        const randomHUD = [
          'SYS_SCAN // 주변 환경 및 네트워크 상태 점검...',
          'SYS_HEALTH // 프로세서 온도 42.5°C // 정상',
          'SYS_SEC // 방화벽 이상 무 // 패킷 모니터링 활성',
          'SYS_MEM // 캐시 정렬 완료 // 메모리 상태 최적',
        ];
        const randomItem = randomHUD[Math.floor(Math.random() * randomHUD.length)];
        setLogs(prev => [...prev.slice(-30), `[${new Date().toLocaleTimeString()}] ${randomItem}`]);
      }
    };

    addLog();
    const logTimer = setInterval(addLog, 4000);
    return () => clearInterval(logTimer);
  }, []);

  // Scroll terminal logs to bottom
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Auth Observer
  useEffect(() => {
    if (!auth) {
      console.warn('Firebase Auth is not initialized. User logging feature is suspended.');
      return;
    }
    try {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase Auth is not initialized yet or configuration is missing.', e);
    }
  }, []);

  // Login handler
  const handleLogin = async () => {
    if (!auth) {
      alert('Firebase 설정(.env.local)이 누락되었거나 비활성 상태입니다. 로컬 터미널 설정이 필요합니다.');
      return;
    }
    try {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] USER_AUTH // 사용자 로그인 성공`]);
    } catch (error: any) {
      console.error(error);
      alert('로그인에 실패했습니다. Firebase API 키가 누락되었거나 프로젝트 설정이 활성화되지 않았을 수 있습니다. (.env.local 파일을 확인해 주세요)');
    }
  };

  // Logout handler
  const handleLogout = async () => {
    if (!auth) return;
    try {
      await signOut(auth);
      setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] USER_AUTH // 사용자 로그아웃 완료`]);
    } catch (error) {
      console.error(error);
    }
  };

  return (
    <main className="min-h-screen p-4 md:p-8 flex flex-col justify-between max-w-7xl mx-auto relative z-10">
      {/* Top Header / HUD Bar */}
      <div className="flex flex-col md:flex-row justify-between items-center border border-cyber-blue/20 bg-slate-950/70 backdrop-blur-md px-6 py-4 rounded-[3px] gap-4 mb-6 shadow-[0_0_15px_rgba(0,240,255,0.03)] relative">
        <span className="hud-corner hud-tl"></span>
        <span className="hud-corner hud-tr"></span>
        <span className="hud-corner hud-bl"></span>
        <span className="hud-corner hud-br"></span>

        <div className="flex items-center gap-3">
          <div className="relative">
            <Cpu className="w-8 h-8 text-cyber-blue cyber-pulse" />
            <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-electric-teal rounded-full animate-ping" />
          </div>
          <div>
            <h1 className="font-mono text-lg md:text-xl font-bold tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-cyber-blue via-vibrant-cyan to-electric-teal select-none">
              HEARHIM PROTOCOL
            </h1>
            <p className="text-[9px] font-mono text-slate-500 tracking-wider">
              QUANTUM AI CORE ANALYTICS SYSTEM
            </p>
          </div>
        </div>

        {/* User Auth Section */}
        <div className="flex items-center gap-4 font-mono text-xs">
          {user ? (
            <div className="flex items-center gap-3 border border-electric-teal/20 bg-electric-teal/5 py-1.5 px-3 rounded-[3px]">
              <div className="flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-electric-teal" />
                <span className="text-slate-200">{user.displayName || 'Authorized User'}</span>
              </div>
              <span className="text-slate-600">|</span>
              <button onClick={handleLogout} className="text-slate-400 hover:text-red-400 flex items-center gap-1 transition-colors cursor-pointer">
                <LogOut className="w-3.5 h-3.5" />
                DISCONNECT
              </button>
            </div>
          ) : (
            <Button variant="primary" glow onClick={handleLogin} className="flex items-center gap-1.5 !py-1.5 !px-4">
              <LogIn className="w-3.5 h-3.5" />
              CONNECT USER
            </Button>
          )}
        </div>
      </div>

      {/* Main Core Dashboard Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6 grow items-stretch">
        
        {/* Module 1: Facial Analysis HUD Link */}
        <Card 
          className="flex flex-col justify-between"
          header="ANALYTICS MODULE // 심상 분석"
          footer={<span>SYSTEM READY // V1.0.3</span>}
        >
          <div className="space-y-4">
            <div className="h-44 bg-slate-950/80 rounded-[3px] border border-cyber-blue/10 flex items-center justify-center relative overflow-hidden group">
              <div className="laser-scanner" />
              <div className="absolute inset-0 cyber-grid-overlay opacity-30 group-hover:opacity-50 transition-opacity" />
              <Scan className="w-16 h-16 text-cyber-blue/40 group-hover:text-cyber-blue/70 transition-colors duration-500 group-hover:scale-105" />
              <div className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-600">
                RESOLUTION: 1024x1024 px // FRAME_LOCK
              </div>
            </div>
            
            <h2 className="text-base font-bold text-slate-100 font-serif">
              인공지능 안면 심상(心象) & 관계 분석
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              얼굴의 형태학적 특징, 미세 표정, 그리고 톤을 다각도로 계측합니다. 미신에 치우친 관상이 아닌 생리학과 심리 모델링을 적용하여 기질, 건강 컨디션, 그리고 MBTI / 에니어그램 성격을 추론하고 두 사람의 시너지와 잠재 갈등 주의사항을 도출합니다.
            </p>
          </div>
          
          <div className="pt-6">
            <Button 
              variant="primary" 
              glow 
              className="w-full justify-center"
              onClick={() => router.push('/facial-analysis')}
            >
              INITIALIZE CORE SCANNER // 심상 분석 가동
            </Button>
          </div>
        </Card>

        {/* Module 2: Immediate Documentation HUD Link */}
        <Card 
          className="flex flex-col justify-between"
          header="DOCUMENTATION MODULE // 실시간 미디어 분석"
          footer={<span>STREAM CONNECTED // ACTIVE</span>}
        >
          <div className="space-y-4">
            <div className="h-44 bg-slate-950/80 rounded-[3px] border border-electric-teal/10 flex items-center justify-center relative overflow-hidden group">
              <div className="absolute inset-0 cyber-grid-overlay opacity-30 group-hover:opacity-50 transition-opacity" />
              <TerminalIcon className="w-16 h-16 text-electric-teal/40 group-hover:text-electric-teal/70 transition-colors duration-500 group-hover:scale-105" />
              <div className="absolute top-2 right-2 flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse" />
                <span className="text-[8px] font-mono text-red-500">LIVE FEED</span>
              </div>
              <div className="absolute bottom-2 left-2 text-[8px] font-mono text-slate-600">
                MEDIA BUFFER: ACTIVE // MEM_FREE: 89%
              </div>
            </div>
            
            <h2 className="text-base font-bold text-slate-100 font-serif">
              프롬프트 기반 실시간 미디어 분석
            </h2>
            <p className="text-xs text-slate-400 leading-relaxed font-sans">
              카메라 스냅샷 피드나 파일에 대해 사용자가 입력한 자연어 질문에 따라 즉각적으로 미디어 정보를 정밀 스캔하고 한국어 보고서를 구성합니다. 프레임 캡션, 텍스트 판독, 장면 요약 등 다목적 미디어 분석을 진행합니다.
            </p>
          </div>
          
          <div className="pt-6">
            <Button 
              variant="secondary" 
              glow 
              className="w-full justify-center"
              onClick={() => router.push('/immediate-documentation')}
            >
              ESTABLISH STREAMING LINK // 분석 스트림 활성화
            </Button>
          </div>
        </Card>

        {/* Terminal log panel */}
        <Card 
          header="HEARHIM MONITOR TERMINAL // 실시간 로그"
          className="flex flex-col max-h-[500px] lg:max-h-none"
          footer={
            <div className="flex justify-between w-full text-[9px] font-mono">
              <span>TEMP: 39.2 C</span>
              <span>MEM_USED: 412 MB</span>
            </div>
          }
        >
          <div className="bg-black/90 p-4 rounded-[3px] border border-cyber-blue/10 h-72 lg:h-[350px] overflow-y-auto font-mono text-[10px] text-emerald-400 space-y-1.5 scanline-static scrollbar-thin scrollbar-thumb-emerald-800">
            {logs.map((log, i) => (
              <div key={i} className="leading-relaxed whitespace-pre-wrap">
                {log}
              </div>
            ))}
            <div ref={terminalEndRef} />
          </div>
          <div className="mt-3 flex items-center gap-2 bg-slate-950 p-2.5 rounded-[3px] border border-cyan-500/10 select-none">
            <Info className="w-3.5 h-3.5 text-cyber-blue shrink-0" />
            <p className="text-[9px] text-slate-500 font-mono">
              시스템 로깅은 백그라운드에서 실시간으로 분석 프레임의 상태 및 API 트래픽 수신 세션을 모니터링합니다.
            </p>
          </div>
        </Card>

      </div>

      {/* Bottom Status Controls / HUD footer */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 border border-cyber-blue/20 bg-slate-950/70 backdrop-blur-md px-6 py-4 rounded-[3px] items-center text-xs font-mono">
        <span className="hud-corner hud-tl"></span>
        <span className="hud-corner hud-tr"></span>
        <span className="hud-corner hud-bl"></span>
        <span className="hud-corner hud-br"></span>

        <div className="flex items-center gap-2 text-slate-400 justify-center md:justify-start">
          <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
          <span>PORTAL ACTIVE // T: {localTime}</span>
        </div>

        <div className="col-span-1 md:col-span-2 flex justify-center gap-3">
          <button 
            onClick={() => setIsDonationOpen(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-cyber-blue transition-colors duration-200 cursor-pointer"
          >
            <Heart className="w-3.5 h-3.5 text-red-500" />
            후원 (Donation)
          </button>
          <span className="text-slate-700">|</span>
          <button 
            onClick={() => setIsPwaOpen(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-electric-teal transition-colors duration-200 cursor-pointer"
          >
            <Smartphone className="w-3.5 h-3.5 text-electric-teal" />
            PWA 설치 가이드
          </button>
          <span className="text-slate-700">|</span>
          <button 
            onClick={() => setIsUpdateOpen(true)}
            className="flex items-center gap-1.5 text-slate-400 hover:text-red-400 transition-colors duration-200 cursor-pointer"
          >
            <RefreshCw className="w-3.5 h-3.5 text-cyan-400" />
            캐시 초기화
          </button>
        </div>

        <div className="text-slate-500 text-center md:text-right text-[10px]">
          HEARHIM PROTOCOL &copy; 2026 // ALL RIGHTS RESERVED
        </div>
      </div>

      {/* Modals */}
      <DonationModal isOpen={isDonationOpen} onClose={() => setIsDonationOpen(false)} />
      <PwaInstallGuide isOpen={isPwaOpen} onClose={() => setIsPwaOpen(false)} />
      <UpdateInfoModal isOpen={isUpdateOpen} onClose={() => setIsUpdateOpen(false)} />
    </main>
  );
}
