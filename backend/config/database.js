import { connect } from "mongoose";

const connectDatabase = () => {
  connect(process.env.DB_LOCATION, {
    autoIndex: true,
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
    .then((data) => {
      console.log(`Mongodb connected with server: ${data.connection.host}`);
    })
    .catch((err) => console.error("MongoDB connection error:", err));
};

export default connectDatabase;
