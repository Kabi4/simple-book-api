const express = require("express");
const fs = require("fs");
const util = require("util");
const app = express();

app.use(express.json());

const readFile = util.promisify(fs.readFile);
const writeFile = util.promisify(fs.writeFile);

const writeAFile = async (data) => {
  await writeFile(`${__dirname}/books.json`, JSON.stringify(data));
};

const readAFile = async () => {
  const booksBuffer = await readFile(`${__dirname}/books.json`);
  const data = JSON.parse(booksBuffer.toString());
  return data;
};

app.get("/api/v1/books/", async (req, res) => {
  const data = await readAFile();
  res.send({ data });
});

app.get("/api/v1/books/:id", async (req, res) => {
  let data = await readAFile();
  const id = req.params.id;
  const index = data.findIndex((ele) => ele.id == id);
  if (index === -1)
    return res.status(404).send({ message: "No book with id to return!" });
  res.send(data[index]);
});

app.post("/api/v1/books", async (req, res) => {
  const validity = ["name", "description", "gener"];
  const body = req.body;
  const newObject = {};
  validity.forEach((ele) => {
    if (!body[ele]) {
      return res
        .status(404)
        .send({ message: "All required param not provided." });
    }
    newObject[ele] = body[ele];
  });
  const data = await readAFile();
  const id = data.length === 0 ? 0 : parseInt(data[data.length - 1].id) + 1;
  newObject.id = id;
  data.push(newObject);
  await writeAFile(data);
  res.send(data);
});

app.delete("/api/v1/books/:id", async (req, res) => {
  let data = await readAFile();
  const id = req.params.id;
  const index = data.findIndex((ele) => ele.id == id);
  if (index === -1)
    return res.status(404).send({ message: "No book with id to delete!" });
  data.splice(index, 1);
  await writeAFile(data);
  res.status(204).send();
});

app.patch("/api/v1/books/:id", async (req, res) => {
  let data = await readAFile();
  const id = req.params.id;
  const index = data.findIndex((ele) => ele.id == id);
  if (index === -1)
    return res.status(404).send({ message: "No book with id to update!" });
  const validity = ["name", "description", "gener"];
  const body = req.body;
  validity.forEach((ele) => {
    if (body[ele]) {
      data[index][ele] = body[ele];
    }
  });
  await writeAFile(data);
  res.status(201).send(data[index]);
});

module.exports = app;
