if (typeof global.WeakRef !== "function") {
  global.WeakRef = class WeakRefPolyfill {
    constructor(value) {
      this._value = value;
    }

    deref() {
      return this._value;
    }
  };
}

if (typeof global.FinalizationRegistry !== "function") {
  global.FinalizationRegistry = class FinalizationRegistryPolyfill {
    register() {}

    unregister() {
      return true;
    }
  };
}

require("expo-router/entry");
