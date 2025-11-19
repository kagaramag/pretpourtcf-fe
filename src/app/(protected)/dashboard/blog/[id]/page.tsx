import BlogDetailScreen from "@/screens/blog/blog-detail";

export const metadata = {
  title: "Blog Post | PRET POUR TCF",
  description: "View blog post details",
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
