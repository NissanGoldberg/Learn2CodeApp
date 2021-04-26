FROM openjdk:17-jdk-alpine3.13


WORKDIR /app

COPY ./ ./
#RUN npm install --production
RUN mkdir /users_data
RUN apk add --update nodejs npm
RUN npm install
# RUN npm install --prefix ./online-coding/
# RUN npm run build --prefix online-coding
RUN apk add --no-cache bash
VOLUME /users_data


ENV PORT = 3000
EXPOSE 3000
EXPOSE 9000

ENV ADMIN_TOKEN = admin1234

CMD [ "npm", "start"]
