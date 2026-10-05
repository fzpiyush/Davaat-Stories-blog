import {
  BookOpenIcon,
  ChatBubbleLeftRightIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  FolderIcon,
  PhotoIcon,
  Squares2X2Icon,
  TagIcon,
  UserCircleIcon,
  UsersIcon,
} from "@heroicons/react/24/outline";

export type AdminNavItem = {
  label: string;
  href: string;
  Icon: typeof Squares2X2Icon;
};

export const adminNav = [
  { label: "Dashboard", href: "/admin", Icon: Squares2X2Icon },
  { label: "Blogs", href: "/admin/blogs", Icon: DocumentTextIcon },
  { label: "Stories", href: "/admin/stories", Icon: BookOpenIcon },
  { label: "Categories", href: "/admin/categories", Icon: FolderIcon },
  { label: "Tags", href: "/admin/tags", Icon: TagIcon },
  { label: "Media", href: "/admin/media", Icon: PhotoIcon },
  { label: "Comments", href: "/admin/comments", Icon: ChatBubbleLeftRightIcon },
  { label: "Readers", href: "/admin/readers", Icon: UsersIcon },
  { label: "Subscribers", href: "/admin/subscribers", Icon: EnvelopeIcon },
  { label: "Profile", href: "/admin/profile", Icon: UserCircleIcon },
] as const satisfies readonly AdminNavItem[];

export function isAdminNavActive(pathname: string, href: string): boolean {
  if (href === "/admin") {
    return pathname === "/admin";
  }

  return pathname === href || pathname.startsWith(`${href}/`);
}

export function getAdminPageTitle(pathname: string): string {
  const match = adminNav.find((item) => isAdminNavActive(pathname, item.href));
  return match?.label ?? "Dashboard";
}
