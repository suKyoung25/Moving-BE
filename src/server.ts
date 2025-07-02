import figlet from "figlet";
import app from "./app";

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  figlet("Team4 Moving", (err, data) => {
    if (err) {
      console.log("Something went wrong with figlet");
      console.dir(err);
      return;
    }
    console.log(data || `Server started at port ${PORT}`);
  });
});
