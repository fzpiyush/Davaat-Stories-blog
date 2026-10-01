"use client";

import { useEffect, useState, type MouseEvent } from "react";

export type TocItem = {
  id: string;
  heading: string;
};

interface TableOfContentsProps {
  items: TocItem[];
}

export default function TableOfContents({ items }: TableOfContentsProps) {
  const [activeId, setActiveId] = useState<string>(items[0]?.id ?? "");

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);

    if (elements.length === 0) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort(
            (a, b) => a.boundingClientRect.top - b.boundingClientRect.top,
          );

        if (visible.length > 0) {
          setActiveId(visible[0].target.id);
        }
      },
      { rootMargin: "-15% 0px -70% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    return () => observer.disconnect();
  }, [items]);

  function handleClick(event: MouseEvent<HTMLAnchorElement>, id: string) {
    const target = document.getElementById(id);

    if (!target) {
      return;
    }

    event.preventDefault();

    const reduceMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)",
    ).matches;

    target.scrollIntoView({
      behavior: reduceMotion ? "auto" : "smooth",
      block: "start",
    });

    window.history.replaceState(null, "", `#${id}`);
    setActiveId(id);
  }

  return (
    <nav
      aria-labelledby="toc-heading"
      className="w-full p-6 hidden lg:flex flex-col gap-4 bg-surface-muted rounded-lg"
    >
      <h2
        id="toc-heading"
        className="text-xs font-medium uppercase tracking-[0.2em] text-accent"
      >
        On this page
      </h2>

      <ul className="flex flex-col">
        {items.map((item) => {
          const active = item.id === activeId;

          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                onClick={(event) => handleClick(event, item.id)}
                aria-current={active ? "location" : undefined}
                className="w-full py-1.5 pl-4 block text-sm leading-6 text-muted border-l-2 border-border rounded-r-sm transition-colors duration-200 hover:text-foreground aria-[current=location]:font-medium aria-[current=location]:text-accent aria-[current=location]:border-accent focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent motion-reduce:transition-none"
              >
                {item.heading}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}