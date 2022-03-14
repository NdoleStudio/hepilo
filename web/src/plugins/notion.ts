import { Client } from "@notionhq/client";
import { QueryDatabaseResponse } from "@notionhq/client/build/src/api-endpoints";

export const Notion = new Client({
  baseUrl: process.env.VUE_APP_NOTION_BASE_URL as string,
  auth: process.env.VUE_APP_NOTION_TOKEN as string,
});

export const getDatabase = (): Promise<QueryDatabaseResponse> => {
  return Notion.databases.query({
    database_id: process.env.VUE_APP_NOTION_DATABASE_ID as string,
  });
};

export type BlogEntry = {
  title: string;
  timestamp: Date;
  intro: string;
  id: string;
  slug: string;
  readMinutes: number;
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
