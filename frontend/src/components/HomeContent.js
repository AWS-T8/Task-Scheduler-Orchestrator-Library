import { React } from "react";
import { Link } from "react-router-dom";
import SmoothImage from "react-smooth-image";
import HomeImage from "../assets/static/home-image.png";

const Content = (props) => {
  return (
    <div className="mt-20 flex-grow flex flex-col md:flex-row mx-8 sm:mx-16 justify-around">
      <div className="md:w-2/3 flex flex-col justify-center">
        <p className="font-semibold text-3xl lg:text-4xl">
          Robust & Accurate Scheduler...
        </p>
        <p className="mt-2 md:mt-0 font-light text-2xl lg:text-3xl">
          Completely Free!
        </p>
        <p className="mt-4 text-lg sm:w-2/3 font-normal">
          An open source task orchestrator & scheduler library to schedule AWS
          lambda functions.
        </p>
        <div className="flex space-x-1">
          <div className="inline-flex">
            <Link to="/createTask">
              <button className="mt-10 mb-5 w-full sm:w-full md:w-full lg:w-full bg-transparent hover:bg-blue-500 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                Create Task
              </button>
            </Link>
          </div>
          <div className="inline-flex">
            <Link to="/createOrchestration">
              <button className="mt-10 ml-5 w-full sm:w-full md:w-full lg:w-full bg-transparent hover:bg-blue-500 text-blue-500 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded">
                Create Orchestration
              </button>
            </Link>
          </div>
        </div>
      </div>
      <div className="mt-10 w-1/3 min-h-full hidden sm:inline">
        <SmoothImage
          src={HomeImage}
          alt="a nice image of clock"
          transitionTime={1.0}
          //Other props if you choose to use them
        />
        {/* <img className="object-contain align-center" src="https://ttpsc.com/wp4/wp-content/uploads/2019/09/The-Scheduler-for-Jira-1.png"></img> */}
      </div>
    </div>
  );
};

export default Content;
