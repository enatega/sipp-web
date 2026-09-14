"use client";

import { useCallback, useEffect, useRef, useState } from "react";

export function useCategoryScrollSpy(categoryIds: string[]) {
  const [activeCategoryId, setActiveCategoryId] = useState(categoryIds[0] ?? "");
  const sectionRefs = useRef(new Map<string, HTMLElement>());

  useEffect(() => {
    let frame = 0;

    const updateActiveCategory = () => {
      frame = 0;
      const activationLine = window.innerWidth >= 861 ? 158 : 132;
      const availableIds = categoryIds.filter((id) => sectionRefs.current.has(id));
      let nextCategoryId = availableIds[0] ?? "";

      for (const categoryId of availableIds) {
        const section = sectionRefs.current.get(categoryId);
        if (!section || section.getBoundingClientRect().top > activationLine) break;
        nextCategoryId = categoryId;
      }

      const isAtPageEnd =
        window.scrollY + window.innerHeight >=
        document.documentElement.scrollHeight - 4;
      if (isAtPageEnd && availableIds.length) {
        nextCategoryId = availableIds[availableIds.length - 1];
      }

      if (nextCategoryId) {
        setActiveCategoryId((current) =>
          current === nextCategoryId ? current : nextCategoryId,
        );
      }
    };

    const scheduleUpdate = () => {
      if (!frame) frame = window.requestAnimationFrame(updateActiveCategory);
    };

    scheduleUpdate();
    window.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);
    return () => {
      window.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      if (frame) window.cancelAnimationFrame(frame);
    };
  }, [categoryIds]);

  const setSectionRef = useCallback(
    (categoryId: string) => (element: HTMLElement | null) => {
      if (element) sectionRefs.current.set(categoryId, element);
      else sectionRefs.current.delete(categoryId);
    },
    [],
  );

  const scrollToCategory = useCallback((categoryId: string) => {
    setActiveCategoryId(categoryId);
    sectionRefs.current.get(categoryId)?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, []);

  return {
    activeCategoryId: categoryIds.includes(activeCategoryId)
      ? activeCategoryId
      : categoryIds[0] ?? "",
    scrollToCategory,
    setSectionRef,
  };
}
