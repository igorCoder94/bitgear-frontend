import React from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { BrowserRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

import imageTokenPay from './assets/images/token.png';
import { useWalletConnectorContext } from './contexts/WalletConnect';
import tokensListData from './data/coinlist.json';
import erc20Abi from './data/erc20Abi.json';
import { statusActions, userActions, zxActions } from './redux/actions';
import { Service0x } from './services/0x';
// import { CryptoCompareService } from './services/CryptoCompareService';
import * as Components from './components';
import config from './config';
import * as Pages from './pages';

const tokenGear = {
  symbol: 'GEAR',
  name: 'Bitgear',
  price: null,
  decimals: 18,
  address: config.IS_PRODUCTION
    ? '0x1b980e05943dE3dB3a459C72325338d327B6F5a9'
    : config.IS_TESTING_ON_ROPSTEN
    ? '0xd46bccb05e6a41d97f166c0082c6729f1c6118bd'
    : '0x67a6a6cd58bb9617227dcf40bb35fc7f0839a658',
};

const Zx = new Service0x();
// const CryptoCompare = new CryptoCompareService();

export const App: React.FC = () => {
  const { web3Provider } = useWalletConnectorContext();

  const dispatch = useDispatch();
  const setTokens = React.useCallback((props: any) => dispatch(zxActions.setTokens(props)), [
    dispatch,
  ]);
  const setUserData = React.useCallback((props: any) => dispatch(userActions.setUserData(props)), [
    dispatch,
  ]);
  const setStatus = React.useCallback((props: any) => dispatch(statusActions.setStatus(props)), [
    dispatch,
  ]);
  const { address: userAddress } = useSelector(({ user }: any) => user);

  const [tokens0x, setTokens0x] = React.useState<any[]>([]);
  const [tokensCryptoCompare, setTokensCryptoCompare] = React.useState<any[]>([]);

  const getTokensFromCryptoCompare = async () => {
    try {
      // const result = await CryptoCompare.getAllCoins();
      // console.log('App getTokensFromCryptoCompare:', result.data);
      // if (result.status === 'SUCCESS') {
      //   const newTokens = result.data;
      //   setTokensCryptoCompare(newTokens);
      // }
      const newTokens = (tokensListData as any).Data;
      console.log('App getTokensFromCryptoCompare:', newTokens);
      setTokensCryptoCompare(newTokens);
    } catch (e) {
      console.error(e);
    }
  };

  const changeTokensInfo = React.useCallback(
    (data) => {
      const newData = data;
      data.map((token: any, it: number) => {
        const { symbol, address, decimals } = token;
        const isImage = tokensCryptoCompare[symbol] && tokensCryptoCompare[symbol].ImageUrl;
        newData[it].image = isImage
          ? `https://www.cryptocompare.com/media${tokensCryptoCompare[symbol].ImageUrl}`
          : imageTokenPay;
        newData[it].address = address;
        newData[it].decimals = decimals;
        return null;
      });
      return newData;
    },
    [tokensCryptoCompare],
  );

  const getTokens = React.useCallback(async () => {
    try {
      const resultGetTokens = await Zx.getTokens();
      const newTokens = resultGetTokens.data;
      console.log('App getTokens:', newTokens);
      newTokens.push(tokenGear);
      const tokens = changeTokensInfo(newTokens);
      setTokens({ tokens });
      setTokens0x(tokens);
    } catch (e) {
      console.error('App getTokens:', e);
    }
  }, [setTokens, changeTokensInfo]);

  const getTokensBalances = React.useCallback(async () => {
    try {
      setStatus({ loadingBalances: 'loading' });
      const balances = {};
      // eslint-disable-next-line no-plusplus
      for (let i = 0; i < tokens0x.length; i++) {
        const token = tokens0x[i];
        const { symbol, address }: { symbol: string; address: string } = token;
        let balance = 0;
        if (symbol === 'ETH') {
          // eslint-disable-next-line no-await-in-loop
          balance = await web3Provider.getBalance(userAddress);
        } else {
          // eslint-disable-next-line no-await-in-loop
          balance = await web3Provider.balanceOf({
            address: userAddress,
            contractAddress: address,
            contractAbi: erc20Abi,
          });
        }
        (balances as any)[symbol] = balance;
      }
      console.log('App getTokensBalances balances:', balances);
      setUserData({ balances });
      setStatus({ loadingBalances: 'done' });
    } catch (e) {
      console.error('App getTokensBalances:', e);
      setStatus({ loadingBalances: 'error' });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens0x, setTokens, setUserData, userAddress, web3Provider]);

  React.useEffect(() => {
    getTokensFromCryptoCompare();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  React.useEffect(() => {
    if (!tokensCryptoCompare || tokensCryptoCompare?.length === 0) return;
    getTokens();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokensCryptoCompare]);

  React.useEffect(() => {
    if (!tokens0x || tokens0x?.length === 0) return;
    if (!userAddress) return;
    getTokensBalances();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [tokens0x, userAddress]);

  return (
    <Router>
      <div className="App">
        <Components.Header />
        <main className="container-App">
          <Switch>
            <Route path="/" exact>
              <Pages.PageMain />
            </Route>
            <Route path="/explore">
              <Pages.PageExplore />
            </Route>
            <Route path="/lists" exact>
              <Redirect to="/explore" />
            </Route>
            <Route path="/lists/recently-added">
              <Pages.PageListsRecentlyAdded />
            </Route>
            <Route path="/lists/top-gainers">
              <Pages.PageListsTopGainers />
            </Route>
            <Route path="/markets">
              <Pages.PageMarkets />
            </Route>
            <Route path="/settings">
              <Pages.PageSettings />
            </Route>
            <Route path="/login">
              <Pages.PageLogin />
            </Route>
            <Route path="/account">
              <Pages.PageAccount />
            </Route>
            <Route path="*">
              <Pages.Page404 />
            </Route>
          </Switch>
        </main>
        <Components.Footer />
        <Components.Modal />
      </div>
    </Router>
  );
};
