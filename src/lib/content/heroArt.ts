import type { StaticImageData } from "next/image";

import blogDay from "@/assets/Enchanted Blue Ink and Golden Quill.png";
import blogNight from "@/assets/Magical Sapphire Ink and Golden Quill.png";
import storyDay from "@/assets/Magical Blue-Gold Storybook.png";
import storyNight from "@/assets/Enchanted Blue-and-Gold Spellbook.png";

export interface HeroArtImages {
  night: StaticImageData;
  day: StaticImageData;
}

export const blogsHeroArt: HeroArtImages = {
  night: blogNight,
  day: blogDay,
};

/* Temporary, swap these two imports for the stories book and inkpot images */
export const storiesHeroArt: HeroArtImages = {
  night: storyNight,
  day: storyDay,
};
