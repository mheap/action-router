const router = require("./index");

beforeEach(() => {
  jest.clearAllMocks();
});

test("is a function", () => {
  expect(typeof router).toBe("function");
});

test("throws without any configuration", () => {
  expect(() => router({})).toThrow("No routes provided");
});

test("throws when the current event isn't listed", () => {
  expect(() =>
    router(
      {
        "issue.created": function() {}
      },
      "pull_request.labeled"
    )
  ).toThrow("No entries found for 'pull_request.labeled'");
});

test("throws when there are no functions defined for an event", () => {
  expect(() =>
    router(
      {
        "pull_request.labeled": []
      },
      "pull_request.labeled"
    )
  ).toThrow(`No functions defined for 'pull_request.labeled'`);
});

test("throws when the provided entry isn't a function", () => {
  expect(() =>
    router(
      {
        "pull_request.labeled": [function() {}, "Hello", true]
      },
      "pull_request.labeled"
    )
  ).toThrow("Not a function: Hello, true");
});

test("pulls the event and action from the environment when not provided", () => {
  process.env.GITHUB_EVENT_NAME = "pull_request";
  process.env.GITHUB_EVENT_PATH = "/path/to/pull_request-labeled.json";

  // Mock a call to require(GITHUB_EVENT_PATH);
  const eventPathFn = jest.fn(() => {
    return { action: "labeled" };
  });
  const spy = jest.mock(process.env.GITHUB_EVENT_PATH, eventPathFn, {
    virtual: true
  });

  const fn = jest.fn();
  router({
    "pull_request.labeled": [fn]
  });

  // Expect the mock that we provided as module.exports
  // to have been called
  expect(eventPathFn).toBeCalled();

  delete process.env.GITHUB_EVENT_NAME;
  delete process.env.GITHUB_EVENT_PATH;
});

test("executes with an event subtype", () => {
  const fn = jest.fn();
  router(
    {
      "pull_request.labeled": [fn]
    },
    "pull_request.labeled"
  );

  expect(fn).toBeCalled();
});

test("executes without an event subtype", () => {
  const fn = jest.fn();
  router(
    {
      pull_request: [fn]
    },
    "pull_request.labeled"
  );

  expect(fn).toBeCalled();
});

test("does not pass anything to the executed function", () => {
  const fn = jest.fn();
  router(
    {
      pull_request: [fn]
    },
    "pull_request.labeled"
  );

  // We expect it to have been called with no arguments
  // This reads a little strangely, but it's correct
  expect(fn).toHaveBeenCalledWith();
});

test("supports a single function being passed", () => {
  const fn = jest.fn();
  router(
    {
      pull_request: fn
    },
    "pull_request.labeled"
  );
  expect(fn).toBeCalled();
});

test("supports an array of functions being passed", () => {
  const fn = jest.fn();
  router(
    {
      pull_request: [fn]
    },
    "pull_request.labeled"
  );
  expect(fn).toBeCalled();
});

test("runs multiple functions if provided", () => {
  const fn = jest.fn();
  const fn2 = jest.fn();
  router(
    {
      pull_request: [fn, fn2]
    },
    "pull_request.labeled"
  );

  expect(fn).toBeCalled();
  expect(fn2).toBeCalled();
});

test("returns an array of promises", async () => {
  const fn = () => Promise.resolve("results");
  const fn2 = () => Promise.resolve("here");

  const result = await router(
    {
      pull_request: [fn, fn2]
    },
    "pull_request.labeled"
  );

  expect(result).toEqual(["results", "here"]);
});
