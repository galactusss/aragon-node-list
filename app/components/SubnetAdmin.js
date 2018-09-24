import React from 'react'
import { Card, TextInput, Field, Button, Text } from '@aragon/ui'
import { Row, Col } from 'react-flexbox-grid'
import styled from 'styled-components'
import { translate } from 'react-i18next'
import web3Utils from 'web3-utils'
import { Address6 } from 'ip-address'
import QrReader from 'react-qr-reader'

const StyledCard = styled(Card)`
  width: 100%;
  height: auto;
  text-align: left;
  margin-top: 10px;
  margin-bottom: 10px;
  padding: 20px;
`

class SubnetAdmin extends React.Component {
  constructor() {
    super()
    this.state = {
      delay: 300,
      ethAddress: '0xb4124cEB3451635DAcedd11767f004d8a28c6eE7',
      ipAddress: '0000:0000:0000:0000:0000:0000:0000:0001',
      ipValid: true,
      nickname: 'adam',
      result: 'No result'
    } 
  } 

  setNickname = e => { 
    let nickname = e.target.value
    this.setState({ nickname })
  }

  setEthAddress = e => { 
    let ethAddress = e.target.value
    this.setState({ ethAddress })
  }

  setIpAddress = e => { 
    let ipAddress = e.target.value
    let ipValid = (new Address6(ipAddress)).isValid()
    this.setState({ ipAddress, ipValid })
  }

  addNode = async () => {
    let { ethAddress, ipAddress, nickname } = this.state
    nickname = web3Utils.padRight(web3Utils.toHex(nickname), 32)
    ipAddress = '0x' + ipAddress.replace(new RegExp(':', 'g'), '')
    this.props.app.addMember(
      ethAddress,
      ipAddress,
      nickname
    )
  } 

  formatIp = async e => {
    let ipAddress = (new Address6(e.target.value)).canonicalForm()
    if (ipAddress)
      this.setState({ ipAddress })
  } 

  handleScan = result => {
    if (result) {
      this.setState({ result })
    }
  }

  handleError = err => {
    console.error(err)
  }

  render() {
    let { t } = this.props;
    let { nickname, ethAddress, ipAddress, ipValid} = this.state

    /*
    const billCount = new BN(summation(subscribersCount))
    const perBlockFee = await contract.perBlockFee()
    let expectedBalance = perBlockFee.mul(billCount).add(new BN(0))
    */
    let bills = 125.23

    return (
      <Row>
        <Col xs={6}>
          <StyledCard>
            <Text size="xlarge">{t('addNode')}</Text>
            <Field label={t('nodeNickname')}>
              <TextInput wide
                type="text"
                name="nickname"
                placeholder={t('whoOwns')}
                onChange={this.setNickname}
                value={nickname}
              />
            </Field>
            <Button>Scan node QR code</Button>
            {/*
            <div>
              <QrReader
                delay={this.state.delay}
                onError={this.handleError}
                onScan={this.handleScan}
                style={{ width: '100%' }}
                />
              <p>{this.state.result}</p>
            </div>
            */}
            <Field label={t('ethAddress')}>
              <TextInput wide
                type="text"
                name="address"
                placeholder={t('enterEthAddress')}
                onChange={this.setEthAddress}
                value={ethAddress}
              />
            </Field>
            <Field label={t('ipAddress')}>
              <TextInput wide
                type="text"
                name="ip"
                placeholder={t('enterIpAddress')}
                onBlur={this.formatIp}
                onChange={this.setIpAddress}
                value={ipAddress}
              />
            </Field>
            {ipValid || <span>Enter a valid ipv6 address</span>}
            <Field>
              <Button onClick={this.addNode}>{t('addNode')}</Button>
            </Field>
          </StyledCard>
          <StyledCard>
            <Text size="xlarge">{t('collectBills')}</Text>
            <p>{t('youHave', { bills })}</p>
            <Button>{t('collectBills')}</Button>
          </StyledCard>
        </Col>
        <Col xs={6}>
          <StyledCard>
            <Text size="xlarge">{t('checkNode')}</Text>
            <Field label={t('ethAddress')}>
              <TextInput wide
                type="text"
                name="address"
                placeholder={t('enterEthAddress')}
              />
            </Field>
            <Button>{t('checkNodeInSubnetDAO')}</Button>
          </StyledCard>
          <StyledCard>
            <Text size="xlarge">{t('removeNode')}</Text>
            <Field label={t('ethAddress')}>
              <TextInput wide
                type="text"
                name="address"
                placeholder={t('enterEthAddress')}
              />
            </Field>
            <Button>{t('removeNodeFromSubnetDAO')}</Button>
          </StyledCard>
        </Col>
      </Row>
    );
  }
}

export default translate()(SubnetAdmin)
