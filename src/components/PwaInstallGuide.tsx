import React, { useEffect, useState } from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Download, Monitor, Smartphone } from 'lucide-react';

interface PwaInstallGuideProps {
  isOpen: boolean;
  onClose: () => void;
}

export const PwaInstallGuide: React.FC<PwaInstallGuideProps> = ({ isOpen, onClose }) => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) {
      alert('PWA 설치 프로토콜을 즉시 실행할 수 없습니다. 브라우저 주소창 우측의 설치 아이콘 혹은 모바일 브라우저 메뉴의 [홈 화면에 추가] 기능을 직접 활성화 해주세요.');
      return;
    }
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`PWA installation outcome: ${outcome}`);
    setDeferredPrompt(null);
    onClose();
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="PWA APPLICATION MODULE // 설치 가이드">
      <div className="space-y-4 py-2 font-mono">
        <p className="text-xs leading-relaxed text-slate-400">
          HEARHIM PROTOCOL을 모바일 또는 데스크톱의 독립형 웹앱 형태로 등록하여 가동하면 로딩 속도가 획기적으로 단축되며 전체 화면 HUD 인터페이스를 활성화할 수 있습니다.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
          <div className="border border-slate-800 bg-slate-950/60 p-3 rounded-[3px] space-y-2">
            <div className="flex items-center gap-1.5 text-cyber-blue font-bold">
              <Smartphone className="w-3.5 h-3.5" />
              모바일 (iOS / Android)
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              1. Safari 또는 Chrome 브라우저 가동<br />
              2. 하단 <b>공유</b> 버튼 또는 Chrome 설정 아이콘 클릭<br />
              3. <b>[홈 화면에 추가]</b> 메뉴 선택
            </p>
          </div>
          
          <div className="border border-slate-800 bg-slate-950/60 p-3 rounded-[3px] space-y-2">
            <div className="flex items-center gap-1.5 text-electric-teal font-bold">
              <Monitor className="w-3.5 h-3.5" />
              데스크톱 (Windows / macOS)
            </div>
            <p className="text-[10px] text-slate-400 leading-normal">
              1. Chrome 또는 Edge 브라우저 가동<br />
              2. 주소창 우측 상단 <b>[설치]</b> 버튼(컴퓨터 모니터 아이콘) 클릭<br />
              3. 가이드 팝업에서 설치 최종 승인
            </p>
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
          <Button variant="secondary" glow onClick={handleInstallClick} className="flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            앱 즉시 설치하기
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
