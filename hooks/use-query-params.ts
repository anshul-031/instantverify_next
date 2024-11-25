"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useCallback } from "react";

export function useQueryParams<T>() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const createQueryString = useCallback(
    (params: Partial<T>) => {
      const newSearchParams = new URLSearchParams(searchParams?.toString());

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === undefined || value === "") {
          newSearchParams.delete(key);
        } else {
          newSearchParams.set(key, String(value));
        }
      });

      return newSearchParams.toString();
    },
    [searchParams]
  );

  const setQueryParams = useCallback(
    (params: Partial<T>) => {
      const queryString = createQueryString(params);
      router.push(`${pathname}${queryString ? `?${queryString}` : ""}`);
    },
    [pathname, router, createQueryString]
  );

  const getQueryParams = useCallback(() => {
    const params: Partial<T> = {};
    searchParams?.forEach((value, key) => {
      (params as any)[key] = value;
    });
    return params;
  }, [searchParams]);

  return {
    queryParams: getQueryParams(),
    setQueryParams,
    createQueryString,
  };
}
