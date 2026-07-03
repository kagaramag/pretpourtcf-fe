import PublicBlogScreen from "@/screens/public-blog";
import { blogService } from "@/services/blog";

export const revalidate = 1800; // Revalidate every 30 minutes

export const metadata = {
  title: "PrêtPourTCF | Blog — Conseils et actualités TCF",
  description: "Découvrez nos articles, conseils et actualités pour réussir votre préparation au TCF Canada et TCF Québec",
};

interface PublicBlogPageProps {
  searchParams: Promise<{ search?: string; page?: string }>;
}

export default async function PublicBlogPage({ searchParams }: PublicBlogPageProps) {
  const { search, page } = await searchParams;
  const currentPage = Number(page) || 1;

  const defaultPagination = {
    page: currentPage,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  };

  try {
    const response = await blogService.getPublishedBlogs({
      page: currentPage,
      limit: 9,
      search: search || undefined,
      sort: "-_id",
    });

    return (
      <PublicBlogScreen
        initialBlogs={response.data.blogs}
        initialPagination={{ ...defaultPagination, ...response.data.pagination }}
        initialSearch={search || ""}
      />
    );
  } catch {
    return (
      <PublicBlogScreen
        initialBlogs={[]}
        initialPagination={defaultPagination}
        initialSearch={search || ""}
      />
    );
  }
}
