//requiring node modules
const express = require('express');
const path = require('path');
const mongoose = require('mongoose');
const methodOverride = require('method-override');
var geoip = require('geoip-lite');
 


//models
const Url = require('./Models/urlModel');

const fetch = require('node-fetch');

let url = "http://api.ipapi.com/157.51.40.232?access_key=ff1d5d234467a690947054984e3fc2f0";

let settings = { method: "Get" };

let location;

fetch(url, settings)
    .then(res => res.json())
    .then((json) => {
        location = json.continent_name;
        console.log(json.continent_name);
    });



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

    if(urls.length!=0)
    {

    for(url of urls)
    {
        let date1 = new Date(url.createdAt);
        let now = Date.now();
        let date2 = new Date(now); 
        var Difference_In_Time = date2.getTime() - date1.getTime();
        var Difference_In_Days = Math.floor(Difference_In_Time / (1000 * 3600 * 24));
        if(Difference_In_Days>180){
            await Url.findByIdAndDelete(url._id);
        }
    }

    }

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
        let date1 = new Date(url.createdAt);
        let now = Date.now();
        let date2 = new Date(now); 
        var Difference_In_Time = date2.getTime() - date1.getTime();
        var Difference_In_Days = Math.floor(Difference_In_Time / (1000 * 3600 * 24));
        if(Difference_In_Days>180){
            await Url.findByIdAndDelete(url._id);
        }
        url.continent = url.continent.concat(location);
        url.clicks++;
        url.save();
        res.redirect(url.long);

    }

})

app.get('/location/:url',async(req,res)=>{

    const url = await Url.findById(req.params.url);
    res.render('location',{continents : url.continent,url});

})



app.listen(3000, () => {
    console.log('Serving on port 3000');
})