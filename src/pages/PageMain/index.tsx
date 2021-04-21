import React from 'react';
import { useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { v1 as uuid } from 'uuid';

import { ReactComponent as IconSearch } from '../../assets/icons/search.svg';
import imageCoin from '../../assets/images/coin.png';
import imageRocket from '../../assets/images/rocket.png';
import { InputWithDropdown } from '../../components';

import s from './style.module.scss';

type TypeToken = {
  symbol: string;
  name: string;
  price?: number;
  priceChange?: string | number;
  image?: string;
};

type TypeCardProps = {
  children: React.ReactElement[];
  to: string;
};

type TypeSearchDropdownProps = {
  items?: TypeToken[];
  search?: string;
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

export const SearchDropdown: React.FC<TypeSearchDropdownProps> = ({ items = [], search = '' }) => {
  return (
    <div className={s.dropdownSearch}>
      {items && items.length > 0 ? (
        items.map((item: TypeToken) => {
          const { symbol, name, image } = item;
          return (
            <Link to={`/markets/${symbol}`} key={uuid()} className={s.dropdownSearchItem}>
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
  const [searchResult, setSearchResult] = React.useState<any[]>([]);

  let { tokens } = useSelector(({ zx }: any) => zx);
  tokens = tokens.slice(0, 3);

  const matchSearch = (value: string) => {
    try {
      let result = tokens.filter((token: TypeToken) => {
        const includesInSymbol = token.symbol.toLowerCase().includes(value.toLowerCase());
        const includesInName = token.name.toLowerCase().includes(value.toLowerCase());
        if (includesInSymbol || includesInName) return true;
        return false;
      });
      result = result.slice(0, 50);
      console.log('matchSearch:', result);
      setSearchResult(result);
    } catch (e) {
      console.error(e);
    }
  };

  const handleSearch = (e: string) => {
    setSearchValue(e);
    if (e.length < 2) return;
    matchSearch(e);
  };

  return (
    <div className={s.container}>
      <section className={s.containerTitle}>
        <h1>
          Find the <span>best prices</span> across exchange networks
        </h1>
        <div>
          <InputWithDropdown
            classContainer={s.containerInput}
            onChange={handleSearch}
            value={searchValue}
            label={<Label />}
            labelInner={<SearchLabel />}
            dropdown={<SearchDropdown items={searchResult} />}
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
          }
          return (
            <Card key={`token-${uuid()}`} to={`/markets/${symbol}`}>
              <div className={s.cardContainerFirst}>
                <div className={s.cardSymbol}>{symbol}</div>
                <div className={s.cardPrice}>${price}</div>
                <div className={classPriceChange}>{priceChange}%</div>
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
