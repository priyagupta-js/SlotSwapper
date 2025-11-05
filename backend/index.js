// backend file 
const express = require('express');
const app = express();
const PORT = 5000;

app.get('/',(req,res) =>{
    res.send(" hello from backend");
});

app.listen(PORT,() =>{
    console.log(`server is running on http://localhost:${PORT}`);
});

