// Import package 
const grpc = require('@grpc/grpc-js');
var protoLoader = require('@grpc/proto-loader');

// Define Proto path 
const PROTO_PATH = './mahasiswa.proto';

const options = {
  keepCase: true,
  longs: String,
  enums: String,
  defaults: true,
  oneofs: true,
}

var packageDefinition = protoLoader.loadSync(PROTO_PATH, options);

// Load Proto 
const mahasiswaProto = grpc.loadPackageDefinition(packageDefinition);

const server = new grpc.Server();

// Dummy data 
let mahasiswa = {
    mahasiswa: [
      {
        id: "1",
        nama: "Melon",
        nrp: "1234",
        nilai: 59
      },
      {
        id: "2",
        nama: "Molen",
        nrp: "5678",
        nilai: 60
      }
    ]
}

server.addService(mahasiswaProto.MahasiswaService.service, {
  getAll: (_, callback) => {
    callback(null, mahasiswa);
  }
})

// Start server 
server.bindAsync(
  "127.0.0.1:50051",
  grpc.ServerCredentials.createInsecure(),
  (error, port) => {
    console.log("Server running at http://127.0.0.1:50051");
    server.start();
  }
)