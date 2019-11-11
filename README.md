# Power Consumption API [WIP]
A Express microservice, running on Node.js, for generating random power (in watts) and energy consumption data (the latter in kWh), over a time period.

## Getting started
Make sure that you have the latest stable releases of [Git](https://git-scm.com/), [Docker](https://docs.docker.com/), [Docker Compose](https://docs.docker.com/compose/) and [Node.js](https://nodejs.org/) installed in your system.
With the necessary installations completed, open a terminal, and execute the following commands:

```
$ git clone https://github.com/guligon90/power-consumption.git
$ cd power-comsumption/
$ docker-compose -f docker/docker-compose.yml build
$ docker-compose up
```

The output of the last command should be similar to the following:

```
Starting power-consumption ... 
Starting power-consumption ... done
Attaching to power-consumption
power-consumption    | yarn run v1.19.1
power-consumption    | $ nodemon ./src/server.js 3000
power-consumption    | [nodemon] 1.19.4
power-consumption    | [nodemon] to restart at any time, enter `rs`
power-consumption    | [nodemon] watching dir(s): *.*
power-consumption    | [nodemon] watching extensions: js,mjs,json
power-consumption    | [nodemon] starting `node ./src/server.js 3000`
power-consumption    | Power consumption API listening at port 3000
```

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

where the power $P_{k}$, $k\in\{1,...,n\}$ are in watts and the time step $\Delta t$ are in minutes.

### Routing
Initially, it was meant to be a simple REST microservice for testing, with only one endpoint:
```
GET /api/v1/consumption/**
```
#### Query string parameters

| Name             |      Type         |                      Description                         | Default Value |
|------------------|:-----------------:|:---------------------------------------------------------|:--------------|
| `startTimestamp` |    `string`       | Represents a date/time in the format `yyyy-mm-dd hh:mm`  |      N/A      |
| `endTimestamp`   |    `string`       | Represents a date/time in the format `yyyy-mm-dd hh:mm`  |      N/A      |
| `minPower`       |    `number`       | The lowest value of active (real) power, in watts [W],<br>for random generation, simulating some eletrical device.   | `0.1`  |
| `maxPower`       |    `number`       | The highest value of active (real) power, in watts [W],<br>for random generation, simulating some eletrical device.  | `10.0` |
| `minuteStep`     |    `integer`      | The step in minutes between randomly-generated power<br>values for a single day. | `5` |

#### Request example
* Request (using [Postman](https://www.getpostman.com/)):
  ```
  GET /api/v1/consumption/?startTimestamp=2019-11-09 15:23&minuteStep=2&endTimestamp=2020-11-11 16:18 HTTP/1.1
  Host: localhost:3000
  User-Agent: PostmanRuntime/7.19.0
  Accept: */*
  Cache-Control: no-cache
  Postman-Token: e4d8aa24-bfca-4b82-b1c5-beb28865bc81,92c84648-fafe-49e8-9206-7bd89b9bb20a
  Host: localhost:3000
  Accept-Encoding: gzip, deflate
  Connection: keep-alive
  cache-control: no-cache
  ```
* Response payload:
  ```
  [
      {
          "2019-11-09": {
              "powerValues": [
                  {
                      "15:23": 8.435762652240635
                  },
                  {
                      "15:25": 3.5630009133972194
                  },
                  {
                      "15:27": 4.804120322135856
                  },
                  {
                      "15:29": 9.189577617423351
                  },
                  {
                      "15:31": 2.4441798263254024
                  },
                  ...
              ],
              "cumulativeKWh": [
                  {
                      "15:00": 0.003172020596257984
                  },
                  {
                      "16:00": 0.008847385261002778
                  },
                  {
                      "17:00": 0.013310425162393582
                  }
              ]
          }
      },
      ...
  ]
  ```