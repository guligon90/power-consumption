# Power Consumption Simulation API [WIP]
A Express microservice, running on Node.js, for generating random power (in watts) and energy consumption data (the latter in kWh), over a time period.

## Getting started
Make sure that you have installed in your system the latest stable releases of the following tools:
* [Git](https://git-scm.com/);
* [Docker](https://docs.docker.com/);
* [Docker Compose](https://docs.docker.com/compose/);
* [Node.js](https://nodejs.org/);
* [Yarn](https://yarnpkg.com/lang/en/).

With the necessary installations completed, open a terminal, and execute the following commands:

```
$ git clone https://github.com/guligon90/power-consumption.git
$ cd power-comsumption/
$ yarn install --save-dev
$ docker-compose -f docker-compose.yml build --pull
$ docker-compose up -d
$ docker-compose logs --follow
```

The output of the last command should be similar to the following:

```
Attaching to power-consumption-api
power-consumption-api | yarn run v1.16.0
power-consumption-api | $ node ./src/server.js
power-consumption-api | Power consumption API listening at port 3100
```

To quit the docker logging stream, just press `Ctrl+C`.

## API documentation

### Background

Mathematically, power and energy are related as follows:

$$P(t) := \frac{dE}{dt} \Leftrightarrow E(t) = E(t_0) + \int_{t_0}^t P(\tau)d\tau$$

In this API, power values are generated in a constant minute step basis, the integral above is numerically evaluated by means
of the trapezoidal scheme, i.e.,

$$
E[\text{kWh}] \approx 
    \left( \frac{1}{10^3}\right )
    \times\left( \frac{1}{60}\right)
    \times\sum_{k=1}^{n}\frac{\left(P_{k} + P_{k-1}\right)\Delta t}{2}
$$

where the power values $P_{k}$, $k\in\{1,...,n\}$ are in watts and the time step $\Delta t$ is in minutes.

### Routing
Initially, it was meant to be a simple REST microservice for testing, with only one endpoint:
```
GET /api/v1/consumption/?query_string
```

#### Environment variables

Some of the default values for the query string parameters, as well as some Node.js server settings, ate defined in some environment variables, set up
in `docker/variables.env`. Such variables are:

| Name                      |      Type         |                      Description                                          | Value         |
|---------------------------|:-----------------:|:--------------------------------------------------------------------------|:--------------|
| `NODE_ENV`                |    `string`       | The environment in which Node.js server is operating                      | `production, development` |
| `NODE_PORT`               |    `integer`      | The Node.js server port for HTTP requests                                 | `3100`        |
| `TYPICAL_DAY_START_TIME`  |    `string`       | The start time for a (typical) day simulation, in the format `hh:mm`      | `08:00`       |
| `TYPICAL_DAY_END_TIME`    |    `string`       | The finish time for a (typical) day simulation, in the format `hh:mm`     | `18:00`       |
| `DEFAULT_MIN_POWER_WATTS` |    `number`       | Default value for `minPower` query string parameter                       | `1.0`         |
| `DEFAULT_MAX_POWER_WATTS` |    `number`       | Default value for `maxPower` query string parameter                       | `10.0`        |
| `DEFAULT_MINUTE_STEP`     |    `integer`      | Default value for `minuteStep` query string parameter                     | `5`           |
| `DEFAULT_DECIMAL_DIGITS`  |    `integer`      | Default number of decimal digits, for floating point rounding purposes    | `5`           |

#### Query string parameters

| Name             |      Type         |                      Description                                                                                       | Default Value                 |
|------------------|:-----------------:|:-----------------------------------------------------------------------------------------------------------------------|:------------------------------|
| `startTimestamp` |    `string`       | Represents a date/time in the format `yyyy-mm-dd hh:mm`                                                                |  `TYPICAL_DAY_START_TIME`*    |
| `endTimestamp`   |    `string`       | Represents a date/time in the format `yyyy-mm-dd hh:mm`                                                                |  `TYPICAL_DAY_END_TIME`*      |
| `minPower`       |    `number`       | The lowest value of active (real) power, in watts [W],<br>for random generation, simulating some eletrical device.     | `DEFAULT_MIN_POWER_WATTS`     |
| `maxPower`       |    `number`       | The highest value of active (real) power, in watts [W],<br>for random generation, simulating some eletrical device.    | `DEFAULT_MAX_POWER_WATTS`     |
| `minuteStep`     |    `integer`      | The step in minutes between randomly-generated power<br>values for a single day.                                       | `DEFAULT_MINUTE_STEP`         |

[*] Naturally, the default value just apply for the time. The date specification is mandatory.

#### Request example

Here is the [cURL](https://curl.haxx.se/) code generated by [Postman](https://www.getpostman.com/):
```
curl -X GET \
    'http://localhost:3000/api/v1/consumption/?maxPower=4500&minPower=3000&startTimestamp=2019-11-09%2007:10&minuteStep=3&endTimestamp=2020-11-11%2016:31' \
    -H 'Accept: */*' \
    -H 'Accept-Encoding: gzip, deflate' \
    -H 'Cache-Control: no-cache' \
    -H 'Connection: keep-alive' \
    -H 'Host: localhost:3000' \
    -H 'Postman-Token: [SOME_GENERATED_TOKEN]' \
    -H 'User-Agent: PostmanRuntime/7.19.0' \
    -H 'cache-control: no-cache'
```

As for the response payload, the generated data is structured as follows:
```
[
    {
        // Generated data for a specific day
        "yyyy-mm-dd": {
            // Power in Watts,
            "powerValues": [
                "hh:mm": 123.456,
                ...
            ],
            // Energy consumption in kWh
            "kWhValues": {
                // Total energy for each hour
                "hourly": [
                    "hh:mm": 789.10,
                    ...
                ],
                // Cumulative sum of the 'kWhValues' array
                "cumulative": [
                    "hh:mm": 789.10,
                    ...
                ],
            }
        }
    },
    ...
]
```

The output for the example in question is:
```
[
    {
        "2019-11-09": {
            "powerValues": [
                {
                    "07:10": 4108.60603
                },
                {
                    "07:13": 3313.47811
                },
                ...
                {
                    "17:55": 4430.45599
                },
                {
                    "17:58": 3980.75259
                }
            ],
            "kWhValues": {
                "hourly": [
                    {
                        "07:00": 2.98224
                    },
                    {
                        "08:00": 3.46238
                    },
                    ...
                    {
                        "16:00": 3.6808
                    },
                    {
                        "17:00": 3.61168
                    }
                ],
                "cumulative": [
                    {
                        "07:00": 2.98224
                    },
                    {
                        "08:00": 6.44462
                    },
                    ...
                    {
                        "16:00": 35.2594
                    },
                    {
                        "17:00": 38.87108
                    }
                ]
            }
        }
    },
    ...
]
```
