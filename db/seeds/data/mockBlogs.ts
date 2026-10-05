export interface Blog {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  tags: string[];
  image: string;
  publishedAt: string;
  readTime: string;
  author: string;
  content: BlogSection[];
}

export interface BlogSection {
  heading?: string;
  paragraphs: string[];
  quote?: string;
}

export const blogs: Blog[] = [
  {
    id: "1",
    slug: "building-a-focused-development-workflow",
    title: "Building a Focused Development Workflow",
    excerpt:
      "Tools, habits, and small changes that help me stay productive and focused as a developer.",
    category: "Technology",
    tags: ["Technology", "Productivity", "Development", "Habits"],
    image:
      "https://plus.unsplash.com/premium_photo-1685086785636-2a1a0e5b591f?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    publishedAt: "September 15, 2026",
    readTime: "5 min read",
    author: "Piyush Gupta",
    content: [
      {
        heading: "Why a focused workflow matters",
        paragraphs: [
          "As developers, it is easy to get distracted. New tools, notifications, endless tabs, and constant context switching can make even simple work feel difficult.",
          "Over time, I have realized that a focused workflow is not about doing more. It is about removing unnecessary friction and giving important work enough uninterrupted attention.",
        ],
      },
      {
        heading: "Keep your environment simple",
        paragraphs: [
          "A clean development environment reduces mental overhead. I try to keep only the tools and extensions that I actively use.",
          "The goal is not to have the perfect setup. The goal is to have a setup that stays out of the way when I am trying to think.",
        ],
        quote:
          "A simple setup creates a calmer mind, and a calmer mind writes better code.",
      },
      {
        heading: "Use time blocks",
        paragraphs: [
          "I work in focused blocks of time rather than constantly switching between tasks.",
          "During these blocks, notifications stay quiet and unrelated tabs stay closed. This makes it easier to maintain momentum.",
        ],
      },
      {
        heading: "Continuous learning",
        paragraphs: [
          "Staying focused does not mean ignoring new ideas. I set aside dedicated time to explore new tools, read technical articles, and work on small experiments.",
          "This keeps learning intentional instead of allowing it to interrupt the work that already needs attention.",
        ],
      },
      {
        heading: "Final thoughts",
        paragraphs: [
          "A focused workflow is a journey rather than a one-time setup.",
          "Small steps, consistent effort, and a clear mind can make the process of building software much more enjoyable.",
        ],
      },
    ],
  },

  {
    id: "2",
    slug: "finding-peace-in-a-busy-world",
    title: "Finding Peace in a Busy World",
    excerpt:
      "A few thoughts on slowing down, simplifying, and being more present in everyday life.",
    category: "Life",
    tags: ["Life", "Mindset", "Reflection"],
    image:
      "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    publishedAt: "September 11, 2026",
    readTime: "4 min read",
    author: "Piyush Gupta",
    content: [
      {
        heading: "The feeling of always being busy",
        paragraphs: [
          "There is always another message, another task, another thing waiting for our attention.",
          "Sometimes the hardest part is not the amount of work itself, but the feeling that we never completely leave it behind.",
        ],
      },
      {
        heading: "Making room for quiet",
        paragraphs: [
          "Small periods of quiet can change the way a day feels.",
          "A walk without a phone, a few pages of a book, or simply sitting somewhere peaceful can create enough space to notice what normally gets ignored.",
        ],
      },
    ],
  },

  {
    id: "3",
    slug: "lessons-ive-learned-along-the-way",
    title: "Lessons I've Learned Along the Way",
    excerpt:
      "A collection of ideas and lessons that have shaped the way I think and work.",
    category: "Ideas",
    tags: ["Ideas", "Learning", "Life"],
    image: "https://images.unsplash.com/photo-1546410531-bb4caa6b424d?q=80&w=1471&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    publishedAt: "September 8, 2026",
    readTime: "6 min read",
    author: "Piyush Gupta",
    content: [
      {
        heading: "Learning takes time",
        paragraphs: [
          "Some lessons arrive quickly. Others take years to understand.",
          "The important thing is to remain curious and continue paying attention to what experience is teaching us.",
        ],
      },
    ],
  },
];

export function getBlogBySlug(slug: string) {
  return blogs.find((blog) => blog.slug === slug);
}
