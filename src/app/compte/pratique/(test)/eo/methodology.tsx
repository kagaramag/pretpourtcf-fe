export default function MethodEO() {
  return (
    <div className="p-6 bg-[#69edcd] rounded-2xl flex flex-col gap-1">
      <h1 className="lg:text-2xl text-lg font-bold">
        Méthodologie pour la pratique de la expression orale
      </h1>
      <h5 className="text-sm mb-2 max-w-3xl">
        L'épreuve se compose de 3 tâches : une présentation personnelle (2 min),
        poser des questions sur un sujet donné (2 min de préparation + 4 min
        d'interaction), et un débat avec l'examinateur sur un sujet d'actualité.
      </h5>
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Avant l'épreuve</h4>
          <div className="text-black/80 text-sm">
            Préparer la présentation personnelle : identité, parcours, projets
            et motivations.
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Pendant la préparation</h4>
          <div className="text-black/80 text-sm">
            Lire attentivement le sujet et noter rapidement des questions
            variées ou des arguments clés.
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Pendant l'interaction</h4>
          <div className="text-black/80 text-sm">
            Parler clairement, utiliser des connecteurs logiques et réagir aux
            propos de l'examinateur.
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Conseil pratique</h4>
          <div className="text-black/80 text-sm">
            S'entraîner régulièrement à voix haute et suivre l'actualité pour
            enrichir ses arguments.
          </div>
        </div>
      </div>
    </div>
  );
}
