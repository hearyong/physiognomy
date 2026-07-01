import React from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { RefreshCw, AlertTriangle } from 'lucide-react';

interface UpdateInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const UpdateInfoModal: React.FC<UpdateInfoModalProps> = ({ isOpen, onClose }) => {
  const handleForceUpdate = () => {
    if (typeof window !== 'undefined') {
      // Unregister all service workers
      if ('serviceWorker' in navigator) {
        navigator.serviceWorker.getRegistrations().then((registrations) => {
          for (const registration of registrations) {
            registration.unregister();
          }
        });
      }
      
      // Clear cache storage
      if ('caches' in window) {
        caches.keys().then((names) => {
          for (const name of names) {
            caches.delete(name);
          }
        });
      }

      // Hard reload page
      window.location.reload();
    }
  };

  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="VERSION UPDATE PROTOCOL // 빌드 동기화">
      <div className="space-y-4 py-2 font-mono">
        <p className="text-xs leading-relaxed text-slate-400">
          HEARHIM PROTOCOL의 최신 코어 빌드가 감지되었습니다. 
          PWA 오프라인 캐싱 데이터와 로컬 세션의 불일치를 해결하고 안전한 분석 모듈을 보장하기 위해 아래 갱신 처리를 권장합니다.
        </p>

        <div className="border border-red-500/20 bg-red-950/20 p-3 rounded-[3px] space-y-1.5 text-red-400 text-xs">
          <div className="flex items-center gap-1.5 font-bold">
            <AlertTriangle className="w-3.5 h-3.5" />
            경고: 데이터 무결성 보존
          </div>
          <p className="text-[10px] text-slate-400 leading-normal">
            하단의 <b>[강제 업데이트 실행]</b>을 호출하면 로컬에 바인딩된 브라우저 오프라인 캐시가 초기화되고 최신화된 JavaScript 에셋이 로딩됩니다.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            건너뛰기
          </Button>
          <Button variant="danger" glow onClick={handleForceUpdate} className="flex items-center gap-1.5">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: '4s' }} />
            강제 업데이트 실행
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
