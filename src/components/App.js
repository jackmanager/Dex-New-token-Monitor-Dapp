import React, { Component } from 'react';
import { Card } from 'react-bootstrap'
import { MDBDataTableV5 } from 'mdbreact';
import Web3 from 'web3';
import './App.css';
import TopNav from './Nav';
import {bscRPC, ERC20ABI,ROUTERABI, bnbAddress, routerAddress, factoryAddress, etherscanAPIKey, FactoryABI, usdtAddress} from './config'
import { BsCardChecklist } from 'react-icons/bs';
import abiDecoder from  'abi-decoder'
import { hashMessage } from 'ethers/lib/utils';
const ethers = require('ethers')



let web3 = new Web3(bscRPC);
const provider = new ethers.providers.JsonRpcProvider(bscRPC);
const factoryContract =  new web3.eth.Contract(FactoryABI,factoryAddress);
const wethContract    =  new web3.eth.Contract(ERC20ABI, bnbAddress)
const routerContract  =  new web3.eth.Contract(ROUTERABI, routerAddress)


class App extends Component {

  constructor(props){
    super(props)
    this.state={
      isBotRuning   : false,
      tableDatas    : [],
      prevToken     : '', 
      checkhash     : '0'
    }
  }


  async componentWillMount() {
    await this.start()
  }





  async start(){
    setInterval(() => {
      this.Listening()
    }, 3000);
  }

  async Listening(){
    
    let blocknumber = await web3.eth.getBlockNumber() - 5

    let eventarray = await factoryContract.getPastEvents('PairCreated',{
      fromBlock : blocknumber,
      toBlock : 'latest'
    })
    eventarray = eventarray[0]
    console.log(eventarray)

    try{
          let id
          let tokenAddress
          let bnbAmount    
          let tokenName
          let tokenTitle
          let verifyStatus
          let honeyPotStatus
          let mintStatus
          let taxStatus
          let buyTax
          let sellTax
          let renounceStatus
          let liquidityStatus
          let liquidityAmount
          let hash
          let owner
          let supply
          let traded
          let txCount
          let releaseDate
          let tableDatas
          let tableData

         
          eventarray.returnValues[0] == bnbAddress? tokenAddress = eventarray.returnValues[1]: tokenAddress = eventarray.returnValues[0]

          console.log(tokenAddress)

      

            if (tokenAddress !== this.state.prevToken){
             
              this.setState({
                prevToken : tokenAddress
              })

              let tokenContract=  new web3.eth.Contract(ERC20ABI,tokenAddress);
              id = this.state.tableDatas.length + 1
              tokenName    = await tokenContract.methods.symbol().call()
              tokenTitle    = await tokenContract.methods.name().call()
              hash =  eventarray.transactionHash
              console.log(tokenName, tokenTitle)
              tableDatas = this.state.tableDatas
              tableData = {
                id              : id,
                tokenName       : tokenName,
                tokenTitle      : tokenTitle,
                tokenAddress    : tokenAddress,
                hash            : '',
                releaseDate     : '',
                verifyStatus    : '',
                honeyPotStatus  : '',
                mintStatus      : '',
                taxStatus       : '',
                renounceStatus  : '',
                liquidityStatus : '',
                liquidityAmount : '',
                owner           : '',
                supply          : '',
                traded          : '',
                txCount         : '',
              }
  
              tableDatas.push(tableData)
  
              this.setState({
                tabledatas : tableDatas
              })

  // verify check

                try{
                  let bscURL = 'https://api.etherscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=' + etherscanAPIKey;
                  await fetch (bscURL)
                  .then(response => response.json())
                  .then(
                    async(response)=> {
                        if (response['result']['0']['ABI'] === "Contract source code not verified") {
                          verifyStatus = false
                        } else {
                          verifyStatus = true
                        }
                  })
                }catch(err){
                  verifyStatus = false
                } 

  // honeypot check 

                try{
                  let honeypot_url = 'https://aywt3wreda.execute-api.eu-west-1.amazonaws.com/default/IsHoneypot?chain=eth&token=' + tokenAddress 
                  await fetch(honeypot_url)
                  .then(response => response.json())
                  .then(
                    async (response) => { 
                        honeyPotStatus = !response.IsHoneypot
                        buyTax = response.BuyTax
                        sellTax = response.SellTax
                  })
                }catch(err){
                  honeyPotStatus = false
                }
  
  // mint check
              
                try{
                    const url = 'https://api.etherscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=' + etherscanAPIKey;
                    await fetch(url)
                      .then(res => res.json())
                      .then(
                        async (res) => {
                          if (res['result']['0']['SourceCode'].includes('mint')||res['result']['0']['SourceCode'].includes('Mint')) {
                            mintStatus =false
                          } else {
                            mintStatus =true
                          }
                        })
                
                }catch(err){
                  mintStatus = false
                }
  
  // renounce check                      
                try{
                  
                    let ownerAddress = ''
  
                    try {
                      ownerAddress = await tokenContract.methods.owner().call()
                    }catch(err){
                      try{
                        ownerAddress = await tokenContract.methods.Owner().call()
                      }catch(err){
                        try{
                          ownerAddress = await tokenContract.methods.ownerOf().call()
                        }catch(err){
                        }
                      }  
                    }
                    owner = ownerAddress
                    if (ownerAddress === ''||ownerAddress === '0x0000000000000000000000000000000000000000'){
                      renounceStatus = false
                    } else {
                      renounceStatus = true
                    }
                }catch(err){
                  renounceStatus =false
                }
  
  // liquidity check
                try{
                  
  
                  let poolAddress     = await factoryContract.methods.getPair(tokenAddress, bnbAddress).call()
                  console.log("pooladdress", poolAddress)
  
                  let ethliquidityAmount =  await wethContract.methods.balanceOf(poolAddress).call()
                  ethliquidityAmount = (ethliquidityAmount / 1000000000000000000)
                  let usdliquidityAmount =  await routerContract.methods.getAmountsOut(ethers.BigNumber.from("1000000000000000000"), [bnbAddress,usdtAddress]).call()
                  liquidityAmount = (usdliquidityAmount[1] * ethliquidityAmount/ 500000).toFixed(2) 
                }catch(err){
                }
  
  // total supply check
  
              try{
                  const url = 'https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=' + tokenAddress + '&apikey=' + etherscanAPIKey;
                  await fetch(url)
                    .then(res => res.json())
                    .then(
                      async (res) => {
                        console.log(res)
                        let tokenContract = new web3.eth.Contract(ERC20ABI, tokenAddress)
                        let decimals = await tokenContract.methods.decimals().call()
                        supply = (res.result / Math.pow(10, decimals)).toFixed(3)
                      })
              }catch(err){
                supply =  " can't catch "
              }
  // mint check
              try{
                  const url = 'https://api.etherscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=' + etherscanAPIKey;
                  await fetch(url)
                    .then(res => res.json())
                    .then(
                      async (res) => {
                        if (res['result']['0']['SourceCode'].includes('mint')||res['result']['0']['SourceCode'].includes('Mint')) {
                          mintStatus =false
                        } else {
                          mintStatus =true
                        }
                      })
              }catch(err){
                mintStatus = false
              }
  
  // transaction count check 
              try{
                console.log("1111111111111111111111111")
                txCount = await web3.eth.getTransactionCount(tokenAddress)
                console.log("22222222222222",txCount)
              }catch(err){
                console.log(err)
              }
              
              tableDatas = this.state.tableDatas
              
              tableDatas[id-1].hash = <a href = {"https://etherscan.io/tx/" + hash} target  = "_blank">{hash}</a>
              tableDatas[id-1].liquidityStatus = liquidityAmount + '$'
              tableDatas[id-1].supply = supply
              tableDatas[id-1].taxStatus = 'Buy Tax : ' + buyTax  + ', Sell Tax :' + sellTax
              tableDatas[id-1].owner = owner
              tableDatas[id-1].txCount = txCount
              mintStatus ? tableDatas[id-1 ].mintStatus = <p className='text-success'> Non-Mintable </p> :  tableDatas[id -1 ].mintStatus = <p className='text-danger'> Mintable </p> 
              verifyStatus?  tableDatas[id-1].verifyStatus = <p className='text-success'> Verified </p> :  tableDatas[id-1].verifyStatus = <p className='text-danger'> Unverified </p> 
              honeyPotStatus ? tableDatas[id-1].honeyPotStatus = <p className='text-success'> Good </p> : tableDatas[id-1].honeyPotStatus = <p className='text-danger'> HoneyPot </p>
              mintStatus ? tableDatas[id-1 ].mintStatus = <p className='text-success'> Non-Mintable </p> :  tableDatas[id -1 ].mintStatus = <p className='text-danger'> Mintable </p> 
              renounceStatus ? tableDatas[id-1 ].renounceStatus = <p className='text-success'> Good </p> : tableDatas[id -1 ].renounceStatus =  <p className='text-danger'> renounced </p>
              
              this.setState({
                tabledatas : tableDatas
              })
            }       
    }catch(err){
      return
    }
  }



  render() {

    var rowsCaptureTable = this.state.tableDatas
    const captureDataTable = {
      columns : [
        {
          label : 'No',
          field : 'id',
          sort  : 'asc'
        },
        {
          label : 'Token Symbol',
          field : 'tokenName',
        },
        {
          label : 'Token Name',
          field : 'tokenTitle',
        },
        {
          label : 'Token Address',
          field : 'tokenAddress',
        },
        {
          label : 'Verify',
          field : 'verifyStatus',
        },
        {
          label : 'Honeypot',
          field : 'honeyPotStatus',
        },
        {
          label : 'Mint',
          field : 'mintStatus',
        },
        {
          label : 'Tax',
          field : 'taxStatus',
        },
        {
          label : 'Renounce',
          field : 'renounceStatus',
        },
        {
          label : 'Liquidity',
          field : 'liquidityStatus',
        },
        {
          label : 'Hash Link',
          field : 'hash',
        },
        {
          label : 'Owner',
          field : 'owner',
        },
        {
          label : 'Total Supply',
          field : 'supply',
        },
        {
          label : 'Total Volume Traded',
          field : 'traded',
        },
        {
          label : 'Tx Count',
          field : 'txCount',
        },
        {
          label : 'Release Date',
          field : 'releaseDate',
        }
      ],
      rows : rowsCaptureTable,
    }




    return (
      <div>
        <TopNav/><br/><br/>

        <div className = "row">
          <div className = "col-1"></div>
          <div className = "col-10">
            <Card  bg="light" style={{ height: '100%'}} >
              <Card.Body>
                <Card.Title><h2> <BsCardChecklist/> &nbsp; Newest Token Table </h2> <hr/></Card.Title><br/>
                  <MDBDataTableV5 hover entriesOptions={[5,10,20,50,100,200,500,1000]} entries={5} pagesAmount={300} data={captureDataTable}  materialSearch /><br/><br/>
              </Card.Body>
            </Card>
          </div>
          <div className = "col-1"></div>
        </div>

      </div>
    );
  }
}

export default App;
