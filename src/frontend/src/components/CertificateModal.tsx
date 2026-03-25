import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Separator } from "@/components/ui/separator";
import {
  Building2,
  CheckCircle2,
  Download,
  Globe2,
  Mail,
  MapPin,
  Printer,
  Shield,
  Truck,
} from "lucide-react";
import { useRef } from "react";
import type { Product } from "../backend.d";

interface CertificateModalProps {
  product: Product | null;
  open: boolean;
  onClose: () => void;
}

declare global {
  interface Window {
    html2canvas?: (
      el: HTMLElement,
      opts?: Record<string, unknown>,
    ) => Promise<HTMLCanvasElement>;
  }
}

export default function CertificateModal({
  product,
  open,
  onClose,
}: CertificateModalProps) {
  const printRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    const content = printRef.current?.innerHTML;
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Certificate of Authenticity</title>
      <style>body{font-family:Inter,sans-serif;padding:40px;max-width:700px;margin:0 auto}
      h1{font-size:28px;font-weight:700}h2{font-size:20px}
      .grid{display:grid;grid-template-columns:1fr 1fr;gap:12px 24px}
      .label{font-size:11px;text-transform:uppercase;color:#666;font-weight:600}
      .value{font-size:14px;color:#1a1a2e;font-weight:500;margin-top:2px}
      </style></head><body>${content}</body></html>`);
    win.document.close();
    win.print();
  };

  const handleDownloadImage = async () => {
    const el = printRef.current;
    if (!el) return;

    // Load html2canvas if not already loaded
    if (!window.html2canvas) {
      await new Promise<void>((resolve, reject) => {
        const script = document.createElement("script");
        script.src =
          "https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js";
        script.onload = () => resolve();
        script.onerror = () => reject(new Error("Failed to load html2canvas"));
        document.head.appendChild(script);
      });
    }

    if (!window.html2canvas) return;

    const canvas = await window.html2canvas(el, {
      backgroundColor: "#ffffff",
      scale: 2,
      useCORS: true,
    });

    const link = document.createElement("a");
    link.download = `VeriProduct-Certificate-${product?.id ?? "cert"}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  };

  if (!product) return null;

  const fields = [
    { label: "Product Name", value: product.name },
    { label: "Product ID", value: product.id },
    { label: "Manufacturer", value: product.manufacturer },
    { label: "Production Date", value: product.productionDate },
    { label: "Current Owner", value: product.currentOwner },
    { label: "Serial Number", value: product.serialNumber },
    { label: "Batch Number", value: product.batchNumber },
    { label: "Warranty", value: product.warrantyInfo },
  ];

  const hasDistributor =
    product.distributorName ||
    product.distributorContact ||
    product.distributorAddress ||
    product.distributorCountry;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent
        data-ocid="certificate.dialog"
        className="max-w-xl max-h-[90vh] overflow-y-auto"
      >
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-success" />
            Certificate of Authenticity
          </DialogTitle>
        </DialogHeader>

        <div ref={printRef} className="py-2">
          {/* Header */}
          <div className="flex items-center justify-between mb-4">
            <div>
              <div className="flex items-center gap-2">
                <Shield
                  className="w-6 h-6"
                  style={{ color: "oklch(0.22 0.05 252)" }}
                />
                <span className="font-bold text-lg">VeriProduct</span>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Blockchain Authentication System
              </p>
            </div>
            <div className="flex items-center gap-1.5 bg-success-bg text-success px-3 py-1.5 rounded-full">
              <CheckCircle2 className="w-4 h-4" />
              <span className="text-xs font-bold uppercase tracking-wide">
                Authentic
              </span>
            </div>
          </div>

          <Separator className="mb-4" />

          <h2 className="text-base font-semibold mb-3">Product Details</h2>
          <div className="grid grid-cols-2 gap-x-6 gap-y-3">
            {fields.map((f) => (
              <div key={f.label}>
                <p className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground">
                  {f.label}
                </p>
                <p className="text-sm font-medium mt-0.5">{f.value || "—"}</p>
              </div>
            ))}
          </div>

          {hasDistributor && (
            <>
              <Separator className="my-4" />
              <div className="flex items-center gap-2 mb-3">
                <Truck className="w-4 h-4 text-muted-foreground" />
                <h2 className="text-base font-semibold">
                  Authorized Distributor
                </h2>
              </div>
              <div className="grid grid-cols-2 gap-x-6 gap-y-3">
                {product.distributorName && (
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground flex items-center gap-1">
                      <Building2 className="w-3 h-3" /> Distributor Name
                    </p>
                    <p className="text-sm font-medium mt-0.5">
                      {product.distributorName}
                    </p>
                  </div>
                )}
                {product.distributorContact && (
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground flex items-center gap-1">
                      <Mail className="w-3 h-3" /> Contact
                    </p>
                    <p className="text-sm font-medium mt-0.5">
                      {product.distributorContact}
                    </p>
                  </div>
                )}
                {product.distributorAddress && (
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> Address
                    </p>
                    <p className="text-sm font-medium mt-0.5">
                      {product.distributorAddress}
                    </p>
                  </div>
                )}
                {product.distributorCountry && (
                  <div>
                    <p className="text-[11px] uppercase font-semibold tracking-wide text-muted-foreground flex items-center gap-1">
                      <Globe2 className="w-3 h-3" /> Country
                    </p>
                    <p className="text-sm font-medium mt-0.5">
                      {product.distributorCountry}
                    </p>
                  </div>
                )}
              </div>
            </>
          )}

          <Separator className="my-4" />
          <p className="text-xs text-muted-foreground">
            Verified on the Internet Computer blockchain at{" "}
            <span className="font-medium">{new Date().toLocaleString()}</span>
          </p>
          <p className="text-[10px] text-muted-foreground mt-1">
            This certificate confirms the authenticity of the above product as
            registered in the VeriProduct blockchain ledger.
          </p>
        </div>

        <div className="flex justify-end gap-2 pt-2">
          <Button
            variant="outline"
            onClick={onClose}
            data-ocid="certificate.cancel_button"
          >
            Close
          </Button>
          <Button
            variant="outline"
            onClick={handleDownloadImage}
            data-ocid="certificate.download_button"
          >
            <Download className="w-4 h-4 mr-1.5" />
            Download Image
          </Button>
          <Button onClick={handlePrint} data-ocid="certificate.print_button">
            <Printer className="w-4 h-4 mr-1.5" />
            Print
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
