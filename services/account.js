import { Networks } from "stellar-base";
import { Keypair, Server } from "stellar-sdk";
import { isConnected, getPublicKey } from "@stellar/freighter-api";

export const networks = [
  {
    name: "testnet",
    passphrase: Networks.TESTNET,
    serverUrl: "https://horizon-testnet.stellar.org",
  },
  {
    name: "public",
    passphrase: Networks.PUBLIC,
    serverUrl: "https://horizon.stellar.org",
  },
];

export const initServer = (network, setServer, setAccount) => {
  if (network) {
    setServer(new Server(network.serverUrl));
  } else {
    setServer(undefined);
  }
  setAccount(undefined);
};

export const connectFreighter = async () => {
  try {
    if (!isConnected()) {
      return { isError: true, error: new Error("Freighter not available") };
    }
    const publicKey = await getPublicKey();
    const keypair = Keypair.fromPublicKey(publicKey);
    return {
      isError: false,
      keypair: keypair,
    };
  } catch (err) {
    return { isError: true, error: err };
  }
};

export const fetchAccount = async (server, keypair) => {
  try {
    const account = await server.loadAccount(keypair.publicKey());
    const balances = account.balances.map((asset) => {
      if (asset.asset_type === "native") {
        return {
          balance: asset.balance,
          assetCode: "XLM",
        };
      } else if (
        asset.asset_type === "credit_alphanum4" ||
        asset.asset_type === "credit_alphanum12"
      ) {
        return {
          balance: asset.balance,
          assetCode: asset?.asset_code,
          assetIssuer: asset?.asset_issuer,
        };
      } else if (asset.asset_type === "liquidity_pool_shares") {
        return {
          balance: asset.balance,
          liquidity_pool_id: asset?.liquidity_pool_id,
        };
      }
    });
    const operations =
      (await server
        .transactions()
        .forAccount(account.accountId())
        .order("asc")
        .limit(1)
        .call()
        .then(({ records }) => records.pop())
        .then((record) => record?.operations())
        .then((operations) => operations?.records)
        .catch(console.error)) || [];
    const createRecord = operations.find(
      (rec) => rec.type === "create_account",
    );
    const createdAt = createRecord ? createRecord.created_at : "-";
    const createdBy = createRecord ? createRecord.source_account : "-";
    return {
      isError: false,
      accountId: account.accountId(),
      createdAt: createdAt,
      createdBy: createdBy,
      balances: balances,
    };
  } catch (err) {
    return {
      isError: true,
      error: err,
    };
  }
};
