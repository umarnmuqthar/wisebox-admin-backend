FROM --platform=linux/amd64 node:16-alpine

# Create app directory
WORKDIR /usr/src/app

# RUN apk add --update --no-cache python3 make gcc libsass g++
RUN apk add --update --no-cache python3 make gcc libsass g++ && ln -sf python3 /usr/bin/python
RUN python3 -m ensurepip
RUN pip3 install --no-cache --upgrade pip setuptools

RUN apk add --no-cache tzdata
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY package.json ./
COPY yarn.lock ./

RUN yarn install
# If you are building your code for production
# RUN npm ci --only=production

# Bundle app source
COPY . .

ENV NODE_ENV=development
ENV DEBUG=app:*
ENV PORT=8080

EXPOSE 8080
CMD [ "node", "index.js" ]
