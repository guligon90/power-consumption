"use strict";

const validation = require("./validation");

const BAD_FORMAT_TEST_CASES = [
  {
    description: "empty query parameters",
    queryParams: {},
    expected: {
      message: "You must specify the APi parameters in a query string format."
    }
  },
  {
    description: "parameters with wrong format",
    queryParams: {
      startTimestamp: "2019-01-01 234:32",
      endTimestamp: "2019-01-01FOO",
      minPower: "54e",
      maxPower: "-s3",
      minuteStep: "4r"
    },
    expected: [
      "The startTimestamp parameter must be in the format YYYY-MM-DD or YYYY-MM-DD HH:MM.",
      "The endTimestamp parameter must be in the format YYYY-MM-DD or YYYY-MM-DD HH:MM.",
      "The minPower parameter must be a number.",
      "The maxPower parameter must be a number.",
      "The minuteStep parameter must be a positive integer."
    ]
  },
  {
    description: "invalid datetime and power ranges",
    queryParams: {
      startTimestamp: "2019-01-01 12:35",
      endTimestamp: "2019-01-01 09:48",
      minPower: "3000",
      maxPower: "2000",
      minuteStep: "-3"
    },
    expected: [
      "The minuteStep parameter must be a positive integer.",
      "The ending datetime must be greater than the starting datetime.",
      "The maximum power must be greater than the minimum power."
    ]
  },
  {
    description: "invalid date range",
    queryParams: {
      startTimestamp: "2019-02-27",
      endTimestamp: "2019-01-13"
    },
    expected: [
      "The ending datetime must be greater than the starting datetime."
    ]
  }
];

describe("Validation module unit tests", () => {
  it("Should return an empty query parameter object", () => {
    const reqQuery = {
      foo: "foo",
      bar: "bar"
    };

    const queryParams = validation.getQueryParams(reqQuery);
    expect(queryParams).toStrictEqual({});
  });

  it("Should return only an object with the pre-defined API filters", () => {
    const reqQuery = {
      foo: "foo",
      bar: "bar",
      startTimestamp: "2019-01-01 00:00",
      endTimestamp: "2019-12-01 23:59",
      minPower: 3000,
      maxPower: 4000,
      minuteStep: 3
    };

    const queryParams = validation.getQueryParams(reqQuery);
    delete reqQuery.foo;
    delete reqQuery.bar;
    expect(queryParams).toStrictEqual(reqQuery);
  });

  BAD_FORMAT_TEST_CASES.forEach(testCase => {
    it(`Should return a list of messages for ${testCase.description}`, () => {
      const messages = validation.validateQueryParams(testCase.queryParams);
      expect(messages).toStrictEqual(testCase.expected);
    });
  });
});
