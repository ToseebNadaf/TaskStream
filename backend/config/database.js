import { connect } from "mongoose";

const connectDatabase = () => {
  connect(process.env.DB_LOCATION, {
    autoIndex: true,
  }).then((data) => {
    console.log(`Mongodb connected with server: ${data.connection.host}`);
  });
};

export default connectDatabase;
