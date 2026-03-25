interface QRCodeDisplayProps {
  productId: string;
  size?: number;
}

export default function QRCodeDisplay({
  productId,
  size = 150,
}: QRCodeDisplayProps) {
  const verifyUrl = `${window.location.origin}/?verify=${encodeURIComponent(productId)}`;
  const qrSrc = `https://api.qrserver.com/v1/create-qr-code/?size=${size}x${size}&data=${encodeURIComponent(verifyUrl)}&bgcolor=ffffff&color=0b1321&qzone=1`;

  return (
    <div className="flex flex-col items-center gap-2">
      <img
        src={qrSrc}
        alt={`QR code for product ${productId}`}
        width={size}
        height={size}
        className="rounded-lg border border-border shadow-xs"
      />
      <p className="text-[10px] text-muted-foreground text-center max-w-[150px]">
        Scan to verify product authenticity
      </p>
    </div>
  );
}
