import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  AlertTriangle,
  Award,
  CheckCircle2,
  ChevronRight,
  Copy,
  Globe,
  Link as LinkIcon,
  Loader2,
  QrCode,
  Search,
  Shield,
  ShieldCheck,
  ShieldX,
  Sparkles,
  X,
  XCircle,
  Zap,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import type { Product, VerificationResult } from "../backend.d";
import CertificateModal from "../components/CertificateModal";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import QRCodeDisplay from "../components/QRCodeDisplay";
import QRScannerModal from "../components/QRScannerModal";
import { useListProducts, useVerifyProduct } from "../hooks/useQueries";

// Extended result type to accommodate new backend fields
type ExtendedVerificationResult = VerificationResult & {
  originalProductDetails?: Product;
  fakeIndicators?: string[];
};

// ── Animated Shield ───────────────────────────────────────────────────────────
function AnimatedShield() {
  return (
    <div className="relative w-72 h-72 mx-auto flex items-center justify-center">
      <div className="absolute inset-0 rounded-full border border-teal/20 animate-ring-expand" />
      <div
        className="absolute inset-0 rounded-full border border-teal/15 animate-ring-expand"
        style={{ animationDelay: "1s" }}
      />
      <div
        className="absolute w-56 h-56 rounded-full border border-dashed border-teal/25 animate-spin-slow"
        style={{ transform: "rotateX(65deg)" }}
      />
      <div
        className="absolute w-44 h-44 rounded-full border border-teal/20 animate-spin-reverse"
        style={{ transform: "rotateX(65deg) rotateZ(40deg)" }}
      />
      <div className="absolute w-36 h-36 rounded-full bg-teal/10 blur-2xl animate-pulse-glow" />
      <div className="relative w-28 h-28 rounded-2xl bg-gradient-to-br from-teal/30 to-teal/10 border border-teal/40 flex items-center justify-center shadow-teal-lg animate-float">
        <Shield className="w-14 h-14 text-teal" strokeWidth={1.5} />
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-green-400 border-2 border-navy-900 flex items-center justify-center">
          <CheckCircle2 className="w-3 h-3 text-navy-900" />
        </div>
      </div>
      {[0, 72, 144, 216, 288].map((deg) => (
        <div
          key={deg}
          className="absolute w-2.5 h-2.5 rounded-full bg-teal/60"
          style={{
            transform: `rotate(${deg}deg) translateX(108px)`,
            animationDelay: `${deg / 288}s`,
          }}
        />
      ))}
    </div>
  );
}

// ── Trust Score Ring ──────────────────────────────────────────────────────────
function TrustRing({ score, status }: { score: number; status: string }) {
  const [animated, setAnimated] = useState(0);
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    const t = setTimeout(() => setAnimated(score), 100);
    return () => clearTimeout(t);
  }, [score]);

  const offset = circumference - (animated / 100) * circumference;
  const isGenuine = status === "genuine";
  const isCounterfeit = status === "fake";
  const strokeColor = isGenuine
    ? "oklch(0.56 0.16 155)"
    : isCounterfeit
      ? "oklch(0.52 0.19 27)"
      : "oklch(0.68 0.17 60)";

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      <svg
        width="100"
        height="100"
        viewBox="0 0 100 100"
        role="img"
        aria-label="Trust score ring"
        className="-rotate-90"
      >
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke="oklch(0.9 0.01 240)"
          strokeWidth="8"
        />
        <circle
          cx="50"
          cy="50"
          r={radius}
          fill="none"
          stroke={strokeColor}
          strokeWidth="8"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          style={{ transition: "stroke-dashoffset 1s ease-out" }}
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="text-xl font-display font-black text-foreground">
          {animated}%
        </span>
        <span className="text-[10px] text-muted-foreground font-medium">
          Trust
        </span>
      </div>
    </div>
  );
}

// ── Product Details Grid ──────────────────────────────────────────────────────
function ProductDetailsGrid({ product }: { product: Product }) {
  return (
    <div className="grid sm:grid-cols-2 gap-x-6 gap-y-3 mb-5">
      {(
        [
          ["Product Name", product.name],
          ["Product ID", product.id],
          ["Manufacturer", product.manufacturer],
          ["Serial Number", product.serialNumber],
          ["Batch Number", product.batchNumber],
          ["Production Date", product.productionDate],
          ["Current Owner", product.currentOwner],
          ["Warranty", product.warrantyInfo],
        ] as [string, string][]
      ).map(([label, value]) => (
        <div key={label}>
          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide mb-0.5">
            {label}
          </p>
          <p className="text-sm font-medium text-foreground truncate">
            {value || "—"}
          </p>
        </div>
      ))}
    </div>
  );
}

// ── Distributor Panel ─────────────────────────────────────────────────────────
function DistributorPanel({
  product,
  tint = "default",
}: { product: Product; tint?: "default" | "green" }) {
  if (!product.distributorName) return null;
  return (
    <div
      className={`rounded-xl border p-4 mb-5 ${
        tint === "green"
          ? "bg-success/5 border-success/30"
          : "bg-muted/50 border-border"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <Globe
          className={`w-4 h-4 ${tint === "green" ? "text-success" : "text-teal"}`}
        />
        <span
          className={`text-xs font-bold uppercase tracking-widest ${
            tint === "green" ? "text-success" : "text-teal"
          }`}
        >
          Authorized Distributor
        </span>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {(
          [
            ["Name", product.distributorName],
            ["Contact", product.distributorContact],
            ["Address", product.distributorAddress],
            ["Country", product.distributorCountry],
          ] as [string, string][]
        ).map(([label, value]) => (
          <div key={label}>
            <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
            <p className="text-sm font-medium">{value || "—"}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function HomePage() {
  const [query, setQuery] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [scanOpen, setScanOpen] = useState(false);
  const [certProduct, setCertProduct] = useState<Product | null>(null);
  const [showQR, setShowQR] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const { data: products = [] } = useListProducts();
  const verifyMutation = useVerifyProduct();

  const result = verifyMutation.data as ExtendedVerificationResult | undefined;
  const isLoading = verifyMutation.isPending;

  // Build suggestions: show both name and ID
  const suggestions = products
    .filter(
      (p) =>
        !query ||
        p.name.toLowerCase().includes(query.toLowerCase()) ||
        p.id.toLowerCase().includes(query.toLowerCase()),
    )
    .slice(0, 8);

  const handleVerify = async (term?: string) => {
    const q = (term ?? query).trim();
    if (!q) return;
    setShowSuggestions(false);
    await verifyMutation.mutateAsync(q);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") handleVerify();
  };

  const trustScore = result?.status === "genuine" ? 100 : 0;

  // Get the matched product (genuine) — may come as array or object
  const matched: Product | null =
    result?.status === "genuine"
      ? ((Array.isArray(result.matchedProductDetails)
          ? (result.matchedProductDetails as Product[])[0]
          : result.matchedProductDetails) ?? null)
      : null;

  // The genuine original (when fake was scanned)
  const original: Product | null =
    result?.status === "fake"
      ? ((Array.isArray(result.originalProductDetails)
          ? (result.originalProductDetails as Product[])[0]
          : result.originalProductDetails) ?? null)
      : null;

  const fakeIndicators: string[] = result?.fakeIndicators ?? [
    "Product not found in blockchain registry",
    "Cannot verify manufacturer authenticity",
    "No distributor records found",
    "Serial number not verifiable",
  ];

  const copyLink = () => {
    navigator.clipboard.writeText(
      `${window.location.origin}?verify=${encodeURIComponent(query)}`,
    );
    toast.success("Link copied to clipboard!");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />

      {/* ── Hero ── */}
      <section className="hero-dark relative overflow-hidden">
        <div className="hero-grid absolute inset-0 pointer-events-none" />
        <div className="absolute top-20 left-10 w-72 h-72 rounded-full bg-teal/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 right-10 w-96 h-96 rounded-full bg-teal/5 blur-3xl pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <motion.div
              initial={{ opacity: 0, x: -32 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.7, ease: "easeOut" }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-teal/30 bg-teal/10 px-3 py-1 text-xs font-bold text-teal uppercase tracking-widest mb-6">
                <Sparkles className="w-3 h-3" />
                Blockchain-Powered Authentication
              </div>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-display font-black text-white leading-[0.95] tracking-tight mb-6">
                Is Your
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal to-teal-glow">
                  Product Real?
                </span>
              </h1>
              <p className="text-white/60 text-lg leading-relaxed mb-10 max-w-lg">
                Verify authenticity in seconds using immutable blockchain
                technology. Detect counterfeits instantly — search any product
                from the market.
              </p>

              <div className="flex flex-wrap gap-8">
                {[
                  {
                    label: "Products Protected",
                    value: products.length || "35+",
                    icon: Shield,
                  },
                  {
                    label: "Verifications",
                    value: "1,000+",
                    icon: CheckCircle2,
                  },
                  { label: "Accuracy", value: "99.9%", icon: Sparkles },
                ].map((stat) => (
                  <motion.div
                    key={stat.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.3 }}
                    className="flex flex-col"
                  >
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <stat.icon className="w-3.5 h-3.5 text-teal" />
                      <span className="text-2xl font-display font-black text-white">
                        {stat.value}
                      </span>
                    </div>
                    <span className="text-white/40 text-xs font-medium">
                      {stat.label}
                    </span>
                  </motion.div>
                ))}
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.85 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex justify-center"
            >
              <AnimatedShield />
            </motion.div>
          </div>
        </div>
      </section>

      {/* ── Verify Card ── */}
      <div className="relative z-10 -mt-16 px-4 sm:px-6 lg:px-8 max-w-4xl mx-auto w-full">
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          <Card className="shadow-card-lg border border-border/60 overflow-visible">
            <CardContent className="p-6">
              <Tabs defaultValue="search">
                <TabsList
                  className="w-full mb-5 bg-muted/60"
                  data-ocid="verify.tab"
                >
                  <TabsTrigger value="search" className="flex-1 gap-1.5">
                    <Search className="w-3.5 h-3.5" />
                    Search by Name / ID
                  </TabsTrigger>
                  <TabsTrigger value="scan" className="flex-1 gap-1.5">
                    <QrCode className="w-3.5 h-3.5" />
                    Scan QR Code
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="mt-0">
                  <div className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input
                      ref={inputRef}
                      data-ocid="verify.search_input"
                      className="pl-10 pr-10 h-12 text-base rounded-xl border-border focus:border-teal focus:ring-teal/20"
                      placeholder="Enter product name or ID — e.g. Nike Air Max, iPhone 15, Rolex..."
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value);
                        setShowSuggestions(true);
                      }}
                      onKeyDown={handleKeyDown}
                      onFocus={() => setShowSuggestions(true)}
                      onBlur={() =>
                        setTimeout(() => setShowSuggestions(false), 200)
                      }
                      autoComplete="off"
                    />
                    {query && (
                      <button
                        type="button"
                        onClick={() => {
                          setQuery("");
                          verifyMutation.reset();
                        }}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Suggestions dropdown */}
                    <AnimatePresence>
                      {showSuggestions && suggestions.length > 0 && (
                        <motion.div
                          initial={{ opacity: 0, y: -8 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -8 }}
                          transition={{ duration: 0.15 }}
                          className="absolute top-full mt-2 left-0 right-0 bg-card border border-border rounded-xl shadow-card-lg z-20 overflow-hidden"
                        >
                          <div className="px-3 py-2 text-xs text-muted-foreground font-medium border-b border-border">
                            {query
                              ? `Results for "${query}"`
                              : "Popular products — click to verify"}
                          </div>
                          {suggestions.map((p) => (
                            <button
                              key={p.id}
                              type="button"
                              className="w-full flex items-center gap-3 px-3 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left"
                              onClick={() => {
                                setQuery(p.name);
                                handleVerify(p.name);
                              }}
                            >
                              <ChevronRight className="w-3.5 h-3.5 text-teal flex-shrink-0" />
                              <div className="flex-1 min-w-0">
                                <span className="font-medium text-foreground">
                                  {p.name}
                                </span>
                                <span className="text-muted-foreground ml-2 text-xs font-mono">
                                  {p.id}
                                </span>
                              </div>
                              <Badge
                                variant="outline"
                                className="text-[10px] flex-shrink-0"
                              >
                                {p.manufacturer}
                              </Badge>
                            </button>
                          ))}
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  <Button
                    data-ocid="verify.submit_button"
                    className="w-full mt-4 h-12 btn-teal rounded-xl text-base"
                    onClick={() => handleVerify()}
                    disabled={isLoading || !query.trim()}
                  >
                    {isLoading ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Checking Blockchain...
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 mr-2" />
                        Verify Authenticity Now
                      </>
                    )}
                  </Button>

                  <p className="text-center text-xs text-muted-foreground mt-3">
                    Try:{" "}
                    <button
                      type="button"
                      className="text-teal hover:underline"
                      onClick={() => {
                        setQuery("Nike Air Max");
                        handleVerify("Nike Air Max");
                      }}
                    >
                      Nike Air Max
                    </button>
                    {" · "}
                    <button
                      type="button"
                      className="text-teal hover:underline"
                      onClick={() => {
                        setQuery("iPhone 15");
                        handleVerify("iPhone 15");
                      }}
                    >
                      iPhone 15
                    </button>
                    {" · "}
                    <button
                      type="button"
                      className="text-teal hover:underline"
                      onClick={() => {
                        setQuery("Rolex Submariner");
                        handleVerify("Rolex Submariner");
                      }}
                    >
                      Rolex Submariner
                    </button>
                  </p>
                </TabsContent>

                <TabsContent value="scan" className="mt-0">
                  <div className="text-center py-8">
                    <div className="w-16 h-16 rounded-2xl bg-teal/10 border border-teal/20 flex items-center justify-center mx-auto mb-4">
                      <QrCode className="w-8 h-8 text-teal" />
                    </div>
                    <p className="text-muted-foreground text-sm mb-5">
                      Open your camera and aim at a product's QR code to
                      instantly verify
                    </p>
                    <Button
                      data-ocid="verify.scan_qr.button"
                      className="btn-teal h-12 px-8 rounded-xl gap-2"
                      onClick={() => setScanOpen(true)}
                    >
                      <QrCode className="w-4 h-4" />
                      Open QR Scanner
                    </Button>
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </motion.div>
      </div>

      {/* ── Verification Result ── */}
      <div className="max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 mt-6">
        <AnimatePresence mode="wait">
          {result && (
            <motion.div
              key={result.status + query}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.45 }}
              data-ocid="verify.result.card"
            >
              {/* ── GENUINE ── */}
              {result.status === "genuine" && (
                <Card className="border-2 border-success/50 bg-success/5 overflow-hidden">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-success/15 border border-success/30 flex items-center justify-center flex-shrink-0">
                        <ShieldCheck
                          className="w-9 h-9 text-success"
                          data-ocid="verify.result.success_state"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-xl font-display font-black text-success">
                            ✓ AUTHENTIC PRODUCT
                          </h3>
                          <Badge
                            className="bg-success/15 text-success border-success/30 text-xs"
                            variant="outline"
                          >
                            VERIFIED
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {result.reason}
                        </p>
                        <p className="text-xs text-success/70 mt-1 font-medium">
                          🔒 Powered by Blockchain — Tamper-proof verification
                        </p>
                      </div>
                      <TrustRing score={trustScore} status={result.status} />
                    </div>

                    {matched && (
                      <>
                        <Separator className="mb-5" />
                        <ProductDetailsGrid product={matched} />
                        <DistributorPanel product={matched} tint="green" />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            data-ocid="verify.result.certificate_button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setCertProduct(matched)}
                          >
                            <Award className="w-3.5 h-3.5" />
                            Certificate
                          </Button>
                          <Button
                            data-ocid="verify.result.qr_button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={() => setShowQR(!showQR)}
                          >
                            <QrCode className="w-3.5 h-3.5" />
                            {showQR ? "Hide QR" : "Show QR"}
                          </Button>
                          <Button
                            data-ocid="verify.result.copy_button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5"
                            onClick={copyLink}
                          >
                            <Copy className="w-3.5 h-3.5" />
                            Copy Link
                          </Button>
                        </div>
                        <AnimatePresence>
                          {showQR && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.3 }}
                              className="overflow-hidden mt-4"
                            >
                              <div className="flex justify-center p-4 bg-white rounded-xl border border-border">
                                <QRCodeDisplay productId={matched.id} />
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* ── FAKE ── */}
              {result.status === "fake" && (
                <div className="space-y-4">
                  <Card className="border-2 border-error/60 overflow-hidden fake-alert-pulse">
                    <CardContent className="p-6">
                      <div className="flex items-start gap-4 mb-6">
                        <div className="w-16 h-16 rounded-2xl bg-error/15 border border-error/40 flex items-center justify-center flex-shrink-0">
                          <ShieldX
                            className="w-9 h-9 text-error"
                            data-ocid="verify.result.error_state"
                          />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1 flex-wrap">
                            <h3 className="text-xl font-display font-black text-error">
                              ⚠ COUNTERFEIT ALERT
                            </h3>
                            <Badge
                              className="bg-error/15 text-error border-error/40 text-xs"
                              variant="outline"
                            >
                              FAKE DETECTED
                            </Badge>
                          </div>
                          <p className="text-muted-foreground text-sm">
                            {result.reason}
                          </p>
                          <p className="text-xs text-error/70 mt-1 font-medium">
                            This product is NOT in our blockchain registry.
                          </p>
                        </div>
                        <TrustRing score={0} status={result.status} />
                      </div>

                      {/* Fake Indicators */}
                      <div className="rounded-xl bg-error/5 border border-error/20 p-4 mb-5">
                        <div className="flex items-center gap-2 mb-3">
                          <AlertTriangle className="w-4 h-4 text-error" />
                          <span className="text-sm font-bold text-error uppercase tracking-wider">
                            Fake Indicators Detected
                          </span>
                        </div>
                        <ul className="space-y-2">
                          {fakeIndicators.map((indicator) => (
                            <li
                              key={indicator}
                              className="flex items-start gap-2.5 text-sm"
                            >
                              <XCircle className="w-4 h-4 text-error flex-shrink-0 mt-0.5" />
                              <span className="text-foreground/80">
                                {indicator}
                              </span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      <Button
                        data-ocid="verify.result.report_button"
                        variant="outline"
                        size="sm"
                        className="border-error/40 text-error hover:bg-error/10 gap-1.5"
                      >
                        <AlertTriangle className="w-3.5 h-3.5" />
                        Report This Fake Product
                      </Button>
                    </CardContent>
                  </Card>

                  {/* Genuine Original Panel */}
                  {original ? (
                    <Card className="border-2 border-success/40 bg-success/5">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-5">
                          <div className="w-10 h-10 rounded-xl bg-success/15 border border-success/30 flex items-center justify-center">
                            <ShieldCheck className="w-5 h-5 text-success" />
                          </div>
                          <div>
                            <h4 className="font-display font-bold text-success">
                              🛡 The Genuine Original
                            </h4>
                            <p className="text-xs text-muted-foreground">
                              Below is the genuine version you should verify
                              against.
                            </p>
                          </div>
                          <Badge
                            className="ml-auto bg-success/15 text-success border-success/30"
                            variant="outline"
                          >
                            AUTHENTIC
                          </Badge>
                        </div>
                        <Separator className="mb-5" />
                        <ProductDetailsGrid product={original} />
                        <DistributorPanel product={original} tint="green" />
                        <div className="flex flex-wrap gap-2">
                          <Button
                            data-ocid="verify.original.certificate_button"
                            variant="outline"
                            size="sm"
                            className="gap-1.5 border-success/40 text-success hover:bg-success/10"
                            onClick={() => setCertProduct(original)}
                          >
                            <Award className="w-3.5 h-3.5" />
                            View Certificate
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ) : (
                    <Card className="border border-border/60">
                      <CardContent className="p-6">
                        <div className="flex items-center gap-3 mb-4">
                          <ShieldCheck className="w-5 h-5 text-success" />
                          <h4 className="font-display font-bold text-foreground">
                            🛡 How to Find the Genuine Product
                          </h4>
                        </div>
                        <p className="text-sm text-muted-foreground mb-3">
                          Always purchase from authorized retailers. Check for
                          official hologram stickers, tamper-proof seals, and
                          scan the official QR code on the product packaging.
                        </p>
                        <p className="text-xs text-muted-foreground/70">
                          🔒 Powered by Blockchain — Tamper-proof registry
                        </p>
                      </CardContent>
                    </Card>
                  )}
                </div>
              )}

              {/* ── NOT FOUND ── */}
              {result.status === "not found" && (
                <Card className="border-2 border-warning/50 bg-warning/5">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-16 h-16 rounded-2xl bg-warning/15 border border-warning/30 flex items-center justify-center flex-shrink-0">
                        <AlertTriangle
                          className="w-9 h-9 text-warning"
                          data-ocid="verify.result.error_state"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <h3 className="text-xl font-display font-black text-warning">
                            Product Not Registered
                          </h3>
                          <Badge
                            className="bg-warning/15 text-warning border-warning/30 text-xs"
                            variant="outline"
                          >
                            NOT FOUND
                          </Badge>
                        </div>
                        <p className="text-muted-foreground text-sm">
                          {result.reason}
                        </p>
                        <p className="text-xs text-warning/70 mt-1 font-medium">
                          This product was not found in our registry. Proceed
                          with caution.
                        </p>
                      </div>
                      <TrustRing score={0} status={result.status} />
                    </div>

                    <div className="rounded-xl bg-warning/5 border border-warning/20 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <AlertTriangle className="w-4 h-4 text-warning" />
                        <span className="text-sm font-bold text-warning uppercase tracking-wider">
                          Warning Indicators
                        </span>
                      </div>
                      <ul className="space-y-2">
                        {fakeIndicators.map((indicator) => (
                          <li
                            key={indicator}
                            className="flex items-start gap-2.5 text-sm"
                          >
                            <AlertTriangle className="w-4 h-4 text-warning flex-shrink-0 mt-0.5" />
                            <span className="text-foreground/80">
                              {indicator}
                            </span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </CardContent>
                </Card>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* ── Main content ── */}
      <main className="flex-1 mt-16">
        {/* ── How It Works ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-xs font-bold text-teal uppercase tracking-widest mb-3">
              Simple Process
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-foreground">
              How It Works
            </h2>
          </motion.div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              {
                step: "01",
                icon: Search,
                title: "Find Your Product",
                desc: "Search any product from the market by name or ID. Our AI matches it against the blockchain registry.",
                color: "bg-teal/10 border-teal/20 text-teal",
              },
              {
                step: "02",
                icon: Shield,
                title: "Blockchain Verification",
                desc: "Instant query against an immutable distributed ledger. If it's fake, you'll see red flags and the genuine original.",
                color: "bg-purple-500/10 border-purple-500/20 text-purple-400",
              },
              {
                step: "03",
                icon: Award,
                title: "Get Clear Results",
                desc: "See VERIFIED or FAKE DETECTED instantly. Get the genuine product details and download a Certificate of Authenticity.",
                color: "bg-success/10 border-success/20 text-success",
              },
            ].map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.12 }}
              >
                <Card className="h-full card-lift border-border/60">
                  <CardContent className="p-6">
                    <div className="flex items-start gap-4">
                      <div className="flex-shrink-0">
                        <div
                          className={`w-12 h-12 rounded-2xl border flex items-center justify-center ${item.color}`}
                        >
                          <item.icon className="w-6 h-6" />
                        </div>
                      </div>
                      <div>
                        <span className="text-xs font-black text-muted-foreground/50 uppercase tracking-widest">
                          Step {item.step}
                        </span>
                        <h3 className="font-display font-bold text-foreground mt-1 mb-2">
                          {item.title}
                        </h3>
                        <p className="text-sm text-muted-foreground leading-relaxed">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Feature Cards ── */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 mb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="text-center mb-12"
          >
            <span className="inline-block text-xs font-bold text-teal uppercase tracking-widest mb-3">
              Why VeriProduct
            </span>
            <h2 className="text-3xl sm:text-4xl font-display font-black text-foreground">
              Built for Trust
            </h2>
          </motion.div>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                icon: Shield,
                title: "Blockchain Security",
                desc: "Every product is logged on an immutable distributed ledger. Impossible to fake or alter.",
                iconBg: "bg-teal/10",
                iconColor: "text-teal",
              },
              {
                icon: Globe,
                title: "Any Market Product",
                desc: "Search any product you buy from the market. If it's counterfeit, we'll show you the real one.",
                iconBg: "bg-blue-500/10",
                iconColor: "text-blue-400",
              },
              {
                icon: Zap,
                title: "Instant Results",
                desc: "Sub-second verification. See VERIFIED or FAKE DETECTED with full details immediately.",
                iconBg: "bg-yellow-500/10",
                iconColor: "text-yellow-400",
              },
              {
                icon: Award,
                title: "Official Certificate",
                desc: "Download a printable Certificate of Authenticity with QR code for any verified product.",
                iconBg: "bg-success/10",
                iconColor: "text-success",
              },
            ].map((feat, i) => (
              <motion.div
                key={feat.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
              >
                <Card className="h-full card-lift border-border/60">
                  <CardContent className="p-5">
                    <div
                      className={`w-10 h-10 rounded-xl ${feat.iconBg} flex items-center justify-center mb-4`}
                    >
                      <feat.icon className={`w-5 h-5 ${feat.iconColor}`} />
                    </div>
                    <h3 className="font-display font-bold text-foreground mb-2">
                      {feat.title}
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {feat.desc}
                    </p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* ── Stats Banner ── */}
        <section className="hero-dark relative overflow-hidden mb-0">
          <div className="hero-grid absolute inset-0 pointer-events-none opacity-50" />
          <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                {
                  num: products.length || "35+",
                  label: "Products Protected",
                  icon: Shield,
                },
                { num: "Instant", label: "Verification Speed", icon: Zap },
                { num: "100%", label: "Blockchain-Backed", icon: LinkIcon },
                { num: "Free", label: "Forever, Always", icon: Sparkles },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.4, delay: i * 0.1 }}
                  className="text-center"
                >
                  <div className="w-10 h-10 rounded-xl bg-teal/15 border border-teal/20 flex items-center justify-center mx-auto mb-3">
                    <stat.icon className="w-5 h-5 text-teal" />
                  </div>
                  <div className="text-3xl font-display font-black text-white mb-1">
                    {stat.num}
                  </div>
                  <div className="text-white/50 text-sm">{stat.label}</div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      {/* ── Modals ── */}
      <QRScannerModal
        open={scanOpen}
        onClose={() => setScanOpen(false)}
        onScan={(id) => {
          setScanOpen(false);
          setQuery(id);
          handleVerify(id);
        }}
      />

      {certProduct && (
        <CertificateModal
          product={certProduct}
          open={!!certProduct}
          onClose={() => setCertProduct(null)}
        />
      )}
    </div>
  );
}
