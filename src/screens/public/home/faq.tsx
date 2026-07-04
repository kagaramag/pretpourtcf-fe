const faqs = [
  {
    question: "Qu'est-ce que le TCF?",
    answer:
      "Le TCF (Test de Connaissance du Français) est un test officiel de niveau de français langue étrangère. Il évalue vos compétences linguistiques selon les niveaux du CECR (A1 à C2). Il est reconnu internationalement et souvent requis pour l'immigration, les études ou le travail dans les pays francophones.",
  },
  {
    question: "Comment fonctionne le plateforme?",
    answer:
      "Après votre inscription, vous accédez immédiatement à notre bibliothèque d'exercices et de tests. Vous pouvez vous entraîner à votre rythme, suivre vos progrès en temps réel, et recevoir des corrections détaillées. Notre système adapte les exercices à votre niveau pour maximiser votre progression.",
  },
  {
    question: "Puis-je annuler mon abonnement à tout moment?",
    answer:
      "Oui, vous pouvez annuler votre abonnement à tout moment depuis votre espace personnel. Il n'y a aucun engagement à long terme. Si vous annulez, vous conservez l'accès jusqu'à la fin de votre période payée.",
  },
  {
    question: "Les tests sont-ils similaires au vrai TCF?",
    answer:
      "Absolument! Nos tests sont conçus pour reproduire fidèlement le format, la difficulté et les conditions du TCF officiel. Nous mettons régulièrement à jour notre contenu pour qu'il reste conforme aux dernières versions du test.",
  },
  {
    question: "Combien de temps faut-il pour se préparer?",
    answer:
      "Cela dépend de votre niveau actuel et de votre objectif. En moyenne, nos utilisateurs s'entraînent entre 4 et 12 semaines. Avec une pratique régulière de 30 minutes par jour, la plupart constatent des progrès significatifs après 2 semaines.",
  },
  {
    question: "Puis-je accéder à la plateforme depuis mon téléphone?",
    answer:
      "Oui! Notre plateforme est entièrement responsive et fonctionne parfaitement sur tous les appareils: ordinateurs, tablettes et smartphones. Vous pouvez ainsi vous entraîner où que vous soyez.",
  },
  {
    question: "Recevrai-je un certificat après ma préparation?",
    answer:
      "Notre plateforme vous prépare au TCF officiel, mais ne délivre pas de certificat reconnu. Vous devrez passer le TCF officiel auprès d'un centre agréé pour obtenir votre certification. Nous vous accompagnons dans cette préparation pour maximiser vos chances de réussite.",
  },
];

export default function LandingFAQ() {
  return (
    <div className="bg-gray-50 py-3 sm:py-20 md:py-24 lg:py-4">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-4xl">
          <h2 className="text-3xl sm:text-4xl md:text-5xl tracking-tighter text-center leading-tight">
            Questions fréquentes
          </h2>
          <div className="text-sm sm:text-lg text-center text-gray-700">
            Vous avez des questions? Nous avons les réponses.
          </div>
          <div className="mt-2 sm:mt-4 lg:mt-4 bg-white p-4 sm:p-6 lg:rounded-2xl rounded-lg divide-y divide-gray-200">
            {faqs.map((faq, index) => (
              <details key={index} className="group py-4 first:pt-0 last:pb-0">
                <summary className="flex cursor-pointer items-center justify-between gap-4 text-left text-sm font-medium text-gray-900 hover:text-primary list-none [&::-webkit-details-marker]:hidden">
                  <span>{faq.question}</span>
                  <svg
                    className="h-4 w-4 shrink-0 text-gray-500 transition-transform duration-200 group-open:rotate-180"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2}
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
                  </svg>
                </summary>
                <p className="mt-3 text-sm sm:text-base text-gray-700">
                  {faq.answer}
                </p>
              </details>
            ))}
          </div>
          <div className="mt-10 sm:mt-12 text-center mb-6">
            <p className="text-base text-gray-700">
              Vous avez d'autres questions?{" "}
              <a
                href="/contactez-nous"
                className="font-semibold text-primary hover:text-primary/80"
              >
                Contactez-nous
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
