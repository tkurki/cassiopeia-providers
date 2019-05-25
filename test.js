const Provider = require('./')
const provider = new Provider()

provider.on('data', d => console.log(JSON.stringify(d)))