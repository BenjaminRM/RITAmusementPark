var port = process.env.PORT || 3000;
var http = require('http');
var fs = require('fs');
var html = fs.readFileSync('secondary.html');
var pg = require('pg');

var log = function(entry) {
    fs.appendFileSync('/tmp/sample-app.log', new Date().toISOString() + ' - ' + entry + '\n');
};

var server = http.createServer(function (req, res) {
    if (req.method === 'POST') {
        var body = '';

        req.on('data', function(chunk) {
            body += chunk;
        });

        req.on('end', function() {
            if (req.url === '/') {
                log('Received message: ' + body);
            } else if (req.url = '/scheduled') {
                log('Received task ' + req.headers['x-aws-sqsd-taskname'] + ' scheduled at ' + req.headers['x-aws-sqsd-scheduled-at']);
            }

            res.writeHead(200, 'OK', {'Content-Type': 'text/plain'});
            res.end();
        });
    } else {
        res.writeHead(200);
        res.write(html);
        res.end();
    }
});

function testDataConnection() {
    console.log('testDataConnection function!');
    //Database Connection test (Printed to logs in the Elastic Beanstalk Logs tab)
    var connection = new pg.Client({
        user: process.env.RDS_USERNAME,
        host: process.env.RDS_HOSTNAME,
        database: process.env.RDS_DB_NAME,
        password: process.env.RDS_PASSWORD,
        port: process.env.RDS_PORT,
    });
    connection.connect();

    // connection.query('SELECT NOW()', (err, res) => {
    //     console.log(err, res)
    //     connection.end()
    // })

    connection.query('SELECT nametest FROM users', (err, res) => {
        console.log("RESULT FROM QUERY: ", res);
        console.log("QUERY ERRORS: ", err);
        connection.end()
    })
}

// Listen on port 3000, IP defaults to 127.0.0.1
server.listen(port);

// Put a friendly message on the terminal
console.log('Server running at http://127.0.0.1:' + port + '/');
console.log('Testing additional message!');
console.log('TESTING EB CLI!');

testDataConnection();