import React from 'react';
import { Dialog } from './ui/Dialog';
import { Button } from './ui/Button';
import { Coffee, ShieldCheck } from 'lucide-react';

interface DonationModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const DonationModal: React.FC<DonationModalProps> = ({ isOpen, onClose }) => {
  return (
    <Dialog isOpen={isOpen} onClose={onClose} title="PROTOCOL ENERGY UPGRADE // 후원">
      <div className="space-y-4 py-2 font-mono">
        <p className="text-xs leading-relaxed text-slate-400">
          HEARHIM PROTOCOL은 독립적으로 개발 및 가동되는 AI 연산 시스템입니다. 
          서버 연동 트래픽 제어를 원활히 유지하고 AI 코어 엔진(Gemini Pro/Flash)의 리소스를 향상시킬 수 있도록 후원으로 서포트해 주세요.
        </p>
        
        <div className="border border-cyber-blue/20 bg-slate-950/80 p-4 rounded-[3px] space-y-2">
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">후원 계좌 (카카오뱅크)</span>
            <span className="text-cyber-blue font-semibold">3333-08-9584712</span>
          </div>
          <div className="flex justify-between items-center text-xs">
            <span className="text-slate-400">예금주</span>
            <span className="text-slate-200">헤아림 개발팀</span>
          </div>
        </div>

        <div className="flex items-start gap-2 bg-cyber-blue/5 border border-cyber-blue/10 p-3 rounded-[3px] text-[11px] text-slate-400">
          <ShieldCheck className="w-4 h-4 text-cyber-blue shrink-0 mt-0.5" />
          <span>에너지 기부는 데이터 연산 서버 안정화와 더 나은 알고리즘 최적화를 위한 개발 리소스로만 소중하게 활용됩니다.</span>
        </div>

        <p className="text-[10px] text-slate-500 italic text-center">
          * 후원을 마친 뒤 터미널의 에너지 보존 법칙에 따라 프로토콜을 계속 사용하실 수 있습니다.
        </p>

        <div className="flex justify-end gap-2 pt-2">
          <Button variant="ghost" onClick={onClose}>
            닫기
          </Button>
          <Button variant="primary" glow onClick={onClose} className="flex items-center gap-1.5">
            <Coffee className="w-3.5 h-3.5" />
            에너지 충전 완료
          </Button>
        </div>
      </div>
    </Dialog>
  );
};
