import BlogDetailScreen from "@/screens/blog/blog-detail";

export const metadata = {
  title: "PrêtPourTCF | Détails de l'article",
  description: "Consultez et modifiez les détails d'un article du blog PrêtPourTCF",
};

interface BlogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function BlogDetailPage({ params }: BlogDetailPageProps) {
  const { id } = await params;
  return <BlogDetailScreen blogId={id} />;
}
