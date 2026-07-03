"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/use-debounce";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, Loading, Calendar } from "@/icons";
import { blogService } from "@/services/blog";
import { Blog } from "@/types";
import { toast } from "sonner";
import { formatDate } from "@/lib/date-utils";
import Link from "next/link";
import { config } from "@/config";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
}

interface PublicBlogScreenProps {
  initialBlogs: Blog[];
  initialPagination: Pagination;
  initialSearch: string;
}

function PublicBlogScreenContent({
  initialBlogs,
  initialPagination,
  initialSearch,
}: PublicBlogScreenProps) {
  const router = useRouter();

  const [searchQuery, setSearchQuery] = useState(initialSearch);
  const debouncedSearch = useDebounce(searchQuery, 500);

  const [blogs, setBlogs] = useState<Blog[]>(initialBlogs);
  const [isLoading, setIsLoading] = useState(false);
  const [pagination, setPagination] = useState<Pagination>(initialPagination);

  // Skip the first effect run — server already gave us the right data
  const skipNextFetch = useRef(true);

  useEffect(() => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("search", searchQuery);

    const queryString = params.toString();
    router.push(`/blog${queryString ? `?${queryString}` : ""}`, {
      scroll: false,
    });
  }, [searchQuery]);

  useEffect(() => {
    if (skipNextFetch.current) {
      skipNextFetch.current = false;
      return;
    }
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
      setPagination((prev) => ({ ...prev, ...response.data.pagination }));
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Failed to fetch blogs");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-primary text-white pb-8 pt-24">
        <div className="container mx-auto px-4">
          <h1 className="text-4xl md:text-5xl font-bold text-center mb-2">
            Blog
          </h1>
          <p className="text-xl text-center text-white/80 max-w-2xl mx-auto">
            Découvrez nos articles, conseils et actualités
          </p>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        {/* Search */}
        <div className="max-w-2xl mx-auto mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-3 h-5 w-5 text-gray-600" />
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
            <Loading className="h-8 w-8 animate-spin text-gray-600" />
          </div>
        ) : blogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-64 text-center">
            <p className="text-lg font-medium">Aucun article trouvé</p>
            <p className="text-sm text-gray-600">
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
                          loading="lazy"
                          className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                    )}
                    <div className="p-6">
                      <h2 className="text-xl font-bold mb-2 line-clamp-2">
                        {blog.title}
                      </h2>
                      <p className="text-gray-600 mb-4 line-clamp-3">
                        {blog.description}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-600">
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
                <span className="text-sm text-gray-600">
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

export default function PublicBlogScreen(props: PublicBlogScreenProps) {
  return (
    <Suspense fallback={<Loading className="h-8 w-8 animate-spin" />}>
      <PublicBlogScreenContent {...props} />
    </Suspense>
  );
}
