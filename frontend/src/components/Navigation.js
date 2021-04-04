import { React } from "react";
import { Link, useLocation } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";
import { logout } from "../actions/userActions";
import NavMenu from "./Helpers/NavMenu";
const navStyle = {
  position: "fixed",
  top: "0",
  width: "100%",
};

const Navigation = () => {
  const userLogin = useSelector((state) => state.userLogin);
  const dispatch = useDispatch();

  const location = useLocation();

  const onLogoutHandler = (e) => {
    localStorage.removeItem("token");
    localStorage.removeItem("username");
    localStorage.removeItem("password");
    dispatch(logout());
  };

  return (
    <>
      {/* Navbar */}
      {/* <div className="bg-white border-blue-400 border-t-8 py-1 z-18"></div> */}
      <nav
        className="py-4 relative z-50 bg-white flex flex-row justify-between shadow-xl h-16"
        style={navStyle}
      >
        <script
          src="https://cdn.jsdelivr.net/gh/alpinejs/alpine@v2.x.x/dist/alpine.min.js"
          defer
        ></script>
        <div className="w-2/3 ml-4 sm:ml-8 md:ml-12 md:ml-12 md:mr-10 sm:mr-10 flex justify-start">
          <svg
            className="mt-1 mr-1"
            xmlns="http://www.w3.org/2000/svg"
            width="35"
            height="35"
            viewBox="0 0 24 24"
          >
            <path d="M17 3v-2c0-.552.447-1 1-1s1 .448 1 1v2c0 .552-.447 1-1 1s-1-.448-1-1zm-12 1c.553 0 1-.448 1-1v-2c0-.552-.447-1-1-1-.553 0-1 .448-1 1v2c0 .552.447 1 1 1zm13 13v-3h-1v4h3v-1h-2zm-5 .5c0 2.481 2.019 4.5 4.5 4.5s4.5-2.019 4.5-4.5-2.019-4.5-4.5-4.5-4.5 2.019-4.5 4.5zm11 0c0 3.59-2.91 6.5-6.5 6.5s-6.5-2.91-6.5-6.5 2.91-6.5 6.5-6.5 6.5 2.91 6.5 6.5zm-14.237 3.5h-7.763v-13h19v1.763c.727.33 1.399.757 2 1.268v-9.031h-3v1c0 1.316-1.278 2.339-2.658 1.894-.831-.268-1.342-1.111-1.342-1.984v-.91h-9v1c0 1.316-1.278 2.339-2.658 1.894-.831-.268-1.342-1.111-1.342-1.984v-.91h-3v21h11.031c-.511-.601-.938-1.273-1.268-2z" />
          </svg>
          <Link to="/">
            <h1 className="font-semibold text-2xl sm:text-4xl self-center">
              Scheduler
            </h1>
          </Link>
        </div>
        <div className="mr-4 w-2/3 mb-4 ml-4 sm:ml-8 md:ml-12 md:ml-12 md:mr-10 sm:mr-10 flex justify-end">
          {userLogin.isLoggedIn && (
            <div className="flex text-sm sm:text-lg md:text-xl">
              <NavMenu onLogoutHandler={onLogoutHandler} path= {location.pathname}/>
            </div>
          )}
          {!userLogin.isLoggedIn && (
            <Link to="/signIn">
              <button className="bg-blue-900 hover:bg-blue-700 text-white font-bold py-1 px-4 rounded">
                Sign In
              </button>
            </Link>
          )}
        </div>
        {/* <div className="sm:ml-4 sm:ml-8 md:ml-12 md:ml-12 md:mr-10 flex justify-start">
          <h2 className="sm:ml-4 sm:ml-8 self-center mr-3 text-lg sm:text-xl lg:text-2xl nav-text">
            <button className="bg-white px-1 sm:px-2 sm:py-2 md:py-2 md:px-2 hover:bg-gray-100 text-gray-800 font-semibold border border-gray-400 rounded shadow-md">
              Sign In
            </button>
          </h2>
        </div> */}
      </nav>
    </>
  );
};

export default Navigation;
