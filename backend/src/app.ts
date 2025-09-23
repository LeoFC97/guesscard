import express from 'express';
import bodyParser from 'body-parser';
import { setRoutes } from './routes/mtgRoutes';
import cors from 'cors';


const app = express();
const PORT = process.env.PORT || 3001;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

// Swagger endpoint
setRoutes(app);

app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});