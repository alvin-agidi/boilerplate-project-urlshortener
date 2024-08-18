require("dotenv").config();
const express = require("express");
const cors = require("cors");
const app = express();
const mongoose = require("mongoose");
const dns = require("dns");
const urlparser = require("url");

// Basic Configuration
const port = process.env.PORT || 3000;

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect(process.env.MONGO_URI, {
	useNewUrlParser: true,
	useUnifiedTopology: true,
});
let schema = new mongoose.Schema({ original_url: String });
let Url = mongoose.model("Url", schema);

app.use(cors());

app.use("/public", express.static(`${process.cwd()}/public`));

app.get("/", function (req, res) {
	res.sendFile(process.cwd() + "/views/index.html");
});

app.post("/api/shorturl/", function (req, res) {
	const original_url = req.body.url;
	dns.lookup(urlparser.parse(original_url).hostname, (err, address) => {
		if (err) {
			console.error(err);
		}
		if (!address) {
			res.json({ error: "invalid url" });
		} else {
			const url = new Url({ original_url });
			url.save((err, data) => {
				if (err) return console.log(err);
				res.json({
					original_url: data.original_url,
					short_url: data._id,
				});
			});
		}
	});
});

// Your first API endpoint
app.get("/api/shorturl/:shorturl", function (req, res) {
	const params = req.params;
	const shorturl = params.shorturl;
	Url.findById(shorturl, function (err, data) {
		if (err || !data) {
			console.error(err);
			res.json({ error: "invalid url" });
		}
		// console.log(data.original_url);
		res.redirect(data.original_url);
	});
});

app.listen(port, function () {
	console.log(`Listening on port ${port}`);
});
