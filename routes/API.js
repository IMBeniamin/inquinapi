const express = require("express");
const router = express.Router();
const cors = require("cors");
const Api = require("../model/countryScheme");

router.options("*", cors());

router.get("/", (req, res) => {
    let error = {};

    const iso_code = parse_isoCode(req.query.iso_code, error);
    const year = parse_year(req.query.year, error);
    const filter = parse_filter(req.query.filter, error);
    const strict = parse_strict(req.query.strict, error);

    // Initiating query build
    const formatted_query = {
            iso_code: iso_code,
            year: year
    };
    for (const [key, value] of Object.entries(formatted_query))
        value === undefined ? delete formatted_query[key] : {}

    Api.find(formatted_query).select(filter).exec((query_error, db_data) => {
        if (query_error)
            res.status(503).send(query_error)
        else if (Object.keys(error).length > 0)
            res.status(400).send(error);
        else
            res.status(200).json(db_data);
    });
});

module.exports = router;
