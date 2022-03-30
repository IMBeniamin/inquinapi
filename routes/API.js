const express = require("express");
const router = express.Router();
const cors = require("cors");
const Api = require("../model/countryScheme");

router.options("*", cors());

router.get("/", (req, res) => {
  const sort = req.query.sort || {
    year: "desc",
  };
  let error = {};

  // filter FORMATTING
  const filter_format = new RegExp("^(-?)\\w+(?:(,?)\\1\\w+)*$");
  let filter = req.query.filter
    ? req.query.filter.replace(/\s/g, "")
    : undefined;
  // console.log("raw filter is:", filter)
  if (!filter) {
    filter = [];
  } else if (filter_format.test(filter)) {
    filter = filter.split(",");
  } else {
    filter = [];
    error["filter"] = {
      message: "filter does not respect the {[-]field1,[-]field2,...} format",
    };
  }

  // iso_code FORMATTING
  const iso_code_format = new RegExp("^\\w{3}(?:,\\w{3})*$");
  let iso_code = req.query.iso_code
    ? req.query.iso_code.replace(/\s/g, "").toUpperCase()
    : undefined;
  // console.log("raw iso_code is:", iso_code)
  if (!iso_code) {
    iso_code = undefined;
  } else if (iso_code_format.test(req.query.iso_code)) {
    iso_code = iso_code.split(",");
    // console.log("formatted iso code is: ", iso_code)
  } else {
    error["iso_code"] = {
      message: "iso_code does not respect the {AAA,AAA,...} format",
    };
  }

  // year FORMATTING
  const year_format_list = new RegExp("^-?\\d+(?:,-?\\d+)*$");
  const year_format_range = new RegExp("^(-?\\d+)-(-?\\d+)$");
  let year_type_range = false;
  let year = req.query.year;
  let year_from = undefined;
  let year_to = undefined;
  // console.log("raw year is:", year)
  if (!year) {
    year = undefined;
  } else if (year_format_list.test(year)) {
    year = year.split(",");
    // console.log("formatted list year is:", year)
  } else if (year_format_range.test(year)) {
    let range = year_format_range.exec(year).slice(1);
    year_from = Math.min(...range);
    year_to = Math.max(...range);
    year_type_range = true;
    // console.log("formatted range year is:", year_from, year_to)
  } else {
    year = undefined;
    error["year"] = {
      message:
        "year does not respect the {YYYY,YYYY,...} or {YYYY-YYYY} format",
    };
  }

  // Initiating query build
  let formatted_query = {
    iso_code: iso_code
      ? {
          $in: iso_code,
        }
      : undefined,
    year: year
      ? year_type_range
        ? {
            $gt: year_from,
            $lt: year_to,
          }
        : {
            $in: year,
          }
      : undefined,
  };
  Object.keys(formatted_query).forEach((key) =>
    formatted_query[key] === undefined ? delete formatted_query[key] : {}
  );
  console.log(formatted_query, filter);
//  console.log("la stringa di connessione e':", process.env.CONNECTION_STRING)
  filter.push("-_id");
  Api.find(formatted_query, filter).sort().exec((query_error, db_data) => {
      console.log("received response from db")
      if (query_error) {
//        console.log("error 503 when sending")
        res.status(503).send(query_error);
      } else if (Object.keys(error).length > 0) {
//        console.log("error 400 when sending")
        res.status(400).send(error);
      } else {
//        console.log("sending data to user");
        const equals = (a, b) => {
         return a.length === b.length && a.every((v, i) => v === b[i])
        }

        filter.pop() // to delete -_id
        if(filter.length)
          db_data.forEach( (state,index) => {
            //console.log(Object.values(state))
            let dataKeys = Object.keys(Object.values(state)[Object.values(state).length - 1])
            if(!equals(dataKeys,filter)) db_data.splice(index,1)
          })

        res.status(200).json(db_data);
      }
    });
});

module.exports = router;
