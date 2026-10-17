import { RotateCcw, Smartphone } from "lucide-react";

export function OrientationGate() {
  return (
    <div className="orientation-gate" role="status" aria-live="polite">
      <div className="orientation-gate__device" aria-hidden="true">
        <Smartphone size={50} strokeWidth={1.6} />
        <RotateCcw size={24} strokeWidth={2} />
      </div>
      <strong>请横屏使用</strong>
      <span>旋转手机，获得完整琴键空间</span>
    </div>
  );
}
