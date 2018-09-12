import React from 'react'
import { AragonApp, AppBar } from '@aragon/ui'
import Aragon, { providers } from '@aragon/client'
import styled from 'styled-components'
import { Grid } from 'react-flexbox-grid'

import NewNodeForm from './components/NewNodeForm'
import CheckNode from './components/CheckNode'
import DeleteNode from './components/DeleteNode'
import Nav from './components/Nav'
import NodeList from './components/NodeList'

const AppContainer = styled(AragonApp)`
  display: flex;
  justify-content: center;
  align-content: flex-start;
  flex-direction: column;
  text-align: center;
`

const AltheaAppBar = styled(AppBar)`
  background: #efefef;
  border: 2px solid #ddd;
  border-radius: 5px;
  padding: 0;
  margin: 0;
  height: 100%;
`

export default class App extends React.Component {
  constructor() {
    super();
    this.state = { page: NodeList };
  } 

  setPage = page => this.setState({ page })  

  render() {
    const Page = this.state.page;

    return (
      <AppContainer>
        <Grid fluid>
          <AltheaAppBar title="Althea Subnet DAO" endContent={<Nav setPage={this.setPage} />} />
          {this.state.page && <Page />}
        </Grid>
      </AppContainer>
    )
  }
}
