import Web3 from 'web3';
import EtherWallet from '../build/contracts/EtherWallet.json';

let web3;
let etherWallet;

const initWeb3 = () => {
  return new Promise((resolve, reject) => {
    if (typeof window.ethereum !== 'undefined') {
      const web3 = new Web3(window.ethereum);
      window.ethereum.enable()
        .then(() => {
          resolve(
            new Web3(window.ethereum)
          );
        })
        .catch(e => {
          reject(e);
        });
      return;
    }
    if (typeof window.web3 !== 'undefined') {
      return resolve(
        new Web3(window.web3.currentProvider)
      );
    }
    resolve(new Web3('http://localhost:9545'));
  });
};

const initContract = async () => {
  const networkId = await web3.eth.net.getId();
  return new web3.eth.Contract(
    EtherWallet.abi,
    EtherWallet
      .networks[networkId]
      .address
  );
};

const initApp = () => {
  const $deposit = document.getElementById('deposit')
  const $depositResult = document.getElementById('deposit-result')
  const $send = document.getElementById('send')
  const $sendResult = document.getElementById('send-result')
  const $balance = document.getElementById('balance')

  let accounts = []
  web3.eth.getAccounts()
    .then(_accounts => {
      accounts = _accounts
      console.log(accounts)
    })

  let balance;
  web3.eth.getBalance(etherWallet.options.address)
    .then(_balance => {
      balance = parseInt(_balance)
      $balance.innerHTML = _balance + " Wei"
    })


  $deposit.addEventListener('submit', e => {
    e.preventDefault();
    const amount = e.target.elements[0].value;
    etherWallet.methods.deposit()
      .send({ from: accounts[0], value: amount })
      .then(() => {
        $depositResult.innerHTML = `${amount} Wei is deposited`
        balance += parseInt(amount);
        $balance.innerHTML = balance + " Wei"
      })
      .catch(() => {
        $depositResult.innerHTML = `Ooops... there was an arror while trying to deposit ${amount} Wei into the wallet...`
      })
  })

  $send.addEventListener('submit', e => {
    e.preventDefault();
    const address = e.target.elements[0].value;
    const amount = e.target.elements[1].value;
    etherWallet.methods.send(address, amount)
      .send({ from: accounts[0] })
      .then(() => {
        balance -= parseInt(amount);
        $balance.innerHTML = balance + " Wei"
        $sendResult.innerHTML = `${amount} Wei is sent to ${address}`
      })
      .catch(() => {
        $sendResult.innerHTML = `Ooops... there was an arror while trying to send ${amount} Wei to ${address}...`
      })
  })
}

document.addEventListener('DOMContentLoaded', () => {
  initWeb3()
    .then(_web3 => {
      web3 = _web3;
      return initContract();
    })
    .then(_etherWallet => {
      etherWallet = _etherWallet;
      initApp();
    })
    .catch(e => console.log(e.message));
});
