import type { Knex } from "knex";

const STORY_SLUG = "the-lantern-keeper";
const DAY_MS = 24 * 60 * 60 * 1000;

// Reuses a photo from the sample blogs, swap it for a real 3:4 cover in the admin
const COVER_URL =
  "https://images.unsplash.com/photo-1490730141103-6cac27aaab94?q=80&w=1470&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const STORY = {
  title: "The Lantern Keeper",
  blurb:
    "High in the northern pass, Mira keeps the old lanterns burning so travelers can find their way through the snow. For eleven winters, nobody has come.\n\nThen, on the longest night of the year, someone knocks.",
  category: "Fiction",
  tags: ["Fantasy", "Mystery", "Slow burn"],
};

const CHAPTERS = [
  {
    title: "The Last Lantern",
    paragraphs: [
      "The wind came down the pass the way it always did in the deep of winter, low and patient, testing every shutter on the keeper's house as if it had all the time in the world.",
      "Mira climbed the tower steps with the oil can swinging from one hand. Forty two steps. She had counted them so many times that the number had stopped being a number and become a kind of song.",
      "At the top, the great lantern waited behind its glass. She trimmed the wick, filled the well, and struck the match. The flame caught, wavered, and then stood tall, throwing a long gold road out across the snow.",
      "Her grandmother used to say that a lantern is a promise made to a stranger. You light it not because you know someone is coming, but because they might be.",
      "Eleven winters. Eleven winters of promises, and the road had stayed empty.",
      "Mira sat down on the cold stone, pulled her coat tighter, and watched the light go out into the dark, the way it always did. Somewhere far below, a single bell rang once, though there was no one there to ring it.",
    ],
  },
  {
    title: "A Visitor at Dusk",
    paragraphs: [
      "She told herself it was the wind. Bells did strange things in the cold. Metal shrank, ropes stiffened, and old towers made old noises.",
      "But the next evening, as the sky turned the colour of a bruise and she climbed down from the lantern, there were footprints in the fresh snow outside her door.",
      "They came up the road from the valley, neat and steady, and stopped right at her step. They did not go back.",
      "Mira stood very still with her hand on the latch. Inside, the kettle was beginning to sing. Outside, the wind had gone suddenly, completely quiet.",
      "Then came the knock. Three slow taps, polite and unhurried, like someone who had walked a very long way and saw no reason to rush the last part.",
      "She opened the door.",
    ],
  },
  {
    title: "What the Snow Remembers",
    paragraphs: [
      "The traveler was younger than she expected, with frost in his eyebrows and a satchel held close against his chest as if it carried something that mattered more than warmth.",
      "\"I followed the light,\" he said. \"I didn't think anyone still kept it.\"",
      "\"Someone has to,\" Mira said, and stepped aside to let him in.",
      "He sat by the fire for a long time without speaking. When he finally opened the satchel, he took out a small brass lantern, dented and blackened, with a name scratched into its base. Mira knew the name before she read it. It was her grandmother's.",
      "\"She gave it to my father,\" the traveler said quietly. \"Thirty years ago, on a night like this. He told me that if I was ever lost, I should bring it back to the pass.\"",
      "Outside, the snow kept falling, soft and endless, covering every road but one.",
    ],
  },
];

function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/[\s-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function countWords(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

async function getCategoryId(trx: Knex.Transaction, name: string): Promise<string> {
  const [row]: { id: string }[] = await trx("categories")
    .insert({ name, slug: slugify(name) })
    .onConflict("slug")
    .merge(["name"])
    .returning("id");

  return row.id;
}

async function getTagIds(trx: Knex.Transaction, names: string[]): Promise<string[]> {
  for (const name of names) {
    await trx.raw("insert into tags (name, slug) values (?, ?) on conflict do nothing", [
      name,
      slugify(name),
    ]);
  }

  return trx("tags")
    .whereIn(
      "slug",
      names.map((name) => slugify(name)),
    )
    .pluck("id");
}

export async function seed(knex: Knex): Promise<void> {
  const existing = await knex("stories").where({ slug: STORY_SLUG }).first("id");

  if (existing) {
    console.log("Sample story already exists, skipping");
    return;
  }

  const now = Date.now();

  await knex.transaction(async (trx) => {
    const author: { id: string } | undefined = await trx("authors")
      .orderBy("created_at", "asc")
      .first("id");

    const categoryId = await getCategoryId(trx, STORY.category);
    const tagIds = await getTagIds(trx, STORY.tags);

    const [cover]: { id: string }[] = await trx("media")
      .insert({ url: COVER_URL, alt_text: "A quiet mountain lake at dawn" })
      .returning("id");

    const storyPublishedAt = new Date(now - 3 * DAY_MS);

    const [story]: { id: string }[] = await trx("stories")
      .insert({
        slug: STORY_SLUG,
        title: STORY.title,
        blurb: STORY.blurb,
        cover_media_id: cover.id,
        category_id: categoryId,
        author_id: author?.id ?? null,
        status: "published",
        progress: "ongoing",
        published_at: storyPublishedAt,
        created_at: storyPublishedAt,
        updated_at: new Date(now - DAY_MS),
      })
      .returning("id");

    if (tagIds.length > 0) {
      await trx("story_tags").insert(
        tagIds.map((tagId) => ({ story_id: story.id, tag_id: tagId })),
      );
    }

    // One chapter per day, the newest one yesterday
    await trx("chapters").insert(
      CHAPTERS.map((chapter, index) => {
        const content = chapter.paragraphs.join("\n\n");
        const publishedAt = new Date(now - (CHAPTERS.length - index) * DAY_MS);

        return {
          story_id: story.id,
          number: index + 1,
          title: chapter.title,
          content,
          word_count: countWords(content),
          status: "published",
          published_at: publishedAt,
          created_at: publishedAt,
          updated_at: publishedAt,
        };
      }),
    );
  });

  console.log(`Seeded ${STORY.title} with ${CHAPTERS.length} chapters`);
}