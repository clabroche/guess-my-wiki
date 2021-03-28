FROM alpine:3.13 as builder
RUN apk --no-cache add gcc g++ make python3 nodejs npm
WORKDIR /guessMyWiki
COPY ./server .
RUN rm -rf .git && rm -rf node_modules && npm i --production

FROM alpine:3.13
RUN apk --no-cache add nodejs
WORKDIR /guessMyWiki
COPY --from=builder /guessMyWiki .
CMD ["node", "bin/www"]
