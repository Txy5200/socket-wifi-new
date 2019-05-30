import React, { Component } from 'react';
import { connect } from 'react-redux';
import TopPage from './header';
import { Layout } from 'antd';
const { Content } = Layout;

class Container extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }
  componentDidMount() {}
  render() {
    return (
      <div className={'container_content'}>
        <TopPage {...this.props}></TopPage>
        {this.props.children}
      </div>
    );
  }
}
const mapStateToProps = state => {
  return {};
};

export default connect(
  mapStateToProps,
  null
)(Container);
