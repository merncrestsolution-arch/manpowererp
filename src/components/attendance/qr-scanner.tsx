"use client";

import { Html5Qrcode } from "html5-qrcode";
import { useEffect, useRef, useState } from "react";

import { Button } from "@/components/ui/button";

type QrScannerProps = {
  onScan: (code: string) => void;
  onError?: (message: string) => void;
};

export function QrScanner({ onScan, onError }: QrScannerProps) {
  const scannerRef = useRef<Html5Qrcode | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const containerId = "attendance-qr-scanner";

  useEffect(() => {
    let isMounted = true;

    async function startScanner() {
      try {
        const scanner = new Html5Qrcode(containerId);
        scannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          {
            fps: 10,
            qrbox: { width: 250, height: 250 },
          },
          (decodedText) => {
            onScan(decodedText);
          },
          () => undefined,
        );

        if (isMounted) {
          setIsRunning(true);
          setCameraError(null);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "Unable to access camera for QR scanning";
        setCameraError(message);
        onError?.(message);
      }
    }

    void startScanner();

    return () => {
      isMounted = false;
      const scanner = scannerRef.current;

      if (scanner?.isScanning) {
        void scanner.stop().then(() => scanner.clear());
      }
    };
  }, [onError, onScan]);

  return (
    <div className="space-y-jk-sm">
      <div
        id={containerId}
        className="overflow-hidden rounded-xl border bg-black/90"
      />
      {cameraError ? (
        <p className="text-destructive text-sm">{cameraError}</p>
      ) : (
        <p className="text-muted-foreground text-sm">
          {isRunning
            ? "Align the QR code within the frame to check in or out."
            : "Starting camera..."}
        </p>
      )}
      <Button
        type="button"
        variant="outline"
        onClick={() => {
          const scanner = scannerRef.current;
          if (scanner?.isScanning) {
            void scanner.stop().then(() => scanner.clear());
            setIsRunning(false);
          }
        }}
      >
        Stop Scanner
      </Button>
    </div>
  );
}
