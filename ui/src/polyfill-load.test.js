import fetchMock from "fetch-mock";

import { EmptyAPIResponse } from "__mocks__/Fetch";
import { mockMatchMedia } from "__mocks__/matchMedia";

const settingsElement = {
  dataset: {
    sentryDsn: "",
    version: "1.2.3",
    defaultFiltersBase64: "WyJmb289YmFyIiwiYmFyPX5iYXoiXQ==",
  },
};

beforeEach(() => {
  window.matchMedia = mockMatchMedia({});

  global.MutationObserver = class {
    disconnect() {}
    observe(element, initObject) {}
  };
});

it("loads ResizeObserver polyfill if needed", () => {
  expect(window.ResizeObserver).toBeFalsy();

  const root = document.createElement("div");
  jest.spyOn(global.document, "getElementById").mockImplementation((name) => {
    return name === "settings"
      ? settingsElement
      : name === "defaults"
      ? null
      : name === "root"
      ? root
      : null;
  });
  const response = EmptyAPIResponse();
  response.filters = [];

  fetchMock.reset();
  fetchMock.any({
    body: JSON.stringify(response),
  });

  require("./index.tsx");
  expect(window.ResizeObserver).toBeTruthy();
});
