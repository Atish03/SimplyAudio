const express = require("express");
const app = express();

app.use('/media', express.static("uploads"));

app.listen(1337, () => {
    console.log("listening on port 1337")
})