export default function MethodCO() {
  return (
    <div className="p-6 bg-[#69edcd] rounded-2xl flex flex-col gap-1">
      <h1 className="lg:text-2xl text-lg font-bold">
        Méthodologie pour la pratique de la compréhension orale
      </h1>
      <h5 className="text-sm mb-2 max-w-3xl">
        Vous écoutez des enregistrements audio (conversations, annonces,
        interviews) diffusés une seule fois, puis vous répondez aux questions à
        choix multiples basées sur ce que vous avez entendu.
      </h5>
      <div className="grid grid-cols-4 gap-3">
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Avant l'audio</h4>
          <div className="text-black/80 text-sm">
            Lire rapidement les questions pour savoir quoi écouter
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Pendant l'audio</h4>
          <div className="text-black/80 text-sm">
            Lire rapidement les questions pour savoir quoi écouter
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Répondre immédiatement</h4>
          <div className="text-black/80 text-sm">
            Lire rapidement les questions pour savoir quoi écouter
          </div>
        </div>
        <div className="p-3 bg-[#53d7b6] rounded-xl">
          <h4>Conseil pratique</h4>
          <div className="text-black/80 text-sm">
            S’entraîner avec des audios pour habituer l’oreille.
          </div>
        </div>
      </div>
    </div>
  );
}
