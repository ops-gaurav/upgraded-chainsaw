# Upgraded Chainsaw

### Description
sample project of a dummy shopping website.

### Installation
* clone the repository using <br/>
`git clone https://github.com/sharma02gaurav/upgraded-chainsaw.git`
* Install nodejs and bower dependencies using 
`npm install`
* To run the server use `npm start`

### Database data
You'll also need an admin for a website. You can import admin
using the following json file.<br/>
* Go into the project directory `cd upgraded-chainsaw`.
* Make sure your `mongod` process is running.
* import the database using the following command <br/>
`mongorestore --archive < db_dump`

*Make sure have your `mongod` process running*

### Developer
* Use `gulp scripts` to minify the javascript files.
