import React, { useEffect, useRef, useState } from 'react';
import ActionElements from './elements';
import { translateShortHand } from '../../utils/commonUtils';
import { handleAction } from '../../utils/chromeUtils';
import ActiveIndexContext from '../../context/ActiveIndexContext';
import MiniSearchInputContext from '../../context/MiniSearchInputContext';
import { Action } from '../../types/Action';
import MiniToast from './toast';
import { SearchStrategyFactory } from '../../utils/strategys';

const MiniComponent = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [actions, setActions] = useState<Action[]>([]);
  const [filteredActions, setFilteredActions] = useState<Action[]>([]);
  const [actionElements, setActionElements] = useState<JSX.Element[]>([]);
  const [actionLength, setActionLength] = useState(filteredActions.length);
  const [activeIndex, setActiveIndex] = useState(0);
  const [down, setDown] = useState<{ [key: number]: boolean }>({});

  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Init actions
  useEffect(() => {
    chrome.runtime.sendMessage({ request: 'get-actions' }, response => {
      setActions(response.actions);
    });
  }, []);

  // Listen for actionLength
  useEffect(() => {
    setActionLength(filteredActions.length);
  }, [filteredActions]);

  // Listen for click events, and if clicked, focus
  useEffect(() => {
    chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
      if (message.request == 'open-mini') {
        setIsOpen(prevIsOpen => !prevIsOpen);
        window.setTimeout(() => {
          inputRef.current?.focus();
        }, 100);
        inputRef.current?.focus();
      }
    });
  }, []);

  // Listen for key events
  useEffect(() => {
    setActionElements(ActionElements(filteredActions));
  }, [activeIndex, filteredActions]);

  // render items for search
  const handleSearch = () => {
    if (inputRef.current?.value == undefined) {
      return;
    }
    const value = inputRef.current!.value;
    // eg. /b -> /bookmark
    inputRef.current.value = translateShortHand(value);
    // search actions
    SearchStrategyFactory.createStrategy(value)
      .execute(value, actions)
      .then(item => {
        setFilteredActions(item);
      });
    setActionElements(ActionElements(filteredActions));
  };

  // Handles the keydown event and performs actions based on the pressed key.
  const handleKeyDown = (e: KeyboardEvent) => {
    // Use a key map to handle different keys
    const keyMap: { [key: string]: () => void } = {
      ArrowUp: () => setActiveIndex(prevIndex => Math.max(prevIndex - 1, 0)),
      ArrowDown: () => setActiveIndex(prevIndex => Math.min(prevIndex + 1, actionElements.length - 1)),
      Enter: () => {
        const action = filteredActions[activeIndex];
        if (action) {
          chrome.runtime.sendMessage({ request: action.action, tab: action, query: inputRef.current?.value });
          handleAction(action, { value: inputRef.current?.value || '', setValFunc: setMiniSearchInput });
        }
      },
      Escape: () => setIsOpen(false),
    };
    if (keyMap[e.key]) {
      keyMap[e.key]();
    }

    setDown(prev => ({ ...prev, [e.key]: true }));
  };

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [activeIndex, actionElements.length]);

  useEffect(() => {
    if (activeIndex >= 0 && listRef.current && listRef.current.children[activeIndex]) {
      const activeElement = listRef.current.children[activeIndex] as HTMLElement;
      activeElement.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    }
  }, [activeIndex, actionElements.length]);

  // provide a way to set the input value from outside
  const setMiniSearchInput = (newValue: string) => {
    if (inputRef.current) {
      inputRef.current.value = newValue;
    }
  };

  return (
    <div>
      <div id="mini-extension" className={`mini-extension ${isOpen ? '' : 'mini-closing'}`}>
        <div id="mini-wrap">
          <div id="mini">
            <div id="mini-search">
              <input
                onBlur={() => setTimeout(() => setIsOpen(false), 100)}
                placeholder="Type a command or search"
                ref={inputRef}
                onChange={handleSearch}
              />
            </div>
            <div id="mini-list" ref={listRef}>
              <ActiveIndexContext.Provider value={{ activeIndex, setActiveIndex }}>
                <MiniSearchInputContext.Provider
                  value={{ miniSearchInput: inputRef.current?.value || '', setMiniSearchInput }}
                >
                  {actionElements}
                </MiniSearchInputContext.Provider>
              </ActiveIndexContext.Provider>
            </div>
            <div id="mini-footer">
              <div id="mini-results">{actionLength} results</div>
              <div id="mini-arrows">
                Use arrow keys <span className="mini-shortcut">↑</span>
                <span className="mini-shortcut">↓</span> to navigate
              </div>
            </div>
          </div>
        </div>
        <div id="mini-overlay"></div>
      </div>
      <MiniToast isOpen={false} />
    </div>
  );
};

export default MiniComponent;
