// Get the current tab
import { Action } from '../types/Action';
import { addhttp } from './commonUtils';
import {InputValue} from "../types/InputValue";
import {renderActions} from "./actions";

const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

// Get bookmarks to populate in the actions
const getBookmarks = () => {
  let bookMarks: Action[] = [];
  const process_bookmark = (bookmarks: chrome.bookmarks.BookmarkTreeNode[]) => {
    for (const bookmark of bookmarks) {
      if (bookmark.url) {
        bookMarks.push({
          title: bookmark.title,
          desc: 'Bookmark',
          id: bookmark.id,
          url: bookmark.url,
          type: 'bookmark',
          action: 'bookmark',
          emoji: true,
          emojiChar: '⭐️',
          keycheck: false,
        });
      }
      if (bookmark.children) {
        process_bookmark(bookmark.children);
      }
    }
  };

  chrome.bookmarks.getRecent(100, process_bookmark);
  return bookMarks;
};

// Lots of different actions
const switchTab = (tab: chrome.tabs.Tab) => {
  chrome.tabs.highlight({
    tabs: tab.index,
    windowId: tab.windowId,
  });
  chrome.windows.update(tab.windowId, { focused: true });
};
const goBack = (tab: chrome.tabs.Tab) => {
  if (tab.id !== undefined) {
    chrome.tabs.goBack(tab.id);
  } else {
    console.error('Tab ID is undefined.');
  }
};
const goForward = (tab: chrome.tabs.Tab) => {
  if (tab.id !== undefined) {
    chrome.tabs.goForward(tab.id);
  } else {
    console.error('Tab ID is undefined.');
  }
};
const duplicateTab = (tab: chrome.tabs.Tab) => {
  getCurrentTab().then(response => {
    chrome.tabs.duplicate(response.id!);
  });
};
const createBookmark = (tab: chrome.tabs.Tab) => {
  getCurrentTab().then(response => {
    chrome.bookmarks.create({
      title: response.title,
      url: response.url,
    });
  });
};
const muteTab = (mute: boolean | undefined) => {
  getCurrentTab().then(response => {
    chrome.tabs.update(response.id!, { muted: mute });
  });
};
const reloadTab = () => {
  chrome.tabs.reload();
};
const pinTab = (pin: boolean | undefined) => {
  getCurrentTab().then(response => {
    chrome.tabs.update(response.id!, { pinned: pin });
  });
};
const clearAllData = () => {
  chrome.browsingData.remove(
    {
      since: new Date().getTime(),
    },
    {
      appcache: true,
      cache: true,
      // "cacheStorage": true,
      cookies: true,
      downloads: true,
      fileSystems: true,
      formData: true,
      history: true,
      indexedDB: true,
      localStorage: true,
      passwords: true,
      serviceWorkers: true,
      webSQL: true,
    },
  );
};
const clearBrowsingData = () => {
  chrome.browsingData.removeHistory({ since: 0 });
};
const clearCookies = () => {
  chrome.browsingData.removeCookies({ since: 0 });
};
const clearCache = () => {
  chrome.browsingData.removeCache({ since: 0 });
};
const clearLocalStorage = () => {
  chrome.browsingData.removeLocalStorage({ since: 0 });
};
const clearPasswords = () => {
  chrome.browsingData.removePasswords({ since: 0 });
};
const openChromeUrl = (url: string) => {
  chrome.tabs.create({ url: 'chrome://' + url + '/' });
};
const openIncognito = () => {
  chrome.windows.create({ incognito: true });
};
const closeWindow = (id: number) => {
  chrome.windows.remove(id);
};
const closeTab = (tab: chrome.tabs.Tab) => {
  chrome.tabs.remove(tab.id!);
};
const closeCurrentTab = () => {
  getCurrentTab().then(closeTab);
};
const removeBookmark = (bookmark: chrome.bookmarks.BookmarkTreeNode) => {
  chrome.bookmarks.remove(bookmark.id);
};

const handleAction = (action: Action, searchInputValue?: InputValue) => {
  if (action.action == undefined) {
    return;
  }
  const act = renderActions[action.action];
  act(action, searchInputValue);
};

export {
  getBookmarks,
  switchTab,
  goBack,
  goForward,
  duplicateTab,
  createBookmark,
  muteTab,
  reloadTab,
  pinTab,
  clearAllData,
  clearBrowsingData,
  clearCookies,
  clearCache,
  clearLocalStorage,
  clearPasswords,
  openChromeUrl,
  openIncognito,
  closeWindow,
  closeTab,
  closeCurrentTab,
  getCurrentTab,
  removeBookmark,
  handleAction,
};
