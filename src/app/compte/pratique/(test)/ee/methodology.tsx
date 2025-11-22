export default function MethodEE() {
  return (
    <div className="p-6 bg-[#69edcd] rounded-2xl flex flex-col gap-1">
      <h1 className="lg:text-2xl text-lg font-bold">
        Méthodologie pour la pratique de l&apos;expression écrite
      </h1>
      <div className="text-black/75 text-sm mb-2 max-w-3xl">
        Vous répondez à des questions écrites, rédigez des textes courts ou des
        essais selon le niveau. Vos réponses sont évaluées sur la clarté, la
        grammaire et la cohérence.
      </div>
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Lire attentivement</h4>
          <div className="text-black/80 text-sm">
            Comprendre la question et ce qui est demandé avant d&apos;écrire
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Structurer sa réponse</h4>
          <div className="text-black/80 text-sm">
            Organiser ses idées avec une introduction, un développement et une
            conclusion
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Soigner la langue</h4>
          <div className="text-black/80 text-sm">
            Utiliser un vocabulaire riche et varié, éviter les répétitions
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Relire et corriger</h4>
          <div className="text-black/80 text-sm">
            Vérifier l&apos;orthographe, la grammaire et la ponctuation avant
            de soumettre
          </div>
        </div>
      </div>
    </div>
  );
}
