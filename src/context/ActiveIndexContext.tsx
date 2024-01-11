import React from 'react';

const ActiveIndexContext = React.createContext({
    activeIndex: 0,
    setActiveIndex: (index: number) => {}
});

export default ActiveIndexContext;
