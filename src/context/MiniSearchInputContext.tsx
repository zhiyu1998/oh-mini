import React from 'react';

const MiniSearchInputContext = React.createContext({
    miniSearchInput: '', // 这里存放实际的值
    setMiniSearchInput: (newValue: string) => {} // 这是一个空函数，稍后将被实际的更新函数替换
});

export default MiniSearchInputContext;
