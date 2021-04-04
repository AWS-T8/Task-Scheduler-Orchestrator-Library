import { React, useState, useEffect } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";
import { CopyToClipboard } from "react-copy-to-clipboard";
import notify from "./Notification";

const Orchestration = ({
  id,
  name,
  taskUrls,
  scheduledTime,
  status,
  startTime,
  endTime,
  onCancelHandler,
  toggleModal,
  conditionCheckTaskUrl,
  fallbackTaskUrl,
  conditionCheckRetries,
  numberOfTasks,
  timeDelayBetweenRetries,
  timeDelayForConditionCheck,
  reachedFallback,
}) => {
  const [showHidden, setShowHidden] = useState(false);
  const [copied, setCopied] = useState(false);
  const [taskList, setTaskList] = useState([]);

  const toggleCopyHandler = (text) => {
    setCopied(!copied);
    notify("message", `${text} Copied!`);
  };

  const createTaskDisplay = async () => {
    let list = await taskUrls.map((url, index) => {
      return (
        <>
          <div>
            <CopyToClipboard
              text={url}
              onCopy={() => toggleCopyHandler(`URL of Task #${index + 1}`)}
            >
              <span className="select-none cursor-pointer text-blue-500 background-transparent font-bold uppercase pb-2 text-sm outline-none focus:outline-none mr-1 mb-1">
                Task #{index + 1}
              </span>
            </CopyToClipboard>
          </div>
          <div>{startTime[index]}</div>
          <div>{endTime[index]}</div>
        </>
      );
    });
    setTaskList(list);
  };

  useEffect(() => {
    createTaskDisplay();
  }, []);

  let color;
  let currStatus = status.split(" ")[0];
  if (currStatus === "scheduled") color = "#3B82F6";
  else if (currStatus === "running") color = "#FBBF24";
  else if (currStatus === "failed" || reachedFallback) color = "#F87171";
  else if (currStatus === "cancelled") color = "#9CA3AF";
  else if (currStatus === "completed") color = "#34D399";

  const statusColor = {
    backgroundColor: color,
  };
  return (
    <div className="bg-white rounded border shadow shadow-xl flex flex-col justify-between mb-4">
      {/* Content */}
      <div className="flex justify-between px-4 pt-4 pb-2">
        <div className="flex flex-col">
          <p className="font-semibold text-2xl mb-1.5">{name}</p>
          {/* <TextTruncate line={1} element="span" truncateText="…" text={name} /> */}
          <p className="font-normal text-base mb-0.5">{scheduledTime}</p>
          <div className="font-light text-sm font-light">
            <p className="mt-1 font-light text-sm font-light">
              Number Of Tasks: {numberOfTasks}
            </p>
          </div>
          <p className="mt-1 font-light text-sm font-light">Status: {status}</p>
        </div>
        <div className="flex flex-col justify-between">
          <button
            className="select-none mb-1 text-sm bg-transparent hover:bg-blue-500 text-blue-700  hover:text-white py-1.5 px-2 border border-blue-500 hover:border-transparent rounded"
            onClick={() => toggleModal(id)}
          >
            Modify
          </button>
          <button
            onClick={() => onCancelHandler(id)}
            className="select-none mt-1 text-sm bg-transparent hover:bg-red-500 text-red-700  hover:text-white py-1.5 px-2 border border-red-500 hover:border-transparent rounded"
          >
            Cancel
          </button>
        </div>
      </div>
      {showHidden ? (
        <div className="px-4 pb-4 pt-4 divide-y-2">
          <div className="pb-1">
            <p className="text-md">More Details:</p>
          </div>
          <div className="flex flex-col pt-2">
            <div className="font-light text-sm">
              <p>Retries Left: {conditionCheckRetries}</p>
            </div>
            <div className="font-light text-sm">
              <p>Time Between Retries: {timeDelayBetweenRetries}</p>
            </div>

            <div className="font-light text-sm">
              <p>
                Time Delay Between Condition Check: {timeDelayForConditionCheck}
              </p>
            </div>
            <div className="select-none cursor-pointer text-blue-500 background-transparent font-bold uppercase pt-2 pb-1 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
              <CopyToClipboard
                text={conditionCheckTaskUrl}
                onCopy={() => toggleCopyHandler("Condition Check URL")}
              >
                <span>Copy Condition Check URL</span>
              </CopyToClipboard>
            </div>
            <div className="select-none cursor-pointer text-blue-500 background-transparent font-bold uppercase pb-2 text-sm outline-none focus:outline-none mr-1 mb-1 ease-linear transition-all duration-150">
              <CopyToClipboard
                text={fallbackTaskUrl}
                onCopy={() => toggleCopyHandler("Fallback URL")}
              >
                <span>Copy Fallback URL</span>
              </CopyToClipboard>
            </div>
            {/* Task List */}
            {/* <div className="mr-4">{taskList}</div> */}
            <div className="grid grid-cols-3 place-content-center w-full">
              <div>Task Number</div>
              <div>Start Time</div>
              <div>End Time</div>
              {taskList}
            </div>
          </div>
        </div>
      ) : null}
      <div className="w-full flex justify-center mb-1">
        <p
          className="select-none cursor-pointer font-light text-sm text-blue-400"
          onClick={() => setShowHidden(!showHidden)}
        >
          {showHidden ? (
            <span>
              <ExpandLessIcon />
              Less Details
            </span>
          ) : (
            <span>
              <ExpandMoreIcon />
              More Details
            </span>
          )}
        </p>
      </div>
      {/* Status Bar */}
      <div className="w-full h-3 rounded-b" style={statusColor}></div>
    </div>
  );
};

export default Orchestration;
