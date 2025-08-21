
export interface ChainConfig {
  chainName?: string;
  chainId: string;
  rpcEndpoint: string;
  restEndpoint: string;
  icon?: string;
  AddressForChain: string;
  AssetId: string;
  Denom: string;
  decimals: number;
  Symbol: string;
  gasPrice: string;
  gasMultiplier?: number;
  unbondingDays?: number;
  swapPoolId?: number; 
  intermediateToken?: string; 
  firstHopPoolId?: number;
  secondHopPoolId?: number; 
  sourceChannel?: string; 
  destinationChannel?: string;  
  destinationPort?: string; 
  tipAddress?: string;
  ibcDenomOnOsmosis?: string; // Denom on Osmosis for IBC
  squidChainID?: string; // For Squid integration, if needed
  stakable?: boolean; 
  swapToBtcPoolId?: number; // Pool ID for BTC/USDC
}
export const NOBLE: ChainConfig = {
  chainName: "Noble",
  chainId: "noble-1",
  rpcEndpoint: "https://noble-rpc.polkachu.com",
  restEndpoint: "https://noble-api.polkachu.com",
  icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/noble/images/stake.png', // Noble chain icon
  AddressForChain: "nobleAddress",
  AssetId: "noble",
  Denom: "uusdc",
  decimals: 6,
  Symbol: "USDC",
  gasPrice: '0.025uusdc',
  gasMultiplier: 1.3,
  unbondingDays: 21,
  sourceChannel: "channel-1", 
  destinationChannel: "channel-750",
  tipAddress: "noble1vj0h76hp378ufnypjv2234m23q2g7pj90qt9sw",
  squidChainID: "noble",
};

export const COSMOS_HUB: ChainConfig = {
  chainName: "Cosmos Hub",
  chainId: "cosmoshub-4",
  rpcEndpoint: "https://cosmos-rpc.publicnode.com",
  restEndpoint: "https://cosmos-rest.publicnode.com",
  icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/cosmoshub/images/atom.png',
  AddressForChain: "cosmosAddress",
  AssetId: "cosmos",
  Denom: "uatom",
  decimals: 6,
  Symbol: "ATOM",
  gasPrice: '0.0025uosmo',
  gasMultiplier: 1.2,
  unbondingDays: 21,
  swapPoolId: 1282,
  sourceChannel: "channel-141", //  Source channel for Cosmos Hub
  destinationChannel: "channel-0", // 
  squidChainID: "cosmoshub", 
  tipAddress: "cosmos1vj0h76hp378ufnypjv2234m23q2g7pj98r7dgq",
  ibcDenomOnOsmosis: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2",
};

export const OSMOSIS: ChainConfig = {
  chainName: "Osmosis",
  chainId: "osmosis-1",
  rpcEndpoint: "https://osmosis-rpc.publicnode.com",
  restEndpoint: "https://osmosis-rest.publicnode.com",
  icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/osmosis/images/osmo.png',
  AddressForChain: "osmosisAddress",
  AssetId: "osmosis",
  Denom: "uosmo",
  decimals: 6,
  Symbol: "OSMO",
  gasPrice: '0.0025uosmo',
  gasMultiplier: 1.2,
  unbondingDays: 14,
  swapPoolId: 1464,
  intermediateToken: "uatom", 
  firstHopPoolId: 1135,
  secondHopPoolId: 1251,
  sourceChannel: "channel-1", // Source channel for Osmosis
  destinationChannel: "channel-0", // Destination channel for swaps
  tipAddress: "osmo1vj0h76hp378ufnypjv2234m23q2g7pj90cda7j",
  squidChainID: "osmosis", 
 
};


export const AKASH: ChainConfig = {
  chainName: "Akash",
    chainId: "akashnet-2",
    rpcEndpoint: "https://akash-rpc.publicnode.com",
    restEndpoint: "https://akash-rest.publicnode.com",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/akash/images/akt.png',
    AddressForChain: "akashAddress",
    AssetId: "akash-network",
    Denom: "uakt",
    decimals: 6,
    Symbol: "AKT",
    gasPrice: '0.025uakt',
    gasMultiplier: 1.3,
    unbondingDays: 21,
    swapPoolId: 1301,
    intermediateToken: "uosmo", 
    firstHopPoolId: 1093,
    secondHopPoolId: 1263,
    sourceChannel: "channel-9", 
    destinationChannel: "channel-1",
    tipAddress: "akash1vj0h76hp378ufnypjv2234m23q2g7pj92cn236",
    ibcDenomOnOsmosis: "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
    squidChainID: "akashnet", 
  };

  export const REGEN: ChainConfig = {
    chainName: "Regen",
    chainId: "regen-1",
    rpcEndpoint: "https://regen-rpc.publicnode.com",
    restEndpoint: "https://regen-rest.publicnode.com",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/regen/images/regen.png',
    AddressForChain: "regenAddress",
    AssetId: "regen",
    Denom: "uregen",
    decimals: 6,
    Symbol: "REGEN",
    gasPrice: '0.025uregen',
    gasMultiplier: 1.3,
    unbondingDays: 21,
    swapPoolId: 1472,
    intermediateToken: "uosmo", // Optional intermediate token for swaps (e.g., USDC)
    firstHopPoolId: 1483,
    secondHopPoolId: 1263, // Optional second hop pool id for swaps
    sourceChannel: "channel-1",
    destinationChannel: "channel-8",
    tipAddress: "regen1vj0h76hp378ufnypjv2234m23q2g7pj9cp437y",
    ibcDenomOnOsmosis: "ibc/1DCC8A6CB5689018431323953344A9F6CC4D0BFB261E88C9F7777372C10CD076",
    squidChainID: "regen", 
  };

  export const OMNIFLIX: ChainConfig = {
    chainName: "Omniflix",
    chainId: "omniflixhub-1",
    rpcEndpoint: "https://omniflix-rpc.publicnode.com",
    restEndpoint: "https://omniflix-rest.publicnode.com",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/omniflixhub/images/flix.png',
    AddressForChain: "omniflixAddress",
    AssetId: "omniflix-network",
    Denom: "uflix",
    decimals: 6,
    Symbol: "FLIX",
    gasPrice: '0.025uflix',
    gasMultiplier: 1.3,
    unbondingDays: 21,
    swapPoolId: 1263, // Swap pool id to USDC
    intermediateToken: "uosmo", // Optional intermediate token for swaps (e.g., USDC)
    firstHopPoolId: 1895, // The first hop pool id for swaps
    secondHopPoolId: 1263,
    sourceChannel: "channel-1",
    destinationChannel: "channel-199",
    tipAddress: "omniflix1vj0h76hp378ufnypjv2234m23q2g7pj96a05l7",
    ibcDenomOnOsmosis: "ibc/CEE970BB3D26F4B907097B6B660489F13F3B0DA765B83CC7D9A0BC0CE220FA6F",
    squidChainID: "omniflixhub",
  };


  export const JUNO: ChainConfig = {
    chainName: "Juno",
    chainId: "juno-1",
    rpcEndpoint: "https://juno-rpc.publicnode.com",
    restEndpoint: "https://juno-rest.publicnode.com",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/juno/images/juno.png',
    AddressForChain: "junoAddress",
    AssetId: "juno-network",
    Denom: "ujuno",
    decimals: 6,
    Symbol: "JUNO",
    gasPrice: '0.025ujuno',
    gasMultiplier: 1.3,
    unbondingDays: 28,
    swapPoolId: 1097,
    intermediateToken: "uosmo", 
    firstHopPoolId: 1097, // The first hop pool id for swaps
    secondHopPoolId: 1263, // The second hop pool id for swaps
    sourceChannel: "channel-0", 
    destinationChannel: "channel-42",
    tipAddress: "juno1vj0h76hp378ufnypjv2234m23q2g7pj933ak0u",
    ibcDenomOnOsmosis: "ibc/46B44899322F3CD854D2D46DEEF881958467CDD4B3B10086DA49296BBED94BED",
    squidChainID: "juno",
  };

  export const SENTINEL: ChainConfig = {
    chainName : "Sentinel",
    chainId: "sentinelhub-2",
    rpcEndpoint: "https://rpc.cosmos.directory/sentinel",
    restEndpoint: "https://rest.cosmos.directory/sentinel",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/sentinel/images/dvpn.png',
    AddressForChain: "sentinelAddress",
    AssetId: "sentinel",
    Denom: "udvpn",
    decimals: 6,
    Symbol: "P2P",
    gasPrice: '0.025udvpn',
    gasMultiplier: 1.3,
    unbondingDays: 21,
    swapPoolId: 5,
    intermediateToken: "uosmo", 
    firstHopPoolId: 5, 
    secondHopPoolId: 1263, 
    sourceChannel: "channel-0", 
    destinationChannel: "channel-2", 
    destinationPort: "transfer", 
    tipAddress: "sent1vj0h76hp378ufnypjv2234m23q2g7pj9ucg5v0",
    ibcDenomOnOsmosis: "ibc/9712DBB13B9631EDFA9BF61B55F1B2D290B2ADB67E3A4EB3A875F3B6081B3B84",
    squidChainID: "sentinelhub",
  };

  export const STRIDE: ChainConfig = {
    chainName: "Stride",
    chainId: "stride-1",
    rpcEndpoint: "https://rpc.cosmos.directory/stride",
    restEndpoint: "https://rest.cosmos.directory/stride",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stride/images/strd.png',
    AddressForChain: "strideAddress",
    AssetId: "stride",
    Denom: "ustrd",
    decimals: 6,
    Symbol: "STRD",
    gasPrice: '0.025ustrd',
    gasMultiplier: 1.3,
    unbondingDays: 21,
    swapPoolId: 1243,
    sourceChannel: "channel-5", 
    destinationChannel: "channel-1", 
    destinationPort: "transfer", 
    tipAddress: "stride1vj0h76hp378ufnypjv2234m23q2g7pj9yg73uv",
    ibcDenomOnOsmosis: "ibc/1480B8FD20AD5FCAE81EA87584D269547DD4D436843C1D20F15E00EB64743EF4",
  };


  export const COREUM: ChainConfig = {
    chainName: "Coreum",  
    chainId: "coreum-mainnet-1",
    rpcEndpoint: "https://coreum-rpc.publicnode.com",
    restEndpoint: "https://coreum-rest.publicnode.com",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/coreum/images/coreum.png',
    AddressForChain: "coreumAddress",
    AssetId: "coreum",
    Denom: "ucore",
    decimals: 6, 
    Symbol: "CORE",
    gasPrice: '0.025ucore',
    gasMultiplier: 1.3,
    unbondingDays: 14,
    swapPoolId: 1244,
    intermediateToken: "uosmo", 
    firstHopPoolId: 1244, // The first hop pool id for swaps
    secondHopPoolId: 1263, // The second hop pool id for swaps
    tipAddress: "core12lkpgzejkm4var5zl5f65lhg8e50h9ndmj7mr3",
    ibcDenomOnOsmosis: "ibc/F3166F4D31D6BA1EC6C9F5536F5DDDD4CC93DBA430F7419E7CDC41C497944A65",
    squidChainID: "coreum-mainnet", 
    sourceChannel: "channel-2", 
    destinationChannel: "channel-1", 
    destinationPort: "transfer", 
  };

  export const INJECTIVE: ChainConfig = {
    chainName: "Injective",
    chainId: "injective-1",
    rpcEndpoint: "https://injective-rpc.publicnode.com",
    restEndpoint: "https://injective-rest.publicnode.com",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/injective/images/inj.png',
    AddressForChain: "injectiveAddress",
    AssetId: "injective-protocol",
    Denom: "inj",
    decimals: 18,
    Symbol: "INJ",
    gasPrice: '0.00025inj',
    gasMultiplier: 1.2,
    unbondingDays: 21,
    swapPoolId: 1319,
    tipAddress: "inj1ssau0dhrmcaj4rj845xh4l8v0e03rr4x4asr9h",
    ibcDenomOnOsmosis: "ibc/64BA6E31FE887D66C6F8F31C7B1A80C7CA179239677B4088BB55F5EA07DBE273",
    sourceChannel: "channel-122", 
    destinationChannel: "channel-8", 
    destinationPort: "transfer", 
  };

  export const CELESTIA: ChainConfig = {
    chainName: "Celestia",
    chainId: "celestia",
    rpcEndpoint: "https://celestia-rpc.publicnode.com",
    restEndpoint: "https://celestia-rest.publicnode.com",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/celestia/images/celestia.png',
    AddressForChain: "celestiaAddress",
    AssetId: "celestia",
    Denom: "utia",
    decimals: 6,
    Symbol: "TIA",
    gasPrice: '0.025utia',
    gasMultiplier: 1.3,
    unbondingDays: 21,
    swapPoolId: 1247,
    intermediateToken: "uosmo", 
    firstHopPoolId: 1248, // The first hop pool id for swaps
    secondHopPoolId: 1263, // The second hop pool id for swaps
    sourceChannel: "channel-2", 
    destinationChannel: "channel-6994", 
    destinationPort: "transfer", 
    tipAddress: "celestia1vj0h76hp378ufnypjv2234m23q2g7pj9kf0ajd",
    ibcDenomOnOsmosis: "ibc/D79E7D83AB399BFFF93433E54FAA480C191248FC556924A2A8351AE2638B3877",
    squidChainID: "celestia",
  };

  export const STARGAZE: ChainConfig = {
    chainName: "Stargaze",
    chainId: "stargaze-1",
    rpcEndpoint: "https://stargaze-rpc.publicnode.com",
    restEndpoint: "https://stargaze-rest.publicnode.com",
    icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/stargaze/images/stars.png',
    AddressForChain: "stargazeAddress",
    AssetId: "stargaze",
    Denom: "ustars",
    decimals: 6,
    Symbol: "STARS",
    gasPrice: '0.025ustars',
    gasMultiplier: 1.3,
    unbondingDays: 14,
    swapPoolId: 1096,
    intermediateToken: "uosmo", 
    firstHopPoolId: 1096, 
    secondHopPoolId: 1263, 
    sourceChannel: "channel-0", 
    destinationChannel: "channel-75", 
    destinationPort: "transfer", 
    tipAddress: "stars1vj0h76hp378ufnypjv2234m23q2g7pj9nlfsr3",
    ibcDenomOnOsmosis: "ibc/987C17B11ABC2B20019178ACE62929FE9840202CE79498E29FE8E5CB02B7C0A4",
    squidChainID: "stargaze",
  };

  export const ATONE: ChainConfig = {
    chainName: "Atone",
      chainId: "atomone-1",
      rpcEndpoint: "https://rpc.cosmos.directory/atomone",
      restEndpoint: "https://rest.cosmos.directory/atomone",
      icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/atomone/images/atomone.png',
      AddressForChain: "atoneAddress",
      AssetId: "atomone",
      Denom: "uatone",
      decimals: 6,
      Symbol: "ATONE",
      gasPrice: '0.025uatone',
      gasMultiplier: 1.3,
      unbondingDays: 21,
      swapPoolId: 2741,
      intermediateToken: "uatom", 
      firstHopPoolId: 2639, 
      secondHopPoolId: 1251, 
      sourceChannel: "channel-2", //  Source channel for Cosmos Hub
      destinationChannel: "channel-1",
      tipAddress: "atone1vj0h76hp378ufnypjv2234m23q2g7pj9frz27c",
      ibcDenomOnOsmosis: "ibc/BC26A7A805ECD6822719472BCB7842A48EF09DF206182F8F259B2593EB5D23FB",
      squidChainID: "atomone", // For Squid integration, if needed
    };

    export const QUICKSILVER: ChainConfig = {
      chainName: "Quicksilver",
        chainId: "quicksilver-2",
        rpcEndpoint: "https://rpc.cosmos.directory/quicksilver",
        restEndpoint: "https://rest.cosmos.directory/quicksilver",
        icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/quicksilver/images/qck.png',
        AddressForChain: "quicksilverAddress",
        AssetId: "quicksilver",
        Denom: "uqck",
        decimals: 6,
        Symbol: "QCK",
        gasPrice: '0.025qck  ',
        gasMultiplier: 1.3,
        unbondingDays: 21,
        swapPoolId: 1697,
        intermediateToken: "uosmo", 
        firstHopPoolId: 1697, 
        secondHopPoolId: 1263, 
        sourceChannel: "channel-2", 
        destinationChannel: "channel-1",
        tipAddress: "quick1vj0h76hp378ufnypjv2234m23q2g7pj9v8wl3j",
        ibcDenomOnOsmosis: "ibc/635CB83EF1DFE598B10A3E90485306FD0D47D34217A4BE5FD9977FA010A5367D",
        squidChainID: "quicksilver", // For Squid integration, if needed
      };

      export const ARKEO: ChainConfig = {
        chainName: "Arkeo",
          chainId: "arkeo-main-v1",
          rpcEndpoint: "https://rpc-seed.arkeo.network",
          restEndpoint: "https://arkeo-mainnet.api.stakevillage.net",
          icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/arkeo/images/arkeo.svg',
          AddressForChain: "arkeoAddress",
          AssetId: "arkeo",
          Denom: "uarkeo",
          decimals: 8,
          Symbol: "ARKEO",
          gasPrice: '0.025arkeo  ',
          gasMultiplier: 1.3,
          unbondingDays: 21,
          swapPoolId: 2977,
          intermediateToken: "uosmo", 
          firstHopPoolId: 2977, 
          secondHopPoolId: 1263, 
          sourceChannel: "channel-1", 
          destinationChannel: "channel-103074",
          tipAddress: "arkeo1vj0h76hp378ufnypjv2234m23q2g7pj9yrtg49",
          ibcDenomOnOsmosis: "ibc/AD969E97A63B64B30A6E4D9F598341A403B849F5ACFEAA9F18DBD9255305EC65",
          squidChainID: "arkeo", // For Squid integration, if needed
        };

        export const SECRET: ChainConfig = {
          chainName: "Secret Network",
            chainId: "secret-4",
            rpcEndpoint: "https://scrt.public-rpc.com",
            restEndpoint: "https://secretnetwork-api.lavenderfive.com",
            icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/secretnetwork/images/scrt.png',
            AddressForChain: "secretAddress",
            AssetId: "secret",
            Denom: "uscrt",
            decimals: 6,
            Symbol: "SCRT",
            gasPrice: '0.025uscrt  ',
            gasMultiplier: 1.3,
            unbondingDays: 21,
            swapPoolId: 1095,
            intermediateToken: "uosmo", 
            firstHopPoolId: 1095, 
            secondHopPoolId: 1263, 
            sourceChannel: "channel-1", 
            destinationChannel: "channel-88",
            tipAddress: "secret1ua5v32d6huhuz2ccuxdz9w9mz2g5rw7tlva5vu",
            ibcDenomOnOsmosis: "ibc/0954E1C28EB7AF5B72D24F3BC2B47BBB2FDF91BDDFD57B74B99E133AED40972A",
            squidChainID: "secret", // For Squid integration, if needed
          };
        
        export const SAGA: ChainConfig = {
          chainName: "Saga",
            chainId: "ssc-1",
            rpcEndpoint: "https://saga-rpc.publicnode.com:443",
            restEndpoint: "https://saga-rest.publicnode.com",
            icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/saga/images/saga.png',
            AddressForChain: "sagaAddress",
            AssetId: "saga-2",
            Denom: "usaga",
            decimals: 6,
            Symbol: "SAGA",
            gasPrice: '0.025usaga  ',
            gasMultiplier: 1.3,
            unbondingDays: 21,
            swapPoolId: 1671,
            intermediateToken: "uosmo", 
            firstHopPoolId: 1670, 
            secondHopPoolId: 1263, 
            sourceChannel: "channel-2", 
            destinationChannel: "channel-1",
            tipAddress: "saga19pvdg6ut7n5kqzmsrxysln2cfedenw854kp052",
            ibcDenomOnOsmosis: "ibc/2CD9F8161C3FC332E78EF0C25F6E684D09379FB2F56EF9267E7EC139642EC57B",
            squidChainID: "saga", // For Squid integration, if needed
        }  
    
        export const JACKAL: ChainConfig = {
          chainName: "Jackal",
            chainId: "jackal-1",
            rpcEndpoint: "https://rpc.cosmos.directory/jackal",
            restEndpoint: "https://rest.cosmos.directory/jackal",
            icon: 'https://raw.githubusercontent.com/cosmos/chain-registry/master/jackal/images/jkl.png',
            AddressForChain: "jackalAddress",
            AssetId: "jackal-protocol",
            Denom: "ujkl",
            decimals: 6,
            Symbol: "JKL",
            gasPrice: '0.025ujkl  ',
            gasMultiplier: 1.3,
            unbondingDays: 21,
            swapPoolId: 832,
            intermediateToken: "uosmo", 
            firstHopPoolId: 832, 
            secondHopPoolId: 1263, 
            sourceChannel: "channel-0", 
            destinationChannel: "channel-412",
            tipAddress: "jkl1vj0h76hp378ufnypjv2234m23q2g7pj97asu3l",
            ibcDenomOnOsmosis: "ibc/8E697BDABE97ACE8773C6DF7402B2D1D5104DD1EEABE12608E3469B7F64C15BA",
            squidChainID: "jackal", // For Squid integration, if needed
          };
  export const CHAINS = [COSMOS_HUB, OSMOSIS, AKASH, REGEN, CELESTIA, OMNIFLIX, SENTINEL, JUNO, STARGAZE, COREUM, ATONE, QUICKSILVER, SAGA, SECRET, JACKAL, ARKEO, NOBLE];
 
  // Function to get address for a chain
export const AddressesForChain = (chainName: string, wallet: any) => {
  const chain = CHAINS.find(chain => chain.chainName === chainName);
  return chain ? wallet[chain.AddressForChain] : null
};

  // NON-COSMOS CHAIN CONFIGS
export const BTC = {
  Symbol: "BTC",
  Denom: "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC",
  ibcDenomOnOsmosis: "factory/osmo1z6r6qdknhgsc0zeracktgpcxf43j6sekq07nw8sxduc9lg0qjjlqfu25e3/alloyed/allBTC",
  decimals: 8,
  firstHopPoolId: 1278,  // BTC/OSMO
  intermediateToken: "uosmo",
  secondHopPoolId: 678,  // OSMO/USDC
};


// Export non-chain tokens separately if needed
export const NON_CHAIN_TOKENS = [BTC];


