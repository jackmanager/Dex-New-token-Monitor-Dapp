import React, { Component } from 'react';
import { Card } from 'react-bootstrap'
import { MDBDataTableV5 } from 'mdbreact';
import Web3 from 'web3';
import './App.css';
import TopNav from './Nav';
import {bscRPC, ERC20ABI,ROUTERABI, bnbAddress, routerAddress, factoryAddress, etherscanAPIKey, FactoryABI, usdtAddress} from './config'
import { BsCardChecklist } from 'react-icons/bs';
// In a node environment
const Moralis = require('moralis');
const serverUrl = "https://l2xpqkgp20cn.usemoralis.com:2053/server";
const appId = "ZYDMZACAxoVYw7P65iT0uyY4LMUDL41DPk54fmcJ";

let web3 = new Web3(bscRPC);
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
        Moralis.start({ serverUrl, appId });
        await this.initialListing(2000)
        setInterval(() => {
          this.realTimeScanning(1)
        }, 10000);
        setInterval(() => {
          this.realTimeUpdate()
        }, 10000);
    }

    async initialListing(number){
      console.log("initial token scanning!")
        let blocknumber = await web3.eth.getBlockNumber() - number
        let eventarray = await factoryContract.getPastEvents('PairCreated',{
          fromBlock : blocknumber,
          toBlock : 'latest'
        })
        let tokenAddress
        let hash 
        let pairAddress
        
        for (let index = eventarray.length - 1; index > - 1; index--) {
          eventarray[index].returnValues[0] === bnbAddress? tokenAddress = eventarray[index].returnValues[1]: tokenAddress = eventarray[index].returnValues[0]
          hash =  eventarray[index].transactionHash
          pairAddress = eventarray[index].returnValues[2]

          let tableData = {
            id              : index,
            tokeninfo       : '',
            tokenAddress    : tokenAddress,
            hash            : hash,
            releaseDate     : '',
            verifyStatus    : '',
            verifyStatusDis : '',
            honeyPotStatus  : '',
            mintStatus      : '',
            mintStatusDis   : '',
            taxStatus       : '',
            renounceStatus  : '',
            liquidityStatus : '',
            liquidityAmount : '',
            owner           : '',
            supply          : '',
            traded          : '',
            txCount         : '',
            pairAddress     : pairAddress,
            tokenAddressDis : '',
            hashDis         : '',
          }
    
          let tableDatas = this.state.tableDatas
          tableDatas.push(tableData)
          this.setState({
            tableDatas : tableDatas
          })
            this.getData(tokenAddress, hash, index, pairAddress)
        }
    }

    async realTimeScanning(number){
        console.log("real time token scanning")
        let tokenAddress
        let hash 
        let pairAddress
        let blocknumber = await web3.eth.getBlockNumber() - number
        let eventarray = await factoryContract.getPastEvents('PairCreated',{
            fromBlock : blocknumber,
            toBlock : 'latest'
        })
        

        if(eventarray.length === 0){
            console.log("new token scanning result: nothing")
            return
        } else {
            console.log("new token scanning result: ", eventarray.length)
            for (let index = 0; index < eventarray.length; index++) {
                hash =  eventarray[index].transactionHash       
                if (hash === this.state.tableDatas[0].hash){
                  return
                }

                eventarray[index].returnValues[0] === bnbAddress? tokenAddress = eventarray[index].returnValues[1]: tokenAddress = eventarray[index].returnValues[0]
                hash =  eventarray[index].transactionHash
                pairAddress = eventarray[index].returnValues[2]

                let tableData = {
                  id              : this.state.tableDatas.length,
                  tokeninfo       : '',
                  tokenAddress    : tokenAddress,
                  hash            : hash,
                  releaseDate     : '',
                  verifyStatus    : '',
                  verifyStatusDis : '',
                  honeyPotStatus  : '',
                  mintStatus      : '',
                  mintStatusDis   : '',
                  taxStatus       : '',
                  renounceStatus  : '',
                  liquidityStatus : '',
                  liquidityAmount : '',
                  owner           : '',
                  supply          : '',
                  traded          : '',
                  txCount         : '',
                  pairAddress     : pairAddress,
                  tokenAddressDis : '',
                  hashDis         : '',
                }
                let tableDatas = this.state.tableDatas
                tableDatas.unshift(tableData)
                this.setState({
                  tableDatas : tableDatas
                })
                this.getData(tokenAddress, hash,  this.state.tableDatas.length - 1, pairAddress)
            }
        }
    }

    async realTimeUpdate(){
        console.log("data update!")
        for (let i = 0; i < this.state.tableDatas.length; i++) {
            this.getData(this.state.tableDatas[i].tokenAddress, this.state.tableDatas[i].hash, this.state.tableDatas[i].id, this.state.tableDatas[i].pairAddress)
            console.log(i)
        }
    }

    async getData(tokenAddress, hash, id, pairAddress){
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

            tableDatas[this.state.tableDatas.length - id - 1].tokeninfo = tokenTitle + '  (' + tokenName + ')'
            tableDatas[this.state.tableDatas.length - id - 1].tokenAddressDis = <a href = {"https://etherscan.io/address/" + tokenAddress} target  = "_blank">{tokenAddress.slice(0,5)}...{tokenAddress.slice(tokenAddress.length -3 ,tokenAddress.length)}</a>
            tableDatas[this.state.tableDatas.length - id - 1].hashDis = <a href = {"https://etherscan.io/tx/" + hash} target  = "_blank">{hash.slice(0,5)}...{hash.slice(hash.length -3 ,hash.length)}</a>
            this.setState({
                tabledatas : tableDatas
            })

  // get timestamp 
            try{
                const options = {
                    chain: "eth",
                    transaction_hash: hash
                };
                const transaction = await Moralis.Web3API.native.getTransaction(options)
                releaseDate = transaction.block_timestamp
                tableDatas = this.state.tableDatas
                tableDatas[this.state.tableDatas.length - id - 1].releaseDate = releaseDate.slice(0,10) + ' ' + releaseDate.slice(11,19)
                this.setState({
                    tabledatas : tableDatas
                })
            }catch(err){

            }

// renounce check      ============================================================  

             try{
                try {
                    owner = await tokenContract.methods.owner().call()
                }catch(err){
                    owner = ""
                }
                if (owner === ''||owner === '0x0000000000000000000000000000000000000000'){
                    renounceStatus = false
                } else {
                    renounceStatus = true
                }
              }catch(err){
                  renounceStatus =false
              }    
              tableDatas = this.state.tableDatas
              renounceStatus ? tableDatas[this.state.tableDatas.length - id - 1].renounceStatus = <p className='text-success'> Good </p> : tableDatas[this.state.tableDatas.length - id - 1].renounceStatus =  <p className='text-danger'> renounced </p>
              owner === ''?tableDatas[this.state.tableDatas.length - id - 1].owner = <p className='text-warning'> Unknown </p>:tableDatas[this.state.tableDatas.length - id - 1].owner = <a href = {"https://etherscan.io/address/" + owner} target  = "_blank">{owner.slice(0,6)}...{owner.slice(owner.length -3 ,owner.length)}</a>
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
              tableDatas[this.state.tableDatas.length - id - 1].supply = supply.toExponential(3)
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
                tableDatas[this.state.tableDatas.length - id - 1].mintStatusDis = <p className='text-warning'> Unknown </p> 
            }else if(mintStatus === 'Non-mintable'){
                tableDatas[this.state.tableDatas.length - id - 1].mintStatusDis = <p className='text-success'> Non-Mintable </p>
            } else {
                tableDatas[this.state.tableDatas.length - id - 1].mintStatusDis = <p className='text-danger'> Mintable </p> 
            }
            verifyStatus ? tableDatas[this.state.tableDatas.length - id - 1].verifyStatusDis = <p className='text-success'> Verified </p> :  tableDatas[this.state.tableDatas.length - id - 1].verifyStatusDis = <p className='text-danger'> Unverified </p> 
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
                      honeyPotStatus = !response.IsHoneypot
                      buyTax = response.BuyTax
                      sellTax = response.SellTax
                })
            }catch(err){
                honeyPotStatus = false
            }
            tableDatas = this.state.tableDatas
            honeyPotStatus ? tableDatas[this.state.tableDatas.length - id - 1].honeyPotStatus = <p className='text-success'> Good </p> : tableDatas[this.state.tableDatas.length - id - 1].honeyPotStatus = <p className='text-danger'> HoneyPot </p>
            tableDatas[this.state.tableDatas.length - id - 1].taxStatus = <p className='text-success'> Sell tax:{sellTax}, Buy Tax:{buyTax} </p>

            this.setState({
                tabledatas : tableDatas
            })

 

  // liquidity check
            try{
                let poolAddress     = await factoryContract.methods.getPair(tokenAddress, bnbAddress).call()
                let ethliquidityAmount =  await wethContract.methods.balanceOf(poolAddress).call()
                ethliquidityAmount = (ethliquidityAmount / 1000000000000000000)
                let usdliquidityAmount =  await routerContract.methods.getAmountsOut("1000000000000000000", [bnbAddress,usdtAddress]).call()
                ethPrice = usdliquidityAmount[1] / Math.pow(10,6)
                liquidityAmount = (usdliquidityAmount[1] * ethliquidityAmount/ 500000).toFixed(2) 
            }catch(err){
            }

              
            tableDatas = this.state.tableDatas
            tableDatas[this.state.tableDatas.length - id - 1].liquidityStatus = liquidityAmount + '$'
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
            traded = (tradedbuffer * ethPrice / Math.pow(10, 18)).toFixed(2)
            tableDatas = this.state.tableDatas
            tableDatas[this.state.tableDatas.length - id - 1].txCount = txCount
            tableDatas[this.state.tableDatas.length - id - 1].traded = traded + '$'
            this.setState({
                tabledatas : tableDatas
            })
        }catch(err){
            return
        }
    }

    render() {
      var rowsCaptureTable = this.state.tableDatas
      const captureDataTable = {
        columns : [
          {
            label : 'Token',
            field : 'tokeninfo',
          },
          {
            label : 'Address',
            field : 'tokenAddressDis',
          },
          {
            label : 'Hash',
            field : 'hashDis',
          },
          {
            label : 'Release Date',
            field : 'releaseDate',
          },
          {
            label : 'Owner',
            field : 'owner',
          },
          {
            label : 'Supply',
            field : 'supply',
          },
          {
            label : 'Verify',
            field : 'verifyStatusDis',
          },
          {
            label : 'Honeypot',
            field : 'honeyPotStatus',
          },
          {
            label : 'Mint',
            field : 'mintStatusDis',
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
            label : 'TxCount',
            field : 'txCount',
          },
          {
            label : 'Volume Traded',
            field : 'traded',
          },
        ],
        rows : rowsCaptureTable,
      }




      return (
        <div>
          <TopNav/><br/><br/>
              <Card  bg="light" style={{ height: '96%', width : '100%', align : 'center'}} >
                <Card.Body>
                  <Card.Title><h2> <BsCardChecklist/> &nbsp; Newest Token Table </h2> <hr/></Card.Title><br/>
                    <MDBDataTableV5 hover entriesOptions={[5,10,20,50,100,200,500,1000]} entries={100} pagesAmount={300} data={captureDataTable}  materialSearch /><br/><br/>
                </Card.Body>
              </Card>
        </div>
      );
    }
}

export default App;
