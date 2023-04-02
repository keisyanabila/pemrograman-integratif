const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const sqlite3 = require('sqlite3').verbose();
const protoDescriptor = grpc.loadPackageDefinition(packageDefinition);
const crudProto = grpc.loadPackageDefinition(packageDefinition).crud;
const server = new grpc.Server();
const db = new sqlite3.Database('./data.db');

const packageDefinition = protoLoader.loadSync('./passenger.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

  server.addService(crudProto.CrudService.service, {
    createPassenger: createPassenger,
    readPassenger: readPassenger,
    updatePassenger: updatePassenger,
    deletePassenger: deletePassenger

//CREATE
function createPassenger(call, callback) {
  const passenger = call.request;
  passenger.bookingID = Math.floor(Math.random() * 1000000000);
  
  db.run('INSERT INTO Passenger (bookingID, name, address, phonenumber, email) VALUES (?, ?, ?, ?, ?)', [passenger.bookingID, passenger.name, passenger.address, passenger.phonenumber, passenger.email], function (err) {
    if (err) {
      callback(err);
      return;
    }
    callback(null, passenger);
  });
}

//READ
function readPassenger(call, callback) {
  const targetBookingID = call.request.bookingID;
  
  db.get('SELECT * FROM Passenger WHERE bookingID = ?', [targetBookingID], function (err, row) {
    if (err) {
      callback(err);
      return;
    }

    if (!row) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Data not found for the provided booking ID.',
      });
      return;
    }
    
    callback(null, row);
  });
}



//UPDATE
function updatePassenger(call, callback) {
  const updatedPassenger = call.request;

  db.run('UPDATE Passenger SET name = ?, address = ?, phonenumber = ?, email = ? WHERE bookingID = ?', [updatedPassenger.name, updatedPassenger.address, updatedPassenger.phonenumber, updatedPassenger.email, updatedPassenger.bookingID], function (err) {
    if (err) {
      callback(err);
      return;
    }

    if (this.changes === 0) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Data not found for the provided booking ID.',
      });
      return;
    }

    callback(null, updatedPassenger);
  });
}


//DELETE
function deletePassenger(call, callback) {
  const targetBookingID = call.request.bookingID;

  db.run('DELETE FROM Passenger WHERE bookingID = ?', [targetBookingID], function (err) {
    if (err) {
      callback(err);
      return;
    }

    if (this.changes === 0) {
      callback({
        code: grpc.status.NOT_FOUND,
        details: 'Data not found for the provided booking ID.',
      });
      return;
    }

    callback(null, { bookingID: targetBookingID });
  });
}


server.bind('0.0.0.0:50051', grpc.ServerCredentials.createInsecure());
  console.log('gRPC server started');
  server.start();
