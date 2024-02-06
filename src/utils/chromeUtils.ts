// Get the current tab
import { Action } from '../types/Action';
import { InputValue } from '../types/InputValue';
import { renderActions } from './actions';

export const getCurrentTab = async () => {
  const queryOptions = { active: true, currentWindow: true };
  const [tab] = await chrome.tabs.query(queryOptions);
  return tab;
};

// Get bookmarks to populate in the actions
export const getBookmarks = () => {
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
export const switchTab = (tab: chrome.tabs.Tab) => {
  chrome.tabs.highlight({
    tabs: tab.index,
    windowId: tab.windowId,
  });
  chrome.windows.update(tab.windowId, { focused: true });
};
export const goBack = (tab: chrome.tabs.Tab) => {
  if (tab.id !== undefined) {
    chrome.tabs.goBack(tab.id);
  } else {
    console.error('Tab ID is undefined.');
  }
};
export const goForward = (tab: chrome.tabs.Tab) => {
  if (tab.id !== undefined) {
    chrome.tabs.goForward(tab.id);
  } else {
    console.error('Tab ID is undefined.');
  }
};
export const duplicateTab = (tab: chrome.tabs.Tab) => {
  getCurrentTab().then(response => {
    chrome.tabs.duplicate(response.id!);
  });
};
export const createBookmark = (tab: chrome.tabs.Tab) => {
  getCurrentTab().then(response => {
    chrome.bookmarks.create({
      title: response.title,
      url: response.url,
    });
  });
};
export const muteTab = (mute: boolean | undefined) => {
  getCurrentTab().then(response => {
    chrome.tabs.update(response.id!, { muted: mute });
  });
};
export const reloadTab = () => {
  chrome.tabs.reload();
};
export const pinTab = (pin: boolean | undefined) => {
  getCurrentTab().then(response => {
    chrome.tabs.update(response.id!, { pinned: pin });
  });
};
export const clearAllData = () => {
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
export const clearBrowsingData = () => {
  chrome.browsingData.removeHistory({ since: 0 });
};
export const clearCookies = () => {
  chrome.browsingData.removeCookies({ since: 0 });
};
export const clearCache = () => {
  chrome.browsingData.removeCache({ since: 0 });
};
export const clearLocalStorage = () => {
  chrome.browsingData.removeLocalStorage({ since: 0 });
};
export const clearPasswords = () => {
  chrome.browsingData.removePasswords({ since: 0 });
};
export const openChromeUrl = (url: string) => {
  chrome.tabs.create({ url: 'chrome://' + url + '/' });
};
export const openIncognito = () => {
  chrome.windows.create({ incognito: true });
};
export const closeWindow = (id: number) => {
  chrome.windows.remove(id);
};
export const closeTab = (tab: chrome.tabs.Tab) => {
  chrome.tabs.remove(tab.id!);
};
export const closeCurrentTab = () => {
  getCurrentTab().then(closeTab);
};
export const removeBookmark = (bookmark: chrome.bookmarks.BookmarkTreeNode) => {
  chrome.bookmarks.remove(bookmark.id);
};

export const handleAction = (action: Action, searchInputValue?: InputValue) => {
  if (action.action == undefined) {
    return;
  }
  const act = renderActions[action.action];
  act(action, searchInputValue);
};