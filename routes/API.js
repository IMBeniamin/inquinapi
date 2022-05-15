const express = require("express");
const router = express.Router();
const cors = require("cors");
const Api = require("../model/countryScheme");
const _ = require("lodash");

router.options("*", cors());

//prasing raw iso_code to iso_code acceptable to mongoose syntax
const parse_isoCode = (raw, error) => {
    //regex that checks iso_code format
    const iso_code_format = new RegExp("^\\w{3}(?:,\\w{3})*$"); //ITA,DEU,FRA...
    if (raw === undefined || !raw) return {}

    const iso_code = raw.replace(/\s/g, "").toUpperCase();
    // remove spaces and formats according to model then test against regex pattern
    if (iso_code_format.test(iso_code))
        return {iso_code: {$in: iso_code.split(",")}};

    else {
        error["iso_code"] = {
            message: "iso_code does not respect the AAA[,AAA,...] format",
        };
        return {}
    }
}

//parsing raw year to year acceptable to mongoose syntax
const parse_year = (raw, error) => {
    // regex that checks the year formatting
    // YYYY[,YYYY,YYYY,...]
    const year_format_list = new RegExp("^-?\\d+(?:,-?\\d+)*$");
    // YYYY-YYYY
    const year_format_range = new RegExp("^(-?\\d+)-(-?\\d+)$");

    if (raw === undefined || !raw) return {};

    const year = raw.replace(/\s/g, "");
    // remove spaces and formats according to model then test against regex pattern
    if (year_format_list.test(year))
        return {year: {$in: year.split(",")}};

    else if (year_format_range.test(year)) {
        const range = year_format_range.exec(year).slice(1);
        return {
            year: {$gte: Math.min(...range), $lte: Math.max(...range)} //$gte = >= || $lte = <=
        }
    } else {
        error["year"] = {
            message:
                "year does not respect the YYYY[,YYYY,...] or YYYY-YYYY format",
        };
        return {}
    }
}

//parsing raw filter to filter acceptable to mongoose syntax
const parse_filter = (raw, error) => {
    // checks filter formatting [-]field1[,[-]field2,...]
    const filter_format = new RegExp("^(-?)\\w+(?:(,?)\\1\\w+)*$");
    const default_filter = ['-_id']

    if (raw === undefined || !raw) return default_filter;

    const filter = raw.replace(/\s/g, "");
    // remove spaces and formats according to model then test against regex pattern
    if (filter_format.test(filter))
        return ['-_id'].concat(filter.split(","))

    else {
        error["filter"] = {
            message: "filter does not respect the {[-]field1,[-]field2,...} format",
        };
        return default_filter
    }
}

const parse_strict = (raw, error, filter_fields) => {
    // checks filter formatting
    // field1[,field2,...]
    const strict_format_list = new RegExp("^\\w+(,\\w+)*$");
    // (*) All fields must be strict
    const strict_format_all = new RegExp("^\\*$");

    if (raw === undefined || !raw) return {};

    const strict = raw.replace(/\s/g, "")
    // remove spaces and formats according to model then test against regex pattern
    if (strict_format_list.test(strict))
        return strict.split(",").reduce((prev, cur) => ({...prev, [cur]: {$exists: true}}), {})
    else if (strict_format_all.test(strict))
        return filter_fields.reduce((prev, cur) => ({...prev, [cur]: {$exists: true}}), {})
    else {
        error["strict"] = {
            message: "strict does not respect the field1[,field2,...] or * format",
        };
        return {};
    }
}

router.get("/", (req, res) => {
    let error = {};

    const iso_code = parse_isoCode(req.query.iso_code, error);
    const year = parse_year(req.query.year, error);

    const filter = parse_filter(req.query.filter, error);
    const strict = parse_strict(req.query.strict, error, filter); //parameter used to return documents that have available fields present in filter

    const query = _.merge(iso_code, year, strict); //merge 3 object into 1 object
    console.log(query)
    Api.find(query).select(filter).exec((query_error, db_data) => {
        if (query_error)
            res.status(503).send(query_error)
        else if (Object.keys(error).length > 0)
            res.status(400).send(error);
        else
            res.status(200).json(db_data);
    });

});

module.exports = router;
