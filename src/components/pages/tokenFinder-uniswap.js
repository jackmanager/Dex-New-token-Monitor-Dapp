import React, { Component } from 'react';
import { Card } from 'react-bootstrap'
import { MDBDataTable  } from 'mdbreact';
import Web3 from 'web3';
import './App.css';
import {ethRPC, ERC20ABI, ROUTERABI, ethAddress, uniswapRouterAddress, uniswapFactoryAddress, etherscanAPIKey, FactoryABI, ethUsdtAddress} from '../config'
import { BsCardChecklist, BsStopwatch } from 'react-icons/bs';
import {NotificationContainer, NotificationManager} from 'react-notifications';
import 'react-notifications/lib/notifications.css';
// In a node environment
let web3 = new Web3(ethRPC);
const factoryContract =  new web3.eth.Contract(FactoryABI,uniswapFactoryAddress);
const wethContract    =  new web3.eth.Contract(ERC20ABI, ethAddress)
const routerContract  =  new web3.eth.Contract(ROUTERABI, uniswapRouterAddress)
const internationalNumberFormat = new Intl.NumberFormat('en-US')
let pageBusy  = true;

class Uniswap extends Component {

    constructor(props){
      super(props)
      this.state={
        isBotRuning   : false,
        tableDatas    : [],
        prevToken     : '', 
        checkhash     : '0',
        pageBusy      : true,
        scanningBlockNumber : 0,
      }
    }

    async componentWillMount() {
            await this.initialListing(1000)

            let blocknumber = await web3.eth.getBlockNumber()
            this.setState({
              scanningBlockNumber : blocknumber
            })

            setInterval(() => {
              this.realTimeScanning()
            }, 30000);

            setInterval(() => {
              this.realTimeDataUpdate()
            }, 60000);

            setInterval(() => {
              this.realTimeTimerUpdate()
            }, 2000);


    }

    async initialListing(number){
      console.log("initial token scanning!")
        let blocknumber = await web3.eth.getBlockNumber() - number
        let eventarray = await factoryContract.getPastEvents('PairCreated',{
          fromBlock : blocknumber,
          toBlock : 'latest'
        })
        console.log(eventarray)


        let tokenAddress
        let hash 
        let pairAddress
        
        for (let index = eventarray.length - 1; index > - 1; index--) {
          eventarray[index].returnValues[0] === ethAddress? tokenAddress = eventarray[index].returnValues[1]: tokenAddress = eventarray[index].returnValues[0]
          hash =  eventarray[index].transactionHash
          pairAddress = eventarray[index].returnValues[2]

          let tableData = {
            id              : index,
            tokenName       : '',
            tokenTitle      : '',
            releaseDate      : '',
            owner           : '',
            Distokeninfo       : '',
            tokenAddress    : tokenAddress,
            hash            : hash,
            DisreleaseDate     : '',
            verifyStatus    : '',
            DisverifyStatus : '',
            honeyPotStatus  : '',
            mintStatus      : '',
            DismintStatus   : '',
            taxStatus       : '',
            renounceStatus  : '',
            liquidityStatus : '',
            liquidityAmount : '',
            supply          : '',
            traded          : '',
            txCount         : '',
            pairAddress     :  pairAddress,
            DistokenAddress : '',
            Dishash         : '',
            honeyPotStatusDis : '',
            DisOwner           : '',
            flag            : 'false'
          }
          let tableDatas = this.state.tableDatas
          tableDatas.push(tableData)
          this.setState({
            tableDatas : tableDatas
          })
            this.getData(tokenAddress, hash, index, pairAddress, false)
            this.getTimer(hash, index)
        }
    }

    async realTimeScanning(){
        console.log("real time token scanning")
        let tokenAddress
        let hash 
        let pairAddress
        
        let eventarray = await factoryContract.getPastEvents('PairCreated',{
            fromBlock : this.state.scanningBlockNumber + 1,
            toBlock : 'latest'
        })

        let blocknumber = await web3.eth.getBlockNumber()
        this.setState({
            scanningBlockNumber : blocknumber
        })

        if(eventarray.length === 0){
            console.log("new token scanning result: nothing")
            return
        } else {
            console.log("new token scanning result: ", eventarray.length)
                hash =  eventarray[0].transactionHash       
                if (hash === this.state.tableDatas[0].hash){  
                } else {
                    eventarray[0].returnValues[0] === ethAddress? tokenAddress = eventarray[0].returnValues[1]: tokenAddress = eventarray[0].returnValues[0]
                    hash =  eventarray[0].transactionHash
                    pairAddress = eventarray[0].returnValues[2]
                    let tokenContract=  new web3.eth.Contract(ERC20ABI,tokenAddress);
                    let tokenName    = await tokenContract.methods.symbol().call();
                    NotificationManager.success("New token " + tokenName + " is added To Uninswap Liquidity \n" )
                    document.querySelector('tbody>tr:first-of-type').classList.add('new')
                    setTimeout(() => {
                      document.querySelector('tbody>tr:first-of-type').classList.remove("new") 
                    }, 30000);
                    let tableData = {
                      id              :  this.state.tableDatas.length,
                      tokenName       : '',
                      tokenTitle      : '',
                      releaseDate      : '',
                      owner           : '',                      
                      tokenAddress    : tokenAddress,
                      hash            : hash,
                      verifyStatus    : '',                     
                      honeyPotStatus  : '',
                      mintStatus      : '',
                      taxStatus       : '',
                      renounceStatus  : '',
                      liquidityStatus : '',
                      liquidityAmount : '',
                      supply          : '',
                      traded          : '',
                      txCount         : '',
                      pairAddress     :  pairAddress,
                      Distokeninfo    : '',
                      DisverifyStatus : '',
                      DismintStatus   : '',
                      DisreleaseDate  : '',
                      DistokenAddress : '',
                      Dishash         : '',
                      DisOwner        : '',
                      honeyPotStatusDis : '',
                      flag            : 'false'
                    }
                    
                    let tableDatas = this.state.tableDatas
                    tableDatas.unshift(tableData)
                    this.setState({
                      tableDatas : tableDatas
                    })
                    this.getData(tokenAddress, hash,  this.state.tableDatas.length - 1, pairAddress)
                    this.getTimer(hash, this.state.tableDatas.length - 1)
                }
        }
    }

    async realTimeDataUpdate(){
      if (this.state.pageBusy === false){
        return
      }
        console.log("data update!")
        for (let i = 0; i < this.state.tableDatas.length; i++) {
            this.getData(this.state.tableDatas[i].tokenAddress, this.state.tableDatas[i].hash, this.state.tableDatas[i].id, this.state.tableDatas[i].pairAddress, true)
            console.log(i)
        }
    }

    async realTimeTimerUpdate(){
      if(pageBusy = false){
        return
      }
      for (let i = 0; i < this.state.tableDatas.length; i++) {
          this.getTimer(this.state.tableDatas[i].hash, this.state.tableDatas[i].id)
      }
  }

    async getData(tokenAddress, hash, id, pairAddress, isUpdate){
        try{
            let tokenName
            let tokenTitle
            let verifyStatus
            let honeyPotStatus
            let mintStatus
            let buyTax
            let sellTax
            let renounceStatus
            let liquidityAmount
            let owner
            let supply
            let traded
            let txCount
            let releaseDate
            let tableDatas
            let ethPrice

            let tokenContract=  new web3.eth.Contract(ERC20ABI,tokenAddress);
            tokenName    = await tokenContract.methods.symbol().call()
            tokenTitle    = await tokenContract.methods.name().call()   
            tableDatas = this.state.tableDatas
            tableDatas[this.state.tableDatas.length - id - 1].tokenName = tokenName
            tableDatas[this.state.tableDatas.length - id - 1].tokenTitle = tokenTitle
            tableDatas[this.state.tableDatas.length - id - 1].tokeninfo = <p><b>{tokenTitle}</b><br/><b>({tokenName})</b></p> 
            tableDatas[this.state.tableDatas.length - id - 1].tokenAddressDis = <a href = {"https://etherscan.io/address/" + tokenAddress} target  = "_blank"><b>{tokenAddress.slice(0,5)}...{tokenAddress.slice(tokenAddress.length -3 ,tokenAddress.length)}</b></a>
            tableDatas[this.state.tableDatas.length - id - 1].hashDis = <a href = {"https://etherscan.io/tx/" + hash} target  = "_blank"><b>{hash.slice(0,5)}...{hash.slice(hash.length -3 ,hash.length)}</b></a>
            this.setState({
                tabledatas : tableDatas
            })
// renounce check      ============================================================  

             try{
                try {
                    owner = await tokenContract.methods.owner().call()
                }catch(err){
                    owner = ""
                }
                if (owner === '0x0000000000000000000000000000000000000000'){
                    renounceStatus = 'false'
                } else if (owner === ''){
                    renounceStatus = 'unknown'
                } else {
                    renounceStatus = 'true'
                }
              }catch(err){
                  renounceStatus =false
              }
              tableDatas = this.state.tableDatas
              if (renounceStatus === 'true'){
                  tableDatas[this.state.tableDatas.length - id - 1].renounceStatus = <p className='text-success'> <b>Good</b> </p>
              }  else if (renounceStatus === 'false'){
                  tableDatas[this.state.tableDatas.length - id - 1].renounceStatus =  <p className='text-danger'> <b>renounced</b> </p>
              }  else {
                  tableDatas[this.state.tableDatas.length - id - 1].renounceStatus =  <p className='text-warning'> <b>Unknown</b> </p>
              }


              if (isUpdate && owner !== tableDatas[this.state.tableDatas.length - id - 1].owner){
                document.querySelector('tbody>tr:nth-of-type('+(this.state.tableDatas.length - id) +')>td:nth-of-type(5)').classList.add('new')
                document.querySelector('tbody>tr:nth-of-type('+(this.state.tableDatas.length - id) +')>td:nth-of-type(10)').classList.add('new')
                setTimeout(() => {
                  document.querySelector('tbody>tr:nth-of-type('+(this.state.tableDatas.length - id) +')>td:nth-of-type(5)').classList.remove("new") 
                  document.querySelector('tbody>tr:nth-of-type('+(this.state.tableDatas.length - id) +')>td:nth-of-type(10)').classList.remove("new") 
                }, 30000);
              }

              tableDatas[this.state.tableDatas.length - id - 1].owner = owner
              owner === '' ? tableDatas[this.state.tableDatas.length - id - 1].DisOwner = <p className='text-warning'> Unknown </p>:tableDatas[this.state.tableDatas.length - id - 1].DisOwner = <a href = {"https://etherscan.io/address/" + owner} target  = "_blank"><b>{owner.slice(0,6)}...{owner.slice(owner.length -3 ,owner.length)}</b></a>

              this.setState({
                tabledatas : tableDatas
              })
   
              
// total supply check
              try{
                  supply = await tokenContract.methods.totalSupply().call()
                      supply = supply / 1
              }catch(err){
                  supply =  " can't catch "
              }

              tableDatas = this.state.tableDatas
              tableDatas[this.state.tableDatas.length - id - 1].supply = <p><b>{supply.toExponential(2)}</b></p>
              this.setState({
                  tabledatas : tableDatas
              })

                  
  // verify check,  mint check ===============================================================
            try{
                if( this.state.tableDatas[this.state.tableDatas.length - id - 1].verifyStatus === true) {
                  verifyStatus = true
                  mintStatus = this.state.tableDatas[this.state.tableDatas.length - id - 1].mintStatus
                } else {
                    let bscURL = 'https://api.etherscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=' + etherscanAPIKey;
                    await fetch (bscURL)
                    .then(response => response.json())
                    .then(
                        async(response)=> {
                            try{
                                if (response['result']['0']['ABI'] === "Contract source code not verified") {
                                    verifyStatus = false
                                    mintStatus   = "unknown"
                                } else {
                                    verifyStatus = true
                                    try{
                                        if (response['result']['0']['SourceCode'].includes('mint')||response['result']['0']['SourceCode'].includes('Mint')) {
                                            mintStatus = "Non-Mintable"
                                        } else {
                                            mintStatus ="Mintable"
                                        }
                                    }catch(err){
                                        mintStatus = "Non-mintable"
                                    }   
                                }
                            }catch(err){
                                verifyStatus = false
                            }
                    })
                } 
            }catch(err){
              verifyStatus = false
              mintStatus = "Non-M"
            } 

            tableDatas = this.state.tableDatas
            tableDatas[this.state.tableDatas.length - id - 1].mintStatus = mintStatus
            tableDatas[this.state.tableDatas.length - id - 1].verifyStatus = verifyStatus
            if (mintStatus === 'unknown'){
                tableDatas[this.state.tableDatas.length - id - 1].mintStatusDis = <p className='text-warning'> <b>Unknown</b> </p> 
            }else if(mintStatus === 'Non-mintable'){
                tableDatas[this.state.tableDatas.length - id - 1].mintStatusDis = <p className='text-success'> <b>Non-Mintable</b> </p>
            } else {
                tableDatas[this.state.tableDatas.length - id - 1].mintStatusDis = <p className='text-danger'> <b>Mintable</b> </p> 
            }
            verifyStatus ? tableDatas[this.state.tableDatas.length - id - 1].verifyStatusDis = <p className='text-success'> <b>Verified</b> </p> :  tableDatas[this.state.tableDatas.length - id - 1].verifyStatusDis = <p className='text-danger'> <b>Unverified</b> </p> 
            this.setState({
                tabledatas : tableDatas
            })



  // honeypot check ================================================================
            try{
                let honeypot_url = 'https://aywt3wreda.execute-api.eu-west-1.amazonaws.com/default/IsHoneypot?chain=eth&token=' + tokenAddress 
                await fetch(honeypot_url)
                .then(response => response.json())
                .then(
                  async (response) => { 
                    console.log(response)
                      honeyPotStatus = !response.IsHoneypot
                      buyTax = response.BuyTax
                      sellTax = response.SellTax
                })
            }catch(err){
                honeyPotStatus = false
            }

            if (isUpdate && tableDatas[this.state.tableDatas.length - id - 1].honeyPotStatus !== honeyPotStatus){
                  document.querySelector('tbody>tr:nth-of-type('+(this.state.tableDatas.length - id) +')>td:nth-of-type(8)').classList.add('new')
                  setTimeout(() => {
                    document.querySelector('tbody>tr:nth-of-type('+(this.state.tableDatas.length - id) +')>td:nth-of-type(8)').classList.remove("new") 
                  }, 30000);
            }

            tableDatas = this.state.tableDatas
            tableDatas[this.state.tableDatas.length - id - 1].honeyPotStatus = honeyPotStatus
            honeyPotStatus ? tableDatas[this.state.tableDatas.length - id - 1].honeyPotStatusDis = <p className='text-success'> <b>Good</b> </p> : tableDatas[this.state.tableDatas.length - id - 1].honeyPotStatusDis = <p className='text-danger'> <b>HoneyPot</b> </p>
            tableDatas[this.state.tableDatas.length - id - 1].taxStatus = <p className='text-success'><b>Sell tax:{sellTax}% <br/>Buy Tax:{buyTax}% </b> </p>

            this.setState({
                tabledatas : tableDatas
            })

 

  // liquidity check
            try{
                let poolAddress     = await factoryContract.methods.getPair(tokenAddress, ethAddress).call()
                let ethliquidityAmount =  await wethContract.methods.balanceOf(poolAddress).call()
                ethliquidityAmount = (ethliquidityAmount / 1000000000000000000)
                let usdliquidityAmount =  await routerContract.methods.getAmountsOut("1000000000000000000", [ethAddress,ethUsdtAddress]).call()
                ethPrice = usdliquidityAmount[1] / Math.pow(10,6)
                liquidityAmount = (usdliquidityAmount[1] * ethliquidityAmount/ 500000).toFixed(0)
                

            }catch(err){
            }


              
            tableDatas = this.state.tableDatas
            tableDatas[this.state.tableDatas.length - id - 1].liquidityStatus = internationalNumberFormat.format(liquidityAmount) + '$' 
            this.setState({
              tabledatas : tableDatas
            })

  // token transferred count trad amount
            let transferEventArray = await tokenContract.getPastEvents('Transfer',{
                fromBlock : 0,
                toBlock : 'latest'
            })
            let countbuffer  = 0
            let tradedbuffer = 0
            if (transferEventArray.length !== 0){
                for (let index = 0; index < transferEventArray.length; index++) {
                    if (transferEventArray[index].returnValues[0] === pairAddress || transferEventArray[index].returnValues[1] === pairAddress){
                        countbuffer = countbuffer + 1
                        let transaction = await web3.eth.getTransaction(transferEventArray[index].transactionHash)
                        tradedbuffer = tradedbuffer + transaction.value / 1
                    }
                }
            }

            txCount = countbuffer
            traded = internationalNumberFormat.format((tradedbuffer * ethPrice / Math.pow(10, 18)).toFixed(0))
            tableDatas = this.state.tableDatas
            tableDatas[this.state.tableDatas.length - id - 1].txCount = txCount
            tableDatas[this.state.tableDatas.length - id - 1].traded  = traded + '$'
            this.setState({
                tabledatas : tableDatas
            })
        }catch(err){
            return
        }
    }

    async getTimer(hash, id){
      let releaseDate
        try{
          let timetransaction = await web3.eth.getTransaction(hash)
          let blocknumber = timetransaction.blockNumber
          let timeblock = await web3.eth.getBlock(blocknumber)
          let releasetime = timeblock.timestamp
          let sincetime = Math.floor(Date.now() / 1000) - releasetime
          let hour   = Math.floor(sincetime / 3600)
          let minute = Math.floor((sincetime - 3600 * hour)/60)
          let second = Math.floor (sincetime % 60)


          if (hour !== 0){
            releaseDate = hour + 'h '
          }  else {
            releaseDate = ''
          }
          if (minute !== 0 ){
            releaseDate = releaseDate + minute + 'm '
          }   
          if (second !== 0){
            releaseDate = releaseDate + second + 's'
          }
      }catch(err){

      }

      let tableDatas = this.state.tableDatas
      tableDatas[this.state.tableDatas.length - id - 1].releaseDate = releaseDate
      tableDatas[this.state.tableDatas.length - id - 1].DisReleaseDate = <p><b><BsStopwatch/>{releaseDate}</b></p> 
      this.setState ({
        tableDatas : tableDatas
      })
    }



    render() {
      var rowsCaptureTable = this.state.tableDatas
      const captureDataTable = {
        columns : [
          {
            label : 'Token',
            field : 'tokeninfo',
            sort: 'disabled',
          },
          {
            label : 'Address',
            field : 'tokenAddressDis',
            sort: 'disabled',
          },
          {
            label : 'Hash',
            field : 'hashDis',
            sort  : 'disabled',
          },
          {
            label : 'Listed Since',
            field : 'DisReleaseDate',
            sort  : 'disabled',
          },
          {
            label : 'Owner',
            field : 'DisOwner',
            sort  : 'disabled',
          },
          {
            label : 'Supply',
            field : 'supply',
          },
          {
            label : 'Verify',
            field : 'verifyStatusDis',
            sort  : 'disabled',
          },
          {
            label : 'Honeypot',
            field : 'honeyPotStatusDis',
            sort  : 'disabled',
          },
          {
            label : 'Mint',
            field : 'mintStatusDis',
            sort  : 'disabled',
          },
          {
            label : 'Renounce',
            field : 'renounceStatus',
            sort  : 'disabled',
          },
          {
            label : 'Tax',
            field : 'taxStatus',
            sort  : 'disabled',
          },
          {
            label : 'Liquidity',
            field : 'liquidityStatus',
            sort  : 'disabled',
          },
          {
            label : 'TxCount',
            field : 'txCount',
            sort  : 'disabled',
          },
          {
            label : 'Volume Traded',
            field : 'traded',
            sort: 'disabled',
          },
        ],
        rows : rowsCaptureTable,
      }

      return (
        <div>
          <br/>
          <Card  bg="light" style={{ height: '92vh', align : 'center', color : '#b73859'}} >
            <Card.Body style = {{overflowY : 'scroll'}}>
              <Card.Title><h2> <b><BsCardChecklist/> &nbsp; Newest Token Table Of UNISWAP </b></h2> <hr/></Card.Title><br/>
              <MDBDataTable small materialSearch noBottomColumns responsive theadColor="indigo"  data={captureDataTable}  entriesOptions={[10, 20, 50 ,100 ]} entries ={10} hover/>
            </Card.Body>
          </Card>
          <NotificationContainer/>
        </div>
      );
    }
}
export default Uniswap;
