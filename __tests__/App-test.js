import React from "react";
import renderer from "react-test-renderer";

import App from "../App";

jest.mock("expo", () => ({
  AppLoading: "AppLoading",
}));

jest.mock("../navigation/MainNavigator", () => "MainNavigator");

describe("App", () => {
  jest.useFakeTimers();

  it(`renders the loading screen`, () => {
    const tree = renderer.create(<App />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it(`renders the root without loading screen`, () => {
    const tree = renderer.create(<App skipLoadingScreen />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
