import crypto from "crypto";

interface ApiConfig {
  apiKey: string;
  secretKey: string;
  passphrase: string;
  projectId?: string;
}

function getApiConfig(): ApiConfig {
  return {
    apiKey: process.env.OKX_API_KEY || "",
    secretKey: process.env.OKX_SECRET_KEY || "",
    passphrase: process.env.OKX_API_PASSPHRASE || "",
    projectId: process.env.OKX_PROJECT_ID,
  };
}

function preHash(
  timestamp: string,
  method: string,
  requestPath: string,
  params: any
): string {
  let queryString = "";
  if (method === "GET" && params) {
    const query = new URLSearchParams();
    Object.keys(params).forEach((key) => {
      query.append(key, params[key]);
    });
    queryString = "?" + query.toString();
  } else if (method === "POST" && params) {
    queryString = typeof params === "string" ? params : JSON.stringify(params);
  }
  return timestamp + method + requestPath + queryString;
}

function sign(message: string, secretKey: string): string {
  const hmac = crypto.createHmac("sha256", secretKey);
  hmac.update(message);
  return hmac.digest("base64");
}

function createAuthHeaders(
  method: string,
  requestPath: string,
  params: any,
  config: ApiConfig
): Record<string, string> {
  const timestamp = new Date().toISOString().slice(0, -5) + "Z";
  const message = preHash(timestamp, method, requestPath, params);
  const signature = sign(message, config.secretKey);

  return {
    "OK-ACCESS-KEY": config.apiKey,
    "OK-ACCESS-SIGN": signature,
    "OK-ACCESS-TIMESTAMP": timestamp,
    "OK-ACCESS-PASSPHRASE": config.passphrase,
    "Content-Type": "application/json",
    ...(config.projectId ? { "OK-ACCESS-PROJECT": config.projectId } : {}),
  };
}

export async function getTokenPrice(
  chain: number,
  tokenAddress: string
): Promise<any> {
  const baseUrl = "https://web3.okx.com";
  const requestPath = "/api/v5/dex/market/price";

  const params = [
    {
      chainIndex: `${chain}`,
      tokenContractAddress: tokenAddress,
    },
  ];

  const body = JSON.stringify(params);

  try {
    const apiConfig = getApiConfig();
    const authHeaders = createAuthHeaders("POST", requestPath, body, apiConfig);

    const response = await fetch(`${baseUrl}${requestPath}`, {
      method: "POST",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
      body,
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch token price: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    const item = data.data[0];
    if (!item) {
      return {
        msg: "not found",
      };
    }
    return {
      price: item.price,
      time: item.time,
    };
  } catch (error) {
    console.error("Error fetching token price from OKX DEX:", error);
    throw error;
  }
}

export async function getSupportedChain() {
  const baseUrl = "https://web3.okx.com";
  const requestPath = "/api/v5/dex/market/supported/chain";

  try {
    const apiConfig = getApiConfig();
    const authHeaders = createAuthHeaders("GET", requestPath, null, apiConfig);

    const response = await fetch(`${baseUrl}${requestPath}`, {
      method: "GET",
      headers: {
        ...authHeaders,
        Accept: "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(
        `Failed to fetch supported chain: ${response.status} ${response.statusText}`
      );
    }

    const data = await response.json();
    console.log("getSupportedChain", data);
    return data.data;
  } catch (error) {
    console.error("Error fetching supported chain from OKX DEX:", error);
    throw error;
  }
}
