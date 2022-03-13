import React, { useEffect, useState } from "react";
import {
  Button,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import * as Clipboard from "expo-clipboard";
import * as Linking from "expo-linking";

import {
  connectFreighter,
  fetchAccount,
  freighter,
  initServer,
  networks,
} from "../services/account";
import { FontAwesome5 } from "@expo/vector-icons";

const HomeScreen = () => {
  const [network, setNetwork] = useState(networks[0]);
  const [server, setServer] = useState();
  const [keypair, setKeypair] = useState();
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState();

  useEffect(() => {
    initServer(network, setServer, setAccount);
  }, [network]);

  useEffect(() => {
    if (server && keypair) {
      setLoading(true);
      fetchAccount(server, keypair).then((res) => {
        if (!res.isError) {
          setAccount(res);
        } else {
          setAccount(undefined);
        }
        setLoading(false);
      });
    } else {
      setAccount(undefined);
    }
  }, [server, keypair, setLoading]);

  const disconnect = () => {
    setKeypair(undefined);
  };

  const connect = () => {
    connectFreighter().then((res) => {
      console.log(res);
      if (!res.isError) {
        setKeypair(res.keypair);
      }
    });
  };

  return (
    <View style={styles.container}>
      <View style={styles.buttons}>
        <View style={styles.row}>
          {networks.map((net) => (
            <Button
              key={net.name}
              onPress={() => setNetwork(net)}
              color={net.name === network.name ? "#08f" : "gray"}
              title={net.name}
            />
          ))}
        </View>
        {!!!keypair ? (
          <Button
            onPress={connect}
            title="Connect wallet"
            disabled={!freighter.isInstalled}
          />
        ) : (
          <Button color="#841584" onPress={disconnect} title="Disconnect" />
        )}
      </View>

      {!!account && !account?.isError ? (
        <View style={styles.container}>
          <View style={styles.accountContainer}>
            <Text>
              <strong>Account</strong>
            </Text>
            <AccountDetail accountId={account?.accountId} network={network} />
            <Text>Created by:</Text>
            <AccountDetail accountId={account?.createdBy} network={network} />
            <Text>
              Created at:
              <br />
              {account?.createdAt}
            </Text>
          </View>

          <Text>
            <strong>Balances</strong>
          </Text>
          <ScrollView
            style={styles.column}
            contentContainerStyle={styles.scrollContainer}
          >
            {account?.balances.map((asset, index) => (
              <View style={styles.assetContainer} key={`asset_${index}`}>
                <AssetDetail asset={asset} network={network} />
              </View>
            ))}
          </ScrollView>
        </View>
      ) : (
        <View style={styles.infoContainer}>
          {!freighter.isInstalled ? (
            <Text>
              Freighter extension is not installed
              <br />
              Get it from{" "}
              <TouchableOpacity
                onPress={() => Linking.openURL(freighter.installUrl)}
              >
                <Text style={styles.link}>{freighter.installUrl}</Text>
              </TouchableOpacity>
            </Text>
          ) : (
            <Text>
              {loading
                ? "Loading..."
                : !keypair
                ? "Connect your wallet to show account information."
                : "Couldn't find account information, check that you have correct network selected."}
            </Text>
          )}
        </View>
      )}
    </View>
  );
};

export default HomeScreen;

const AccountDetail = ({ accountId, network }) => {
  const accountUrl = `https://stellar.expert/explorer/${network.name}/account/${accountId}`;

  return (
    <View style={styles.detailContainer}>
      <TouchableOpacity onPress={() => Linking.openURL(accountUrl)}>
        <Text style={styles.link}>
          <strong>{displayId(accountId)}</strong>
        </Text>
      </TouchableOpacity>
      <TouchableOpacity onPress={() => Clipboard.setString(accountId)}>
        <FontAwesome5 name="copy" size={18} />
      </TouchableOpacity>
    </View>
  );
};

const AssetDetail = ({ asset, network }) => {
  const assetUrl = () => {
    const networkLink = `https://stellar.expert/explorer/${network.name}/`;
    const liquidityLink = `liquidity-pool/${asset?.liquidity_pool_id}`;
    const assetLink = `asset/${asset?.assetCode}${
      asset.assetIssuer ? `-${asset.assetIssuer}` : ""
    }`;

    return `${networkLink}${
      !!asset.liquidity_pool_id ? `${liquidityLink}` : `${assetLink}`
    }`;
  };

  return (
    <View style={styles.detailContainer}>
      <View style={styles.row}>
        <View
          style={[
            styles.avatarBackground,
            { backgroundColor: randomHexColor() },
          ]}
        >
          <Text style={styles.assetAvatar}>
            {asset.assetCode ? asset.assetCode.slice(0, 3) : "+"}
          </Text>
        </View>
        {!!asset.liquidity_pool_id ? (
          <View style={styles.assetText}>
            <Text>
              <strong>{`${asset.balance} pool shares`}</strong>
            </Text>
            <Text>
              Liquidity pool id: {asset?.liquidity_pool_id.slice(0, 18)}...
            </Text>
          </View>
        ) : (
          <View style={styles.assetText}>
            <Text>
              <strong>{`${asset.balance} ${asset.assetCode}`}</strong>
            </Text>
            <Text>{displayId(asset?.assetIssuer)}</Text>
          </View>
        )}
      </View>
      <TouchableOpacity onPress={() => Linking.openURL(assetUrl())}>
        <FontAwesome5 name="external-link-alt" size={18} />
      </TouchableOpacity>
    </View>
  );
};

const displayId = (accountId) => {
  return accountId
    ? `${accountId.slice(0, 12)}...${accountId.slice(-12)}`
    : undefined;
};

const randomHexColor = () => {
  return "#000000".replace(/0/g, () => {
    return (~~(Math.random() * 16)).toString(16);
  });
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 3,
    backgroundColor: "#fff",
  },
  row: {
    flexDirection: "row",
  },
  column: {
    flexDirection: "column",
  },
  link: {
    textDecorationLine: "underline",
  },
  buttons: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  scrollContainer: {
    paddingTop: 5,
  },
  accountContainer: {
    flexDirection: "column",
    borderBottomWidth: "thin",
    padding: 5,
  },
  assetContainer: {
    borderBottomWidth: 1,
    borderColor: "gray",
    padding: 10,
  },
  detailContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  assetText: {
    flexDirection: "column",
    marginLeft: 10,
  },
  avatarBackground: {
    alignItems: "center",
    justifyContent: "center",
    width: 42,
    height: 42,
    borderRadius: 42,
  },
  assetAvatar: {
    textAlign: "center",
    backgroundColor: "none",
    fontSize: 14,
    lineHeight: 14,
  },
  infoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 10,
  },
});
