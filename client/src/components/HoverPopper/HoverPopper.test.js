import React from 'react';
import ReactDOM from 'react-dom';
import HoverPopper from './HoverPopper';

it('renders without crashing', () => {
  const div = document.createElement('div');
  ReactDOM.render(
    <HoverPopper>
      <div />
      <div />
    </HoverPopper>,
    div
  );
  ReactDOM.unmountComponentAtNode(div);
});
