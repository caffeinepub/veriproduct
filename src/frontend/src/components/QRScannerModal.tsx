import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Camera,
  CameraOff,
  FlipHorizontal,
  Loader2,
  QrCode,
  ScanLine,
  X,
} from "lucide-react";
import { useEffect, useRef } from "react";
import { useQRScanner } from "../qr-code/useQRScanner";

interface QRScannerModalProps {
  open: boolean;
  onClose: () => void;
  onScan: (data: string) => void;
}

function extractProductId(raw: string): string {
  try {
    const url = new URL(raw);
    const verify = url.searchParams.get("verify");
    if (verify) return verify;
  } catch {
    // not a URL
  }
  return raw;
}

export default function QRScannerModal({
  open,
  onClose,
  onScan,
}: QRScannerModalProps) {
  const {
    isScanning,
    isActive,
    isSupported,
    error,
    isLoading,
    canStartScanning,
    startScanning,
    stopScanning,
    switchCamera,
    clearResults,
    qrResults,
    videoRef,
    canvasRef,
  } = useQRScanner({
    facingMode: "environment",
    scanInterval: 150,
    maxResults: 3,
  });

  const handledRef = useRef<number | null>(null);

  useEffect(() => {
    if (qrResults.length > 0) {
      const latest = qrResults[0];
      if (handledRef.current !== latest.timestamp) {
        handledRef.current = latest.timestamp;
        const productId = extractProductId(latest.data);
        stopScanning();
        onScan(productId);
        onClose();
      }
    }
  }, [qrResults, onScan, onClose, stopScanning]);

  useEffect(() => {
    if (!open) {
      stopScanning();
      clearResults();
      handledRef.current = null;
    }
  }, [open, stopScanning, clearResults]);

  const isMobile =
    /Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent,
    );

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent data-ocid="qr_scanner.dialog" className="max-w-sm">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <QrCode className="w-5 h-5 text-primary" />
            Scan QR Code
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {isSupported === false ? (
            <div
              data-ocid="qr_scanner.error_state"
              className="flex flex-col items-center gap-3 py-10 text-center"
            >
              <CameraOff className="w-12 h-12 text-muted-foreground/40" />
              <p className="font-medium">Camera Not Supported</p>
              <p className="text-sm text-muted-foreground">
                Your device or browser does not support camera access.
              </p>
            </div>
          ) : (
            <>
              {/* Camera preview */}
              <div className="relative rounded-xl overflow-hidden bg-black aspect-square">
                <video
                  ref={videoRef}
                  className="w-full h-full object-cover"
                  playsInline
                  muted
                />
                <canvas ref={canvasRef} className="hidden" />

                {/* Scanner overlay */}
                {isScanning && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <div className="relative w-48 h-48">
                      {/* Corners */}
                      <span className="absolute top-0 left-0 w-8 h-8 border-t-2 border-l-2 border-primary rounded-tl" />
                      <span className="absolute top-0 right-0 w-8 h-8 border-t-2 border-r-2 border-primary rounded-tr" />
                      <span className="absolute bottom-0 left-0 w-8 h-8 border-b-2 border-l-2 border-primary rounded-bl" />
                      <span className="absolute bottom-0 right-0 w-8 h-8 border-b-2 border-r-2 border-primary rounded-br" />
                      {/* Scan line */}
                      <div className="absolute inset-x-2 top-1/2 -translate-y-1/2">
                        <ScanLine className="w-full h-5 text-primary opacity-80 animate-pulse" />
                      </div>
                    </div>
                  </div>
                )}

                {/* Loading overlay */}
                {isLoading && (
                  <div
                    data-ocid="qr_scanner.loading_state"
                    className="absolute inset-0 bg-black/60 flex items-center justify-center"
                  >
                    <Loader2 className="w-8 h-8 text-white animate-spin" />
                  </div>
                )}

                {/* Idle overlay */}
                {!isActive && !isLoading && (
                  <div className="absolute inset-0 bg-black/70 flex flex-col items-center justify-center gap-3">
                    <Camera className="w-10 h-10 text-white/50" />
                    <p className="text-white/60 text-sm">
                      Camera preview will appear here
                    </p>
                  </div>
                )}
              </div>

              {/* Error */}
              {error && (
                <div
                  data-ocid="qr_scanner.error_state"
                  className="flex items-start gap-2 bg-destructive/10 text-destructive rounded-lg px-3 py-2 text-sm"
                >
                  <X className="w-4 h-4 flex-shrink-0 mt-0.5" />
                  <span>{error.message}</span>
                </div>
              )}

              {/* Controls */}
              <div className="flex gap-2">
                {!isActive ? (
                  <Button
                    data-ocid="qr_scanner.button"
                    className="flex-1"
                    onClick={startScanning}
                    disabled={!canStartScanning || isLoading}
                  >
                    {isLoading ? (
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    ) : (
                      <Camera className="w-4 h-4 mr-2" />
                    )}
                    Start Scanning
                  </Button>
                ) : (
                  <Button
                    data-ocid="qr_scanner.button"
                    className="flex-1"
                    variant="outline"
                    onClick={stopScanning}
                  >
                    <X className="w-4 h-4 mr-2" />
                    Stop
                  </Button>
                )}

                {isMobile && isActive && (
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={switchCamera}
                    disabled={isLoading}
                    data-ocid="qr_scanner.toggle"
                  >
                    <FlipHorizontal className="w-4 h-4" />
                  </Button>
                )}
              </div>

              <p className="text-xs text-center text-muted-foreground">
                Point your camera at a VeriProduct QR code to scan
                automatically.
              </p>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
