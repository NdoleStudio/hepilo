import { getBooleanFromLocalStorage } from "@/plugins/utils";

describe("getBooleanFromLocalStorage", () => {
  it("returns the default when an item doesn't exist", () => {
    expect(getBooleanFromLocalStorage("test", true)).toBe(true);
    expect(getBooleanFromLocalStorage("test", false)).toBe(false);
  });

  it("returns the item is set", () => {
    const key = "test-key";

    localStorage.setItem(key, JSON.stringify(true));
    expect(getBooleanFromLocalStorage(key, false)).toBe(true);

    localStorage.setItem(key, JSON.stringify(false));
    expect(getBooleanFromLocalStorage(key, true)).toBe(false);
  });

  it("returns default when the item is not boolean", () => {
    const key = "test-key";

    localStorage.setItem(key, JSON.stringify("test-value"));
    expect(getBooleanFromLocalStorage(key, false)).toBe(false);

    localStorage.setItem(key, JSON.stringify(123));
    expect(getBooleanFromLocalStorage(key, true)).toBe(true);
  });
});
