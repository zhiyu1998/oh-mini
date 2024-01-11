import { Action } from '../types/Action';

export function processMacActions(actions: Action[]) {
  for (const action of actions) {
    switch (action.action) {
      case 'reload':
        action.keys = ['F5'];
        break;
      case 'fullscreen':
        action.keys = ['F11'];
        break;
      case 'downloads':
        action.keys = ['Ctrl', 'J'];
        break;
      case 'settings':
        action.keycheck = false;
        break;
      case 'history':
        action.keys = ['Ctrl', 'H'];
        break;
      case 'go-back':
        action.keys = ['Alt', '←'];
        break;
      case 'go-forward':
        action.keys = ['Alt', '→'];
        break;
      case 'scroll-top':
        action.keys = ['Home'];
        break;
      case 'scroll-bottom':
        action.keys = ['End'];
        break;
    }
    for (let key in action.keys!) {
      if (action.keys[key] === '⌘') {
        action.keys[key] = 'Ctrl';
      } else if (action.keys[key] === '⌥') {
        action.keys[key] = 'Alt';
      }
    }
  }
  return actions;
}

// Add protocol
export function addhttp(url: string) {
  if (!/^(?:f|ht)tps?\:\/\//.test(url)) {
    url = 'http://' + url;
  }
  return url;
}

// Check if valid url
export function validURL(str: string) {
  const pattern = new RegExp(
    '^(https?:\\/\\/)?' + // protocol
      '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.)+[a-z]{2,}|' + // domain name
      '((\\d{1,3}\\.){3}\\d{1,3}))' + // OR ip (v4) address
      '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*' + // port and path
      '(\\?[;&a-z\\d%_.~+=-]*)?' + // query string
      '(\\#[-a-z\\d_]*)?$',
    'i',
  ); // fragment locator
  return !!pattern.test(str);
}

function isValueInMap(value: string, map: { [key: string]: string }) {
  for (let key in map) {
    if (map.hasOwnProperty(key) && map[key].trim() === value) {
      return true;
    }
  }
  return false;
}

// Translates a shorthand command into its corresponding expanded form.
export function translateShortHand(value: string): string {
  const shorthandCommands: { [key: string]: string } = {
    '/t': '/tab ',
    '/b': '/bookmark ',
    '/h': '/history ',
  };

  // shorthandCommands values
  if (isValueInMap(value, shorthandCommands)) {
    return '';
  }

  if (shorthandCommands[value]) {
    return shorthandCommands[value];
  } else {
    return value;
  }
}
