"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loader2, Calendar, User } from "lucide-react";
import { blogService } from "@/services/blog";
import { Blog } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";
import Link from "next/link";
import { config } from "@/config";

function PublicBlogScreenContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [searchQuery, setSearchQuery] = useState(
    searchParams.get("search") || ""
  );
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [blogs, setBlogs] = useState<Blog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 9,
    total: 0,
    totalPages: 0,
    hasNextPage: false,
    hasPrevPage: false,
  });

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);

    const queryString = params.toString();
    router.push(`/blog${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [searchQuery]);

  useEffect(() => {
    fetchBlogs();
  }, [pagination.page, debouncedSearch]);

  const fetchBlogs = async () => {
    try {
      setIsLoading(true);
      const response = await blogService.getPublishedBlogs({
        page: pagination.page,
        limit: pagination.limit,
        search: debouncedSearch || undefined,
        sort: "-_id",
      });

      setBlogs(response.data.blogs);
      setPagination({
        ...pagination,
        ...response.data.pagination,
      });
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch blogs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-primary text-white py-8">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
            Blog
          </h1>
          <p className="text-xl text-center text-white/80 max-w-2xl mx-auto">
            Découvrez nos articles, conseils et actualités sur la préparation au TCF
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-muted-foreground" />
            <Input
              placeholder="Rechercher des articles..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-12 text-lg"
            />
          </div>
        </div>

        {/* Blog Grid */}
        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-medium">Aucun article trouvé</p>
            <p className="text-sm text-muted-foreground">
              {searchQuery
                ? "Essayez d'ajuster votre recherche"
                : "Revenez bientôt pour découvrir nos articles"}
            </p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {blogs.map((blog) => (
                <Link href={`/blog/${blog._id}`} key={blog._id}>
                  <div className="border border-border bg-white rounded-lg h-full hover:shadow-lg transition-shadow cursor-pointer">
                    {blog.cover_image && (
                      <div className="aspect-video overflow-hidden rounded-t-lg">
                        <img
                          src={`${config.cloudFlarePublicUrl}practices/images/${blog.cover_image}`}
                          alt={blog.title}
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2 line-clamp-2">
                        {blog.title}
                      </h2>
                      <p className="text-muted-foreground mb-4 line-clamp-3">
                        {blog.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4" />
                          <span>
                            {blog.published_at
                              ? formatDate(blog.published_at)
                              : formatDate(blog.createdAt)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <div className="flex items-center justify-center gap-4">
                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page - 1 })
                  }
                  disabled={!pagination.hasPrevPage}
                >
                  Précédent
                </Button>
                <span className="text-sm text-muted-foreground">
                  Page {pagination.page} sur {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  onClick={() =>
                    setPagination({ ...pagination, page: pagination.page + 1 })
                  }
                  disabled={!pagination.hasNextPage}
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default function PublicBlogScreen() {
  return (
    <Suspense fallback={<Loader2 className="h-8 w-8 animate-spin" />}>
      <PublicBlogScreenContent />
    </Suspense>
  );
}
