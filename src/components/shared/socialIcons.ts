import type { IconType } from "react-icons";
import {
  FaFacebookF,
  FaGlobe,
  FaInstagram,
  FaLinkedinIn,
  FaThreads,
  FaWhatsapp,
  FaXTwitter,
  FaYoutube,
} from "react-icons/fa6";

import type { SocialPlatform } from "@/lib/db/types";

export const socialIcons: Record<SocialPlatform, IconType> = {
  instagram: FaInstagram,
  x: FaXTwitter,
  facebook: FaFacebookF,
  youtube: FaYoutube,
  linkedin: FaLinkedinIn,
  threads: FaThreads,
  whatsapp: FaWhatsapp,
  website: FaGlobe,
};
