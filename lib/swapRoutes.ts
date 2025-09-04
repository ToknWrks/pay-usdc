// app/lib/swapRoutes.ts

// Define type for a swap route
export interface SwapRoute {
    directPoolId?: number;  // Direct TOKEN→DESTINATION pool
    multiHopPath?: {        // Multi-hop path
      intermediateToken: string;
      firstHopPoolId: number;
      secondHopPoolId: number;
    };
  }
  
  // Map of source tokens to destination configurations
  export const SWAP_ROUTES: Record<string, Record<string, SwapRoute>> = {
    // For each source token
    "ATOM": {
      "USDC": { directPoolId: 1282 },
      "REGEN": { directPoolId: 22 },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
          firstHopPoolId: 1282, // ATOM→USDC
          secondHopPoolId: 1943  // USDC→BTC
        }
      }
      
    },
    "JUNO": {
      "USDC": { 
          multiHopPath: {
              intermediateToken: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // ATOM
              firstHopPoolId: 498, // JUNO-ATOM
              secondHopPoolId: 1282  // ATOM→USDC
            }
       },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1097, // JUNO-OSMO
          secondHopPoolId: 1995  // OSMO→BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
            intermediateToken: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // ATOM
            firstHopPoolId: 498, // JUNO-ATOM
            secondHopPoolId: 22  // ATOM-REGEN
          }
     }
    },
    "OSMO": {
      "USDC": { directPoolId: 1464 },
      "REGEN": { directPoolId: 1483 },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
          firstHopPoolId: 1464, // OSMO→USDC 
          secondHopPoolId: 1943 // USDC→BTC
        }
      }
    },
    "AKT": {
      "USDC": { directPoolId: 1301 }, // AKASH→USDC
      "BTC": { 
        multiHopPath: {
          intermediateToken: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
          firstHopPoolId: 1301, // AKASH-ATOM 
          secondHopPoolId: 1943 // USDC→BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // USDC
          firstHopPoolId: 4, // AKASH-ATOM 
          secondHopPoolId: 22 // ATOM→REGEN
        }
      }
    },
    "TIA": {
      "USDC": { directPoolId: 1247 }, // TIA→USDC
      "BTC": {
          multiHopPath: {
              intermediateToken: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
              firstHopPoolId: 1247, // TIA-USDC
              secondHopPoolId: 1943 // USDC→BTC
          }
      },
      "REGEN": {
        multiHopPath: {
            intermediateToken: "uosmo", // OSMO
            firstHopPoolId: 1248, // TIA-OSMO
            secondHopPoolId: 42 // OSMO-REGEN
        }
      }
    },
  
    "ATONE": {
      "BTC": { directPoolId: 2648 },
      "USDC": { 
        multiHopPath: {
          intermediateToken: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // ATOM
          firstHopPoolId: 2639, // ATONE-ATOM 
          secondHopPoolId: 1282 // ATOM→USDC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // ATOM
          firstHopPoolId: 2639, // ATONE-ATOM 
          secondHopPoolId: 22 // ATOM-REGEN
        }
      }
    },
  
    "REGEN": {
      "USDC": { directPoolId: 1472 },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
          firstHopPoolId: 1472, // REGEN-USDC 
          secondHopPoolId: 1943 // USDC→BTC
        }
      },
      "qREGEN": { directPoolId: 1767 }
      
    },
  
    "SAGA": {
      "USDC": { directPoolId: 1671 },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
          firstHopPoolId: 1671, // SAGA-USDC 
          secondHopPoolId: 1943 // USDC→BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1670, // SAGA-OSMO 
          secondHopPoolId: 42 // OSMO-REGEN
        }
      }
    },
  
    "INJ": {
      "USDC": { directPoolId: 1319 },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
          firstHopPoolId: 1319, // INJ-USDC 
          secondHopPoolId: 1943 // USDC→BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 725, // INJ-OSMO 
          secondHopPoolId: 42 // OSMO-REGEN
        }
      }
    },
    
    "FLIX": {
      "USDC": { 
        multiHopPath: {
          intermediateToken: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // ATOM
          firstHopPoolId: 1896, // FLIX-ATOM
          secondHopPoolId: 1282 // ATOM-USDC
        }
      },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1895, // FLIX-OSMO 
          secondHopPoolId: 1995 // OSMO-BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1895, // FLIX-OSMO 
          secondHopPoolId: 42 // OSMO-REGEN
        }
      }
    },
    
    "CORE": {
      "USDC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1244, // CORE-OSMO
          secondHopPoolId: 1464 // OSMO-USDC
        }
      },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1244, // CORE-OSMO 
          secondHopPoolId: 1995 // OSMO-BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1244, // CORE-OSMO 
          secondHopPoolId: 42 // OSMO-REGEN
        }
      }
    },
  
    "P2P": {
      "USDC": { 
        multiHopPath: {
          intermediateToken: "ibc/27394FB092D2ECCD56123C74F36E4C1F926001CEADA9CA97EA622B25F41E5EB2", // ATOM
          firstHopPoolId: 6, // DVPN-ATOM
          secondHopPoolId: 1282 // ATOM-USDC
        }
      },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 5, // DVPN-OSMO 
          secondHopPoolId: 1995 // OSMO-BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 5, // DVPN-OSMO 
          secondHopPoolId: 42 // OSMO-REGEN
        }
      },
      
    },
    "QCK": {
      "USDC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1697, // QCK-OSMO
          secondHopPoolId: 1464 // OSMO-USDC
        }
      },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1697, // QCK-OSMO 
          secondHopPoolId: 1995 // OSMO-BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1697, // QCK-OSMO 
          secondHopPoolId: 42 // OSMO-REGEN
        }
      },
    },
  
    "STARS": {
      "USDC": { directPoolId: 1096 },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1635, // STARS-OSMO 
          secondHopPoolId: 1995 // OSMO-BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1635, // STARS-OSMO 
          secondHopPoolId: 42 // OSMO-REGEN
        }
      },
    },
  
    "ARKEO": {
      "USDC": { directPoolId: 2977 },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
          firstHopPoolId: 2977, // ARKEO-USDC 
          secondHopPoolId: 1943 // USDC-BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "ibc/498A0751C798A0D9A389AA3691123DADA57DAA4FE165D5C75894505B876BA6E4", // USDC
          firstHopPoolId: 2977, // ARKEO-USDC 
          secondHopPoolId: 1464 // OSMO-REGEN
        }
      },
    },
  
    "SCRT": {
      "USDC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1095, // SCRT-OSMO
          secondHopPoolId: 1464 // OSMO-USDC
        }
      },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1095, // QCK-OSMO 
          secondHopPoolId: 1995 // OSMO-BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 1095, // QCK-OSMO 
          secondHopPoolId: 42 // OSMO-REGEN
        }
      },
    },
  
    "JKL": {
      "USDC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 832, // JKL-OSMO
          secondHopPoolId: 1263 // OSMO-USDC
        }
      },
      "BTC": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 832, // JKL-OSMO 
          secondHopPoolId: 1995 // OSMO-BTC
        }
      },
      "REGEN": { 
        multiHopPath: {
          intermediateToken: "uosmo", // OSMO
          firstHopPoolId: 832, // JKL-OSMO 
          secondHopPoolId: 42 // OSMO-REGEN
        }
      },
    },
  
    
  };
  
  
  // Helper function to get route
  export function getSwapRoute(fromSymbol: string, toSymbol: string): SwapRoute | undefined {
    return SWAP_ROUTES[fromSymbol]?.[toSymbol];
  }
  
  // Helper to get token denom on Osmosis
  export function getTokenDenomOnOsmosis(symbol: string): string | undefined {
    // Import these from your existing files
    const { TOKENS } = require('./tokens');
    const { CHAINS } = require('@/components/toknwrks/chains');
  
    // Check TOKENS first
    if (TOKENS[symbol]) {
      return TOKENS[symbol].denom;
    }
    
    // Check CHAINS next
    for (const chain of CHAINS) {
      if (chain.Symbol === symbol) {
        return chain.ibcDenomOnOsmosis;
      }
    }
    
    // Special cases
    if (symbol === "OSMO") {
      return "uosmo";
    }
    
    return undefined;
  }