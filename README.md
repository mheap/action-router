# Action Router

Handle multiple events in your GitHub Action with ease!

## Installation

```bash
npm install @mheap/action-router --save
```

## Usage

The router will look for keys that match the event type e.g. `pull_request` and the subtype e.g. `opened` and execute any functions listed.

If a pull request was opened with the following configuration, `pull_request` and `pull_request.opened` would run.

```javascript
const router = require("@mheap/action-router");
const allPrAction = require("./allPrs");
const labelAction = require("./label");
const openAction = require("./open");

router({
  "pull_request": [allPrAction],
  "pull_request.opened": [openAction],
  "pull_request.labeled": [labelAction]
});
```

You can even run multiple methods in response to an event:

```
router({
  "pull_request.opened": [
    openAction, 
    () => { console.log("This runs too") }
  ]
});
```

