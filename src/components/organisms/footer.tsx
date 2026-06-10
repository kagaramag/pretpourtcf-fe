import Link from "next/link";
import { Email, Facebook, Twitter, Instagram, Linkedin } from "@/icons";

const navigation = {
  main: [
    { name: "Accueil", href: "/" },
    { name: "Blog", href: "/blog" },
    { name: "Tarifs", href: "/tarifs" },
    { name: "Séance gratuite", href: "/book" },
    { name: "Contact", href: "/contactez-nous" },
  ],
  legal: [
    { name: "Politique de confidentialité", href: "#" },
    { name: "Conditions d'utilisation", href: "#" },
    { name: "Mentions légales", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-gray-900">
      <div className="mx-auto max-w-7xl overflow-hidden px-5 sm:px-6 lg:px-8 py-10 sm:py-12 md:py-16">
        {/* Main Navigation */}
        <nav
          aria-label="Footer"
          className="flex flex-col items-center gap-4 sm:flex-row sm:flex-wrap sm:justify-center sm:gap-x-6 md:gap-x-8 lg:gap-x-12 text-sm sm:text-base"
        >
          {navigation.main.map((item) => (
            <Link
              key={item.name}
              href={item.href}
              className="text-white/80 hover:text-white transition-colors duration-200 touch-manipulation py-1"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Social Icons */}
        <div className="mt-8 sm:mt-10 flex justify-center gap-5 sm:gap-6">
          {[
            { icon: Facebook, href: "#", label: "Facebook" },
            { icon: Instagram, href: "#", label: "Instagram" },
            { icon: Twitter, href: "#", label: "Twitter" },
            { icon: Linkedin, href: "#", label: "LinkedIn" },
            { icon: Email, href: "mailto:contact@pretpourtcf.com", label: "Email" },
          ].map(({ icon: Icon, href, label }) => (
            <Link
              key={label}
              href={href}
              aria-label={label}
              className="text-white/60 hover:text-white transition-colors duration-200 touch-manipulation"
            >
              <Icon className="size-5 sm:size-6" />
            </Link>
          ))}
        </div>

        {/* Copyright */}
        <div className="mt-8 sm:mt-10 border-t border-white/10 pt-6 sm:pt-8">
          <p className="text-center text-xs sm:text-sm text-white/50">
            &copy; {new Date().getFullYear()} PrêtPourTCF. Tous les droits sont réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
