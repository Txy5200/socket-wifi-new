import React, { Component } from 'react'
import { Switch, Router, Route } from 'react-router-dom'
import { history } from './helper/history'
import Login from './page/login'
import Inspection from './page/inspection'
import ChangePwd from './page/changePwd'
import HistoryRecord from './page/history'
import Setting from './page/setting'
import Report from './page/report'
import DataComparison from './page/data_comparison'
import HelpScreen from './page/help'

import { hot } from 'react-hot-loader'
class App extends Component {
  render() {
    return (
      <Router history={history}>
        <Switch>
          <Route exact path="/login" component={Login} />
          <Route exact path="/inspection" component={Inspection} />
          <Route path="/dataComparison" component={DataComparison} />
          <Route path="/history" component={HistoryRecord} />
          <Route path="/setting" component={Setting} />
          <Route path="/help" component={HelpScreen} />
          <Route path="/inspection/report" component={Report} />
          <Route path="/login/changePwd" component={ChangePwd} />
          <Route path="*" component={Login} />
        </Switch>
      </Router>
    )
  }
}

export default hot(module)(App)
