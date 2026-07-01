import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Upload, Image as ImageIcon } from 'lucide-react';
import { Button } from './ui/Button';

interface CameraCaptureProps {
  onCapture: (base64Image: string) => void;
  label?: string;
}

export const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, label = "SCAN SOURCE" }) => {
  const webcamRef = useRef<Webcam>(null);
  const [mounted, setMounted] = useState(false);
  const [useCamera, setUseCamera] = useState(true);
  const [capturedPreview, setCapturedPreview] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  const capture = () => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      if (imageSrc) {
        setCapturedPreview(imageSrc);
        onCapture(imageSrc);
      }
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setCapturedPreview(base64String);
        onCapture(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const resetImage = () => {
    setCapturedPreview(null);
    onCapture("");
  };

  if (!mounted) {
    return <div className="h-60 bg-slate-950/80 border border-cyber-blue/15 rounded-[3px] animate-pulse" />;
  }

  return (
    <div className="space-y-3 font-mono text-xs">
      <div className="relative h-60 bg-slate-950 rounded-[3px] border border-cyber-blue/20 overflow-hidden flex items-center justify-center">
        {capturedPreview ? (
          <div className="relative w-full h-full">
            <img src={capturedPreview} alt="Captured preview" className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-cyber-blue/5 pointer-events-none" />
            <div className="absolute top-2 left-2 bg-slate-950/80 border border-cyber-blue/30 px-2 py-0.5 text-[9px] text-cyber-blue select-none">
              CAPTURE_BUFF // READY_FOR_ANALYSIS
            </div>
          </div>
        ) : useCamera ? (
          <div className="relative w-full h-full flex items-center justify-center">
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="w-full h-full object-cover"
              videoConstraints={{ facingMode: 'user' }}
              onUserMediaError={() => setUseCamera(false)}
            />
            {/* HUD grid overlays inside camera */}
            <div className="absolute inset-0 border-[2px] border-dashed border-cyber-blue/10 pointer-events-none m-8 rounded-full" />
            <div className="absolute top-1/2 left-0 w-full h-[1px] bg-cyber-blue/15 pointer-events-none" />
            <div className="absolute top-0 left-1/2 w-[1px] h-full bg-cyber-blue/15 pointer-events-none" />
            <div className="laser-scanner" />
            <div className="absolute top-2 left-2 bg-slate-950/80 border border-cyber-blue/20 px-2 py-0.5 text-[8px] text-cyber-blue/80 select-none">
              LIVE_FEED // 30_FPS
            </div>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-3 p-4 text-center select-none">
            <ImageIcon className="w-10 h-10 text-slate-700 animate-pulse" />
            <span className="text-slate-500 text-[10px] leading-relaxed">
              웹캠 장치 비활성화 또는 권한 없음<br />
              <span className="text-slate-600">안면 데이터 파일을 직접 업로드해 주세요.</span>
            </span>
          </div>
        )}
      </div>

      <div className="flex gap-2">
        {capturedPreview ? (
          <Button variant="danger" onClick={resetImage} className="w-full justify-center">
            RE-SET SOURCE // 초기화
          </Button>
        ) : (
          <>
            {useCamera ? (
              <Button variant="primary" glow onClick={capture} className="w-full justify-center flex items-center gap-1.5">
                <Camera className="w-3.5 h-3.5" />
                CAPTURE IMAGE // 캡처
              </Button>
            ) : (
              <div className="relative w-full">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileUpload}
                  className="hidden"
                  id={`file-upload-${label.replace(/\s+/g, '-')}`}
                />
                <label
                  htmlFor={`file-upload-${label.replace(/\s+/g, '-')}`}
                  className="flex items-center justify-center gap-1.5 bg-cyber-blue/10 border border-cyber-blue/45 text-cyber-blue hover:bg-cyber-blue hover:text-black py-2.5 px-5 rounded-[3px] cursor-pointer text-center w-full transition-all duration-300 font-bold hover:shadow-[0_0_10px_rgba(0,240,255,0.2)]"
                >
                  <Upload className="w-3.5 h-3.5" />
                  LOAD ANIMAGE // 업로드
                </label>
              </div>
            )}
            
            <Button
              variant="ghost"
              onClick={() => setUseCamera(!useCamera)}
              className="px-3 shrink-0"
              title={useCamera ? "파일 업로드로 전환" : "웹캠으로 전환"}
            >
              <RefreshCw className="w-4 h-4" />
            </Button>
          </>
        )}
      </div>
    </div>
  );
};
