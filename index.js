module.exports = function(routes, args, eventAndAction) {
  if (Object.keys(routes).length < 1) {
    throw new Error("No routes provided");
  }

  if (!eventAndAction) {
    const payload = require(process.env.GITHUB_EVENT_PATH);
    eventAndAction = `${process.env.GITHUB_EVENT_NAME}.${payload.action}`;
  }

  let [event, action] = eventAndAction.split(".");

  let methods;
  if (routes[eventAndAction]) {
    methods = routes[eventAndAction];
  } else if (routes[event]) {
    methods = routes[event];
  } else {
    throw `No entries found for '${eventAndAction}'`;
  }

  // Make everything an array for consistency
  if (!Array.isArray(methods)) {
    methods = [methods];
  }

  if (methods.length == 0) {
    throw `No functions defined for '${eventAndAction}'`;
  }

  // Throw if any methods provided aren't a function
  const errors = methods.filter(m => typeof m != "function");
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
