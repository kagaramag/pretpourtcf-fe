import PublicLayout from "@/layouts/public";

export default function ConditionsGeneralesPage() {
  return (
    <div className="container mx-auto px-4 py-12 max-w-4xl">
      <div className="prose prose-lg dark:prose-invert max-w-none">
        <h1 className="text-2xl text-center font-semibold mt-4">
          Conditions Generales d&apos;Utilisation
        </h1>

        <p className="mb-2 text-gray-400 text-center">
          Derniere mise a jour: November 01, 2024
        </p>

        <p>
          Bienvenue sur PretPourTCF.com. En accedant a notre site, vous acceptez
          les presentes conditions generales d&apos;utilisation.
        </p>

        <h2 className="text-lg mt-4 mb-2">
          1. Presentation du site
        </h2>
        <p>
          PretPourTCF.com est une plateforme en ligne dediee a la preparation
          aux examens TCF Canada et TCF Quebec. Nous proposons des exercices
          d&apos;entrainement, des tests blancs et des ressources pedagogiques
          pour vous aider dans votre apprentissage du francais.
        </p>

        <h2 className="text-lg mt-4 mb-2">2. Avertissement</h2>
        <p>
          PretPourTCF.com est une plateforme educative independante. Nous ne
          sommes <strong>ni affilies, ni approuves, ni associes</strong> a
          France Education International, Immigration, Refugies et Citoyennete
          Canada (IRCC) ou au Ministere de l&apos;Immigration, de la
          Francisation et de l&apos;Integration du Quebec (MIFI).
        </p>
        <p>
          Nos contenus sont concus pour vous aider a vous preparer, mais ne
          garantissent aucun resultat specifique aux examens officiels.
        </p>

        <h2 className="text-lg mt-4 mb-2">
          3. Compte utilisateur
        </h2>
        <p>
          En creant un compte, vous vous engagez a fournir des informations
          exactes, a proteger la confidentialite de vos identifiants et a ne pas
          partager votre compte avec d&apos;autres personnes.
        </p>

        <h2 className="text-lg mt-4 mb-2">
          4. Utilisation acceptable
        </h2>
        <p>
          Il est interdit de reproduire ou distribuer nos contenus sans
          autorisation, de perturber le fonctionnement du site ou
          d&apos;utiliser la plateforme a des fins illegales.
        </p>

        <h2 className="text-lg mt-4 mb-2">
          5. Propriete intellectuelle
        </h2>
        <p>
          L&apos;ensemble des contenus presents sur PretPourTCF.com (textes,
          exercices, enregistrements audio, graphiques) est protege par le droit
          d&apos;auteur et reste la propriete exclusive de PretPourTCF.com.
        </p>

        <h2 className="text-lg mt-4 mb-2">
          6. Paiement et abonnement
        </h2>
        <p>
          Les tarifs sont indiques en devise locale au moment de l&apos;achat.
          Les paiements sont traites de maniere securisee via nos prestataires
          de paiement.
        </p>

        <h2 className="text-lg mt-4 mb-2">
          7. Limitation de responsabilite
        </h2>
        <p>
          PretPourTCF.com fournit ses services « en l&apos;etat ». Nous ne
          garantissons pas l&apos;obtention d&apos;un niveau particulier aux
          examens officiels TCF. Notre responsabilite ne saurait etre engagee
          pour tout dommage indirect lie a l&apos;utilisation de notre
          plateforme.
        </p>

        <h2 className="text-lg mt-4 mb-2">
          8. Politique de confidentialite
        </h2>
        <p>
          Vos donnees personnelles sont collectees et traitees conformement a
          notre Politique de Confidentialite. En utilisant notre site, vous
          consentez a cette collecte.
        </p>

        <h2 className="text-lg mt-4 mb-2">9. Modifications</h2>
        <p>
          Nous nous reservons le droit de modifier ces conditions a tout moment.
          Les modifications prennent effet des leur publication sur le site.
        </p>

        <h2 className="text-lg mt-4 mb-2">10. Contact</h2>
        <p>Pour toute question concernant ces conditions, contactez-nous a :</p>
        <p>
          <strong>Email :</strong>{" "}
          <a href="mailto:contact@pretpourtcf.com">contact@pretpourtcf.com</a>
          <br />
          <strong>Site :</strong>{" "}
          <a href="https://www.pretpourtcf.com">www.pretpourtcf.com</a>
        </p>

        <hr className="my-2" />

        <div className="italic text-sm">
          En utilisant PretPourTCF.com, vous reconnaissez avoir lu et accepte
          les presentes Conditions Generales d&apos;Utilisation.
        </div>
      </div>
    </div>
  );
}
