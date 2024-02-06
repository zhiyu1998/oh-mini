import { Action } from '../types/Action';
import { orderActions } from './actions';

interface SearchStrategy {
  execute(value: string, actions?: Action[]): Promise<Action[]>;
}

/**
 * 历史搜索策略
 */
class HistorySearchStrategy implements SearchStrategy {
  execute(value: string): Promise<Action[]> {
    // 实现历史搜索逻辑
    const query = value.replace('/history ', '');
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ request: 'search-history', query: query }, response => {
        if (response.history) {
          resolve(response.history);
        } else {
          reject('No history found');
        }
      });
    });
  }
}

/**
 * 书签搜索策略
 */
class BookmarkSearchStrategy implements SearchStrategy {
  execute(value: string): Promise<Action[]> {
    const query = value.replace('/bookmark ', '');
    return new Promise((resolve, reject) => {
      chrome.runtime.sendMessage({ request: 'search-bookmarks', query: query }, response => {
        if (response.bookmarks) {
          resolve(response.bookmarks);
        } else {
          reject('No bookmarks found');
        }
      });
    });
  }
}

/**
 * tab命令搜索策略
 */
class TabSearchStrategy implements SearchStrategy {
  execute(value: string, actions?: Action[]): Promise<Action[]> {
    return new Promise((resolve, reject) => {
      resolve(actions!.filter(item => item.action === 'switch-tab'));
    });
  }
}

/**
 * 命令'/'搜索，搜索命令
 */
class OrderSearchStrategy implements SearchStrategy {
  execute(value: string, actions?: Action[]): Promise<Action[]> {
    return new Promise((resolve, reject) => {
      resolve(orderActions);
    });
  }
}

/**
 * 默认搜索，只过滤
 */
class DefaultSearchStrategy implements SearchStrategy {
  execute(value: string, actions?: Action[]): Promise<Action[]> {
    return new Promise((resolve, reject) => {
      resolve(actions!.filter(item => item.title?.includes(value)));
    });
  }
}

export class SearchStrategyFactory {
  static createStrategy(value: string): SearchStrategy {
    if (value === '/') {
      return new OrderSearchStrategy();
    } else if (value.startsWith('/history')) {
      return new HistorySearchStrategy();
    } else if (value.startsWith('/bookmark')) {
      return new BookmarkSearchStrategy();
    } else if (value.startsWith('/tab')) {
      return new TabSearchStrategy();
    }
    return new DefaultSearchStrategy(); // 默认策略
  }
}
