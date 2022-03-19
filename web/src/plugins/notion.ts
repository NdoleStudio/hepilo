import { Client } from "@notionhq/client";
import {
  GetPageResponse,
  QueryDatabaseResponse,
} from "@notionhq/client/build/src/api-endpoints";
import { Block, BlockContent, BlogEntry } from "@/types/state";

const notion = new Client({
  baseUrl: (process.env.VUE_APP_NOTION_BASE_URL as string).trim(),
  auth: (process.env.VUE_APP_NOTION_TOKEN as string).trim(),
});

export const getDatabase = (): Promise<QueryDatabaseResponse> => {
  return notion.databases.query({
    database_id: (process.env.VUE_APP_NOTION_DATABASE_ID as string).trim(),
  });
};

export const getPage = async (pageId: string): Promise<GetPageResponse> => {
  return await notion.pages.retrieve({ page_id: pageId });
};

export const getBlocks = async (blockId: string): Promise<Array<Block>> => {
  const blocks = await notion.blocks.children.list({
    block_id: blockId,
  });

  // eslint-disable-next-line
  return blocks.results.map((block: any): Block => {
    const type = block.type;
    if (type === "image") {
      return {
        id: block.id,
        type: type,
        image: block.image.file.url as string,
      };
    }
    return {
      id: block.id,
      contents: block[type].rich_text.map(
        // eslint-disable-next-line
        (content: any, index: number): BlockContent => {
          return {
            id: block.id + "-" + index,
            href: content.href ? (content.href as string) : undefined,
            text: content.plain_text as string,
            color: content.annotations.color as string,
            bold: content.annotations.bold as boolean,
          };
        }
      ),
      type: type,
    };
  });
};

export const getBlogEntries = async (): Promise<Array<BlogEntry>> => {
  const response = await getDatabase();
  return response.results.map((page): BlogEntry => {
    // eslint-disable-next-line
    let data = page as any;
    return {
      readMinutes: data.properties.ReadMinutes.number,
      timestamp: new Date(data.properties.Date.date.start),
      title: data.properties.Name.title[0].plain_text,
      slug: data.properties.Slug.rich_text[0].plain_text,
      id: data.id,
      intro: data.properties.Intro.rich_text.reduce(
        (sum: string, value: { plain_text: string }) => {
          return sum + value.plain_text;
        },
        ""
      ),
    };
  });
};
