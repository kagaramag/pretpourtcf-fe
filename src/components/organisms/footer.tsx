const navigation = {
  main: [
    { name: "Accueil", href: "#" },
    { name: "Plans & Tarifs", href: "#" },
    { name: "Blog", href: "#" },
    { name: "FAQs", href: "#" },
    { name: "Contact-nous", href: "#" },
  ],
};

export default function Footer() {
  return (
    <footer className="bg-blue-50">
      <div className="mx-auto max-w-7xl overflow-hidden px-4 sm:px-6 py-12 sm:py-16 md:py-20 lg:py-24 lg:px-8">
        <nav
          aria-label="Footer"
          className="-mb-6 flex flex-wrap justify-center gap-x-6 sm:gap-x-8 md:gap-x-12 gap-y-2 sm:gap-y-3 text-xs sm:text-sm"
        >
          {navigation.main.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-600 hover:text-gray-900"
            >
              {item.name}
            </a>
          ))}
        </nav>
        <p className="mt-8 sm:mt-10 text-center text-xs sm:text-sm text-gray-600 px-4">
          &copy; 2025 PRET POUR TCF LTD, Tous les droits sont réservés.
        </p>
      </div>
    </footer>
  );
}
