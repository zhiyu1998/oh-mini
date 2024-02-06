import React, { useContext, useEffect, useState } from 'react';
import { Action } from '../../types/Action';
import { handleAction } from '../../utils/chromeUtils';
import ActiveIndexContext from '../../context/ActiveIndexContext';
import miniSearchInputContext from '../../context/MiniSearchInputContext';

export interface ItemProps {
  action: Action;
  index: number;
  keys: JSX.Element;
  img: JSX.Element;
}

/**
 * 搜索结果的一条信息
 * @param action
 * @param index
 * @param keys
 * @param img
 * @constructor
 */
const MiniItem: React.FC<ItemProps> = ({ action, index, keys, img }) => {
  const isSearchOrGoto = action.action === 'search' || action.action === 'goto';
  const { activeIndex, setActiveIndex } = useContext(ActiveIndexContext);
  const { miniSearchInput, setMiniSearchInput } = useContext(miniSearchInputContext);

  useEffect(() => {
    // 处理没有emoji的情况
    if (!action.emoji) {
      const loadimg = new Image();
      loadimg.src = action.favIconUrl || '';
      loadimg.onerror = () => {
        // Logic to handle error
      };
    }
  }, [action.emoji, action.favIconUrl]);

  /**
   * 处理单个信息点击事件
   */
  const handleClick = () => {
    // 渲染chrome自带的事件
    chrome.runtime.sendMessage({ request: action.action, tab: action, query: miniSearchInput });
    // 渲染chrome没有自带的事件
    handleAction(action, { value: miniSearchInput, setValFunc: setMiniSearchInput });
  };

  return (
    <div
      className={`mini-item ${index === activeIndex ? 'mini-item-active' : ''}`}
      data-index={index}
      data-type={action.type}
      onClick={() => handleClick()}
      onMouseEnter={() => setActiveIndex(index)}
      onMouseLeave={() => setActiveIndex(index)}
    >
      {img}
      <div className="mini-item-details">
        <div className="mini-item-name">{isSearchOrGoto ? `${action.title} ${miniSearchInput}` : action.title}</div>
        <div className="mini-item-desc">{action.desc}</div>
      </div>
      {keys}
      <div className="mini-select">
        Select <span className="mini-shortcut">⏎</span>
      </div>
    </div>
  );
};

export default MiniItem;
