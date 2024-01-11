import React from 'react';
import { Action } from '../../types/Action';
import MiniItem from './item';

const ActionElements: (actions: Action[]) => JSX.Element[] = (actions) => {
    return actions.map((action, index) => {
        let keys: React.JSX.Element;
        if (action.keycheck && action.keys) {
            keys = (
                <div className="mini-keys">
                    {action.keys.map(key => (
                        <span className="mini-shortcut">{key}</span>
                    ))}
                </div>
            );
        }

    const img = action.emoji ? (
      <span className="mini-emoji-action">{action.emojiChar}</span>
    ) : (
      <img src={action.favIconUrl || ''} alt="favicon" className="mini-icon" />
    );

    return <MiniItem key={index} action={action} index={index} keys={keys!} img={img} />;
  });
};

export default ActionElements;
