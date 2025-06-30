import figlet from "figlet";
import express, { NextFunction, Request, Response} from 'express'
import cors from 'cors'

const app = express();
const PORT = 9000

app.use(cors());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

app.get('/', (req, res) => {
    res.send("Hello, welcome to the Moving Platform Express Server.")
})

app.use((req, res) => {
    res.status(404).send('Page Not Found.');
});

app.use((
  err: any,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Server Error : ', err);
  res.sendStatus(500);
});

app.listen(PORT, () => {
  figlet("Team4 Server Started", (err, data) => {
    if (err) {
      console.log("Something went wrong with figlet");
      console.dir(err);
      return;
    }
    console.log(data);
  });
});