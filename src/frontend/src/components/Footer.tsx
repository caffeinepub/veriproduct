import { Shield } from "lucide-react";

export default function Footer() {
  const year = new Date().getFullYear();
  const utmLink = `https://caffeine.ai?utm_source=caffeine-footer&utm_medium=referral&utm_content=${encodeURIComponent(typeof window !== "undefined" ? window.location.hostname : "")}`;

  const links = {
    Solutions: [
      "Product Verification",
      "Brand Protection",
      "Supply Chain",
      "Anti-Counterfeiting",
    ],
    Company: ["About Us", "Blog", "Careers", "Press"],
    Resources: ["Documentation", "API Reference", "Case Studies", "Support"],
    Legal: ["Privacy Policy", "Terms of Service", "Cookie Policy"],
  };

  return (
    <footer className="nav-dark border-t border-white/10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8">
          <div className="col-span-2 md:col-span-1">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-7 h-7 rounded bg-white/10 flex items-center justify-center">
                <Shield className="w-4 h-4 text-white" />
              </div>
              <span className="text-white font-bold">VeriProduct</span>
            </div>
            <p className="text-white/50 text-sm leading-relaxed">
              Blockchain-powered product authentication for a safer marketplace.
            </p>
          </div>

          {Object.entries(links).map(([group, items]) => (
            <div key={group}>
              <h4 className="text-white/80 font-semibold text-sm mb-3">
                {group}
              </h4>
              <ul className="space-y-2">
                {items.map((item) => (
                  <li key={item}>
                    <span className="text-white/40 text-sm cursor-default">
                      {item}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="border-t border-white/10 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center gap-3">
          <p className="text-white/40 text-sm">
            © {year}. Built with ❤️ using{" "}
            <a
              href={utmLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-white/60 hover:text-white underline"
            >
              caffeine.ai
            </a>
          </p>
          <p className="text-white/30 text-xs">
            Secured by Internet Computer Blockchain
          </p>
        </div>
      </div>
    </footer>
  );
}
