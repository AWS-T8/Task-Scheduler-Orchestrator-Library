import { React, useState, useEffect } from "react";
import { useSelector } from "react-redux";
import { useHistory } from "react-router-dom";
import SmoothImage from "react-smooth-image";
import FormImage from "../assets/static/create-task-image.png";
import axios from "axios";
import Loader from "react-loader-spinner";
import env from "react-dotenv";
import { OrchestratorSchema } from "../validations/OrchestratorValidation";
//Notifications
import notify from "./Helpers/Notification";
import OrchestrationTaskList from "./Helpers/OrchestrationTaskList";
import AddIcon from "@material-ui/icons/Add";
import AvTimerIcon from "@material-ui/icons/AvTimer";

const CreateOrchestrator = (props) => {
  const [name, setName] = useState("");
  const [conditionCheckTaskUrl, setconditionCheckTaskUrl] = useState("");
  const [initialDelay, setinitialDelay] = useState();
  const [fallbackTaskUrl, setfallbackTaskUrl] = useState("");
  const [
    timeDelayForConditionCheck,
    settimeDelayForConditionCheck,
  ] = useState();
  const [conditionCheckRetries, setconditionCheckRetries] = useState();
  const [timeDelayBetweenRetries, settimeDelayBetweenRetries] = useState();
  const userLogin = useSelector((state) => state.userLogin);
  const [showLoader, setShowLoader] = useState(false);
  const history = useHistory();

  const [TaskCount, setTaskCount] = useState(2);
  const [TaskList, setTaskList] = useState([{ url: "" }, { url: "" }]);
  const [displayTaskOptions, setDisplayTaskOptions] = useState(null);
  const [displayDeleteButton, setDisplayDeleteButton] = useState(false);

  const addTaskParamHandler = (e) => {
    e.preventDefault();
    if (TaskCount === 2) {
      setDisplayDeleteButton(true);
    }
    let updatedTaskList = [...TaskList];
    updatedTaskList.push({ url: "" });
    setTaskCount(TaskCount + 1);
    setTaskList(updatedTaskList);
  };

  const removeTaskParamHandler = (index) => {
    if (TaskCount === 3) {
      setDisplayDeleteButton(false);
    }
    let updatedTaskList = [...TaskList];
    updatedTaskList.splice(index, 1);
    setTaskList(updatedTaskList);
    setTaskCount(TaskCount - 1);
  };

  useEffect(() => {
    let updatedTaskList = TaskList.map((param, index) => {
      return (
        <OrchestrationTaskList
          key={index}
          index={index}
          removeTaskParamHandler={removeTaskParamHandler}
          TaskList={TaskList}
          setTaskList={setTaskList}
          displayDeleteButton={displayDeleteButton}
        />
      );
    });
    setDisplayTaskOptions(updatedTaskList);
  }, [TaskCount, TaskList]);

  const createOrchestratorHandler = async (e) => {
    e.preventDefault();
    let ListOfUrls = [];
    for (let i = 0; i < TaskCount; i++) {
      ListOfUrls.push(TaskList[i]["url"]);
    }
    console.log(ListOfUrls.length);
    let formData = {
      name: name,
      conditionCheckTaskUrl: conditionCheckTaskUrl,
      initialDelay: initialDelay,
      fallbackTaskUrl: fallbackTaskUrl,
      timeDelayForConditionCheck: timeDelayForConditionCheck,
      conditionCheckRetries: conditionCheckRetries,
      timeDelayBetweenRetries: timeDelayBetweenRetries,
      numberofTasks: TaskCount,
      taskUrls: ListOfUrls,
    };
    const isValid = await OrchestratorSchema.isValid(formData);
    if (isValid === true) {
      setShowLoader(true);
      axios
        .post(`${env.BACKEND_URL}/orchestrator`, formData, {
          headers: {
            Authorization: `Bearer ${userLogin.user.token}`,
          },
        })
        .then((res) => {
          if (res.status === 201) {
            notify("success", "Orchestration Scheduled!");
            setShowLoader(false);
            setName("");
            setconditionCheckTaskUrl("");
            setinitialDelay("");
            setfallbackTaskUrl("");
            setconditionCheckRetries("");
            settimeDelayBetweenRetries("");
            history.push("/Orchestrations");
          }
        })
        .catch((err) => {
          notify("error", "Something Went Wrong!");
          setShowLoader(false);
          console.log(err);
        });
    } else {
      notify("warning", "Please fill all the fields correctly!");
    }
  };

  return (
    <div className="mt-20 flex-grow flex mx-8 sm:mx-16 justify-between py-8">
      <div className="w-full lg:w-1/2 flex flex-col md:flex-col ">
        <div className="bg-red ui-container py-0">
          <div className="mx-auto max-w-4xl ">
            <div className="flex justify-between flex-col md:flex-row items-baseline divide-y-4">
              <div>
                <h2 className="text-2xl font-bold focus:outline-none focus:shadow-outline">
                  Schedule Orchestration
                </h2>
                <p className="mt-4 text-lg text-gray-500 font-medium">
                  Complete below fields to create an Orchestration
                </p>
              </div>
            </div>
            <form onSubmit={createOrchestratorHandler}>
              <div className="mt-4 divide-y-2">
                <div className="flex flex-col question divide-y">
                  <div className="mb-4 py-2">
                    <div className="flex flex-col">
                      <label className="mt-2 py-1 px-1 w-full font-semibold text-lg">
                        <span>Orchestration Name</span>
                      </label>
                      <input
                        type="textarea"
                        name="orchestrator_name"
                        id="orchestrator_name"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your orchestration name"
                        required
                        value={name}
                        onChange={(e) => {
                          setName(e.target.value);
                        }}
                      ></input>
                    </div>
                    <div className="flex flex-col">
                      <label className="flex flex-col mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                        <span>Initial Delay</span>
                        <span className="text-sm text-gray-500 font-medium">
                          Time in ms after which first task will run
                        </span>
                      </label>
                      <input
                        type="number"
                        name="initial_delay"
                        id="initial_delay"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your initial delay"
                        value={initialDelay}
                        onChange={(e) => {
                          setinitialDelay(e.target.value);
                        }}
                        required
                      ></input>
                    </div>
                    <div className="flex flex-col">
                      <label className="flex flex-col mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                        <span>Condition Check Task Url</span>
                        <span className="text-sm text-gray-500 font-medium">
                          Condition check will run after success of each task
                        </span>
                      </label>
                      <input
                        type="url"
                        name="condition_check_task_url"
                        id="condition_check_task_url"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your condition check task url"
                        value={conditionCheckTaskUrl}
                        onChange={(e) => {
                          setconditionCheckTaskUrl(e.target.value);
                        }}
                        required
                      ></input>
                    </div>
                    <div className="flex flex-col">
                      <label className="flex flex-col mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                        <span>Condition Check Retries</span>
                        <span className="text-sm text-gray-500 font-medium">
                          {`Number of retries if condition check fails (<=100)`}
                        </span>
                      </label>
                      <input
                        type="number"
                        name="condition_check_retries"
                        id="condition_check_retries"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter retries for condition check"
                        value={conditionCheckRetries}
                        onChange={(e) => {
                          setconditionCheckRetries(e.target.value);
                        }}
                        required
                      ></input>
                    </div>
                    <div className="flex flex-col">
                      <label className="flex flex-col mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                        <span>Fallback Task Url</span>
                        <span className="text-sm text-gray-500 font-medium">
                          Fallback will run if all retries of condition check
                          fail
                        </span>
                      </label>
                      <input
                        type="url"
                        name="fallback_task_url"
                        id="fallback_task_url"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your fallback task url"
                        value={fallbackTaskUrl}
                        onChange={(e) => {
                          setfallbackTaskUrl(e.target.value);
                        }}
                        required
                      ></input>
                    </div>
                    <div className="flex flex-col">
                      <label className="flex flex-col mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                        <span>Time Delay For Condition Check</span>
                        <span className="text-sm text-gray-500 font-medium">
                          Time in ms after which condition check will be run
                          upon success of each task
                        </span>
                      </label>
                      <input
                        type="number"
                        name="time_delay_for_condition_check"
                        id="time_delay_for_condition_check"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your time delay for condition check"
                        value={timeDelayForConditionCheck}
                        onChange={(e) => {
                          settimeDelayForConditionCheck(e.target.value);
                        }}
                        required
                      ></input>
                    </div>
                    <div className="flex flex-col">
                      <label className="flex flex-col mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                        <span>Time Delay Between Retries</span>
                        <span className="text-sm text-gray-500 font-medium">
                          Time between each retry of condition check
                        </span>
                      </label>
                      <input
                        type="number"
                        name="time_delay_for_retries"
                        id="time_delay_for_retries"
                        className="mt-1 w-full py-2 rounded-lg px-5  focus:outline-none focus:ring focus:border-blue-300 duration-200 placeholder-gray-400 text-gray-700 border border-gray-300"
                        placeholder="Enter your time delay for retries"
                        value={timeDelayBetweenRetries}
                        onChange={(e) => {
                          settimeDelayBetweenRetries(e.target.value);
                        }}
                        required
                      ></input>
                    </div>
                  </div>
                </div>
                <div className="py-4">
                  <label className="mb-3 mt-2 py-1 px-1 w-full font-semibold text-500 text-lg">
                    Tasks URLs
                  </label>
                  <button
                    onClick={addTaskParamHandler}
                    className="text-xs py-1 px-1 mt-2 mr-auto flex items-center justify-start focus:outline-none rounded-md border border-gray-400 hover:bg-gray-50 flex items-center"
                  >
                    <AddIcon fontSize="small" />
                    <span className="mx-0.5 self-center">Add Task</span>
                  </button>
                  <div className="flex flex-col mt-1 w-full">
                    {displayTaskOptions}
                  </div>
                </div>
                <div className="flex justify-center mt-4 pt-8 border-t">
                  <button
                    className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded flex"
                    type="submit"
                  >
                    <div className="mr-1">
                      <AvTimerIcon />
                    </div>
                    <p className="self-center">Schedule</p>
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
              </div>
            </form>
          </div>
        </div>
      </div>
      <div className="hidden lg:inline w-2/5 min-h-full">
        <SmoothImage
          src={FormImage}
          alt="for create task"
          transitionTime={1.0}
          //Other props if you choose to use them
        />
      </div>
    </div>
  );
};

export default CreateOrchestrator;
