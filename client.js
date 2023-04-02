const grpc = require('grpc');
const protoLoader = require('@grpc/proto-loader');
const readline = require('readline');

const packageDefinition = protoLoader.loadSync('./passenger.proto', {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true
});

const crudProto = grpc.loadPackageDefinition(packageDefinition).crud;
const client = new crudProto.CrudService('localhost:50051', grpc.credentials.createInsecure());

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

//print only
function printPassenger(data) {
  console.log(`bookingID: ${data.bookingID}`);
  console.log(`name: ${data.name}`);
  console.log(`address: ${data.address}`);
  console.log(`Phone Number: ${data.phonenumber}`);
  console.log(`email: ${data.email}\n`);
}

//create
function createPassenger() {
  rl.question('Name: ', (name) => {
    rl.question('Address: ', (address) => {
      rl.question('Phone Number (11 to 12 digits): ', (phonenumber) => {
        if (!/^\d{11,12}$/.test(phonenumber)) {
          console.log('Phone number must contains at least 11 digits.');
          console.log('error! please recreate.');
          mainMenuLoop();
          return;
        }
        rl.question('Email: ', (email) => {
          client.createPassenger({ name, address, phonenumber, email }, (err, data) => {
            if (err) {
              console.error(err);
              return;
            }
            console.log(`Data succesfully added:\n`);
            printPassenger(data);
            mainMenuLoop();
          });
        });
      });
    });
  });
}

//read
function readPassenger() {
  rl.question('enter your booking id: ', (bookingID) => {
    client.readPassenger({ bookingID }, (err, data) => {
      if (err) {
        if (err.code === grpc.status.NOT_FOUND) {
          console.log('Data not found for the provided booking ID.');
        } else {
          console.error('An error occurred:', err);
        }
        mainMenuLoop();
        return;
      }
      console.log(`Here is your data based on your booking id:\n`);
      printPassenger(data);
      mainMenuLoop();
    });
  });
}


//update
function updatePassenger() {
  rl.question('Enter passenger booking ID: ', (bookingID) => {
    client.readPassenger({ bookingID }, (err, data) => {
      if (err) {
        console.error(err);
        mainMenuLoop();
        return;
      }
      if (!data.bookingID) {
        console.log('Booking ID not found. Please try again.');
        updatePassenger();
        return;
      }
      console.log('Current passenger details:');
      printPassenger(data);
      rl.question('Enter new name: ', (name) => {
        rl.question('Enter new address: ', (address) => {
          rl.question('Enter new phone number (11 to 12 digits): ', (phonenumber) => {
            if (!/^\d{11,12}$/.test(phonenumber)) {
              console.log('Phone number must be at least 11 digits. Please try again.');
              updatePassenger();
              return;
            }
            rl.question('Enter new email: ', (email) => {
              client.updatePassenger({ name, address, phonenumber, email, bookingID }, (err, data) => {
                if (err) {
                  console.error(err);
                  return;
                }
                console.log('Passenger details updated:');
                printPassenger(data);
                mainMenuLoop();
              });
            });
          });
        });
      });
    });
  });
}


//delete
function deletePassenger() {
  rl.question('enter your bookingID that you want to delete: ', (bookingID) => {
    client.deletePassenger({ bookingID }, (err, data) => {
      if (err) {
        if (err.message === 'Data not found') {
          console.log(`Passenger with ${bookingID} bookingID was not found.\n`);
        } else  {
          console.error(err);
        }
        mainMenuLoop();
        return;
      }
      else {
      console.log(`Passenger with ${bookingID} bookingID is succesfully deleted.\n`);
      mainMenuLoop();
  }});
  });
}


function mainMenu() {
  console.log(`1. Add Passenger`);
  console.log(`2. Find Passenger`);
  console.log(`3. Change Passenger Details`);
  console.log(`4. Delete Passenger`);
  console.log(`5. Exit`);
}

  const options = {
    '1': createPassenger,
    '2': readPassenger,
    '3': updatePassenger,
    '4': deletePassenger,
    '5': () => {
      rl.close();
    }
  };

  function handleOption(option) {
  const selectedOption = options[option];
  if (selectedOption) {
    selectedOption();
  } else {
    console.log('invalid');
  }
}

function mainMenuLoop() {
  mainMenu();
  rl.question('How can we help you : ', (option) => {
    if (option === '5') {
      rl.close();
    } else {
      handleOption(option);
    }
  }); // <-- add this closing curly brace
}


mainMenuLoop();
  
