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
    await this.listening()
  }

  async listening(){
    let blocknumber = await web3.eth.getBlockNumber() - 1000
    let eventarray = await factoryContract.getPastEvents('PairCreated',{
      fromBlock : blocknumber,
      toBlock : 'latest'
    })
    let tokenAddress
    let hash 
    let currentblocknumber
    
    for (let index = 0; index < eventarray.length; index++) {
      let tableData = {
        id              : '',
        tokeninfo       : '',
        tokenAddress    : '',
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

      let tableDatas = this.state.tableDatas
      tableDatas.push(tableData)
      this.setState({
        tableDatas : tableDatas
      })
      eventarray[eventarray.length - index -1].returnValues[0] == bnbAddress? tokenAddress = eventarray[eventarray.length - index -1].returnValues[1]: tokenAddress = eventarray[eventarray.length - index -1].returnValues[0]
      hash =  eventarray[eventarray.length - index -1].transactionHash
      currentblocknumber = eventarray[eventarray.length - index -1].blockNumber
      this.getDate(tokenAddress, hash, index)
      console.log(eventarray)
    }
  }

  async getDate(tokenAddress, hash, id){
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
      let tableData





          let tokenContract=  new web3.eth.Contract(ERC20ABI,tokenAddress);
          tokenName    = await tokenContract.methods.symbol().call()
          tokenTitle    = await tokenContract.methods.name().call()
         
// verify check,  mint check
            try{
              let bscURL = 'https://api.etherscan.com/api?module=contract&action=getsourcecode&address=' + tokenAddress + '&apikey=' + etherscanAPIKey;
              await fetch (bscURL)
              .then(response => response.json())
              .then(
                async(response)=> {
                  try{
                    if (response['result']['0']['ABI'] === "Contract source code not verified") {
                      verifyStatus = false
                    } else {
                      verifyStatus = true
                    }
                  }catch(err){
                    verifyStatus = false
                  }

                  try{
                    if (response['result']['0']['SourceCode'].includes('mint')||response['result']['0']['SourceCode'].includes('Mint')) {
                      mintStatus =false
                    } else {
                      mintStatus =true
                    }
                  }catch(err){
                    mintStatus = false
                  }   
              })
            }catch(err){
              verifyStatus = false
              mintStatus = false
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

// renounce check        

            try{
                try {
                  owner = await tokenContract.methods.owner().call()
                  console.log(owner)
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

// liquidity check

            try{
              let poolAddress     = await factoryContract.methods.getPair(tokenAddress, bnbAddress).call()
              let ethliquidityAmount =  await wethContract.methods.balanceOf(poolAddress).call()
              ethliquidityAmount = (ethliquidityAmount / 1000000000000000000)
              let usdliquidityAmount =  await routerContract.methods.getAmountsOut("1000000000000000000", [bnbAddress,usdtAddress]).call()
              liquidityAmount = (usdliquidityAmount[1] * ethliquidityAmount/ 500000).toFixed(2) 
            }catch(err){
            }

// total supply check
          try{
              supply = await tokenContract.methods.totalSupply().call()
              supply = supply / 1
              console.log(supply)
          }catch(err){
            supply =  " can't catch "
          }

// transaction count check 
          try{
            txCount = await web3.eth.getTransactionCount(tokenAddress)
            console.log('transaction', txCount)
          }catch(err){
            console.log(err)
          }
// get timestamp 
          const options = {
            chain: "eth",
            transaction_hash: hash
          };

          const transaction = await Moralis.Web3API.native.getTransaction(options)
          releaseDate = transaction.block_timestamp
          
          tableDatas = this.state.tableDatas
          

          tableDatas[id].id = id + 1
          tableDatas[id].tokeninfo = tokenTitle + '(' + tokenName + ')'
          tableDatas[id].tokenAddress = <a href = {"https://etherscan.io/address/" + tokenAddress} target  = "_blank">{tokenAddress.slice(0,6)}...{tokenAddress.slice(tokenAddress.length -4 ,tokenAddress.length- 1)}</a>
          tableDatas[id].hash = <a href = {"https://etherscan.io/tx/" + hash} target  = "_blank">{hash.slice(0,6)}...{hash.slice(hash.length -4 ,hash.length- 1)}</a>
          tableDatas[id].liquidityStatus = liquidityAmount + '$'
          tableDatas[id].supply = supply
          tableDatas[id].taxStatus = <p className='text-success'> Sell tax:{sellTax}, Buy Tax:{buyTax} </p>
          tableDatas[id].owner = <a href = {"https://etherscan.io/address/" + owner} target  = "_blank">{owner.slice(0,6)}...{owner.slice(owner.length -4 ,owner.length- 1)}</a>
          tableDatas[id].txCount = txCount
          tableDatas[id].releaseDate = releaseDate.slice(0,10) + ' ' + releaseDate.slice(11,19)
          mintStatus ? tableDatas[id].mintStatus = <p className='text-success'> Non-Mintable </p> :  tableDatas[id].mintStatus = <p className='text-danger'> Mintable </p> 
          verifyStatus?  tableDatas[id].verifyStatus = <p className='text-success'> Verified </p> :  tableDatas[id].verifyStatus = <p className='text-danger'> Unverified </p> 
          honeyPotStatus ? tableDatas[id].honeyPotStatus = <p className='text-success'> Good </p> : tableDatas[id].honeyPotStatus = <p className='text-danger'> HoneyPot </p>
          mintStatus ? tableDatas[id].mintStatus = <p className='text-success'> Non-Mintable </p> :  tableDatas[id].mintStatus = <p className='text-danger'> Mintable </p> 
          renounceStatus ? tableDatas[id].renounceStatus = <p className='text-success'> Good </p> : tableDatas[id].renounceStatus =  <p className='text-danger'> renounced </p>
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
          label : 'No',
          field : 'id',
          sort  : 'asc'
        },
        {
          label : 'Token',
          field : 'tokeninfo',
        },
        {
          label : 'Address',
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
          label : 'Hash',
          field : 'hash',
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
          label : 'Volume Traded',
          field : 'traded',
        },
        {
          label : 'TxCount',
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
