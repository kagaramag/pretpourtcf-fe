import PublicBlogDetailScreen from "@/screens/public-blog/blog-detail";

export const metadata = {
  title: "Article | Pret Pour TCF",
  description: "Lisez nos articles sur la préparation au TCF",
};

interface PublicBlogDetailPageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function PublicBlogDetailPage({
  params,
}: PublicBlogDetailPageProps) {
  const { id } = await params;
  return <PublicBlogDetailScreen blogId={id} />;
}
