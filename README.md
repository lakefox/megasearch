# MEGASEARCH

MEGASEARCH is a search libary that trades storage space for less memory usage allowing you to search very large amounts of data.

## Installation

Using [NPM](https://npmjs/package/megasearchjs) to install MEGASEARCH.

```bash
npm install megasearchjs
```

## Usage

```javascript
const megasearch = require('megasearchjs');

let ms = new megasearch();

// Add a new document
ms.add("insertidhere", "document data...");

// Query MEGASEARCH
ms.query("what ever search query you have").then((data) => {
  console.log(data);
});

// Get document by ID
ms.id("insertidhere").then((data) => {
  console.log(data);
});

```

## Notes
Your data will be stored in a folder call /store

## License
[MIT](https://choosealicense.com/licenses/mit/)
