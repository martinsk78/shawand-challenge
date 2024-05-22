import express from "express";
import cors from "cors";
import multer from "multer";
import csvToJson from "convert-csv-to-json";

const app = express();
const port = 3000;

const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

let userData: Array<Record<string, string>> = [];

app.use(cors());

app.post("/api/files", upload.single("file"), async (req, res) => {
  //1. Extract file from request
  const { file } = req;
  //2. Validate that we have file
  if (!file) {
    return res.status(500).json({ message: "File is required" });
  }
  //3. Validate the mimetype (csv)
  if (file.mimetype !== "text/csv") {
    return res.status(500).json({ message: "File must be CSV" });
  }
  let json: Array<Record<string, string>> = [];
  try {
    //4. Transfrom el File (Buffer) to String
    const rawCsv = Buffer.from(file.buffer).toString("utf-8");
    console.log(rawCsv);
    //5. Tranform string to JSON
    json = csvToJson.fieldDelimiter(",").csvStringToJson(rawCsv);
  } catch (error) {
    res.status(500).json({ message: "Error parsing the file" });
  }
  userData = json;
  //6. Save the JSON to db (or memory)
  //7. Return 200 with the message and the JSON
  return res
    .status(200)
    .json({ data: json, message: "El archivo se cargo correctamente" });
});

app.get("/api/users", async (req, res) => {
  //1. Extract the query param 'q' from the request
  const { q } = req.query;
  //2. Validate that we have the query param
  if (!q) {
    return res.status(500).json({
      message: "Query param is required",
    });
  }
  if (Array.isArray(q)) {
    res.send(500).json({ message: "Query param must be a string" });
  }
  //3. Filter the data from the db (or memory) with the query param
  const search = q.toString().toLowerCase();
  console.log(userData);
  const filteredData = userData.filter((row) => {
    return Object.values(row).some((value) =>
      value.toLocaleLowerCase().includes(search),
    );
  });

  //4. Return 200 with the filtered data

  return res.status(200).json({ data: filteredData });
});

app.listen(port, () => {
  console.log(`Server is running at http//localhost:${port}`);
});
