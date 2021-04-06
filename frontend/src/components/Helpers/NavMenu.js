import { React, useState } from "react";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import { Link, useHistory } from "react-router-dom";
import ExpandLessIcon from "@material-ui/icons/ExpandLess";

const NavMenu = ({ onLogoutHandler, path }) => {
  let history = useHistory();
  const [showMenu, setShowMenu] = useState(false);

  const toggleShowMenu = (from) => {
    setShowMenu(!showMenu);
    if (from === "task") {
      history.push("/tasks");
    } else if (from === "orch") {
      history.push("/orchestrations");
    }
  };

  const logoutHandler = () => {
    toggleShowMenu();
    onLogoutHandler();
  };

  const activeStyle = {
    borderColor: "#4299e1",
  };

  return (
    <div className="mb-4 flex flex-col">
      <button
        type="button"
        className="flex justify-center focus:outline-none text-blue-600 text-xl py-1 px-1 rounded-md border border-blue-600 hover:bg-blue-50 flex items-center"
        onClick={toggleShowMenu}
      >
        <div className="px-1.5">
          Menu
          {showMenu ? <ExpandLessIcon /> : <ExpandMoreIcon />}
        </div>
      </button>
      {showMenu ? (
        <div className="bg-white shadow rounded text-gray font-normal text-sm select-none">
          <ul className="list-reset">
            <div
              className="cursor-pointer"
              onClick={() => toggleShowMenu("task")}
            >
              <li
                className="block p-4 border-gray-200 hover:border-blue-500 hover:bg-gray-200 border-r-4"
                //   style= {activeStyle}
                style={path === "/tasks" ? activeStyle : null}
              >
                Tasks
              </li>
            </div>

            <div
              className="cursor-pointer"
              onClick={() => toggleShowMenu("orch")}
            >
              <li
                className="block p-4 border-gray-200 hover:border-blue-500 hover:bg-gray-200 border-r-4"
                style={path === "/orchestrations" ? activeStyle : null}
              >
                <Link to="/orchestrations">Orchestrations</Link>
              </li>
            </div>

            <div className="cursor-pointer" onClick={logoutHandler}>
              <li className="block p-4 border-gray-200 hover:border-blue-500 hover:bg-gray-200 border-r-4">
                <Link to="/signIn">Logout</Link>
              </li>
            </div>
          </ul>
        </div>
      ) : null}
    </div>
  );
};

export default NavMenu;
