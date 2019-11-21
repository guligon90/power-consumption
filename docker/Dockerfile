# base image
FROM node:12-alpine

# Set timezone
ARG TZ
RUN apk add --no-cache tzdata \
    && ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

RUN apk add --no-cache yarn

ENV APP_ROOT /power-consumption

WORKDIR $APP_ROOT

COPY ["./package.json", "./yarn.lock", "./"]
RUN yarn install --network-concurrency 1 && \
    yarn cache clean

COPY ./src ./

EXPOSE 3100

CMD ["yarn", "run", "start"]
