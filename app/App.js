import React from 'react'
import { AragonApp, AppBar, observe, Text } from '@aragon/ui'
import Aragon, { providers } from '@aragon/client'
import styled from 'styled-components'
import { Grid } from 'react-flexbox-grid'
import { translate } from 'react-i18next'

import NewNodeForm from './components/NewNodeForm'
import CheckNode from './components/CheckNode'
import DeleteNode from './components/DeleteNode'
import Nav from './components/Nav'

const AppContainer = styled(AragonApp)`
  display: flex;
  align-content: flex-start;
  flex-direction: column;
`

const AltheaAppBar = styled(AppBar)`
  background: #efefef;
  border: 2px solid #ddd;
  border-radius: 5px;
  padding: 0;
  margin: 20px 0;
  height: 100%;
`

const OrganizerModeLink = styled.a`
  cursor: pointer;
  color: blue;
  text-decoration: underline;
`

class App extends React.Component {
  constructor() {
    super();
    this.state = { 
      mode: 'user',
      page: null 
    }
  } 

  setMode = mode => this.setState({ mode })
  setPage = page => this.setState({ page })  

  render() {
    const Page = this.state.page;
    const { app, nodes, t } = this.props;
    const { mode } = this.state;
    let title = t('altheaSubnetDAO')
    if (mode === 'organizer') title += ' ' + t('organizerMode')

    return (
      <AppContainer>
        <Grid fluid>
          <AltheaAppBar title={title} endContent={<Nav mode={mode} setMode={this.setMode} setPage={this.setPage} />} />
          {this.state.page && <Page app={app} nodes={nodes} />}

          {mode === 'user' &&
          <Text.Block style={{marginTop: '20px'}}>
            <OrganizerModeLink onClick={() => this.setMode('organizer')}>{t('organizerModeLink')}</OrganizerModeLink>
          </Text.Block>
          }
        </Grid>
      </AppContainer>
    )
  }
}

export default translate()(observe(
  observable => observable.map(state => ({ ...state })),
  {}
)(App))
