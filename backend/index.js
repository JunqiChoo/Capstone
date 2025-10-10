const express = require('express')
const app = express();
const port = 3000
const bodyParser = require("body-parser");
const cors = require('cors');

app.use(bodyParser.json())
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(cors({
  origin: 'http://localhost:5173'
}))

app.use('/api',require("./Routes/userRoutes"))

app.get('/', (req, res) => {
  res.send('Hello World!')
})


app.listen(port, (error) =>{
    if(!error)
        console.log(`Server is Successfully Running, and App is listening on port  ${port}................`);
    else 
        console.log("Error occurred, server can't start", error);
    }
);