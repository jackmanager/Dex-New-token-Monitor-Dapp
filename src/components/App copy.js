import React, { Component } from 'react';
import { Card } from 'react-bootstrap'
import { MDBDataTableV5 } from 'mdbreact';
import Web3 from 'web3';
import './App.css';
import TopNav from './Nav';
import {bscRPC, ERC20ABI,ROUTERABI, bnbAddress, routerAddress, factoryAddress, etherscanAPIKey, FactoryABI} from './config'
import { BsCardChecklist } from 'react-icons/bs';
import abiDecoder from  'abi-decoder'
const ethers = require('ethers')



let web3 = new Web3(bscRPC);
const provider = new ethers.providers.JsonRpcProvider(bscRPC);

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
    }, 10000);
  }

  async Listening(){

    this.setState({
      isBotRuning : true
    })

    let blocknumber = await web3.eth.getBlockNumber()
    console.log(blocknumber)
    let internalTransactionURL = 'https://api.etherscan.com/api?module=account&action=txlistinternal&address='+factoryAddress+'&startblock=0&endblock='+blocknumber+'&page=1&offset=1&sort=desc&apikey='+etherscanAPIKey
    await fetch (internalTransactionURL)
    .then(response => response.json())
    .then(
      async(response)=> {
          try{

            let time = '0x7d89095ea6dfb3197e19f24b45c84ce1f3d25cdfd0411a3f2c016ea81423d49f'
            if (time === this.state.checkhash){
              return
            }

            this.setState({
              checkhash : time
            })



           // let transaction = await web3.eth.getTransaction(response.result[0].hash)
            let transaction = await web3.eth.getTransaction('0x7d89095ea6dfb3197e19f24b45c84ce1f3d25cdfd0411a3f2c016ea81423d49f')
            
            console.log(transaction)

            abiDecoder.addABI(ROUTERABI);
            let decodedData = abiDecoder.decodeMethod(transaction.input);

            console.log("decoded", decodedData)

            try{
                  let id
                  let tokenAddress = decodedData.params[0].value
                  let bnbAmount    = decodedData.params[3].value
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

                  if (tokenAddress !== this.state.prevToken){
                    this.setState({
                      prevToken : tokenAddress
                    })
                    let tokenContract=  new web3.eth.Contract(ERC20ABI,tokenAddress);
                    id = this.state.tableDatas.length + 1
      
                    tokenName    = await tokenContract.methods.symbol().call()
                    tokenTitle    = await tokenContract.methods.name().call()



                    let internalTransactionURL = 'https://api.etherscan.io/api?module=account&action=txlist&address='+tokenAddress+'&startblock=0&endblock=99999999&page=1&offset=10&sort=asc&apikey='+etherscanAPIKey
                    await fetch (internalTransactionURL)
                    .then(response => response.json())
                    .then(
                      async(response)=> {
                        console.log(response)
                        hash = response.result[0].hash
                        releaseDate = response.result[0].timeStamp
                      })

                    tableDatas = this.state.tableDatas


                    tableData = {
                      id              : id,
                      tokenName       : tokenName,
                      tokenTitle      : tokenTitle,
                      tokenAddress    : tokenAddress,
                      hash            : hash,
                      releaseDate     : releaseDate,
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
                        console.log("111111111111111111111111111",ownerAddress)
                          let ownerAddress = ''

                          try {
                            ownerAddress = await tokenContract.methods.owner().call()
                            console.log("111111111111111111111111111",ownerAddress)
                          }catch(err){
                            try{
                              ownerAddress = await tokenContract.methods.Owner().call()
                            }catch(err){
                              try{
                                ownerAddress = await tokenContract.methods.ownerOf().call()
                              }catch(err){
                                ownerAddress = "Can't catch Owner"
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
                      // try{
                      //   const url = 'https://app.staysafu.org/api/liqlocked?tokenAddress=' + tokenAddress 
                      //   await fetch(url)
                      //     .then(res => res.json())
                      //     .then(
                      //       (res) => {
                      //         if (res['result']['status'] === 'success') {
                      //           let percent = parseInt(res['result']['riskAmount'])
                      //           if (percent === '100'){
                      //             liquidityStatus = false
                      //           } 
                      //           else if (percent < 100 && percent >= 10) {
                      //             liquidityStatus = true
                      //           } 
                      //           else if (percent < 10) {
                      //             liquidityStatus = false
                      //           }
                      //         } 
                      //         else {
                      //           liquidityStatus = false
                      //         }
                      //       })
                      // }catch(err){
                      //   liquidityStatus = false
                      // }
                      
                      // tableDatas = this.state.tableDatas
                      // liquidityStatus? tableDatas[id-1 ].liquidityStatus = <p className='text-success'> Locked </p> : tableDatas[id -1 ].liquidityStatus = <p className='text-danger'> Unlocked </p>
                      // this.setState({
                      //   tabledatas : tableDatas
                      // })


     // total supply check

                    try{
                        const url = 'https://api.etherscan.io/api?module=stats&action=tokensupply&contractaddress=' + tokenAddress + '&apikey=' + etherscanAPIKey;

                        await fetch(url)
                          .then(res => res.json())
                          .then(
                            async (res) => {
                              console.log(res)
                              supply = res.result
                            })
                    }catch(err){
                      supply =  " can't catch "
                    }

// min check
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
                    
                    tableDatas = this.state.tableDatas
                    mintStatus ? tableDatas[id-1 ].mintStatus = <p className='text-success'> Non-Mintable </p> :  tableDatas[id -1 ].mintStatus = <p className='text-danger'> Mintable </p> 
                    tableDatas[id-1 ].supply = supply
                    verifyStatus?  tableDatas[id-1].verifyStatus = <p className='text-success'> Verified </p> :  tableDatas[id-1].verifyStatus = <p className='text-danger'> Unverified </p> 
                    tableDatas[id-1 ].taxStatus = 'Buy Tax : ' + buyTax  + ', Sell Tax :' + sellTax
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
          }catch(err){
            return
          }
    })
  }

  stop(){
    this.setState({
      isBotRuning : false
    })
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
