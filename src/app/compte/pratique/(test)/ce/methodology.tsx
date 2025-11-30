export default function MethodCE() {
  return (
    <div className="p-6 bg-[#69edcd] rounded-2xl flex flex-col gap-1">
      <h1 className="lg:text-2xl text-lg font-bold">
        Méthodologie pour la pratique de la compréhension écrite
      </h1>
      <h5 className="text-sm mb-2 max-w-3xl">
        Vous lisez des textes variés (articles, annonces, courriels,
        documents professionnels), puis vous répondez aux questions à
        choix multiples basées sur votre compréhension du texte.
      </h5>
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Avant la lecture</h4>
          <div className="text-black/80 text-sm">
            Lire rapidement les questions pour identifier les informations clés
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Pendant la lecture</h4>
          <div className="text-black/80 text-sm">
            Repérer les mots-clés et les idées principales du texte
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Répondre méthodiquement</h4>
          <div className="text-black/80 text-sm">
            Relire les passages pertinents avant de choisir votre réponse
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Conseil pratique</h4>
          <div className="text-black/80 text-sm">
            Pratiquer régulièrement la lecture en français pour améliorer votre vitesse
          </div>
        </div>
      </div>
    </div>
  );
}
