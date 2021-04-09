import React from 'react';
import { Link } from 'react-router-dom';
import { v1 as uuid } from 'uuid';

import { ReactComponent as IconSearch } from '../../assets/icons/search.svg';
import imageCoin from '../../assets/images/coin.png';
import imageRocket from '../../assets/images/rocket.png';
import * as Components from '../../components';

import s from './style.module.scss';

type TypeToken = {
  symbol?: string;
  name?: string;
  price?: number;
  priceChange?: number | string;
  image?: string;
};

const tokens: TypeToken[] = [
  {
    symbol: 'WETH',
    name: 'Ethereum',
    price: 1813.04,
    priceChange: 0,
    image: undefined,
  },
  {
    symbol: 'WBTC',
    name: 'Bitcoin',
    price: 1813.04,
    priceChange: 5.96,
    image: undefined,
  },
  {
    symbol: 'GEAR',
    name: 'Gear',
    price: 1813.04,
    priceChange: -1.4,
    image: undefined,
  },
  {
    symbol: 'GEAR',
    name: 'Ethereum',
    price: 1813.04,
    priceChange: -1.4,
    image: undefined,
  },
  {
    symbol: 'WETH',
    name: 'Ethereum',
    price: 1813.04,
    priceChange: 5.96,
    image: undefined,
  },
  {
    symbol: 'WBTC',
    name: 'Ethereum',
    price: 1813.04,
    priceChange: 5.96,
    image: undefined,
  },
  {
    symbol: 'GEAR',
    name: 'Ethereum',
    price: 1813.04,
    priceChange: -1.4,
    image: undefined,
  },
  {
    symbol: 'GEAR',
    name: 'Ethereum',
    price: 1813.04,
    priceChange: -1.4,
    image: undefined,
  },
];

type TypeCardProps = {
  children: React.ReactElement[];
  to: string;
};

export const Card: React.FC<TypeCardProps> = ({ children = [], to = '/' }) => {
  return (
    <Link to={to} className={s.card}>
      {children}
    </Link>
  );
};

export const Label: React.FC = () => {
  return (
    <div className={s.label}>
      <Link
        to="/explore"
        className={s.button}
        // role="button"
        // tabIndex={0}
        // onClick={() => console.log('sss')}
        // onKeyDown={() => {}}
      >
        Explore
      </Link>
    </div>
  );
};

export const SearchLabel: React.FC = () => {
  return (
    <div className={s.labelInput}>
      <IconSearch />
    </div>
  );
};

type TypeSearchDropdownProps = {
  items?: TypeToken[];
  search?: string;
};

export const SearchDropdown: React.FC<TypeSearchDropdownProps> = ({ items = [], search = '' }) => {
  return (
    <div className={s.dropdownSearch}>
      {items && items.length > 0 ? (
        tokens.map((token: TypeToken) => {
          const { symbol, name, image = imageCoin } = token;
          return (
            <Link
              to={`/markets/${symbol}`}
              key={`token-${uuid()}`}
              className={s.dropdownSearchItem}
            >
              <img src={image} alt="" className={s.dropdownSearchItemImage} />
              <div className={s.dropdownSearchItemName}>{name}</div>
              <div className={s.dropdownSearchItemSymbol}>{symbol}</div>
            </Link>
          );
        })
      ) : (
        <div className={s.dropdownSearchItemEmpty}>
          <p>Sorry, we can&lsquo;t find &quot;{search}&quot;</p>
          <Link to="/markets">View all tokens</Link>
        </div>
      )}
    </div>
  );
};

export const PageMain: React.FC = () => {
  const [searchValue, setSearchValue] = React.useState<string>('');
  // const [openSearchDropdown, setOpenSearchDropdown] = React.useState<boolean>(false);

  const handleSearch = (e: string) => {
    setSearchValue(e);
  };

  return (
    <div className={s.container}>
      <section className={s.containerTitle}>
        <h1>
          Find the <span>best prices</span> across exchange networks
        </h1>
        <div>
          <Components.Input
            // open
            classContainer={s.containerInput}
            onChange={handleSearch}
            // onFocus={() => setOpenSearchDropdown(true)}
            // onBlur={() => setOpenSearchDropdown(false)}
            value={searchValue}
            label={<Label />}
            labelInner={<SearchLabel />}
            dropdown={<SearchDropdown items={tokens} />}
            placeholder="Search token or input token address..."
          />
        </div>
      </section>
      <section className={s.containerCards}>
        {tokens.map((token: TypeToken) => {
          let { priceChange } = token;
          const { symbol, price, image = imageCoin } = token;
          let classPriceChange = s.cardPriceChange;
          if (priceChange && priceChange > 0) {
            priceChange = `+${priceChange}`;
            classPriceChange = s.cardPriceChangePlus;
          } else if (priceChange && priceChange < 0) {
            classPriceChange = s.cardPriceChangeMinus;
          } else {
            priceChange = '';
          }
          return (
            <Card key={`token-${uuid()}`} to={`/markets/${symbol}`}>
              <div className={s.cardContainerFirst}>
                <div className={s.cardSymbol}>{symbol}</div>
                <div className={s.cardPrice}>${price}</div>
                <div className={classPriceChange}>{priceChange}</div>
              </div>
              <div className={s.cardContainerSecond}>
                <img src={image} alt="" className={s.cardImage} />
              </div>
            </Card>
          );
        })}
      </section>
      <section className={s.containerLists}>
        <Link to="/lists/recently-added" className={s.cardList}>
          <img src={imageCoin} alt="" className={s.cardListImage} />
          Recently Added
        </Link>
        <Link to="/lists/top-gainers" className={s.cardList}>
          <img src={imageRocket} alt="" className={s.cardListImage} />
          Top Gainers
        </Link>
      </section>
    </div>
  );
};
