import { React, useState, useEffect } from "react";
import Dropdown from "./Helpers/Dropdown";
import SmoothImage from "react-smooth-image";
import DeployImage from "../assets/static/deploy-image.svg";
import AvTimerIcon from "@material-ui/icons/AvTimer";
import Loader from "react-loader-spinner";
import notify from "./Helpers/Notification";
import { useHistory } from "react-router-dom";
import env from "react-dotenv";
import axios from "axios";
import { useSelector } from "react-redux";

const CreateLambda = () => {
  const [name, setName] = useState("");
  const [showLoader, setShowLoader] = useState(false);
  const [handlerName, setHandlerName] = useState("");
  const [handlerFile, setHandlerFile] = useState(null);
  const [requirementsFile, setRequirementsFile] = useState(null);
  const [runtime, setRuntime] = useState("python3.8");
  const onRuntimeChangeHandler = (status) => {
    setRuntime(status);
  };
  const history = useHistory();
  const userLogin = useSelector((state) => state.userLogin);

  const createLambdaHandler = async (e) => {
    e.preventDefault();
    setShowLoader(true);
    var formData = new FormData();
    formData.append("lambdaName", name);
    formData.append("handlerName", handlerName);
    formData.append("runtime", runtime);
    formData.append("lambdaHandlerFile", handlerFile, handlerFile.name);
    formData.append("requirementFile", requirementsFile, requirementsFile.name);
    // add validation
    axios
      .post(`${env.BACKEND_URL}/lambda`, formData, {
        headers: {
          Authorization: `Bearer ${userLogin.user.token}`,
        },
      })
      .then((res) => {
        if (res.status === 201) {
          notify("success", "Lambda Created!");
          setName("");
          setHandlerName("");
          setHandlerFile(null);
          setRequirementsFile(null);
          setShowLoader(false);
          setRuntime("python3.8");
          setShowLoader(false);
          history.push("/my-lambdas");
        }
      })
      .catch((err) => {
        notify("error", "Something Went Wrong!");
        setShowLoader(false);
        console.log(err);
      });
  };
  return (
    <div className="mt-20 flex-grow flex mx-8 sm:mx-16 justify-between py-8">
      <div className="w-full lg:w-1/2 flex flex-col md:flex-col ">
        <div className="bg-red ui-container py-0">
          <div className="mx-auto max-w-4xl ">
            <div className="flex justify-between flex-col md:flex-row items-baseline divide-y-4">
              <div>
                <h2 className="text-2xl font-bold focus:outline-none focus:shadow-outline">
                  Create Lambda
                </h2>
                <p className="mt-4 text-lg text-gray-500 font-medium">
                  Complete below fields to create a Lambda Function
                </p>
              </div>
            </div>
            <form onSubmit={createLambdaHandler}>
              <div className="mt-4 divide-y-2">
                <div className="flex flex-col question divide-y">
                  <div className="mb-4 py-2">
                    <div className="mb-4">
                      <label className="my-2 py-1 px-1 w-full font-semibold text-lg">
                        Lambda Name
                      </label>
                      <input
                        type="textarea"
                        name="lambda_name"
                        id="lambda_name"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your lambda name"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                      ></input>
                    </div>
                    <div className="mb-4">
                      <label className="flex flex-col my-1 py-1 px-1 w-full font-semibold text-lg">
                        <span>Handler Name</span>
                        <p className="text-sm font-medium text-gray-500">
                          Method in your function code that processes events.
                          More{" "}
                          <a
                            href="https://docs.aws.amazon.com/lambda/latest/dg/python-handler.html"
                            className="text-blue-500 underline"
                            target="_blank"
                          >
                            Here
                          </a>
                        </p>
                      </label>
                      <input
                        type="textarea"
                        name="handler_name"
                        id="handler_name"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your handler name"
                        required
                        value={handlerName}
                        onChange={(e) => {
                          setHandlerName(e.target.value);
                        }}
                      ></input>
                    </div>
                    <div className="mb-4">
                      <label className="my-2 py-1 px-1 w-full font-semibold text-lg">
                        Lambda Handler File
                      </label>
                      <input
                        type="file"
                        name="lambda_file"
                        id="lambda_file"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Upload file"
                        required
                        onChange={(e) => setHandlerFile(e.target.files[0])}
                      ></input>
                    </div>
                    <div className="mb-4">
                      <label className="flex flex-col my-1 py-1 px-1 w-full font-semibold text-lg">
                        <span>Requirements file</span>
                        <p className="text-sm font-medium text-gray-500">
                          requirements.txt for Python, package.json for Nodejs
                        </p>
                      </label>
                      <input
                        type="file"
                        name="requirements_file"
                        id="requirements_file"
                        className="mt-1 w-full py-2 rounded-lg px-5 focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Upload file"
                        required
                        onChange={(e) => {
                          setRequirementsFile(e.target.files[0]);
                        }}
                      />
                    </div>
                    <label className="flex flex-col my-1 py-1 px-1 w-full font-semibold text-lg">
                      <span>Runtime</span>
                    </label>
                    <Dropdown
                      list={["python3.8", "nodejs14.x", "nodejs12.x"]}
                      onChangeHandler={onRuntimeChangeHandler}
                      displayStatus={runtime}
                    />
                  </div>
                </div>
              </div>
              <div className="flex justify-center pt-8 border-t">
                <button
                  className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex"
                  type="submit"
                >
                  <div className="mr-1">
                    <AvTimerIcon />
                  </div>
                  <p className="self-center">Create Lambda</p>
                </button>
                {showLoader ? (
                  <div className="ml-4">
                    <Loader
                      type="Puff"
                      color="#00BFFF"
                      height={50}
                      width={50}
                    />
                  </div>
                ) : null}
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:inline w-1/3 h-1/2">
        <SmoothImage
          src={DeployImage}
          alt="for create task"
          transitionTime={1.0}
          //Other props if you choose to use them
        />
      </div>
    </div>
  );
};

export default CreateLambda;
