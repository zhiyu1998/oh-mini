import * as utils from './utils/chromeUtils';
import { Action } from './types/Action';
import { fixedActions, searchActions } from './utils/actions';
import { processMacActions } from './utils/commonUtils';

let actions: Action[] = [];

// Check when the extension button is clicked.
chrome.action.onClicked.addListener(tab => {
  chrome.tabs.sendMessage(tab.id!, { request: 'open-mini' });
});

// Open on install
chrome.runtime.onInstalled.addListener(object => {
  // Check if the extension is being installed
  if (object.reason === 'install') {
    chrome.tabs.create({ url: 'https://github.com/zhiyu1998/oh-mini/' });
  }
});

// Listen for the open mini shortcut
chrome.commands.onCommand.addListener((command) => {
    utils.getCurrentTab().then((response) => {
        chrome.tabs.sendMessage(response.id!, {request: "open-mini"});
    });
});

// Receive messages from any tab
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  switch (message.request) {
    case 'get-actions':
      resetMini();
      sendResponse({ actions: actions });
      break;
    case 'switch-tab':
      utils.switchTab(message.tab);
      break;
    case 'go-back':
      utils.goBack(message.tab);
      break;
    case 'go-forward':
      utils.goForward(message.tab);
      break;
    case 'duplicate-tab':
      utils.duplicateTab(message.tab);
      break;
    case 'create-bookmark':
      utils.createBookmark(message.tab);
      break;
    case 'mute':
      utils.muteTab(true);
      break;
    case 'unmute':
      utils.muteTab(false);
      break;
    case 'reload':
      utils.reloadTab();
      break;
    case 'pin':
      utils.pinTab(true);
      break;
    case 'unpin':
      utils.pinTab(false);
      break;
    case 'remove-all':
      utils.clearAllData();
      break;
    case 'remove-history':
      utils.clearBrowsingData();
      break;
    case 'remove-cookies':
      utils.clearCookies();
      break;
    case 'remove-cache':
      utils.clearCache();
      break;
    case 'remove-local-storage':
      utils.clearLocalStorage();
      break;
    case 'remove-passwords':
      utils.clearPasswords();
    case 'history': // Fallthrough
    case 'downloads':
    case 'extensions':
    case 'settings':
    case 'extensions/shortcuts':
      utils.openChromeUrl(message.request);
      break;
    case 'manage-data':
      utils.openChromeUrl('settings/clearBrowserData');
      break;
    case 'incognito':
      utils.openIncognito();
      break;
    case 'close-window':
      utils.closeWindow(sender.tab?.windowId!);
      break;
    case 'close-tab':
      utils.closeCurrentTab();
      break;
    case 'search-history':
      chrome.history.search({ text: message.query, maxResults: 0, startTime: 0 }, data => {
        {
          data.forEach((action: Action, index: number) => {
            action.type = 'history';
            action.emoji = true;
            action.emojiChar = '🏛';
            action.action = 'history';
            action.keycheck = false;
          });
          sendResponse({ history: data });
        }
      });
      return true;
    case 'search-bookmarks':
      chrome.bookmarks.search({ query: message.query }).then(data => {
        // The index property of the bookmark appears to be causing issues, iterating separately...
        data
          .filter(x => x.index == 0)
          .forEach((action, index) => {
            if (!action.url) {
              data.splice(index, 1);
            }
            (action as Action).type = 'bookmark';
            (action as Action).emoji = true;
            (action as Action).emojiChar = '⭐️';
            (action as Action).action = 'bookmark';
            (action as Action).keycheck = false;
          });
        data.forEach((action: chrome.bookmarks.BookmarkTreeNode, index) => {
          if (!action.url) {
            data.splice(index, 1);
          }
          (action as Action).type = 'bookmark';
          (action as Action).emoji = true;
          (action as Action).emojiChar = '⭐️';
          (action as Action).action = 'bookmark';
          (action as Action).keycheck = false;
        });
        sendResponse({ bookmarks: data });
      });
      return true;
    case 'remove':
      if (message.type == 'bookmark') {
        utils.removeBookmark(message.action);
      } else {
        utils.closeTab(message.action);
      }
      break;
    case 'search':
      chrome.search.query({ text: message.query }, () => null);
      break;
    case 'restore-new-tab':
      // TODO
      restoreNewTab('');
      break;
    case 'close-mini':
      utils.getCurrentTab().then(response => {
        chrome.tabs.sendMessage(response.id!, { request: 'close-mini' });
      });
      break;
  }
});

function restoreNewTab(newtaburl: string) {
  utils.getCurrentTab().then(response => {
    chrome.tabs
      .create({
        url: newtaburl,
      })
      .then(() => {
        chrome.tabs.remove(response.id!);
      });
  });
}

// Clear actions and append default ones
const clearActions = () => {
  utils.getCurrentTab().then(response => {
    actions = [];
    const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
    let muteaction = {
      title: 'Mute tab',
      desc: 'Mute the current tab',
      type: 'action',
      action: 'mute',
      emoji: true,
      emojiChar: '🔇',
      keycheck: true,
      keys: ['⌥', '⇧', 'M'],
    };
    let pinaction = {
      title: 'Pin tab',
      desc: 'Pin the current tab',
      type: 'action',
      action: 'pin',
      emoji: true,
      emojiChar: '📌',
      keycheck: true,
      keys: ['⌥', '⇧', 'P'],
    };
    if (response.mutedInfo?.muted) {
      muteaction = {
        title: 'Unmute tab',
        desc: 'Unmute the current tab',
        type: 'action',
        action: 'unmute',
        emoji: true,
        emojiChar: '🔈',
        keycheck: true,
        keys: ['⌥', '⇧', 'M'],
      };
    }
    if (response.pinned) {
      pinaction = {
        title: 'Unpin tab',
        desc: 'Unpin the current tab',
        type: 'action',
        action: 'unpin',
        emoji: true,
        emojiChar: '📌',
        keycheck: true,
        keys: ['⌥', '⇧', 'P'],
      };
    }
    actions.push(...fixedActions, muteaction, pinaction);
    actions = processMacActions(actions);
  });
};

// Get tabs to populate in the actions
const getTabs = () => {
  chrome.tabs.query({}, tabs => {
    tabs.forEach(tab => {
      (tab as Action).desc = 'Chrome tab';
      (tab as Action).keycheck = false;
      (tab as Action).action = 'switch-tab';
      (tab as Action).type = 'tab';
    });
    actions = (tabs as Action[]).concat(actions);
  });
};

const resetMini = () => {
  clearActions();
  getTabs();
  utils.getBookmarks();
  actions = searchActions.concat(actions);
};

// Check if tabs have changed and actions need to be fetched again
chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => resetMini());
chrome.tabs.onCreated.addListener(tab => resetMini());
chrome.tabs.onRemoved.addListener((tabId, changeInfo) => resetMini());
