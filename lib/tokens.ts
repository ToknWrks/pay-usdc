// app/(default)/staking/tokens.ts

export interface TokenConfig {
  symbol: string;
  name: string;
  icon: string;
  assetId: string; // CoinGecko ID
  denom: string; // Denom on Osmosis
  decimals: number;
  sourceToken?: string; 
  // Any other properties you might need
}

export const TOKENS: Record<string, TokenConfig> = {
  
 // Swap Tokens 
      "USDC": {
        symbol: "USDC",
        name: "USD Coin",
        icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/usdc.png",
        assetId: "usd-coin",
        denom: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // IBC denom on Osmosis
        decimals: 6
      },
      "BTC": {
        symbol: "BTC",
        name: "Bitcoin",
        icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/bitcoin/images/btc.png",
        assetId: "bitcoin",
        denom: "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC", // IBC denom on Osmosis
        decimals: 8
      },
      "ETH": {
      symbol: "ETH",
      name: "Ethereum",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/_non-cosmos/ethereum/images/eth-white.png",
      assetId: "ethereum",
      denom: "ibc/EA1D43981D5C9A1C4AAEA9C23BB1D4FA126BA9BC7020A25E0AE4AA841EA25DC5", // IBC denom on Osmosis
      decimals: 18
    },

      "ATOM": {
      symbol: "ATOM",
      name: "Cosmos Hub",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png",
      assetId: "cosmos",
      denom: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // IBC denom on Osmosis
      decimals: 6
    },
    "OSMO": {
      symbol: "OSMO",
      name: "osmosis",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png",
      assetId: "osmosis",
      denom: "uosmo", // IBC denom on Osmosis
      decimals: 6
    },
    "REGEN": {
      symbol: "REGEN",
      name: "Regen",
      icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png",
      assetId: "regen",
      denom: "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076", // IBC denom on Osmosis
      decimals: 6
    },

    // ATOM Liquid Staking Tokens
  "dATOM": {
    symbol: "dATOM",
    name: "Drop ATOM",
    denom: "ibc/C1B4D4804EB8F95FFB75E6395A301F0AD6D7DDE5C3A45571B70E46A368DD353E",
    decimals: 6,
    icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/neutron/images/dATOM.svg",
    assetId: "drop-staked-atom",
    sourceToken: "ATOM"
  },
  "stATOM": {
    symbol: "stATOM",
    name: "Stride Staked ATOM",
    denom: "ibc/C140AFD542AE77BD7DCC83F13FDD8C5E5BB8C4929785E6EC2F4C636F98F17901",
    decimals: 6,
    icon: "https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/statom.png",
    assetId: "stride-staked-atom",
    sourceToken: "ATOM"
  },
  
  
  // TIA Liquid Staking Tokens
  "stTIA": {
    symbol: "stTIA",
    name: "Stride Staked TIA",
    denom: "ibc/698350B8A61D575025F3ED13E9AC9C0F45C89DEFE92F76D5838F1D3C1A7FF7C9",
    decimals: 6,
    icon: "/images/tokens/sttia.svg",
    assetId: "stride-staked-tia",
    sourceToken: "TIA"
  },
  "milkTIA": {
    symbol: "milkTIA",
    name: "Milky Way Staked TIA",
    denom: "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0",
    decimals: 6,
    icon: "/images/tokens/milktia.svg",
    assetId: "milkyway-staked-tia",
    sourceToken: "TIA"
  },
  "dTIA": {
    symbol: "dTIA",
    name: "Drop Staked TIA",
    denom: "factory/osmo1f5vfcph2dvfeqcqkhetwv75fda69z7e5c2dldm3kvgj23crkv6wqcn47a0",
    decimals: 6,
    icon: "/images/tokens/milktia.svg",
    assetId: "milkyway-staked-tia",
    sourceToken: "TIA"
  },
  // Add more tokens as needed

};

// Helper function to get a token by symbol
export const getTokenBySymbol = (symbol: string): TokenConfig | undefined => {
  return TOKENS[symbol];
};

// Helper function to get a token by denom
export const getTokenByDenom = (denom: string): TokenConfig | undefined => {
  return Object.values(TOKENS).find(token => token.denom === denom);
};

// Helper functions to get pool IDs for token pairs
export const getPoolIdForTokenPair = (token1Symbol: string, token2Symbol: string): string | null => {
  const poolMap: Record<string, string> = {
    // ATOM  pools
    "ATOM-BTC": "1216", // ATOM/BTC pool
    "ATOM-USDC": "1282", // ATOM/USDC pool
    
    // OSMO pools
    "OSMO-BTC": "1470", // OSMO/BTC pool
    "OSMO-REGEN": "42", // OSMO/REGEN pool
    "OSMO-ATOM": "1", // OSMO/ATOM pool
    "OSMO-ETH": "1134", // OSMO/ETH pool
    
    // USDC pools
    "USDC-BTC": "1493", // USDC/BTC pool
    "OSMO-USDC": "1263", // OSMO/USDC pool
    "USDC-REGEN": "1472", // USDC/REGEN pool
    "TIA-USDC": "1247", // TIA/USDC pool
    "stATOM-USDC": "1419", // stATOM/USDC pool
    "ETH -USDC": "1135", // ETH/USDC pool
    
    
    // TIA pools
    "TIA-OSMO": "1248", // TIA/OSMO pool
    "stTIA-TIA": "1428", // stTIA/TIA pool
    

    // Add more pairs as needed
  };
  
  // Try both directions
  const key1 = `${token1Symbol}-${token2Symbol}`;
  const key2 = `${token2Symbol}-${token1Symbol}`;
  
  return poolMap[key1] || poolMap[key2] || null;
};