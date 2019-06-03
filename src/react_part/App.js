import React, { Component } from 'react'
import { Switch, Router, Route } from 'react-router-dom'
import { history } from './helper/history'
import Inspection from './page/inspection'

class App extends Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route path="*" component={Inspection} />
        </Switch>
      </Router>
    )
  }
}

export default App
