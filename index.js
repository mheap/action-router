module.exports = function (routes, args, eventAndAction) {
  if (Object.keys(routes).length < 1) {
    throw new Error("No routes provided");
  }

  if (!eventAndAction) {
    const payload = require(process.env.GITHUB_EVENT_PATH);
    eventAndAction = `${process.env.GITHUB_EVENT_NAME}.${payload.action}`;
  }

  let [event, action] = eventAndAction.split(".");

  let methods = [];

  if (routes[eventAndAction]) {
    methods = methods.concat(routes[eventAndAction]);
  }

  if (routes[event]) {
    methods = methods.concat(routes[event]);
  }

  if (methods.length === 0) {
    throw `No entries found for '${eventAndAction}'`;
  }

  // Throw if any methods provided aren't a function
  const errors = methods.filter((m) => typeof m != "function");
  if (errors.length > 0) {
    throw new Error(`Not a function: ${errors.join(", ")}`);
  }

  // Execute any methods passed
  const promises = [];
  for (let method of methods) {
    promises.push(method.apply(method, args));
  }

  return Promise.all(promises);
};
