"use client";

import React from "react";
import { motion } from "framer-motion";
import {
  BookOpen,
  PenTool,
  Headphones,
  Mic,
  CheckCircle,
  Users,
  Trophy,
  Clock,
  Target,
  Star,
  ArrowRight,
  Sparkles,
  Brain,
  MessageSquare,
  FileText,
  Volume2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { NavigationLink } from "@/components/ui/navigation-link";

const PreparationScreen = () => {
  const preparations = [
    {
      id: 1,
      title: "Compréhension Écrite",
      icon: BookOpen,
      color: "bg-blue-500",
      bgGradient:
        "bg-gradient-to-br from-blue-50 to-cyan-50 dark:from-blue-950/30 dark:to-cyan-950/30",
      borderColor: "border-blue-200 dark:border-blue-800",
      description:
        "Développez vos compétences en lecture et compréhension de textes variés",
      duration: "45 minutes",
      questions: "29 questions",
      skills: [
        "Identifier des informations essentielles",
        "Analyser des textes complexes",
        "Comprendre les nuances et implications",
        "Extraire des données pertinentes",
      ],
      tips: [
        "Lecture rapide et efficace",
        "Repérage des mots-clés",
        "Stratégies de compréhension globale",
        "Gestion optimale du temps",
      ],
      levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    },
    {
      id: 2,
      title: "Expression écrite",
      icon: PenTool,
      color: "bg-purple-500",
      bgGradient:
        "bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-950/30 dark:to-pink-950/30",
      borderColor: "border-purple-200 dark:border-purple-800",
      description:
        "Maîtrisez l'art de la rédaction en français avec structure et clarté",
      duration: "60 minutes",
      questions: "3 tâches",
      skills: [
        "Rédaction de messages courts",
        "Argumentation structurée",
        "Expression d'opinions personnelles",
        "Synthèse d'informations",
      ],
      tips: [
        "Structure claire et logique",
        "Vocabulaire riche et varié",
        "Connecteurs logiques appropriés",
        "Orthographe et grammaire soignées",
      ],
      levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    },
    {
      id: 3,
      title: "Compréhension Orale",
      icon: Headphones,
      color: "bg-emerald-500",
      bgGradient:
        "bg-gradient-to-br from-emerald-50 to-teal-50 dark:from-emerald-950/30 dark:to-teal-950/30",
      borderColor: "border-emerald-200 dark:border-emerald-800",
      description:
        "Entraînez votre oreille à comprendre différents accents et contextes",
      duration: "25 minutes",
      questions: "29 questions",
      skills: [
        "Compréhension de dialogues quotidiens",
        "Extraction d'informations spécifiques",
        "Reconnaissance des intentions",
        "Analyse de discours formels",
      ],
      tips: [
        "Écoute active et concentration",
        "Anticipation des réponses",
        "Prise de notes efficace",
        "Familiarisation avec différents accents",
      ],
      levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    },
    {
      id: 4,
      title: "Expression Orale",
      icon: Mic,
      color: "bg-orange-500",
      bgGradient:
        "bg-gradient-to-br from-orange-50 to-red-50 dark:from-orange-950/30 dark:to-red-950/30",
      borderColor: "border-orange-200 dark:border-orange-800",
      description: "Gagnez en confiance et fluidité dans vos prises de parole",
      duration: "12 minutes",
      questions: "3 tâches",
      skills: [
        "Présentation personnelle fluide",
        "Interaction spontanée",
        "Expression d'opinions argumentées",
        "Description détaillée",
      ],
      tips: [
        "Prononciation claire",
        "Fluidité et naturel",
        "Gestion du stress",
        "Structuration des idées",
      ],
      levels: ["A1", "A2", "B1", "B2", "C1", "C2"],
    },
  ];

  const benefits = [
    {
      icon: Target,
      title: "Objectifs Personnalisés",
      description:
        "Des parcours adaptés à votre niveau et vos objectifs spécifiques",
    },
    {
      icon: Brain,
      title: "Méthode Cognitive",
      description:
        "Approche basée sur les sciences cognitives pour une mémorisation optimale",
    },
    {
      icon: Users,
      title: "Communauté Active",
      description: "Échangez avec d'autres apprenants et progressez ensemble",
    },
    {
      icon: Trophy,
      title: "Certification Garantie",
      description:
        "Préparez-vous efficacement pour obtenir votre certification TCF",
    },
  ];

  const stats = [
    { value: "95%", label: "Taux de réussite" },
    { value: "10K+", label: "Étudiants formés" },
    { value: "4.9/5", label: "Note moyenne" },
    { value: "24/7", label: "Support disponible" },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 dark:from-gray-900 dark:to-gray-950">
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-20 pb-16 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto text-center relative z-10"
        >
          <Badge
            className="mb-4 px-4 py-1.5 text-sm font-medium"
            variant="secondary"
          >
            <Sparkles className="w-3.5 h-3.5 mr-1.5" />
            Préparation complète au TCF
          </Badge>

          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent mb-6">
            Maîtrisez les 4 Compétences du TCF
          </h1>

          <p className="text-lg md:text-xl text-muted-foreground max-w-3xl mx-auto mb-8">
            Découvrez notre programme de préparation complet pour exceller dans
            toutes les épreuves du Test de Connaissance du Français. Des
            méthodes éprouvées pour garantir votre succès.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="group">
              Commencer gratuitement
              <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
            <Button size="lg" variant="outline">
              <MessageSquare className="mr-2 w-4 h-4" />
              Découvrir le programme
            </Button>
          </div>

          {/* Stats Bar */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.1, duration: 0.5 }}
                className="text-center"
              >
                <div className="text-2xl md:text-3xl font-bold text-primary">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">
                  {stat.label}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.div>
      </section>

      {/* Main Preparations Section */}
      <section className="py-16 px-4">
        <div className="mx-auto max-w-6xl">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Les 4 Compétences Essentielles
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Chaque module est conçu pour développer une compétence spécifique
              avec des exercices progressifs et des stratégies gagnantes.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {preparations.map((prep, index) => (
              <motion.div
                key={prep.id}
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.15, duration: 0.6 }}
              >
                <div
                  className={`h-full border p-6 transition-all duration-300 overflow-hidden group rounded-3xl`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div
                      className={`p-3 rounded-xl bg-gradient-to-br ${prep.color} text-white`}
                    >
                      <prep.icon className="w-8 h-8" />
                    </div>
                    <div className="flex gap-1">
                      {prep.levels.slice(-3).map((level) => (
                        <Badge
                          key={level}
                          variant="secondary"
                          className="text-xs"
                        >
                          {level}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <h3 className="font-semibold text-2xl mb-2 group-hover:text-primary transition-colors">
                    {prep.title}
                  </h3>
                  <div className="p-6">
                    {prep.description}
                  </div>

                  <div className="flex gap-4 mt-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {prep.duration}
                    </div>
                    <div className="flex items-center gap-1">
                      <FileText className="w-4 h-4" />
                      {prep.questions}
                    </div>
                  </div>

                  <div className="space-y-6 mt-4">
                    {/* Skills Section */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Target className="w-4 h-4 text-primary" />
                        Compétences développées
                      </h4>
                      <ul className="space-y-2">
                        {prep.skills.map((skill, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <CheckCircle className="w-4 h-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span>{skill}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    {/* Tips Section */}
                    <div>
                      <h4 className="font-semibold mb-3 flex items-center gap-2">
                        <Star className="w-4 h-4 text-primary" />
                        Conseils stratégiques
                      </h4>
                      <ul className="space-y-2">
                        {prep.tips.map((tip, idx) => (
                          <li
                            key={idx}
                            className="flex items-start gap-2 text-sm"
                          >
                            <Sparkles className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                            <span>{tip}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 px-4 bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Pourquoi Choisir Notre Programme ?
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Une approche complète et innovante pour votre réussite au TCF
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {benefits.map((benefit, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center group"
              >
                <div className="mb-4 inline-flex p-4 rounded-2xl bg-primary/10 to-accent/10 group-hover:from-primary/20 group-hover:to-accent/20 transition-all duration-300">
                  <benefit.icon className="w-8 h-8 text-primary" />
                </div>
                <h3 className="text-lg font-semibold mb-2">{benefit.title}</h3>
                <p className="text-sm text-muted-foreground">
                  {benefit.description}
                </p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Path Section */}
      <section className="py-16 px-4">
        <div className="container mx-auto">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="max-w-4xl mx-auto"
          >
            <Card className="border-2 border-primary/20 bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="p-8 md:p-12">
                <div className="text-center mb-8">
                  <h2 className="text-3xl font-bold mb-4">
                    Votre Parcours de Réussite
                  </h2>
                  <p className="text-lg text-muted-foreground">
                    Un programme structuré pour atteindre vos objectifs
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                      1
                    </div>
                    <h3 className="font-semibold mb-2">Évaluation Initiale</h3>
                    <p className="text-sm text-muted-foreground">
                      Test de niveau personnalisé pour identifier vos points
                      forts et axes d'amélioration
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                      2
                    </div>
                    <h3 className="font-semibold mb-2">Programme Adapté</h3>
                    <p className="text-sm text-muted-foreground">
                      Exercices ciblés et progression graduelle selon votre
                      niveau et disponibilité
                    </p>
                  </div>

                  <div className="text-center">
                    <div className="w-12 h-12 mx-auto mb-4 rounded-full bg-primary/20 flex items-center justify-center text-primary font-bold text-xl">
                      3
                    </div>
                    <h3 className="font-semibold mb-2">Certification TCF</h3>
                    <p className="text-sm text-muted-foreground">
                      Examens blancs et accompagnement jusqu'à l'obtention de
                      votre certification
                    </p>
                  </div>
                </div>

                <div className="mt-10 text-center">
                  <NavigationLink href="/compte/inscription">
                    <Button size="lg" className="group">
                      Démarrer Mon Parcours
                      <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </Button>
                  </NavigationLink>
                </div>
              </div>
            </Card>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-4 bg-primary ">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.6 }}
          className="container mx-auto text-center"
        >
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à Exceller au TCF ?
          </h2>
          <p className="text-lg text-white max-w-xl mx-auto mb-8">
            Rejoignez des milliers d'étudiants qui ont réussi leur certification
            grâce à notre méthode
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <NavigationLink href="/compte/inscription">
              <Button size="lg" className="group">
                <Sparkles className="mr-2 w-4 h-4" />
                Essai Gratuit 3 Jours
                <ArrowRight className="ml-2 w-4 h-4 transition-transform group-hover:translate-x-1" />
              </Button>
            </NavigationLink>
            <NavigationLink href="/tarifs">
              <Button size="lg" variant="outline">
                Voir les Tarifs
              </Button>
            </NavigationLink>
          </div>

          <p className="text-sm text-white mt-6">
            Aucune carte de crédit requise • Accès immédiat • Support 24/7
          </p>
        </motion.div>
      </section>
    </div>
  );
};

export default PreparationScreen;
