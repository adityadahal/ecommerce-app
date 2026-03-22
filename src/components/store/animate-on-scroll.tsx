"use client";

import { useRef } from "react";
import { useIntersection } from "@mantine/hooks";

export function AnimateOnScroll({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const { ref, entry } = useIntersection({ threshold: 0.1, rootMargin: "0px 0px -50px 0px" });
  const hasAnimated = useRef(false);
  if (entry?.isIntersecting) hasAnimated.current = true;

  return (
    <div
      ref={ref}
      className={`transition-all duration-700 ease-out ${
        hasAnimated.current ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      } ${className ?? ""}`}
      style={{ transitionDelay: `${delay}ms` }}
    >
      {children}
    </div>
  );
}
