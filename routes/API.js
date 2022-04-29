const express = require("express");
const router = express.Router();
const cors = require("cors");
const Api = require("../model/countryScheme");

router.options("*", cors());

const parse_isoCode = (raw_isoCode, error) => {
    const iso_code_format = new RegExp("^\\w{3}(?:,\\w{3})*$");
    if (raw_isoCode === undefined || !raw_isoCode)
        return undefined

    // remove spaces and formats according to model then test against regex pattern
    else if (iso_code_format.test(raw_isoCode.replace(/\s/g, "").toUpperCase()))
        return { $in: raw_isoCode.split(",") }

    else
    {
        error["iso_code"] = {
            message: "iso_code does not respect the {AAA,AAA,...} format",
        };
        return undefined
    }
}

const parse_year = (raw_year, error) => {
    const year_format_list = new RegExp("^-?\\d+(?:,-?\\d+)*$");
    const year_format_range = new RegExp("^(-?\\d+)-(-?\\d+)$");

    if (raw_year === undefined || !raw_year)
        return undefined;

    else if (year_format_list.test(raw_year))
        return { $in: raw_year.split(",") };

    else if (year_format_range.test(raw_year))
    {
        const range = year_format_range.exec(raw_year).slice(1);
        return { $gt: Math.min(...range), $lt: Math.max(...range) }
    }

    else
    {
        error["year"] = {
            message:
                "year does not respect the {YYYY,YYYY,...} or {YYYY-YYYY} format",
        };
        return undefined
    }
}

const parse_filter = (raw_filter, error) => {
    // checks filter formatting {[-]field1,[-]field2,...}
    const filter_format = new RegExp("^(-?)\\w+(?:(,?)\\1\\w+)*$");
    const default_filter = ['-_id']
    let filter = raw_filter
        ? raw_filter.replace(/\s/g, "")
        : undefined;

    if (filter === undefined || !filter)
        return default_filter;

    else if (filter_format.test(filter))
        return ['-_id'].concat(filter.split(","))

    else
    {
        error["filter"] = {
            message: "filter does not respect the {[-]field1,[-]field2,...} format",
        };
        return default_filter
    }
}

const parse_strict = (raw_strict, error) => {
    return false
}

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
