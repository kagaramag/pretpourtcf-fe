"use client";

import { useState } from "react";

interface MethodologyStep {
  title: string;
  description: string;
}

interface MethodologyContent {
  title: string;
  description: string;
  steps: MethodologyStep[];
}

type TestType = "co" | "ce" | "eo" | "ee";

interface MethodologyProps {
  type: TestType;
}

const methodologyContent: Record<TestType, MethodologyContent> = {
  ce: {
    title: "Méthodologie pour la pratique de la compréhension écrite",
    description:
      "Vous lisez des textes variés (articles, annonces, courriels, documents professionnels), puis vous répondez aux questions à choix multiples basées sur votre compréhension du texte.",
    steps: [
      {
        title: "Avant la lecture",
        description:
          "Lire rapidement les questions pour identifier les informations clés",
      },
      {
        title: "Pendant la lecture",
        description: "Repérer les mots-clés et les idées principales du texte",
      },
      {
        title: "Répondre méthodiquement",
        description:
          "Relire les passages pertinents avant de choisir votre réponse",
      },
      {
        title: "Conseil pratique",
        description:
          "Pratiquer régulièrement la lecture en français pour améliorer votre vitesse",
      },
    ],
  },
  co: {
    title: "Méthodologie pour la pratique de la compréhension orale",
    description:
      "Vous écoutez des enregistrements audio (conversations, annonces, interviews) diffusés une seule fois, puis vous répondez aux questions à choix multiples basées sur ce que vous avez entendu.",
    steps: [
      {
        title: "Avant l'audio",
        description: "Lire rapidement les questions pour savoir quoi écouter",
      },
      {
        title: "Pendant l'audio",
        description: "Lire rapidement les questions pour savoir quoi écouter",
      },
      {
        title: "Répondre immédiatement",
        description: "Lire rapidement les questions pour savoir quoi écouter",
      },
      {
        title: "Conseil pratique",
        description: "S'entraîner avec des audios pour habituer l'oreille.",
      },
    ],
  },
  ee: {
    title: "Méthodologie pour la pratique de l'expression écrite",
    description:
      "Vous répondez à des questions écrites, rédigez des textes courts ou des essais selon le niveau. Vos réponses sont évaluées sur la clarté, la grammaire et la cohérence.",
    steps: [
      {
        title: "Lire attentivement",
        description:
          "Comprendre la question et ce qui est demandé avant d'écrire",
      },
      {
        title: "Structurer sa réponse",
        description:
          "Organiser ses idées avec une introduction, un développement et une conclusion",
      },
      {
        title: "Soigner la langue",
        description:
          "Utiliser un vocabulaire riche et varié, éviter les répétitions",
      },
      {
        title: "Relire et corriger",
        description:
          "Vérifier l'orthographe, la grammaire et la ponctuation avant de soumettre",
      },
    ],
  },
  eo: {
    title: "Méthodologie pour la pratique de la expression orale",
    description:
      "L'épreuve se compose de 3 tâches : une présentation personnelle (2 min), poser des questions sur un sujet donné (2 min de préparation + 4 min d'interaction), et un débat avec l'examinateur sur un sujet d'actualité.",
    steps: [
      {
        title: "Avant l'épreuve",
        description:
          "Préparer la présentation personnelle : identité, parcours, projets et motivations.",
      },
      {
        title: "Pendant la préparation",
        description:
          "Lire attentivement le sujet et noter rapidement des questions variées ou des arguments clés.",
      },
      {
        title: "Pendant l'interaction",
        description:
          "Parler clairement, utiliser des connecteurs logiques et réagir aux propos de l'examinateur.",
      },
      {
        title: "Conseil pratique",
        description:
          "S'entraîner régulièrement à voix haute et suivre l'actualité pour enrichir ses arguments.",
      },
    ],
  },
};

export default function Methodology({ type }: MethodologyProps) {
  const [showSteps, setShowSteps] = useState(false);
  const content = methodologyContent[type];

  return (
    <div className="p-6 bg-[#69edcd] rounded-2xl flex flex-col gap-1">
      <h1 className="lg:text-2xl text-lg">{content.title}</h1>
      <h5 className="text-sm mb-2 max-w-3xl">{content.description}</h5>

      {/* Toggle button for small screens */}
      <button
        onClick={() => setShowSteps(!showSteps)}
        className="lg:hidden mb-2 px-4 py-1.5 bg-[#53d7b6] rounded-lg font-medium hover:bg-[#3fc09f] transition-colors"
      >
        {showSteps ? "Masquer les étapes" : "Voir les étapes"}
      </button>

      {/* Steps - hidden on small screens by default, always visible on large screens */}
      <div
        className={`${
          showSteps ? "flex" : "hidden"
        } lg:grid flex-col lg:grid-cols-4 gap-3`}
      >
        {content.steps.map((step, index) => (
          <div key={index} className="p-3 bg-[#53d7b6] rounded-xl">
            <h4>{step.title}</h4>
            <div className="text-black/80 text-sm">{step.description}</div>
          </div>
        ))}
      </div>
    </div>
  );
}
