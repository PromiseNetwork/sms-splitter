const { split } = require("../src/index");

it("should return an array with one string for an empty string", () => {
  const input = "";
  const ret = split(input, { world: "foo", you: "bar" }, 160);

  expect(ret.length).toBe(1);
  expect(ret[0]).toBe("");
});

it("should return an array with one string for a string of spaces", () => {
  const input = "  ";
  const ret = split(input, { world: "foo", you: "bar" }, 160);

  expect(ret.length).toBe(1);
  expect(ret[0]).toBe("");
});

it("should return an array with one string", () => {
  const input = "Hello {{world}} how are {{you}}";
  const ret = split(input, { world: "foo", you: "bar" }, 160);

  expect(ret.length).toBe(1);
});

it("should return an array with two strings", () => {
  const input = "Hello {{world}} how are {{you}}";
  const ret = split(input, { world: "foo", you: "bar" }, 16);

  expect(ret.length).toBe(2);
  expect(ret[0]).toBe("Hello foo ...");
  expect(ret[1]).toBe("how are bar");
});

it("should split the content of a token if it is longer than the entire allowed message", () => {
  const input = "Hello {{world}}";
  const ret = split(input, { world: "supercalifragilisticexpialidocious" }, 20);

  expect(ret.length).toBe(3);
  expect(ret[0]).toBe("Hello supercalif ...");
  expect(ret[1]).toBe("ragilisticexpial ...");
  expect(ret[2]).toBe("idocious");
});

it("should return an array with two strings and no ellipses", () => {
  const input = "Hello {{world}} how are {{you}}";
  const ret = split(input, { world: "foo", you: "bar" }, 16, "");

  expect(ret.length).toBe(2);
  expect(ret[0]).toBe("Hello foo");
  expect(ret[1]).toBe("how are bar");
});

it("should split on the space character", () => {
  const input = "This is a multiple word sentence";
  const ret = split(input, {}, 15, "");

  expect(ret.length).toBe(3);
  expect(ret[0]).toBe("This is a");
  expect(ret[1]).toBe("multiple word");
  expect(ret[2]).toBe("sentence");
});
