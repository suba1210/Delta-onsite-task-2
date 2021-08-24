//requiring node modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');

//models
const Url = require('./Models/urlModel');

// connecting to database
mongoose.connect('mongodb://localhost:27017/onsite-2', {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true
});
const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error:"));
db.once("open", () => {
    console.log("Database connected");
});

const app = express();

app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'))

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
// app.use(express.static(path.join(__dirname, 'public')));



app.get('/',async(req,res)=>{
    const urls = await Url.find();
    res.render('index',{urls});
})



app.post('/shorten',async(req,res)=>{
    const url = new Url({long:req.body.long});
    await url.save();
    res.redirect('/');
})







app.get('/:url',async(req,res)=>{
    const url = await Url.findOne({short:req.params.url});
    if(url== null)
    {
        res.send("This url doesn't exist!");
    }
    else {
        url.clicks++;
        url.save();
        res.redirect(url.long);
    }

})



app.listen(3000, () => {
    console.log('Serving on port 3000');
})