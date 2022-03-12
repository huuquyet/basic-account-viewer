import React, { useState } from "react";
import { Platform, StatusBar, View } from "react-native";
import AppLoading from "expo-app-loading";
import { Asset } from "expo-asset";

import MainNavigator from "./navigation/MainNavigator";

export default function App(props) {
  const [isLoadingComplete, setLoadingComplete] = useState(false);

  if (!isLoadingComplete && !props.skipLoadingScreen) {
    return (
      <AppLoading
        startAsync={loadResourcesAsync}
        onError={handleLoadingError}
        onFinish={() => handleFinishLoading(setLoadingComplete)}
      />
    );
  } else {
    return (
      <View
        style={{
          flex: 1,
          backgroundColor: "#fff",
          width: "100%",
          maxWidth: "36rem",
          alignSelf: "center",
        }}
      >
        {Platform.OS === "ios" && <StatusBar barStyle="default" />}
        <MainNavigator />
      </View>
    );
  }
}

async function loadResourcesAsync() {
  await Promise.all([
    Asset.loadAsync([require("./assets/images/freighter.png")]),
  ]);
}

function handleLoadingError(error) {
  // In this case, you might want to report the error to your error reporting
  // service, for example Sentry
  console.warn(error);
}

function handleFinishLoading(setLoadingComplete) {
  setLoadingComplete(true);
}
