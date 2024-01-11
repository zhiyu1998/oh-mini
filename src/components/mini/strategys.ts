import {Action} from "../../types/Action";

interface SearchStrategy {
    execute(value: string, actions?: Action[]): Promise<Action[]>;
}

class HistorySearchStrategy implements SearchStrategy {
     execute(value: string): Promise<Action[]> {
        // 实现历史搜索逻辑
        const query = value.replace('/history ', '');
         return new Promise((resolve, reject) => {
             chrome.runtime.sendMessage({request: 'search-history', query: query}, response => {
                 if (response.history) {
                     resolve(response.history);
                 } else {
                     reject('No history found');
                 }
             });
         });
    }
}

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

class TabSearchStrategy implements SearchStrategy {
    execute(value: string, actions?: Action[]): Promise<Action[]> {
        return new Promise((resolve, reject) => {
            resolve(actions!.filter(item => item.action === 'switch-tab'));
        });
    }
}

class DefaultSearchStrategy implements SearchStrategy {
    execute(value: string, actions?: Action[]): Promise<Action[]> {
        return new Promise((resolve, reject) => {
            resolve(actions!);
        });
    }
}

export class SearchStrategyFactory {
    static createStrategy(value: string): SearchStrategy {
        if (value === '/') {
            return new DefaultSearchStrategy();
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
