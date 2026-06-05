import PublicBlogScreen from "@/screens/public-blog";

export const revalidate = 1800; // Revalidate every 30 minutes

export const metadata = {
  title: "PrêtPourTCF | Blog — Conseils et actualités TCF",
  description: "Découvrez nos articles, conseils et actualités pour réussir votre préparation au TCF Canada et TCF Québec",
};

export default function PublicBlogPage() {
  return <PublicBlogScreen />;
}
