"use strict";
/**
 * FOR ARN passing, requires Credentials for invocation,
 * and in the process stores AWS credentials on Your local DB.
 * But saves the hassle and dangers of an Open HTTP Trigger.
 */
Object.defineProperty(exports, "__esModule", { value: true });
exports.invokeLambda = void 0;
var assert_1 = require("assert");
// Load the SDK and view the APIs offered
var aws_sdk_1 = require("aws-sdk");
var client_lambda_1 = require("@aws-sdk/client-lambda");
// console.log(Object.getOwnPropertyNames(Lambda.prototype));
function parseLambdaARN(ARN) {
  try {
    // https://docs.aws.amazon.com/general/latest/gr/aws-arns-and-namespaces.html
    var ARNComponents = ARN.split(":");
    assert_1.default(
      (ARNComponents.length == 7 || ARNComponents.length == 8) &&
        ARNComponents[0] == "arn" &&
        ARNComponents[1] == "aws" &&
        ARNComponents[2] == "lambda" &&
        ARNComponents[5] == "function"
    );
    var region = ARNComponents[3];
    var accountID = ARNComponents[4]; // might need for validating credentials
    var functionName = ARNComponents[6];
    var qualifier = "";
    if (ARNComponents.length == 8) {
      qualifier = ARNComponents[7];
    } else if (functionName.includes("/")) {
      qualifier = functionName.split("/")[1];
      functionName = functionName.split("/")[0];
    }
    var retComponents = {
      region: region,
      accountID: accountID,
      functionName: functionName,
      qualifier: qualifier,
    };
    return retComponents;
  } catch (_a) {
    console.error("ARN not suitably parsed");
  }
}
function invokeLambda(ARN, Payload, accessKeyID, secretAccessKey) {
  try {
    assert_1.default(accessKeyID.length >= 16 && accessKeyID.length <= 128);
    // https://docs.aws.amazon.com/IAM/latest/APIReference/API_AccessKey.html
    var AWScredentials = new aws_sdk_1.default.Credentials(
      accessKeyID,
      secretAccessKey
    );
    var parsedARN = parseLambdaARN(ARN);
    var lambda = new client_lambda_1.Lambda({
      apiVersion: "2015-03-31",
      region: parsedARN["region"],
      credentials: AWScredentials,
    });
    var invokeParams = {
      FunctionName: parsedARN["functionName"],
      InvocationType: "Event",
      Payload: Payload,
    };
    if (parsedARN["qualifier"] != "") {
      invokeParams["Qualifier"] = parsedARN["qualifier"];
    }
    lambda.invoke(invokeParams, function (err, data) {
      if (err) {
        console.error(err, err.stack); // an error occurred
      } else {
        console.log(data); // successful response
      }
    });
  } catch (_a) {
    console.error("The Lambda Function was not invoked properly.");
  }
}
exports.invokeLambda = invokeLambda;