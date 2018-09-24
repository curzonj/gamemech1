import React from 'react';
import bind from 'memoize-bind';
import PropTypes from 'prop-types';

export default function(fn) {
  const dummyValue = fn(() => null);
  const Context = React.createContext(dummyValue);

  const consumerHoc = Wrapped => props => (
    <Context.Consumer>
      {value => <Wrapped {...props} {...value} />}
    </Context.Consumer>
  );

  const providerHoc = Wrapped => {
    class Wrapper extends React.Component {
      constructor(props) {
        super(props);

        const setState = bind(this.setState, this);
        this.state = fn(setState);
      }

      render() {
        return (
          <Context.Provider value={this.state}>
            {this.props.children}
          </Context.Provider>
        );
      }
    }

    Wrapper.propTypes = {
      children: PropTypes.node.isRequired,
    };

    return props => (
      <Wrapper>
        <Wrapped {...props} />
      </Wrapper>
    );
  };

  return [consumerHoc, providerHoc];
}
