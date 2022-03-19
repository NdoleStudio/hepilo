export type BlogEntry = {
  title: string;
  timestamp: Date;
  intro: string;
  id: string;
  slug: string;
  readMinutes: number;
};

export type Block = {
  type: "image" | "paragraph" | "quote" | "heading_2" | "heading_3";
  contents?: Array<BlockContent>;
  id: string;
  image?: string;
};

export type BlockContent = {
  color: string;
  href?: string;
  bold: boolean;
  id: string;
  text: string;
};

export type List = {
  name: string;
  icon: string;
  id: string;
  cartPanelOpen: boolean;
  items: Array<ListItem>;
};

type NotificationType = "error" | "success" | "info";

export interface Notification {
  message: string;
  timeout: number;
  active: boolean;
  type: NotificationType;
}

export interface User {
  id: string;
  name: string | null;
  photoURL: string | null;
}

export interface SelectItem {
  text: string;
  value: string;
}

export interface Item {
  id: string;
  name: string;
  unit: string | null;
  pricePerUnit: number;
  categoryId: string;
}

export type Category = {
  id: string;
  name: string;
  color: string;
};

export type ListItem = {
  itemId: string;
  notes: string;
  addedToCart: boolean;
  quantity: number;
};

export interface MaterializedListItem {
  item: Item;
  listItem: ListItem;
}

export interface MaterializedListElement {
  category: Category;
  items: Array<MaterializedListItem>;
}

export type MaterializedList = Array<MaterializedListElement>;

export interface UpsertCategoryRequest {
  id: string;
  name: string;
  color: string;
}

export interface UpsertListRequest {
  id: string;
  name: string;
  icon: string;
}

export interface UpsertItemRequest {
  itemId: string;
  pricePerUnit: number;
  categoryId: string;
  unit: string | null;
  name: string;
}

export type AppData = {
  url: string;
  name: string;
};

export interface UpdateItemRequest {
  name: string;
  categoryId: string;
  pricePerUnit: number;
  quantity: number;
  addedToCart: boolean;
  notes: string;
  unit: string | null;
  itemId: string;
}

export interface NotificationRequest {
  message: string;
  type: NotificationType;
}

export interface State {
  loading: boolean;
  loadingState: boolean;
  saving: boolean;
  stateLoaded: boolean;
  title: string;
  showIntro: boolean;
  user: User | null;
  categories: Array<Category>;
  selectedListId: string;
  lists: Array<List>;
  items: Array<Item>;
  currency: string;
  notification: Notification;
  navDrawerOpen: boolean;
  blogEntries: Array<BlogEntry>;
  blogStateLoaded: boolean;
}
