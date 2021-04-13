require("dotenv").config({ path: "./.env" });
const lambdaDB = require("../models/lambdaDB");
const ObjectID = require("mongodb").ObjectID;
const { exec } = require("child_process");
var fs = require("fs");

const ymlContent = (service, runtime, handlerFile, handler, name) => {
  handlerFile = handlerFile.split(".")[0];
  let serviceName = `l${service}`;
  let newName = name.split(" ").join("");
  return `
    service: ${serviceName}
    
    frameworkVersion: '2'
    
    provider:
      name: aws
      runtime: ${runtime}
    
    functions:
      helloWorld:
        handler: ${handlerFile}.${handler}
        events:
          - http:
              path: ${newName}
              method: get
              cors: true
    `;
};

const createDir = (dirPath) => {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirPath, { recursive: true }, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
};

const moveFile = (file, dirPath) => {
  return new Promise((resolve, reject) => {
    file.mv(dirPath, (err) => {
      if (err) {
        reject(err);
      }
      resolve(true);
    });
  });
};

const writeYml = (dirPath, content) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(dirPath, content, function (err, data) {
      if (err) {
        reject(err);
      }
      resolve(data);
    });
  });
};

exports.postLambda = async (req, res) => {
  if (
    !req.body.lambdaName ||
    !req.body.handlerName ||
    !req.body.runtime ||
    !req.files.lambdaHandlerFile ||
    !req.files.requirementFile
  ) {
    return res.status(406).json({ message: "Not Acceptable" });
  }
  try {
    let lambdaHandlerFile = req.files.lambdaHandlerFile;
    let requirementFile = req.files.requirementFile;
    let lambdaHandlerFileName = req.files.lambdaHandlerFile.name;
    let requirementFileName = req.files.requirementFile.name;
    let runtime = req.body.runtime;
    let handlerName = req.body.handlerName;
    let lambdaName = req.body.lambdaName;

    const lambda = new lambdaDB({
      name: lambdaName,
      user: req.user.id,
      handlerName: handlerName,
      runtime: runtime,
      status: "creating",
    });

    const newLambda = await lambda.save();

    const dirPath = `${process.env.DATA_PATH}/${newLambda._id}`;
    const handlerFilePath = `${dirPath}/${lambdaHandlerFileName}`;
    const requirementFilePath = `${dirPath}/${requirementFileName}`;
    const ymlFilePath = `${dirPath}/serverless.yml`;

    createDir(dirPath)
      .then(async (value) => {
        await moveFile(lambdaHandlerFile, handlerFilePath);
        await moveFile(requirementFile, requirementFilePath);
        await writeYml(
          ymlFilePath,
          ymlContent(
            lambda._id,
            runtime,
            lambdaHandlerFileName,
            handlerName,
            lambdaName
          )
        );

        newLambda.functionPath = handlerFilePath;
        newLambda.requirementsPath = requirementFilePath;
        let type = "";
        if (runtime === "nodejs14.x" || runtime === "nodejs12.x") {
          type = "node";
        } else if (runtime === "python3.8") {
          type = "py";
        }
        newLambda.save().then((result) => {
          const command = `${process.env.SERVERLESS_SCRIPT} ${result._id} ${type} &`;
          exec(command, (error, stdout, stderr) => {
            if (error) {
              console.error(`exec error: ${error}`);
            }
          });
          return res.status(201).json(result);
        });
      })
      .catch((err) => {
        throw err;
      });
  } catch (err) {
    //Internal Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.getLambda = async (req, res) => {
  try {
    const allLambdas = await lambdaDB.find({ user: req.user.id });
    const lambdas = await allLambdas.map((lambda) => {
      return {
        id: lambda._id,
        name: lambda.name,
        user: lambda.user,
        status: lambda.status,
        url: lambda.url,
        runtime: lambda.runtime,
      };
    });
    lambdas.reverse();
    res.status(200).json(lambdas);
  } catch (err) {
    // Server Error
    console.log(err.message);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

exports.setLambdaUrl = async (req, res) => {
  try {
    const key = req.params.key;
    if (key !== process.env.KEY) {
      return res.status(403).json({ message: "Forbiden" });
    }
    const id = req.query.id;
    const status = req.query.status;
    const url = req.query.url;
    if (!ObjectID.isValid(id)) {
      return res.status(404).json({ message: "Orchestrator not found" });
    }
    let lambda = await lambdaDB.findById(id);
    if (!lambda) {
      return res.status(404).json({ message: "Not Found" });
    }
    lambda.status = status;
    if (url !== "") {
      lambda.url = url;
    }
    lambda.save().then((result) => {
      return res.status(200).json(result);
    });
  } catch (err) {
    console.log(err);
    return res.status(500).json({ message: "Internal Server Error" });
  }
};
