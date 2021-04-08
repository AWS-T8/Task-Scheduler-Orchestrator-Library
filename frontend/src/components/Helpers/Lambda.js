import { React, useState } from "react";
import { CopyToClipboard } from "react-copy-to-clipboard";
import notify from "./Notification";

const Lambda = ({ id, name, URL, runtime, status }) => {
  const [copied, setCopied] = useState(false);
  const toggleCopyHandler = (text) => {
    setCopied(!copied);
    notify("message", `${text} Copied!`);
  };
  let color;
  if (status === "creating") color = "#FBBF24";
  else if (status === "failed") color = "#F87171";
  else if (status === "completed") color = "#34D399";

  const StatusColor = {
    backgroundColor: color,
  };
  return (
    <div className="bg-white rounded border shadow shadow-xl flex flex-col justify-between mb-4">
      {/* Content */}
      <div className="flex flex-col px-4 py-4 w-full">
        <p className="font-semibold text-2xl mb-1.5">{name}</p>
        <div className="font-light text-sm font-light">
          {URL === "Yet to be created" ? (
            <p className="mt-1 font-light text-sm font-light">URL: {URL}</p>
          ) : (
            <CopyToClipboard
              text={URL}
              onCopy={() => toggleCopyHandler(`Lambda Url`)}
            >
              <span className="select-none cursor-pointer background-transparent font-bold text-sm outline-none focus:outline-none">
                Copy Lambda URL
              </span>
            </CopyToClipboard>
          )}
        </div>

        <p className="mt-1 font-light text-sm font-light">Runtime: {runtime}</p>
        <p className="mt-1 font-light text-sm font-light">Status: {status}</p>
      </div>
      {/* Status Bar */}
      <div className="w-full h-3 rounded-b" style={StatusColor}></div>
    </div>
  );
};

export default Lambda;
