FROM node:16
WORKDIR /usr/src/app

# Update aptitude with new repo
RUN apt-get update

# Install software 
RUN apt-get install -y git
# Download the source code
RUN git clone https://github.com/IMBeniamin/inquinapi.git ./
# Run the package
RUN npm ci --only=production
COPY . .
EXPOSE 80
ENV NODE_ENV production
CMD ["npm", "start"]