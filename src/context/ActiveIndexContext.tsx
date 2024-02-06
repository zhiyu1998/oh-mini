import React from 'react';

/**
 * 搜索给下拉框的单个信息提供当前选中
 */
const ActiveIndexContext = React.createContext({
  activeIndex: 0,
  setActiveIndex: (index: number) => {},
});

export default ActiveIndexContext;
