export interface Action {
  id?: string;
  url?: string;
  title?: string;
  desc?: string;
  action?: string;
  type?: string;
  emoji?: boolean;
  emojiChar?: string;
  keycheck?: boolean;
  favIconUrl?: any;
  keys?: string[];
}
