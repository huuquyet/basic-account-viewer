import React, { useCallback, useEffect, useState } from "react";
import { Platform, StatusBar, View } from "react-native";
import * as SplashScreen from "expo-splash-screen";
import { Asset } from "expo-asset";

import MainNavigator from "./navigation/MainNavigator";

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App(props) {
  const [appIsReady, setAppIsReady] = useState(false);

  useEffect(() => {
    async function prepare() {
      try {
        // Pre-load fonts, make any API calls you need to do here
        await Promise.all([
          Asset.loadAsync([require("./assets/images/freighter.png")]),
        ]);
        // Artificially delay for two seconds to simulate a slow loading
        // experience. Please remove this if you copy and paste the code!
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (e) {
        console.warn(e);
      } finally {
        // Tell the application to render
        setAppIsReady(true);
      }
    }
    prepare();
  }, []);

  const onLayoutRootView = useCallback(async () => {
    if (appIsReady || props.skipLoadingScreen) {
      await SplashScreen.hideAsync();
    }
  }, [appIsReady]);

  if (!appIsReady && !props.skipLoadingScreen) {
    return null;
  }

  return (
    <View
      style={{
        flex: 1,
        backgroundColor: "#fff",
        width: "100%",
        maxWidth: "36rem",
        marginLeft: "auto",
        marginRight: "auto",
      }}
      onLayout={onLayoutRootView}
    >
      {Platform.OS === "ios" && <StatusBar barStyle="default" />}
      <MainNavigator />
    </View>
  );
}
