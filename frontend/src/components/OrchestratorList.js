import { React, useEffect, useState } from "react";
import { useSelector } from "react-redux";
import Orchestration from "./Helpers/Orchestration";
import axios from "axios";
import env from "react-dotenv";
import notify from "./Helpers/Notification";
import { Link } from "react-router-dom";
import Dropdown from "./Helpers/Dropdown";
import Modal from "./Helpers/Modal";
import RefreshIcon from "@material-ui/icons/Refresh";
import AddIcon from "@material-ui/icons/Add";

const OrchestrationList = () => {
  const [displayOrchestrations, setDisplayOrchestrations] = useState([]);
  const [totalOrchestrations, setTotalOrchestrations] = useState(0);
  const [scheduledOrchestrations, setScheduledOrchestrations] = useState(0);
  const [cancelledOrchestrations, setCancelledOrchestrations] = useState(0);
  const [completedOrchestrations, setCompletedOrchestrations] = useState(0);
  const [failedOrchestrations, setFailedOrchestrations] = useState(0);
  const [runningOrchestrations, setRunningOrchestrations] = useState(0);
  const [loading, setLoading] = useState(false);
  const [refresh, setRefresh] = useState(false);
  const [showError, setShowError] = useState(false);
  const [dispStatus, setdispStatus] = useState("All");
  const [showModal, setShowModal] = useState(false);
  const [newTimeDelay, setNewTimeDelay] = useState(0);
  const [modifyID, setModifyID] = useState(-1);

  const userLogin = useSelector((state) => state.userLogin);
  const toggleRefresh = () => {
    setRefresh(!refresh);
  };

  const onCancelHandler = (id) => {
    // console.log(id);
    setLoading(true);

    fetch(`${env.BACKEND_URL}/orchestrator/cancel/${id}`, {
      method: "PATCH", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userLogin.user.token}`,
      },
    })
      .then((res) => {
        if (res.status === 200) {
          notify("success", "Orchestration Cancelled!");
        } else if (res.status === 403) {
          notify("error", "Orchestration Cannot Be Cancelled!");
        } else if (res.status === 500) {
          notify("error", "Internal Server Error!");
        } else {
          notify("error", "Something Went Wrong!");
        }
        toggleRefresh();
      })
      .catch((err) => {
        notify("error", "Something Went Wrong!");
        toggleRefresh();
        console.log(err);
      });
  };

  const toggleModal = (id) => {
    setModifyID(id);
    setShowModal(true);
  };

  const onModifyHandler = () => {
    const changeID = modifyID;
    setModifyID(-1);
    setShowModal(false);
    setLoading(true);
    const url = `${env.BACKEND_URL}/orchestrator/${changeID}`;
    const data = {
      initialDelay: newTimeDelay,
    };
    const config = {
      method: "PATCH", // or 'PUT'
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${userLogin.user.token}`,
      },
      body: JSON.stringify(data),
    };
    fetch(url, config)
      .then((res) => {
        if (res.status === 200) {
          notify("success", "Orchestration Modified!");
        } else if (res.status === 406) {
          notify("warning", "Please Enter Valid Data!");
        } else if (res.status === 403) {
          notify("error", "Orchestration Cannot Be Modified!");
        } else {
          notify("error", "Something Went Wrong!");
        }
        toggleRefresh();
      })
      .catch((err) => {
        toggleRefresh();
        notify("error", "Something Went Wrong!");
      });
  };

  const getAllOrchestrations = () => {
    setLoading(true);
    let url = `${env.BACKEND_URL}/orchestrators`;
    const selectedStatus = dispStatus.toLowerCase();
    // if (dispStatus !== 'All') url += `/${dispStatus.toLowerCase()}`;
    axios
      .get(url, {
        headers: {
          Authorization: `Bearer ${userLogin.user.token}`,
        },
      })
      .then((res) => res.data)
      .then(async (data) => {
        let scheduledOrchestrationsCount = 0,
          cancelledOrchestrationCount = 0,
          completedOrchestrationCount = 0,
          failedOrchestrationCount = 0,
          totalOrchestrationCount = 0,
          runningOrchestrationCount = 0;
        let orchestrations = await data.reduce((accumulator, orchestration) => {
          totalOrchestrationCount++;
          let statusSplit = orchestration.status.split(" ");
          let currStatus = statusSplit[0];
          let secondWord = "";
          secondWord = statusSplit[1];
          if (currStatus === "scheduled") scheduledOrchestrationsCount++;
          else if (currStatus === "completed" && secondWord !== "fallback")
            completedOrchestrationCount++;
          else if (currStatus === "running") runningOrchestrationCount++;
          else if (currStatus === "cancelled") cancelledOrchestrationCount++;
          else failedOrchestrationCount++;
          let reachedFallback = false;
          if (secondWord === "fallback") reachedFallback = true;
          if (currStatus === selectedStatus || selectedStatus === "all") {
            accumulator.push(
              <Orchestration
                key={orchestration.id}
                id={orchestration.id}
                name={orchestration.name}
                taskUrls={orchestration.taskUrls}
                scheduledTime={orchestration.scheduledTime}
                status={orchestration.status}
                startTime={orchestration.startTime}
                endTime={orchestration.endTime}
                onCancelHandler={onCancelHandler}
                toggleModal={toggleModal}
                conditionCheckTaskUrl={orchestration.conditionCheckTaskUrl}
                fallbackTaskUrl={orchestration.fallbackTaskUrl}
                conditionCheckRetries={orchestration.conditionCheckRetries}
                initialRetryCount={orchestration.initialRetryCount}
                numberOfTasks={orchestration.numberOfTasks}
                timeDelayBetweenRetries={orchestration.timeDelayBetweenRetries}
                timeDelayForConditionCheck={
                  orchestration.timeDelayForConditionCheck
                }
                reachedFallback={reachedFallback}
              />
            );
          }
          return accumulator;
        }, []);
        if (orchestrations.length === 0) {
          orchestrations = (
            <div className="self-center">
              <p>No orchestrations Found!</p>
            </div>
          );
        }
        setTotalOrchestrations(totalOrchestrationCount);
        setScheduledOrchestrations(scheduledOrchestrationsCount);
        setRunningOrchestrations(runningOrchestrationCount);
        setCompletedOrchestrations(completedOrchestrationCount);
        setFailedOrchestrations(failedOrchestrationCount);
        setCancelledOrchestrations(cancelledOrchestrationCount);
        setDisplayOrchestrations(orchestrations);
        setLoading(false);
      })
      .catch((err) => {
        setShowError(true);
        notify("error", "Something Went Wrong!");
        setLoading(false);
        console.log(err);
      });
  };

  const onStatusChangedHandler = (status) => {
    setdispStatus(status);
    toggleRefresh();
  };

  useEffect(() => {
    getAllOrchestrations();
  }, [refresh]);

  return (
    <>
      {showError ? (
        <div className="self-center mt-28 md:mt-4 flex-grow flex flex-col md:flex-row mx-8 sm:mx-16 justify-center mb-4">
          <img
            src="https://i.pinimg.com/originals/d7/46/65/d74665c97dba34fe828ead80e30264a7.png"
            alt="Error"
          ></img>
        </div>
      ) : (
        <div className="min-h-screen">
          {loading ? (
            <div className="self-center mt-28 md:mt-4 flex-grow flex flex-col md:flex-row mx-8 sm:mx-16 justify-center mb-4">
              <img
                className="object-contain"
                src="https://thumbs.gfycat.com/DearWellinformedDalmatian-size_restricted.gif"
                alt="Loader"
              ></img>
            </div>
          ) : (
            <div className="mt-28 flex-grow flex flex-col-reverse lg:flex-row mx-8 sm:mx-16 justify-between mb-4">
              {showModal ? (
                <Modal
                  type="Orchestration"
                  newTimeDelay={newTimeDelay}
                  setNewTimeDelay={setNewTimeDelay}
                  setShowModal={setShowModal}
                  onModifyHandler={onModifyHandler}
                />
              ) : null}
              {/* Orchestration List */}
              <div className="lg:w-3/5 flex flex-col justify-around">
                {displayOrchestrations}
              </div>
              {/* Dashboard */}
              <div className=" md:inline flex flex-col justify-start mb-8 lg:mb-0 w-full lg:w-1/3 lg:h-1/4 self-start">
                <div className="self-center mb-4 flex justify-start">
                  <div className="self-center mr-2">
                    <p>Show Status:</p>
                  </div>
                  <Dropdown
                    list={[
                      "All",
                      "Scheduled",
                      "Completed",
                      "Failed",
                      "Running",
                      "Cancelled",
                    ]}
                    onChangeHandler={onStatusChangedHandler}
                    displayStatus={dispStatus}
                  />
                </div>
                <div className="flex justify-between mb-4">
                  <button
                    onClick={toggleRefresh}
                    type="button"
                    className="focus:outline-none  text-sm py-2.5 px-5 rounded-md border border-gray-600 hover:bg-gray-50 flex items-center"
                  >
                    <RefreshIcon fontSize="small" />
                    <p className="ml-1">Refresh</p>
                  </button>
                  <Link to="/createOrchestration">
                    <button
                      onClick={toggleRefresh}
                      type="button"
                      className="focus:outline-none  text-sm py-2.5 px-5 rounded-md border border-gray-600 hover:bg-gray-50 flex items-center"
                    >
                      <AddIcon fontSize="small" />
                      <p className="ml-1">Create Orchestration</p>
                    </button>
                  </Link>
                </div>

                <div className="bg-white shadow shadow-xl border  px-4 py-4 divide-y-4 divide-black-700">
                  <div>
                    <p className="font-semibold text-2xl">
                      Total Orchestrations: {totalOrchestrations}
                    </p>
                  </div>
                  <div className="font-normal text-lg my-2 ">
                    <p className="my-2">Scheduled: {scheduledOrchestrations}</p>
                    <p className="my-2">Completed: {completedOrchestrations}</p>
                    <p className="my-2">Cancelled: {cancelledOrchestrations}</p>
                    <p className="my-2">Failed: {failedOrchestrations}</p>
                    <p className="">Running: {runningOrchestrations}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

export default OrchestrationList;
